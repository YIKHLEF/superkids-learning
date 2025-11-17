import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, Stack } from '@mui/material';
import { ActivityReward, DifficultyLevel } from '../../types';
import analyticsService from '../../services/analytics.service';

interface BreathingExerciseProps {
  onSuccess?: (reward: ActivityReward) => void;
  metadata?: { ebpTags?: string[]; instructions?: string[] };
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onSuccess, metadata }) => {
  const childId = 'demo-child';
  const difficulty = DifficultyLevel.BEGINNER;
  const cycles = useMemo(
    () => [
      { label: 'Inspire', duration: 4 },
      { label: 'Bloque', duration: 2 },
      { label: 'Expire', duration: 4 },
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [cyclesDone, setCyclesDone] = useState(0);
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    analyticsService.sendEvent({
      activityId: 'breathing-exercise',
      childId,
      type: 'activity_start',
      timestamp: new Date().toISOString(),
      difficulty,
    });
  }, [childId, difficulty]);

  const nextCycle = () => {
    const nextIndex = (activeIndex + 1) % cycles.length;
    setActiveIndex(nextIndex);
    setCyclesDone((prev) => (nextIndex === 0 ? prev + 1 : prev));
    analyticsService.sendEvent({
      activityId: 'breathing-exercise',
      childId,
      type: 'attempt',
      timestamp: new Date().toISOString(),
      difficulty,
      attempts: cyclesDone + 1,
      emotionalState: 'calm',
    });
  };

  useEffect(() => {
    if (cyclesDone >= 3 && !celebrated) {
      onSuccess?.({
        activityId: 'breathing-exercise',
        tokens: 12,
        avatarId: 'avatar_zen',
        message: 'Respiration maîtrisée, avatar zen débloqué !',
      });
      analyticsService.sendEvent({
        activityId: 'breathing-exercise',
        childId,
        type: 'success',
        timestamp: new Date().toISOString(),
        difficulty,
        attempts: cyclesDone,
        successRate: 1,
        emotionalState: 'calm',
      });
      setCelebrated(true);
    }
  }, [celebrated, cyclesDone, onSuccess]);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Exercice de respiration
          </Typography>
          <Chip label={`${cyclesDone} cycles`} size="small" color="success" />
        </Stack>
        {metadata?.ebpTags && metadata.ebpTags.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
            {metadata.ebpTags.map((tag) => (
              <Chip key={tag} label={`EBP: ${tag}`} color="info" size="small" variant="outlined" />
            ))}
          </Stack>
        )}
        <Typography variant="body1" sx={{ mb: 2 }}>
          Suis le rythme 4-2-4 pour te calmer.
        </Typography>
        {metadata?.instructions && metadata.instructions.length > 0 && (
          <Stack component="ul" spacing={0.5} sx={{ pl: 2, mb: 2 }}>
            {metadata.instructions.map((instruction) => (
              <Typography key={instruction} component="li" variant="body2" color="text.secondary">
                {instruction}
              </Typography>
            ))}
          </Stack>
        )}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {cycles.map((cycle, index) => (
            <Chip
              key={cycle.label}
              label={`${cycle.label} (${cycle.duration}s)`}
              color={index === activeIndex ? 'primary' : 'default'}
              variant={index === activeIndex ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
        <Button variant="contained" onClick={nextCycle}>
          {activeIndex === 0 ? 'Démarrer' : 'Suivant'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BreathingExercise;
