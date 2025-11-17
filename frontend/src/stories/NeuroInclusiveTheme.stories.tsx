import type { Meta, StoryObj } from '@storybook/react';
import React, { useMemo, useState } from 'react';
import { ThemeProvider, Box, Stack, Typography, Slider, Chip, FormControlLabel, Switch, Select, MenuItem } from '@mui/material';
import { createAppTheme } from '../styles/theme';
import { AccessibilitySettings } from '../types';

const meta: Meta = {
  title: 'Accessibilite/NeuroInclusiveTheme',
};

export default meta;

type Story = StoryObj;

const baseSettings: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  screenReader: false,
  fontSize: 'medium',
  colorScheme: 'light',
  soundEnabled: true,
  audioCuesEnabled: true,
  animationsEnabled: true,
  contrastLevel: 'standard',
  palette: 'calm',
  globalVolume: 80,
  dyslexiaFont: false,
  autoRead: false,
};

export const InteractivePreview: Story = {
  render: () => {
    const [settings, setSettings] = useState<AccessibilitySettings>(baseSettings);
    const theme = useMemo(() => createAppTheme(settings), [settings]);

    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ p: 3, bgcolor: 'background.default', color: 'text.primary', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Prévisualisation thème neuro-inclusif
          </Typography>

          <Stack spacing={2} direction="row" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="body2">Palette</Typography>
            <Select
              size="small"
              value={settings.palette}
              onChange={(event) => setSettings((prev) => ({ ...prev, palette: event.target.value as AccessibilitySettings['palette'] }))}
            >
              <MenuItem value="calm">Apaisante</MenuItem>
              <MenuItem value="vibrant">Stimulante</MenuItem>
              <MenuItem value="monochrome">Monochrome</MenuItem>
            </Select>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.dyslexiaFont}
                  onChange={(event) => setSettings((prev) => ({ ...prev, dyslexiaFont: event.target.checked }))}
                />
              }
              label="Police dyslexie"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.highContrast}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      highContrast: event.target.checked,
                      contrastLevel: event.target.checked ? 'high' : 'standard',
                    }))
                  }
                />
              }
              label="Contraste élevé"
            />
          </Stack>

          <Typography variant="body2">Intensité du contraste</Typography>
          <Slider
            value={['standard', 'high', 'maximum'].indexOf(settings.contrastLevel) * (100 / 2)}
            onChange={(_, value) => {
              const levels: AccessibilitySettings['contrastLevel'][] = ['standard', 'high', 'maximum'];
              const index = Math.floor((value as number) / 50);
              setSettings((prev) => ({ ...prev, contrastLevel: levels[index], highContrast: levels[index] !== 'standard' }));
            }}
            marks
            min={0}
            max={100}
            step={50}
            sx={{ maxWidth: 320, mb: 2 }}
            aria-label="Contraste storybook"
          />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            <Chip label="Primaire" color="primary" />
            <Chip label="Secondaire" color="secondary" />
            <Chip label="Texte" variant="outlined" />
          </Box>
        </Box>
      </ThemeProvider>
    );
  },
};
