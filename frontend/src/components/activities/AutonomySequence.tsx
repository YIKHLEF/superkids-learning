import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Checkbox, FormControlLabel, Typography, LinearProgress, Alert } from '@mui/material';
import { ActivityReward, DifficultyLevel } from '../../types';
import analyticsService from '../../services/analytics.service';

interface AutonomySequenceProps {
  onSuccess?: (reward: ActivityReward) => void;
}

const AutonomySequence: React.FC<AutonomySequenceProps> = ({ onSuccess }) => {
  const childId = 'demo-child';
  const difficulty = DifficultyLevel.BEGINNER;
  const steps = useMemo(
    () => [
      'Ouvrir le sac',
      'Sortir la gourde',
      'Boire deux gorgées',
      'Ranger la gourde',
    ],
    []
  );

  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    analyticsService.sendEvent({
      activityId: 'autonomy-sequence',
      childId,
      type: 'activity_start',
      timestamp: new Date().toISOString(),
      difficulty,
    });
  }, [childId, difficulty]);

  const toggleStep = (step: string) => {
    setCompletedSteps((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]
    );
    analyticsService.sendEvent({
      activityId: 'autonomy-sequence',
      childId,
      type: 'attempt',
      timestamp: new Date().toISOString(),
      difficulty,
      attempts: completedSteps.length + 1,
      successRate: (completedSteps.length + 1) / steps.length,
    });
  };

  const progress = Math.round((completedSteps.length / steps.length) * 100);

  useEffect(() => {
    if (progress === 100 && !finished) {
      onSuccess?.({
        activityId: 'autonomy-sequence',
        tokens: 10,
        themeId: 'theme_routine',
        message: 'Routine terminée avec succès !',
      });
      analyticsService.sendEvent({
        activityId: 'autonomy-sequence',
        childId,
        type: 'success',
        timestamp: new Date().toISOString(),
        difficulty,
        attempts: steps.length,
        successRate: 1,
      });
      setFinished(true);
    }
  }, [finished, onSuccess, progress]);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Séquences d'autonomie
        </Typography>
        <Alert severity={progress === 100 ? 'success' : 'info'} sx={{ mb: 2 }}>
          {progress === 100
            ? 'Routine terminée, bravo !'
            : 'Coche chaque étape pour suivre la routine.'}
        </Alert>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {steps.map((step) => (
            <FormControlLabel
              key={step}
              control={<Checkbox checked={completedSteps.includes(step)} onChange={() => toggleStep(step)} />}
              label={step}
            />
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Progression de la routine
        </Typography>
        <LinearProgress variant="determinate" value={progress} />
      </CardContent>
    </Card>
  );
};

export default AutonomySequence;
