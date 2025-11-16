import React from 'react';
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
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = React.useState('week');

  const weeklyData = [
    { day: 'Lun', activites: 3, reussite: 85 },
    { day: 'Mar', activites: 4, reussite: 90 },
    { day: 'Mer', activites: 2, reussite: 75 },
    { day: 'Jeu', activites: 5, reussite: 95 },
    { day: 'Ven', activites: 3, reussite: 88 },
    { day: 'Sam', activites: 4, reussite: 92 },
    { day: 'Dim', activites: 2, reussite: 80 },
  ];

  const skillsData = [
    { competence: 'Social', niveau: 85 },
    { competence: 'Communication', niveau: 78 },
    { competence: 'Académique', niveau: 92 },
    { competence: 'Autonomie', niveau: 70 },
    { competence: 'Émotions', niveau: 88 },
  ];

  const emotionalData = [
    { emotion: 'Heureux', count: 45 },
    { emotion: 'Neutre', count: 30 },
    { emotion: 'Frustré', count: 15 },
    { emotion: 'Anxieux', count: 10 },
  ];

  return (
    <Box>
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
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="activites"
                    stroke="#A8D5E2"
                    strokeWidth={3}
                    name="Activités complétées"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="reussite"
                    stroke="#B8E6D5"
                    strokeWidth={3}
                    name="Taux de réussite (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={emotionalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="emotion" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#B8E6D5" name="Occurrences" />
                </BarChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={skillsData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="competence" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Niveau"
                    dataKey="niveau"
                    stroke="#A8D5E2"
                    fill="#A8D5E2"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
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
                      23
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Activités complétées
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                      87%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Taux de réussite moyen
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700 }}>
                      3h45
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Temps d'apprentissage
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="secondary.main" sx={{ fontWeight: 700 }}>
                      7
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Jours consécutifs
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
