import { useCallback, useEffect, useMemo, useState } from 'react';
import adaptiveService from '../services/adaptiveService';
import {
  Activity,
  AdaptiveContext,
  AdaptiveRecommendation,
  ActivityRecommendation,
  DifficultyLevel,
} from '../types';

interface AdaptiveState {
  recommendation?: AdaptiveRecommendation;
  loading: boolean;
  error?: string;
}

const adjustDifficulty = (current: DifficultyLevel, successRate?: number, attempts?: number, emotionalState?: string) => {
  if (successRate === undefined || attempts === undefined) return current;

  if (successRate > 0.85 && attempts <= 2 && emotionalState !== 'frustrated') {
    return current === DifficultyLevel.BEGINNER
      ? DifficultyLevel.INTERMEDIATE
      : DifficultyLevel.ADVANCED;
  }

  if (successRate < 0.55 || emotionalState === 'frustrated') {
    return current === DifficultyLevel.ADVANCED
      ? DifficultyLevel.INTERMEDIATE
      : DifficultyLevel.BEGINNER;
  }

  return current;
};

const buildRecommendationPayload = (context: AdaptiveContext): AdaptiveRecommendation => {
  const latest = context.recentPerformance[0];
  const nextDifficulty = adjustDifficulty(
    context.currentDifficulty,
    latest?.successRate,
    latest?.attemptsCount,
    latest?.emotionalState
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
  const [state, setState] = useState<AdaptiveState>({ loading: false });

  const memoizedContext = useMemo(() => context, [context]);

  const fallback = useCallback(() => {
    if (!memoizedContext) return null;
    return buildRecommendationPayload(memoizedContext);
  }, [memoizedContext]);

  const refresh = useCallback(async () => {
    if (!memoizedContext) return;
    setState((prev) => ({ ...prev, loading: true, error: undefined }));

    try {
      const recommendation = await adaptiveService.getRecommendations(memoizedContext);
      setState({ recommendation, loading: false });
    } catch (error) {
      const local = fallback();
      if (local) {
        setState({ recommendation: local, loading: false, error: 'Fallback heuristique (API indisponible)' });
      } else {
        setState({ loading: false, error: 'Impossible de récupérer les recommandations' });
      }
    }
  }, [memoizedContext, fallback]);

  useEffect(() => {
    if (memoizedContext) {
      refresh();
    }
  }, [memoizedContext, refresh]);

  const applyRecommendation = useCallback(
    (activities: Activity[]) => {
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
          } as Activity & { suggestedDifficulty: DifficultyLevel; adaptiveWeight: number };
        })
        .sort((a, b) => (b as any).adaptiveWeight - (a as any).adaptiveWeight);
    },
    [state.recommendation]
  );

  return {
    recommendation: state.recommendation,
    loading: state.loading,
    error: state.error,
    refresh,
    applyRecommendation,
  };
};

export default useAdaptiveLevel;
