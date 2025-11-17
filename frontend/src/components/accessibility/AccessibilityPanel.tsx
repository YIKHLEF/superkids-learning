import React, { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import AccessibilityToggle from './AccessibilityToggle';

interface AccessibilityPanelProps {
  onChange?: (options: { dyslexiaMode: boolean; highContrast: boolean }) => void;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ onChange }) => {
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const handleChange = (key: 'dyslexiaMode' | 'highContrast', value: boolean) => {
    if (key === 'dyslexiaMode') {
      setDyslexiaMode(value);
    }
    if (key === 'highContrast') {
      setHighContrast(value);
    }
    onChange?.({ dyslexiaMode: key === 'dyslexiaMode' ? value : dyslexiaMode, highContrast: key === 'highContrast' ? value : highContrast });
  };

  return (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        Accessibilité
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ajustez l&apos;interface pour un meilleur confort visuel.
      </Typography>
      <Stack spacing={1.5}>
        <AccessibilityToggle
          id="toggle-dyslexia"
          label="Mode dyslexie"
          description="Active une police plus lisible et des espacements plus larges."
          checked={dyslexiaMode}
          onToggle={(checked) => handleChange('dyslexiaMode', checked)}
        />
        <AccessibilityToggle
          id="toggle-contrast"
          label="Haut contraste"
          description="Augmente le contraste pour une meilleure lisibilité."
          checked={highContrast}
          onToggle={(checked) => handleChange('highContrast', checked)}
        />
      </Stack>
    </Box>
  );
};

export default AccessibilityPanel;
