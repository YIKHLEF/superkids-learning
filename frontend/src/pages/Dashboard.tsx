import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  Avatar,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingIcon,
  LocalFireDepartment as StreakIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { RootState } from '../store';

const Dashboard: React.FC = () => {
  const profile = useSelector((state: RootState) => state.profile.currentProfile);
  const progress = useSelector((state: RootState) => state.progress.progress);

  const stats = [
    {
      icon: <TrophyIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      label: 'Jetons gagnés',
      value: progress?.tokensEarned || 0,
    },
    {
      icon: <TrendingIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      label: 'Activités complétées',
      value: progress?.totalActivitiesCompleted || 0,
    },
    {
      icon: <StreakIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      label: 'Série actuelle',
      value: `${progress?.currentStreak || 0} jours`,
    },
    {
      icon: <StarIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      label: 'Niveau',
      value: '5',
    },
  ];

  const recentActivities = [
    { name: 'Reconnaissance des émotions', category: 'Social', progress: 85 },
    { name: 'Mathématiques amusantes', category: 'Académique', progress: 60 },
    { name: 'Histoire sociale du jour', category: 'Communication', progress: 100 },
  ];

  return (
    <Box>
      {/* En-tête du tableau de bord */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Tableau de bord
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenue {profile?.name}! Continue ton excellent travail! 🌟
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>{stat.icon}</Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Activités en cours */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Mes activités en cours
              </Typography>
              {recentActivities.map((activity, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {activity.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={activity.progress}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        backgroundColor: 'primary.main',
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    Catégorie: {activity.category}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Prochaines activités recommandées */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Activité du jour
              </Typography>
              <Box
                sx={{
                  backgroundColor: 'primary.light',
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h3" sx={{ mb: 1 }}>
                  🎯
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                  Apprendre les couleurs
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  15 minutes
                </Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ mb: 1 }}
              >
                Commencer
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Dernières récompenses
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['🏆', '⭐', '🎨', '📚', '🎭'].map((emoji, index) => (
                  <Avatar
                    key={index}
                    sx={{
                      width: 50,
                      height: 50,
                      backgroundColor: 'secondary.light',
                      fontSize: '1.5rem',
                    }}
                  >
                    {emoji}
                  </Avatar>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
