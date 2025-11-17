import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Chip, Typography, Button, Stack, Alert } from '@mui/material';
import { ActivityReward } from '../../types';

interface EmotionDragDropProps {
  onComplete?: (summary: { matched: number; total: number }) => void;
  onSuccess?: (reward: ActivityReward) => void;
}

const EmotionDragDrop: React.FC<EmotionDragDropProps> = ({ onComplete, onSuccess }) => {
  const emotions = useMemo(
    () => [
      { emoji: '😊', label: 'Joie' },
      { emoji: '😢', label: 'Tristesse' },
      { emoji: '😡', label: 'Colère' },
      { emoji: '😨', label: 'Peur' },
    ],
    []
  );

  const [matched, setMatched] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('Fais glisser les émotions vers les bons mots !');
  const [hasCompleted, setHasCompleted] = useState(false);

  const handleMatch = (label: string) => {
    if (!matched.includes(label)) {
      const updated = [...matched, label];
      setMatched(updated);
      const remaining = emotions.length - updated.length;
      const message =
        remaining === 0
          ? 'Bravo ! Tu as identifié toutes les émotions.'
          : `Encore ${remaining} émotions à associer.`;
      setFeedback(message);
      onComplete?.({ matched: updated.length, total: emotions.length });
      if (remaining === 0 && !hasCompleted) {
        onSuccess?.({
          activityId: 'emotions-dnd',
          tokens: 20,
          badgeId: 'badge_empathie',
          message: 'Tu as débloqué le badge empathie !',
        });
        setHasCompleted(true);
      }
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Drag & Drop des émotions
        </Typography>
        <Alert severity={matched.length === emotions.length ? 'success' : 'info'} sx={{ mb: 2 }}>
          {feedback}
        </Alert>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {emotions.map((emotion) => (
            <Chip key={emotion.label} label={`${emotion.emoji} ${emotion.label}`} color="secondary" />
          ))}
        </Stack>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {emotions.map((emotion) => (
            <Button
              key={emotion.label}
              variant={matched.includes(emotion.label) ? 'contained' : 'outlined'}
              onClick={() => handleMatch(emotion.label)}
              disabled={matched.includes(emotion.label)}
            >
              {matched.includes(emotion.label) ? 'Associé !' : `Associer ${emotion.label}`}
            </Button>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default EmotionDragDrop;
