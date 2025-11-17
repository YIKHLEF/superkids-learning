import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Chip, Typography, Stack, Alert, Button } from '@mui/material';

interface CaaBoardProps {
  onMessageBuilt?: (message: string) => void;
}

const CaaBoard: React.FC<CaaBoardProps> = ({ onMessageBuilt }) => {
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

  const addTile = (label: string) => {
    const updated = [...sentence, label];
    setSentence(updated);
    onMessageBuilt?.(updated.join(' '));
  };

  const reset = () => setSentence(['Je veux']);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Tableau CAA
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Construis une phrase en appuyant sur les pictogrammes.
        </Alert>
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
