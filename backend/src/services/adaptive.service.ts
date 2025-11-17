import { ActivityCategory, DifficultyLevel, PrismaClient } from '@prisma/client';
import {
  AdaptiveContext,
  AdaptiveRecommendation,
  ActivityRecommendation,
  AdaptiveEngineResult,
  MlAdaptiveResponse,
  PerformanceSignal,
  RecommendationSource,
} from '../types';
import { logger } from '../utils/logger';

interface AdaptiveServiceOptions {
  mlEndpoint?: string;
  mlApiKey?: string;
  mlEnabled?: boolean;
  prisma?: PrismaClient;
}

/**
 * Adaptive Engine (expérimental)
 *
 * Fournit des recommandations de difficulté et d'activités en se basant
 * d'abord sur des heuristiques explicables, puis sur un connecteur ML externe
 * si celui-ci est activé via la configuration.
 */
export class AdaptiveService {
  private readonly mlEndpoint?: string;
  private readonly mlApiKey?: string;
  private readonly mlEnabled: boolean;
  private readonly prisma?: PrismaClient;

  constructor(options: AdaptiveServiceOptions = {}) {
    this.mlEndpoint = options.mlEndpoint || process.env.ADAPTIVE_ML_ENDPOINT;
    this.mlApiKey = options.mlApiKey || process.env.ADAPTIVE_ML_API_KEY;
    this.mlEnabled = options.mlEnabled ?? process.env.ADAPTIVE_ML_ENABLED === 'true';
    this.prisma = options.prisma;
  }

  isMlActive(): boolean {
    return this.mlEnabled && !!this.mlEndpoint;
  }

  /**
   * Orchestration: tente d'appeler le modèle ML si activé, sinon
   * applique le modèle heuristique interne.
   */
  async getRecommendations(context: AdaptiveContext): Promise<AdaptiveEngineResult> {
    const start = Date.now();
    let source: RecommendationSource = 'heuristic';
    let recommendation: AdaptiveRecommendation | undefined;

    if (this.isMlActive()) {
      try {
        const mlResponse = await this.fetchMlRecommendation(context);
        recommendation = this.normalizeMlResponse(mlResponse, context.childId);
        source = 'ml';
        logger.info('Recommandations générées via le connecteur ML', {
          childId: context.childId,
          endpoint: this.mlEndpoint,
        });
      } catch (error) {
        logger.warn('Échec du connecteur ML, utilisation des heuristiques internes', {
          error,
          childId: context.childId,
        });
      }
    }

    if (!recommendation) {
      recommendation = this.generateHeuristicRecommendation(context);
      source = 'heuristic';
      logger.info('Recommandations générées via l’heuristique locale', { childId: context.childId });
    }

    const latencyMs = Date.now() - start;
    await this.persistRecommendation(context, recommendation, source, latencyMs);

    return { recommendation, source };
  }

  /**
   * Modèle heuristique explicable: ajuste la difficulté en fonction
   * des performances récentes et des signaux émotionnels.
   */
  generateHeuristicRecommendation(context: AdaptiveContext): AdaptiveRecommendation {
    const latest = context.recentPerformance[0] as PerformanceSignal | undefined;
    const nextDifficulty = this.adjustDifficulty(
      context.currentDifficulty,
      latest,
      context.sensoryPreferences
    );

    const recommendations: ActivityRecommendation[] = [
      {
        category: context.targetCategory,
        difficulty: nextDifficulty,
        weight: 0.55,
        reason: 'Poursuite sur la compétence cible avec difficulté adaptée',
        suggestedActivityId: context.currentActivityId,
      },
      {
        category: ActivityCategory.EMOTIONAL_REGULATION,
        difficulty: DifficultyLevel.BEGINNER,
        weight: context.personalization?.regulationNeeded ? 0.2 : 0.1,
        reason: 'Micro-pauses de co-régulation pour limiter la surcharge',
      },
      {
        category: ActivityCategory.SOCIAL_SKILLS,
        difficulty: DifficultyLevel.BEGINNER,
        weight: 0.15,
        reason: 'Consolidation par généralisation sociale',
      },
      {
        category: ActivityCategory.ACADEMIC,
        difficulty: DifficultyLevel.INTERMEDIATE,
        weight: 0.1,
        reason: 'Varier les sollicitations cognitives sans augmenter la charge',
      },
    ];

    if (context.personalization?.shortSessionsPreferred) {
      recommendations.forEach((rec) => {
        rec.weight *= 0.9;
      });
    }

    if (context.sensoryPreferences?.includes('LOW_STIMULATION')) {
      recommendations.forEach((rec) => {
        if (rec.difficulty === DifficultyLevel.ADVANCED) {
          rec.weight *= 0.8;
        }
      });
    }

    const rationale: string[] = [
      `Taux de réussite récent: ${latest?.successRate ?? 'N/A'} (${latest?.attemptsCount ?? 0} tentatives)`,
      `Heuristique appliquée: ${this.describeDifficultyChange(context.currentDifficulty, nextDifficulty)}`,
    ];

    if (context.sensoryPreferences?.length) {
      rationale.push(`Préférences sensorielles prises en compte: ${context.sensoryPreferences.join(', ')}`);
    }

    const escalationWarnings = latest && latest.emotionalState === 'frustrated'
      ? ['Observé: signes de frustration. Prévoir pause sensorielle.']
      : undefined;

    return {
      childId: context.childId,
      nextDifficulty,
      recommendations: recommendations.sort((a, b) => b.weight - a.weight),
      rationale,
      escalationWarnings,
    };
  }

  /**
   * Règles heuristiques simples (sans ML) pour ajuster la difficulté.
   */
  private adjustDifficulty(
    current: DifficultyLevel,
    performance?: PerformanceSignal,
    sensoryPreferences?: string[]
  ): DifficultyLevel {
    if (!performance) {
      return current;
    }

    const { successRate, attemptsCount, emotionalState } = performance;

    const prefersLowStimuli = sensoryPreferences?.includes('LOW_STIMULATION');

    if (
      successRate > 0.85 &&
      attemptsCount <= 2 &&
      emotionalState !== 'frustrated' &&
      !prefersLowStimuli
    ) {
      return current === DifficultyLevel.ADVANCED
        ? DifficultyLevel.ADVANCED
        : current === DifficultyLevel.INTERMEDIATE
        ? DifficultyLevel.ADVANCED
        : DifficultyLevel.INTERMEDIATE;
    }

    if (successRate < 0.55 || emotionalState === 'frustrated') {
      return current === DifficultyLevel.BEGINNER
        ? DifficultyLevel.BEGINNER
        : current === DifficultyLevel.INTERMEDIATE
        ? DifficultyLevel.BEGINNER
        : DifficultyLevel.INTERMEDIATE;
    }

    if (prefersLowStimuli && current === DifficultyLevel.ADVANCED) {
      return DifficultyLevel.INTERMEDIATE;
    }

    return current;
  }

  private describeDifficultyChange(
    current: DifficultyLevel,
    next: DifficultyLevel
  ): string {
    if (current === next) return 'Stabilisation de la difficulté';
    if (next === DifficultyLevel.ADVANCED) return 'Progression vers ADVANCED suite à haute réussite';
    if (next === DifficultyLevel.INTERMEDIATE && current === DifficultyLevel.BEGINNER)
      return 'Augmentation graduelle pour maintenir l’engagement';
    return 'Diminution temporaire pour réduire la charge cognitive';
  }

  /**
   * Connecteur ML optionnel (format générique, endpoint configurable).
   */
  private async fetchMlRecommendation(context: AdaptiveContext): Promise<MlAdaptiveResponse> {
    const response = await fetch(this.mlEndpoint as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.mlApiKey ? { Authorization: `Bearer ${this.mlApiKey}` } : {}),
      },
      body: JSON.stringify({
        childId: context.childId,
        currentDifficulty: context.currentDifficulty,
        targetCategory: context.targetCategory,
        recentPerformance: context.recentPerformance,
        personalization: context.personalization,
        sensoryPreferences: context.sensoryPreferences,
      }),
    });

    if (!response.ok) {
      throw new Error(`Échec du connecteur ML: ${response.statusText}`);
    }

    return (await response.json()) as MlAdaptiveResponse;
  }

  private normalizeMlResponse(
    mlResponse: MlAdaptiveResponse,
    childId: string
  ): AdaptiveRecommendation {
    return {
      childId,
      nextDifficulty: mlResponse.nextDifficulty,
      recommendations: mlResponse.recommendations,
      rationale: mlResponse.explanation || ['Connecteur ML activé'],
    };
  }

  private async persistRecommendation(
    context: AdaptiveContext,
    recommendation: AdaptiveRecommendation,
    source: RecommendationSource,
    latencyMs?: number
  ) {
    const prisma = this.prisma as any;
    if (!prisma?.adaptiveRecommendation) return;

    try {
      await prisma.adaptiveRecommendation.create({
        data: {
          childId: context.childId,
          source,
          requestedContext: context,
          recommendation,
          latencyMs,
        },
      });
    } catch (error) {
      logger.warn('Échec de la persistance des recommandations adaptatives', {
        error,
        childId: context.childId,
      });
    }
  }
}
