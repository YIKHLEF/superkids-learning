import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  LinearProgress,
  Alert,
} from '@mui/material';
import { DifficultyLevel } from '../../types';
import { ActivityReward } from '../../types';
import analyticsService from '../../services/analytics.service';

interface AdaptiveMathGameProps {
  initialDifficulty?: DifficultyLevel;
  onLevelChange?: (level: DifficultyLevel) => void;
  onSuccess?: (reward: ActivityReward) => void;
}

const AdaptiveMathGame: React.FC<AdaptiveMathGameProps> = ({
  initialDifficulty = DifficultyLevel.BEGINNER,
  onLevelChange,
  onSuccess,
}) => {
  const childId = 'demo-child';
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty);
  const [progress, setProgress] = useState(30);
  const [feedback, setFeedback] = useState('Réponds correctement pour débloquer le niveau supérieur.');
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    analyticsService.sendEvent({
      activityId: 'adaptive-math',
      childId,
      type: 'activity_start',
      timestamp: new Date().toISOString(),
      difficulty,
    });
  }, [childId, difficulty]);

  const mathPrompts = useMemo(
    () => ({
      [DifficultyLevel.BEGINNER]: 'Compte les animaux: 2 + 3 = ?',
      [DifficultyLevel.INTERMEDIATE]: 'Résous: 12 - 5 = ?',
      [DifficultyLevel.ADVANCED]: 'Résous: (6 x 3) - 4 = ?',
    }),
    []
  );

  const adjustDifficulty = (success: boolean) => {
    let nextLevel = difficulty;
    if (success && difficulty === DifficultyLevel.BEGINNER) {
      nextLevel = DifficultyLevel.INTERMEDIATE;
    } else if (success && difficulty === DifficultyLevel.INTERMEDIATE) {
      nextLevel = DifficultyLevel.ADVANCED;
    } else if (!success && difficulty !== DifficultyLevel.BEGINNER) {
      nextLevel = DifficultyLevel.BEGINNER;
    }
    setDifficulty(nextLevel);
    onLevelChange?.(nextLevel);
    const newProgress = Math.min(100, success ? progress + 25 : Math.max(10, progress - 20));
    setProgress(newProgress);
    setFeedback(
      success
        ? `Bravo ! Passons au niveau ${nextLevel.toLowerCase()}.`
        : 'On simplifie un peu pour consolider les bases.'
    );

    analyticsService.sendEvent({
      activityId: 'adaptive-math',
      childId,
      type: success ? 'success' : 'attempt',
      timestamp: new Date().toISOString(),
      difficulty: nextLevel,
      attempts: 1,
      successRate: success ? 1 : 0,
    });

    if (success && newProgress >= 80 && !celebrated) {
      onSuccess?.({
        activityId: 'adaptive-math',
        tokens: 25,
        badgeId: 'badge_logique',
        message: 'Progression math réussie !',
      });
      setCelebrated(true);
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Jeux mathématiques adaptatifs
          </Typography>
          <Chip label={difficulty} color="primary" size="small" />
        </Stack>
        <Alert severity="info" sx={{ mb: 2 }}>
          {feedback}
        </Alert>
        <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
          {mathPrompts[difficulty]}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Button variant="contained" onClick={() => adjustDifficulty(true)}>
            Réponse correcte
          </Button>
          <Button variant="outlined" onClick={() => adjustDifficulty(false)}>
            Besoin d'aide
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Progression du niveau
        </Typography>
        <LinearProgress value={progress} variant="determinate" />
      </CardContent>
    </Card>
  );
};

export default AdaptiveMathGame;
