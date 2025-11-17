import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import adaptiveService from '../services/adaptiveService';
import {
  Activity,
  AdaptiveContext,
  AdaptiveRecommendation,
  ActivityRecommendation,
  AdaptiveEngineResult,
  DifficultyLevel,
  RecommendationSource,
} from '../types';

type SuggestionSource = RecommendationSource | 'none';

interface AdaptiveState {
  recommendation?: AdaptiveRecommendation;
  loading: boolean;
  error?: string;
  source: SuggestionSource;
}

const adjustDifficulty = (
  current: DifficultyLevel,
  successRate?: number,
  attempts?: number,
  emotionalState?: string,
  sensoryPreferences?: string[]
) => {
  if (successRate === undefined || attempts === undefined) return current;

  const prefersLowStimuli = sensoryPreferences?.includes('LOW_STIMULATION');

  if (successRate > 0.85 && attempts <= 2 && emotionalState !== 'frustrated' && !prefersLowStimuli) {
    return current === DifficultyLevel.BEGINNER
      ? DifficultyLevel.INTERMEDIATE
      : DifficultyLevel.ADVANCED;
  }

  if (successRate < 0.55 || emotionalState === 'frustrated') {
    return current === DifficultyLevel.ADVANCED
      ? DifficultyLevel.INTERMEDIATE
      : DifficultyLevel.BEGINNER;
  }

  if (prefersLowStimuli && current === DifficultyLevel.ADVANCED) {
    return DifficultyLevel.INTERMEDIATE;
  }

  return current;
};

const buildRecommendationPayload = (context: AdaptiveContext): AdaptiveRecommendation => {
  const latest = context.recentPerformance[0];
  const nextDifficulty = adjustDifficulty(
    context.currentDifficulty,
    latest?.successRate,
    latest?.attemptsCount,
    latest?.emotionalState,
    context.sensoryPreferences
  );

  const recommendations: ActivityRecommendation[] = [
    {
      category: context.targetCategory,
      difficulty: nextDifficulty,
      weight: 0.6,
      reason: 'Alignement sur la compétence active',
      suggestedActivityId: context.currentActivityId,
    },
    {
      category: context.targetCategory,
      difficulty: context.currentDifficulty,
      weight: 0.2,
      reason: 'Maintien du niveau courant pour stabiliser les acquis',
    },
    {
      category: context.targetCategory,
      difficulty: DifficultyLevel.BEGINNER,
      weight: 0.2,
      reason: 'Retour aux fondamentaux pour réduire la charge cognitive',
    },
  ];

  return {
    childId: context.childId,
    nextDifficulty,
    recommendations,
    rationale: [
      `Heuristique locale: succès ${latest?.successRate ?? 'N/A'} avec ${latest?.attemptsCount ?? 0} essais`,
      `Niveau cible: ${nextDifficulty}`,
    ],
    escalationWarnings:
      latest?.emotionalState === 'frustrated'
        ? ['Signaux de frustration détectés : prévoir micro-pause.']
        : undefined,
  };
};

export const useAdaptiveLevel = (context?: AdaptiveContext | null) => {
  const [state, setState] = useState<AdaptiveState>({ loading: false, source: 'none' });

  const memoizedContext = useMemo(() => context, [context]);
  const cacheRef = useRef<Map<string, AdaptiveEngineResult & { cachedAt: number }>>(new Map());

  const contextKey = useMemo(() => {
    if (!memoizedContext) return null;
    const { childId, targetCategory, currentDifficulty, currentActivityId, recentPerformance, sensoryPreferences } =
      memoizedContext;
    return JSON.stringify({
      childId,
      targetCategory,
      currentDifficulty,
      currentActivityId,
      performance: recentPerformance[0],
      sensoryPreferences,
    });
  }, [memoizedContext]);

  const fallback = useCallback((): AdaptiveEngineResult | null => {
    if (!memoizedContext) return null;
    return { recommendation: buildRecommendationPayload(memoizedContext), source: 'fallback' as RecommendationSource };
  }, [memoizedContext]);

  const refresh = useCallback(
    async (options?: { force?: boolean }) => {
      if (!memoizedContext) return;

      if (!options?.force && contextKey) {
        const cached = cacheRef.current.get(contextKey);
        if (cached) {
          setState({
            recommendation: cached.recommendation,
            loading: false,
            error: undefined,
            source: cached.source,
          });
          return;
        }
      }

      setState((prev) => ({ ...prev, loading: true, error: undefined }));

      try {
        const result = await adaptiveService.getRecommendations(memoizedContext);
        if (contextKey) {
          cacheRef.current.set(contextKey, { ...result, cachedAt: Date.now() });
        }
        setState({ recommendation: result.recommendation, loading: false, error: undefined, source: result.source });
      } catch (error) {
        const local = fallback();
        if (local) {
          if (contextKey) {
            cacheRef.current.set(contextKey, { ...local, cachedAt: Date.now() });
          }
          const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
          setState({
            recommendation: local.recommendation,
            loading: false,
            error: offline
              ? 'Recommandation locale (mode hors ligne)'
              : 'Fallback heuristique (API indisponible)',
            source: 'fallback',
          });
        } else {
          setState({ loading: false, error: 'Impossible de récupérer les recommandations', source: 'none' });
        }
      }
    },
    [memoizedContext, contextKey, fallback]
  );

  useEffect(() => {
    if (memoizedContext) {
      refresh();
    }
  }, [memoizedContext, refresh]);

  const applyRecommendation = useCallback(
    <T extends { category: Activity['category']; difficulty: DifficultyLevel }>(activities: T[]) => {
      if (!state.recommendation) return activities;
      const weightMap = new Map<string, ActivityRecommendation>();
      state.recommendation.recommendations.forEach((rec) => {
        weightMap.set(`${rec.category}-${rec.difficulty}`, rec);
      });

      return activities
        .map((activity) => {
          const key = `${activity.category}-${activity.difficulty}`;
          const rec = weightMap.get(key) || weightMap.get(`${activity.category}-${state.recommendation?.nextDifficulty}`);
          return {
            ...activity,
            suggestedDifficulty: rec?.difficulty ?? activity.difficulty,
            adaptiveWeight: rec?.weight ?? 0,
          } as T & { suggestedDifficulty: DifficultyLevel; adaptiveWeight: number };
        })
        .sort((a, b) => (b as any).adaptiveWeight - (a as any).adaptiveWeight);
    },
    [state.recommendation]
  );

  return {
    recommendation: state.recommendation,
    loading: state.loading,
    error: state.error,
    source: state.source,
    refresh,
    applyRecommendation,
  };
};

export default useAdaptiveLevel;
