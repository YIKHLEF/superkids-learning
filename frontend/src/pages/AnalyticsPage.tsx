import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { Line, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';
import analyticsService, { AnalyticsSummary } from '../services/analytics.service';
import { getApiErrorMessage } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  RadialLinearScale
);

const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState('week');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const childId = 'demo-child';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await analyticsService.getEvents(childId);
        setAnalytics(data);
      } catch (err) {
        const message = getApiErrorMessage(err, 'progress/events');
        console.error('[Analytics] Chargement impossible', err);
        setError(`${message}. Visualisation en mode dégradé.`);
        setAnalytics({
          events: [],
          aggregates: {
            totalActivities: 0,
            averageSuccessRate: 0,
            totalDurationSeconds: 0,
            emotionalStates: {},
            attempts: 0,
            skillAverages: {},
          },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [childId]);

  const lineData = useMemo(
    () => ({
      labels: analytics?.events.map((event) => new Date(event.timestamp).toLocaleTimeString()) || [],
      datasets: [
        {
          label: 'Taux de réussite (%)',
          data: analytics?.events.map((event) => Math.round((event.successRate ?? 0) * 100)) || [],
          borderColor: '#A8D5E2',
          backgroundColor: 'rgba(168, 213, 226, 0.25)',
        },
        {
          label: 'Durée (min)',
          data:
            analytics?.events.map((event) => Math.round((event.durationSeconds || 0) / 60)) || [],
          borderColor: '#7BC6CC',
          backgroundColor: 'rgba(123, 198, 204, 0.2)',
        },
      ],
    }),
    [analytics]
  );

  const barData = useMemo(
    () => ({
      labels: Object.keys(analytics?.aggregates.emotionalStates || {}),
      datasets: [
        {
          label: 'Émotions détectées',
          data: Object.values(analytics?.aggregates.emotionalStates || {}),
          backgroundColor: '#B8E6D5',
        },
      ],
    }),
    [analytics]
  );

  const radarData = useMemo(() => {
    const skills = analytics?.aggregates.skillAverages || {};
    const fallbackSkills: [string, number][] = [
      ['SOCIAL_SKILLS', 0],
      ['COMMUNICATION', 0],
      ['ACADEMIC', 0],
      ['AUTONOMY', 0],
      ['EMOTIONAL_REGULATION', 0],
    ];

    const entries = Object.entries(skills).length ? Object.entries(skills) : fallbackSkills;
    const labels = entries.map(([key]) => key.replace(/_/g, ' ').toLowerCase());
    const values = entries.map(([, value]) => Math.round((value || 0) * 100));

    return {
      labels,
      datasets: [
        {
          label: 'Compétences',
          data: values,
          backgroundColor: 'rgba(168, 213, 226, 0.4)',
          borderColor: '#A8D5E2',
        },
      ],
    };
  }, [analytics]);

  return (
    <Box>
      {error && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => setError(null)}>
              Ignorer
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Mes Progrès
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Suis ton évolution et tes réussites
          </Typography>
        </Box>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Période</InputLabel>
          <Select
            value={period}
            label="Période"
            onChange={(e) => setPeriod(e.target.value)}
          >
            <MenuItem value="week">Cette semaine</MenuItem>
            <MenuItem value="month">Ce mois</MenuItem>
            <MenuItem value="year">Cette année</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Activités et Réussite par jour */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Activités et taux de réussite
              </Typography>
              {loading || !analytics ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Line data={lineData} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* États émotionnels */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                États émotionnels
              </Typography>
              {loading || !analytics ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Bar data={barData} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Radar des compétences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Niveau de compétences
              </Typography>
              <Radar data={radarData} />
            </CardContent>
          </Card>
        </Grid>

        {/* Recommandations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Recommandations personnalisées
              </Typography>
              <Box>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: 'primary.light',
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    📈 Continue comme ça!
                  </Typography>
                  <Typography variant="body2">
                    Tu excelles dans les activités académiques. Bravo!
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    backgroundColor: 'warning.light',
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    🎯 Zone d'amélioration
                  </Typography>
                  <Typography variant="body2">
                    Les activités d'autonomie pourraient nécessiter plus de pratique.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    backgroundColor: 'success.light',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    ⭐ Suggestion du jour
                  </Typography>
                  <Typography variant="body2">
                    Essaie l'activité "Se brosser les dents" pour améliorer ton autonomie.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistiques rapides */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Statistiques cette semaine
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700 }}>
                      {analytics?.aggregates.totalActivities ?? 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Activités complétées
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                      {Math.round((analytics?.aggregates.averageSuccessRate || 0) * 100)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Taux de réussite moyen
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700 }}>
                      {Math.round((analytics?.aggregates.totalDurationSeconds || 0) / 60)}m
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Temps d'apprentissage
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="secondary.main" sx={{ fontWeight: 700 }}>
                      {analytics?.aggregates.attempts ?? 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tentatives enregistrées
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
