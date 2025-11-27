import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import { SaveAlt as ExportIcon, Warning as WarningIcon, CheckCircle } from '@mui/icons-material';
import reportingService, { ReportSummary } from '../services/reporting.service';
import { getApiErrorMessage } from '../services/api';

const ReportsPage: React.FC = () => {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const childId = 'demo-child-01';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await reportingService.fetchSummary(childId);
        setSummary(data);
      } catch (err) {
        const message = getApiErrorMessage(err, 'rapports');
        console.error('[Reports] Chargement du rapport échoué', err);
        setError(`${message}. Données locales affichées.`);
        setSummary({
          aggregates: {
            totalActivities: 0,
            averageSuccessRate: 0,
            totalDurationMinutes: 0,
            attempts: 0,
          },
          skillAverages: {},
          emotionalStates: {},
          alerts: [],
          iepComparison: [],
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [childId]);

  const handleExport = async () => {
    if (!summary) return;
    setDownloading(true);
    try {
      const blob = await reportingService.exportCsv(childId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'rapport-progress.csv';
      link.click();
    } catch (err) {
      const message = getApiErrorMessage(err, 'export CSV');
      console.error('[Reports] Export échoué', err);
      setError(`${message} Impossible de finaliser le téléchargement.`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !summary) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Rapports & Alertes
          </Typography>
          <Typography color="text.secondary">Suivi exportable des progrès et alertes automatiques.</Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<ExportIcon />}
          onClick={handleExport}
          disabled={downloading}
        >
          {downloading ? 'Export...' : 'Exporter CSV'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Synthèse
              </Typography>
              <Stack spacing={1.5}>
                <MetricItem label="Activités complétées" value={summary.aggregates.totalActivities} />
                <MetricItem
                  label="Taux de réussite"
                  value={`${Math.round(summary.aggregates.averageSuccessRate * 100)}%`}
                />
                <MetricItem label="Tentatives" value={summary.aggregates.attempts} />
                <MetricItem label="Temps total" value={`${summary.aggregates.totalDurationMinutes} min`} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Comparaison IEP
              </Typography>
              <Stack spacing={2}>
                {summary.iepComparison.map((goal) => (
                  <Box key={goal.objective}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {goal.objective.replace(/_/g, ' ').toLowerCase()}
                      </Typography>
                      <Chip label={`${Math.round(goal.achievedRate * 100)}%`} color="primary" size="small" />
                    </Box>
                    <LinearProgress value={Math.round(goal.achievedRate * 100)} variant="determinate" />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Alertes
              </Typography>
              <Stack spacing={2}>
                {summary.alerts.map((alert) => (
                  <Alert
                    key={alert.id}
                    severity={alert.level === 'critical' ? 'error' : alert.level === 'warning' ? 'warning' : 'info'}
                    iconMapping={{
                      warning: <WarningIcon fontSize="inherit" />,
                      success: <CheckCircle fontSize="inherit" />,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {alert.message}
                    </Typography>
                    {alert.recommendation && (
                      <Typography variant="body2" color="text.secondary">
                        {alert.recommendation}
                      </Typography>
                    )}
                  </Alert>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                États émotionnels détectés
              </Typography>
              <Stack spacing={1.5}>
                {Object.entries(summary.emotionalStates).map(([emotion, count]) => (
                  <Box key={emotion} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography textTransform="capitalize">{emotion}</Typography>
                    <Chip label={`${count} fois`} variant="outlined" />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const MetricItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography color="text.secondary">{label}</Typography>
    <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
  </Box>
);

export default ReportsPage;

