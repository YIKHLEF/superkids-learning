import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Card, CardContent, Chip, Typography, Stack, Alert, Button } from '@mui/material';
import { ActivityReward, DifficultyLevel } from '../../types';
import analyticsService from '../../services/analytics.service';

interface CaaBoardProps {
  onMessageBuilt?: (message: string) => void;
  onSuccess?: (reward: ActivityReward) => void;
  metadata?: { ebpTags?: string[]; instructions?: string[] };
}

const CaaBoard: React.FC<CaaBoardProps> = ({ onMessageBuilt, onSuccess, metadata }) => {
  const childId = 'demo-child';
  const difficulty = DifficultyLevel.BEGINNER;
  const tiles = useMemo(
    () => [
      { icon: '🧑‍🤝‍🧑', label: 'Je veux' },
      { icon: '🍎', label: 'pomme' },
      { icon: '🚰', label: 'eau' },
      { icon: '🎮', label: 'jouer' },
      { icon: '📖', label: 'lire' },
      { icon: '😊', label: 'pause sensorielle' },
    ],
    []
  );

  const [sentence, setSentence] = useState<string[]>(['Je veux']);
  const [celebrated, setCelebrated] = useState(false);
  const sessionStartRef = useRef(Date.now());

  useEffect(() => {
    analyticsService.sendEvent({
      activityId: 'caa-board',
      childId,
      type: 'activity_start',
      timestamp: new Date().toISOString(),
      difficulty,
      supportLevel: 'none',
    });
  }, [childId, difficulty]);

  const addTile = (label: string) => {
    const updated = [...sentence, label];
    setSentence(updated);
    onMessageBuilt?.(updated.join(' '));

    analyticsService.sendEvent({
      activityId: 'caa-board',
      childId,
      type: 'attempt',
      timestamp: new Date().toISOString(),
      difficulty,
      attempts: updated.length,
      supportLevel: 'moderate',
      dominantEmotion: 'engaged',
      emotionalState: 'engaged',
      durationSeconds: Math.round((Date.now() - sessionStartRef.current) / 1000),
    });

    if (updated.length >= 4 && !celebrated) {
        onSuccess?.({
          activityId: 'caa-board',
          tokens: 15,
          badgeId: 'badge_communicateur',
          message: 'Message complet envoyé !',
        });
        analyticsService.sendEvent({
          activityId: 'caa-board',
          childId,
          type: 'success',
          timestamp: new Date().toISOString(),
          difficulty,
          attempts: updated.length,
          successRate: 1,
          supportLevel: 'moderate',
          dominantEmotion: 'confident',
          emotionalState: 'confident',
          durationSeconds: Math.round((Date.now() - sessionStartRef.current) / 1000),
        });
      setCelebrated(true);
    }
  };

  const reset = () => setSentence(['Je veux']);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Tableau CAA
        </Typography>
        {metadata?.ebpTags && metadata.ebpTags.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
            {metadata.ebpTags.map((tag) => (
              <Chip key={tag} label={`EBP: ${tag}`} color="info" size="small" variant="outlined" />
            ))}
          </Stack>
        )}
        <Alert severity="info" sx={{ mb: 2 }}>
          Construis une phrase en appuyant sur les pictogrammes.
        </Alert>
        {metadata?.instructions && metadata.instructions.length > 0 && (
          <Stack component="ul" spacing={0.5} sx={{ pl: 2, mb: 2 }}>
            {metadata.instructions.map((instruction) => (
              <Typography key={instruction} component="li" variant="body2" color="text.secondary">
                {instruction}
              </Typography>
            ))}
          </Stack>
        )}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
          {tiles.map((tile) => (
            <Chip
              key={tile.label}
              label={`${tile.icon} ${tile.label}`}
              color="primary"
              onClick={() => addTile(tile.label)}
              sx={{ m: 0.5 }}
            />
          ))}
        </Stack>
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.100', minHeight: 72, mb: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {sentence.join(' ')}
          </Typography>
        </Box>
        <Button variant="outlined" onClick={reset}>
          Effacer
        </Button>
      </CardContent>
    </Card>
  );
};

export default CaaBoard;
