import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, Stack } from '@mui/material';
import { ActivityReward } from '../../types';

interface BreathingExerciseProps {
  onSuccess?: (reward: ActivityReward) => void;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onSuccess }) => {
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

  const nextCycle = () => {
    const nextIndex = (activeIndex + 1) % cycles.length;
    setActiveIndex(nextIndex);
    setCyclesDone((prev) => (nextIndex === 0 ? prev + 1 : prev));
  };

  useEffect(() => {
    if (cyclesDone >= 3 && !celebrated) {
      onSuccess?.({
        activityId: 'breathing-exercise',
        tokens: 12,
        avatarId: 'avatar_zen',
        message: 'Respiration maîtrisée, avatar zen débloqué !',
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
        <Typography variant="body1" sx={{ mb: 2 }}>
          Suis le rythme 4-2-4 pour te calmer.
        </Typography>
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
