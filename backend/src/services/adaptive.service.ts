import { ActivityCategory, DifficultyLevel } from '@prisma/client';
import {
  AdaptiveContext,
  AdaptiveRecommendation,
  ActivityRecommendation,
  MlAdaptiveResponse,
  PerformanceSignal,
} from '../types';
import { logger } from '../utils/logger';

interface AdaptiveServiceOptions {
  mlEndpoint?: string;
  mlApiKey?: string;
  mlEnabled?: boolean;
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

  constructor(options: AdaptiveServiceOptions = {}) {
    this.mlEndpoint = options.mlEndpoint || process.env.ADAPTIVE_ML_ENDPOINT;
    this.mlApiKey = options.mlApiKey || process.env.ADAPTIVE_ML_API_KEY;
    this.mlEnabled = options.mlEnabled ?? process.env.ADAPTIVE_ML_ENABLED === 'true';
  }

  /**
   * Orchestration: tente d'appeler le modèle ML si activé, sinon
   * applique le modèle heuristique interne.
   */
  async getRecommendations(context: AdaptiveContext): Promise<AdaptiveRecommendation> {
    if (this.mlEnabled && this.mlEndpoint) {
      try {
        const mlResponse = await this.fetchMlRecommendation(context);
        return this.normalizeMlResponse(mlResponse, context.childId);
      } catch (error) {
        logger.warn('Échec du connecteur ML, utilisation des heuristiques internes', { error });
      }
    }

    return this.generateHeuristicRecommendation(context);
  }

  /**
   * Modèle heuristique explicable: ajuste la difficulté en fonction
   * des performances récentes et des signaux émotionnels.
   */
  generateHeuristicRecommendation(context: AdaptiveContext): AdaptiveRecommendation {
    const latest = context.recentPerformance[0] as PerformanceSignal | undefined;
    const nextDifficulty = this.adjustDifficulty(context.currentDifficulty, latest);

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

    const rationale: string[] = [
      `Taux de réussite récent: ${latest?.successRate ?? 'N/A'} (${latest?.attemptsCount ?? 0} tentatives)`,
      `Heuristique appliquée: ${this.describeDifficultyChange(context.currentDifficulty, nextDifficulty)}`,
    ];

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
    performance?: PerformanceSignal
  ): DifficultyLevel {
    if (!performance) {
      return current;
    }

    const { successRate, attemptsCount, emotionalState } = performance;

    if (successRate > 0.85 && attemptsCount <= 2 && emotionalState !== 'frustrated') {
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
}
