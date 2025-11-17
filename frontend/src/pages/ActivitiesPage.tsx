import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import { ActivityCategory, DifficultyLevel } from '../types';
import {
  EmojiPeople as SocialIcon,
  Chat as CommunicationIcon,
  School as AcademicIcon,
  Person as AutonomyIcon,
  Favorite as EmotionalIcon,
} from '@mui/icons-material';

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

  const activities = [
    {
      id: '1',
      title: 'Reconnaissance des émotions',
      description: 'Apprends à identifier les différentes émotions sur les visages',
      category: ActivityCategory.SOCIAL_SKILLS,
      difficulty: DifficultyLevel.BEGINNER,
      duration: 10,
      image: '😊',
    },
    {
      id: '2',
      title: 'Apprendre les couleurs',
      description: 'Découvre et mémorise les couleurs avec des objets colorés',
      category: ActivityCategory.ACADEMIC,
      difficulty: DifficultyLevel.BEGINNER,
      duration: 15,
      image: '🎨',
    },
    {
      id: '3',
      title: 'Se laver les mains',
      description: 'Étapes simples pour bien se laver les mains',
      category: ActivityCategory.AUTONOMY,
      difficulty: DifficultyLevel.BEGINNER,
      duration: 5,
      image: '🧼',
    },
    {
      id: '4',
      title: 'Dire bonjour',
      description: 'Pratique les salutations avec des amis virtuels',
      category: ActivityCategory.COMMUNICATION,
      difficulty: DifficultyLevel.BEGINNER,
      duration: 10,
      image: '👋',
    },
    {
      id: '5',
      title: 'Calmer sa colère',
      description: 'Techniques de respiration et stratégies pour se calmer',
      category: ActivityCategory.EMOTIONAL_REGULATION,
      difficulty: DifficultyLevel.INTERMEDIATE,
      duration: 15,
      image: '🧘',
    },
    {
      id: '6',
      title: 'Compter jusqu\'à 10',
      description: 'Apprends à compter avec des objets amusants',
      category: ActivityCategory.ACADEMIC,
      difficulty: DifficultyLevel.BEGINNER,
      duration: 12,
      image: '🔢',
    },
  ];

  const filteredActivities =
    selectedCategory === 'all'
      ? activities
      : activities.filter((a) => a.category === selectedCategory);

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
        Choisis une activité pour commencer à apprendre en t'amusant!
      </Typography>

      {/* Filtres par catégorie */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? 'contained' : 'outlined'}
            startIcon={category.icon}
            onClick={() => setSelectedCategory(category.value as ActivityCategory | 'all')}
            sx={{ minWidth: 120, minHeight: 48 }}
          >
            {category.label}
          </Button>
        ))}
      </Box>

      {/* Grille d'activités */}
      <Grid container spacing={3}>
        {filteredActivities.map((activity) => (
          <Grid item xs={12} sm={6} md={4} key={activity.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <Box
                sx={{
                  height: 200,
                  backgroundColor: 'secondary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '5rem',
                }}
              >
                {activity.image}
              </Box>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={activity.difficulty}
                    size="small"
                    color={getDifficultyColor(activity.difficulty)}
                  />
                  <Chip label={`${activity.duration} min`} size="small" variant="outlined" />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  {activity.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {activity.description}
                </Typography>
                <Button variant="contained" fullWidth size="large">
                  Commencer
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ActivitiesPage;
