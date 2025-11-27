import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import {
  Psychology as BrainIcon,
  Groups as GroupsIcon,
  EmojiEvents as TrophyIcon,
  Accessible as AccessibleIcon,
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);

  const handleScrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: <BrainIcon sx={{ fontSize: 60 }} />,
      title: 'Apprentissage Adaptatif',
      description: "IA qui s'adapte au rythme de chaque enfant",
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 60 }} />,
      title: 'Compétences Sociales',
      description: 'Activités pour développer les interactions',
    },
    {
      icon: <TrophyIcon sx={{ fontSize: 60 }} />,
      title: 'Récompenses Motivantes',
      description: 'Système de badges et défis personnalisés',
    },
    {
      icon: <AccessibleIcon sx={{ fontSize: 60 }} />,
      title: 'Design Inclusif',
      description: 'Interface adaptée aux besoins sensoriels',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F0F4F8 0%, #E8F0F8 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: 'primary.dark',
                mb: 3,
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              SuperKids Learning
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                mb: 4,
                lineHeight: 1.8,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
              }}
            >
              Une application d'apprentissage conçue spécialement pour les enfants autistes,
              basée sur les recherches scientifiques et les meilleures pratiques pédagogiques.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                Commencer l'Aventure
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleScrollToFeatures}
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  borderColor: 'primary.main',
                  color: 'primary.dark',
                }}
              >
                En Savoir Plus
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '100%',
                height: 400,
                backgroundColor: 'secondary.light',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h3" color="secondary.dark">
                🎨 Illustration
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box ref={featuresRef} sx={{ backgroundColor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{ mb: 6, fontWeight: 600, color: 'text.primary' }}
          >
            Pourquoi SuperKids?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
