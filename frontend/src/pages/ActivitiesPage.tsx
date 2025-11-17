import React, { useMemo, useState } from 'react';
import { Box, Grid, Button, Typography, Chip } from '@mui/material';
import {
  EmojiPeople as SocialIcon,
  Chat as CommunicationIcon,
  School as AcademicIcon,
  Person as AutonomyIcon,
  Favorite as EmotionalIcon,
} from '@mui/icons-material';
import { ActivityCategory, DifficultyLevel } from '../types';
import EmotionDragDrop from '../components/activities/EmotionDragDrop';
import CaaBoard from '../components/activities/CaaBoard';
import AdaptiveMathGame from '../components/activities/AdaptiveMathGame';
import AutonomySequence from '../components/activities/AutonomySequence';
import BreathingExercise from '../components/activities/BreathingExercise';

interface ActivityModule {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  difficulty: DifficultyLevel;
  duration: number;
  component: React.ReactNode;
  badge?: string;
}

const ActivitiesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');

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
        component: <EmotionDragDrop />,
        badge: 'Empathie',
      },
      {
        id: 'aac-board',
        title: 'Tableau CAA',
        description: 'Compose des demandes avec les pictogrammes pour encourager la communication augmentée.',
        category: ActivityCategory.COMMUNICATION,
        difficulty: DifficultyLevel.INTERMEDIATE,
        duration: 6,
        component: <CaaBoard />,
        badge: 'Communicateur',
      },
      {
        id: 'adaptive-math',
        title: 'Jeux mathématiques adaptatifs',
        description: 'Les consignes s\'adaptent automatiquement selon la réussite pour garder un défi motivant.',
        category: ActivityCategory.ACADEMIC,
        difficulty: DifficultyLevel.BEGINNER,
        duration: 12,
        component: <AdaptiveMathGame />,
        badge: 'Logique',
      },
      {
        id: 'autonomy-sequence',
        title: 'Séquences d\'autonomie',
        description: 'Coche chaque étape d\'une routine guidée pour développer l\'indépendance.',
        category: ActivityCategory.AUTONOMY,
        difficulty: DifficultyLevel.BEGINNER,
        duration: 7,
        component: <AutonomySequence />,
        badge: 'Autonome',
      },
      {
        id: 'breathing-exercise',
        title: 'Exercices de respiration',
        description: 'Un rythme respiratoire 4-2-4 avec feedback immédiat pour se réguler.',
        category: ActivityCategory.EMOTIONAL_REGULATION,
        difficulty: DifficultyLevel.INTERMEDIATE,
        duration: 5,
        component: <BreathingExercise />,
        badge: 'Zen',
      },
    ],
    []
  );

  const filteredModules =
    selectedCategory === 'all'
      ? modules
      : modules.filter((module) => module.category === selectedCategory);

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
        {filteredModules.map((module) => (
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
                <Chip label={module.difficulty} size="small" color={getDifficultyColor(module.difficulty)} />
                <Chip label={`${module.duration} min`} size="small" variant="outlined" />
                {module.badge && <Chip label={`Badge: ${module.badge}`} size="small" color="secondary" />}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {module.description}
              </Typography>
              {module.component}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ActivitiesPage;
