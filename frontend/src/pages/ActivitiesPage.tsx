import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Grid, Button, Typography, Chip, Stack, Tooltip, IconButton } from '@mui/material';
import {
  EmojiPeople as SocialIcon,
  Chat as CommunicationIcon,
  School as AcademicIcon,
  Person as AutonomyIcon,
  Favorite as EmotionalIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ActivityReward, ActivityCategory, DifficultyLevel, AdaptiveContext, SensoryPreference } from '../types';
import EmotionDragDrop from '../components/activities/EmotionDragDrop';
import CaaBoard from '../components/activities/CaaBoard';
import AdaptiveMathGame from '../components/activities/AdaptiveMathGame';
import AutonomySequence from '../components/activities/AutonomySequence';
import BreathingExercise from '../components/activities/BreathingExercise';
import useAdaptiveLevel from '../hooks/useAdaptiveLevel';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { applyReward, setError as setRewardError, setInventory, setLoading as setRewardLoading } from '../store/slices/rewardSlice';
import { addTokens, recordFeedback, unlockReward } from '../store/slices/progressSlice';
import rewardsService from '../services/rewards.service';

interface ActivityModule {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  difficulty: DifficultyLevel;
  duration: number;
  renderer: (onSuccess: (reward: ActivityReward) => void) => React.ReactNode;
  badge?: string;
}

const ActivitiesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');
  const dispatch = useDispatch<AppDispatch>();
  const rewardsLoading = useSelector((state: RootState) => state.rewards.loading);
  const childId = 'demo-child-01';

  const adaptiveContext = useMemo<AdaptiveContext>(() => {
    const category = selectedCategory === 'all' ? ActivityCategory.SOCIAL_SKILLS : selectedCategory;

    return {
      childId: 'demo-child-01',
      targetCategory: category,
      currentDifficulty: DifficultyLevel.INTERMEDIATE,
      recentPerformance: [
        {
          successRate: 0.72,
          attemptsCount: 3,
          averageTimePerQuestion: 22,
          emotionalState: 'calm',
          supportLevel: 'minimal',
        },
        {
          successRate: 0.55,
          attemptsCount: 4,
          emotionalState: 'engaged',
        },
      ],
      currentActivityId: 'emotions-dnd',
      personalization: {
        prefersLowStimuli: true,
        shortSessionsPreferred: true,
        regulationNeeded: category === ActivityCategory.EMOTIONAL_REGULATION,
      },
      sensoryPreferences: [SensoryPreference.LOW_STIMULATION],
    };
  }, [selectedCategory]);

  const { recommendation, loading, error, source, refresh, applyRecommendation } = useAdaptiveLevel(adaptiveContext);

  useEffect(() => {
    const fetchRewards = async () => {
      dispatch(setRewardLoading(true));
      try {
        const { tokens, rewards } = await rewardsService.getRewards(childId);
        dispatch(setInventory({ tokens, rewards }));
      } catch (err) {
        dispatch(setRewardError('Impossible de charger les récompenses'));
      } finally {
        dispatch(setRewardLoading(false));
      }
    };

    fetchRewards();
  }, [childId, dispatch]);

  const handleActivityReward = useCallback(
    async (reward: ActivityReward, module: ActivityModule & { suggestedDifficulty?: DifficultyLevel }) => {
      dispatch(applyReward(reward));
      dispatch(addTokens(reward.tokens));
      if (reward.badgeId) {
        dispatch(unlockReward(reward.badgeId));
      }
      dispatch(
        recordFeedback({
          message: reward.message || `Bravo pour ${module.title}!`,
          tokens: reward.tokens,
          badgeUnlocked: reward.badgeId,
          recommendedDifficulty: module.suggestedDifficulty || module.difficulty,
        })
      );

      try {
        dispatch(setRewardLoading(true));
        const data = await rewardsService.awardForActivity(childId, reward);
        dispatch(setInventory({ tokens: data.balance, rewards: data.rewards }));
      } catch (err) {
        dispatch(setRewardError('Synchronisation des récompenses impossible'));
      } finally {
        dispatch(setRewardLoading(false));
      }
    },
    [childId, dispatch]
  );

  const categories = [
    { value: 'all', label: 'Toutes', icon: null },
    { value: ActivityCategory.SOCIAL_SKILLS, label: 'Social', icon: <SocialIcon /> },
    { value: ActivityCategory.COMMUNICATION, label: 'Communication', icon: <CommunicationIcon /> },
    { value: ActivityCategory.ACADEMIC, label: 'Académique', icon: <AcademicIcon /> },
    { value: ActivityCategory.AUTONOMY, label: 'Autonomie', icon: <AutonomyIcon /> },
    { value: ActivityCategory.EMOTIONAL_REGULATION, label: 'Émotions', icon: <EmotionalIcon /> },
  ];

  const modules: ActivityModule[] = useMemo(
    () => [
      {
        id: 'emotions-dnd',
        title: 'Drag & Drop des émotions',
        description: 'Associe les pictogrammes aux émotions correspondantes pour renforcer l\'identification sociale.',
        category: ActivityCategory.EMOTIONAL_REGULATION,
        difficulty: DifficultyLevel.BEGINNER,
        duration: 8,
        renderer: (onSuccess) => <EmotionDragDrop onSuccess={onSuccess} />,
        badge: 'Empathie',
      },
      {
        id: 'aac-board',
        title: 'Tableau CAA',
        description: 'Compose des demandes avec les pictogrammes pour encourager la communication augmentée.',
        category: ActivityCategory.COMMUNICATION,
        difficulty: DifficultyLevel.INTERMEDIATE,
        duration: 6,
        renderer: (onSuccess) => <CaaBoard onSuccess={onSuccess} />,
        badge: 'Communicateur',
      },
      {
        id: 'adaptive-math',
        title: 'Jeux mathématiques adaptatifs',
        description: 'Les consignes s\'adaptent automatiquement selon la réussite pour garder un défi motivant.',
        category: ActivityCategory.ACADEMIC,
        difficulty: DifficultyLevel.BEGINNER,
        duration: 12,
        renderer: (onSuccess) => <AdaptiveMathGame onSuccess={onSuccess} />,
        badge: 'Logique',
      },
      {
        id: 'autonomy-sequence',
        title: 'Séquences d\'autonomie',
        description: 'Coche chaque étape d\'une routine guidée pour développer l\'indépendance.',
        category: ActivityCategory.AUTONOMY,
        difficulty: DifficultyLevel.BEGINNER,
        duration: 7,
        renderer: (onSuccess) => <AutonomySequence onSuccess={onSuccess} />,
        badge: 'Autonome',
      },
      {
        id: 'breathing-exercise',
        title: 'Exercices de respiration',
        description: 'Un rythme respiratoire 4-2-4 avec feedback immédiat pour se réguler.',
        category: ActivityCategory.EMOTIONAL_REGULATION,
        difficulty: DifficultyLevel.INTERMEDIATE,
        duration: 5,
        renderer: (onSuccess) => <BreathingExercise onSuccess={onSuccess} />,
        badge: 'Zen',
      },
    ],
    []
  );

  const filteredModules =
    selectedCategory === 'all'
      ? modules
      : modules.filter((module) => module.category === selectedCategory);

  const adaptiveModules = useMemo(() => {
    const ordered = applyRecommendation(filteredModules);

    return ordered.map((module) => {
      const suggestedDifficulty = (module as any).suggestedDifficulty || module.difficulty;
      const adaptiveWeight = (module as any).adaptiveWeight ?? 0;

      const adjustedDuration = (() => {
        if (suggestedDifficulty === DifficultyLevel.ADVANCED) return module.duration + 4;
        if (suggestedDifficulty === DifficultyLevel.INTERMEDIATE) return module.duration + 2;
        return Math.max(module.duration - 1, 3);
      })();

      const adaptiveBadge =
        suggestedDifficulty !== module.difficulty
          ? `Niveau suggéré: ${suggestedDifficulty}`
          : recommendation?.rationale?.[0] || module.badge;

      return {
        ...module,
        suggestedDifficulty,
        adaptiveWeight,
        adjustedDuration,
        adaptiveBadge,
      };
    });
  }, [applyRecommendation, filteredModules, recommendation]);

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER:
        return 'success';
      case DifficultyLevel.INTERMEDIATE:
        return 'warning';
      case DifficultyLevel.ADVANCED:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Activités d'Apprentissage
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Choisis une activité interactive pour commencer à apprendre en t'amusant!
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ mb: 3, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            color={source === 'remote' ? 'primary' : source === 'fallback' ? 'warning' : 'default'}
            label={
              loading
                ? 'Suggestion en cours...'
                : source === 'remote'
                ? 'Suggestion ML/Backend'
                : source === 'fallback'
                ? 'Heuristique locale'
                : 'Suggestion par défaut'
            }
          />
          {recommendation?.nextDifficulty && (
            <Chip
              variant="outlined"
              color="secondary"
              label={`Prochaine difficulté cible: ${recommendation.nextDifficulty}`}
            />
          )}
          {error && <Chip color="error" label={error} />}
        </Stack>
        <Tooltip title="Rafraîchir la recommandation">
          <span>
            <IconButton onClick={refresh} disabled={loading || rewardsLoading} color="primary">
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? 'contained' : 'outlined'}
            startIcon={category.icon}
            onClick={() => setSelectedCategory(category.value as ActivityCategory | 'all')}
            sx={{ minWidth: 140, minHeight: 48 }}
          >
            {category.label}
          </Button>
        ))}
      </Box>

      <Grid container spacing={3}>
        {adaptiveModules.map((module) => (
          <Grid item xs={12} md={6} key={module.id}>
            <Box
              sx={{
                height: '100%',
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {module.title}
                </Typography>
                <Chip
                  label={module.suggestedDifficulty || module.difficulty}
                  size="small"
                  color={getDifficultyColor(module.suggestedDifficulty || module.difficulty)}
                />
                <Chip label={`${module.adjustedDuration || module.duration} min`} size="small" variant="outlined" />
                {module.adaptiveBadge && <Chip label={`Badge: ${module.adaptiveBadge}`} size="small" color="secondary" />}
                {module.adaptiveWeight > 0 && (
                  <Chip
                    label={`Poids adaptatif: ${(module.adaptiveWeight * 100).toFixed(0)}%`}
                    size="small"
                    variant="outlined"
                    color="info"
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {module.description}
              </Typography>
              {module.renderer((reward) =>
                handleActivityReward(reward, module as ActivityModule & { suggestedDifficulty?: DifficultyLevel })
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ActivitiesPage;
