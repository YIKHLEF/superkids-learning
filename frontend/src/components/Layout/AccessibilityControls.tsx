import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Button,
  Chip,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setContrastLevel, setFontSize, setTheme, toggleSetting, updateAccessibility } from '../../store/slices/settingsSlice';
import { ThemeVariant } from '../../styles/theme';
import { AccessibilitySettings } from '../../types';

const fontSizeOptions: AccessibilitySettings['fontSize'][] = ['small', 'medium', 'large', 'extra-large'];
const contrastOptions: AccessibilitySettings['contrastLevel'][] = ['standard', 'high', 'maximum'];

const themeVariantLabels: Record<ThemeVariant, string> = {
  default: 'Standard',
  'high-contrast': 'Haut contraste',
  dyslexia: 'Dyslexie',
  hypersensitive: 'Hypersensibilité',
};

const AccessibilityControls: React.FC = () => {
  const dispatch = useDispatch();
  const { accessibility, theme } = useSelector((state: RootState) => state.settings);
  const liveStatus = useMemo(() => {
    if (theme === 'high-contrast') return 'Mode haut contraste activé';
    if (theme === 'dyslexia') return 'Police dyslexie activée';
    if (theme === 'hypersensitive') return 'Mode hypersensibilité activé';
    return 'Mode standard activé';
  }, [theme]);

  const handleThemeChange = (variant: ThemeVariant) => {
    dispatch(setTheme(variant));
  };

  return (
    <Card sx={{ mb: 2, borderRadius: 3 }} role="region" aria-label="Contrôles d'accessibilité globaux">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" component="h2">
              Accessibilité globale
            </Typography>
            <Typography variant="body2" color="text.secondary" aria-live="polite">
              {liveStatus}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" aria-label="Choix de thèmes">
            {(Object.keys(themeVariantLabels) as ThemeVariant[]).map((variant) => (
              <Button
                key={variant}
                variant={theme === variant ? 'contained' : 'outlined'}
                color="primary"
                size="large"
                onClick={() => handleThemeChange(variant)}
                sx={{ minWidth: 120, minHeight: 44 }}
                aria-pressed={theme === variant}
              >
                {themeVariantLabels[variant]}
              </Button>
            ))}
          </Stack>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <Stack spacing={1} flex={1} aria-label="Paramètres visuels">
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={accessibility.animationsEnabled}
                  onChange={(event) =>
                    dispatch(updateAccessibility({ animationsEnabled: event.target.checked, reducedMotion: !event.target.checked }))
                  }
                  inputProps={{ 'aria-label': 'Basculer les animations globales' }}
                />
              }
              label="Animations"
            />
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={accessibility.soundEnabled}
                  onChange={(event) =>
                    dispatch(
                      updateAccessibility({
                        soundEnabled: event.target.checked,
                        globalVolume: event.target.checked ? Math.max(20, accessibility.globalVolume) : 0,
                      }),
                    )
                  }
                  inputProps={{ 'aria-label': 'Activer ou couper le son global' }}
                />
              }
              label="Audio"
            />
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={accessibility.dyslexiaFont}
                  onChange={() => dispatch(toggleSetting('dyslexiaFont'))}
                  inputProps={{ 'aria-label': 'Police dyslexie' }}
                />
              }
              label="Police dyslexie"
            />
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={accessibility.highContrast || accessibility.contrastLevel !== 'standard'}
                  onChange={(event) => dispatch(setContrastLevel(event.target.checked ? 'high' : 'standard'))}
                  inputProps={{ 'aria-label': 'Activer le contraste élevé' }}
                />
              }
              label="Contraste renforcé"
            />
          </Stack>

          <Stack spacing={2} flex={1} aria-label="Sélecteurs de préférences">
            <Box>
              <Typography id="font-size-label" variant="body2" sx={{ mb: 0.5 }}>
                Taille de police
              </Typography>
              <Select
                aria-labelledby="font-size-label"
                size="small"
                value={accessibility.fontSize}
                onChange={(event) => dispatch(setFontSize(event.target.value as AccessibilitySettings['fontSize']))}
                sx={{ minHeight: 44, minWidth: 180 }}
              >
                {fontSizeOptions.map((size) => (
                  <MenuItem key={size} value={size} sx={{ minHeight: 44 }}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box>
              <Typography id="contrast-select-label" variant="body2" sx={{ mb: 0.5 }}>
                Niveau de contraste
              </Typography>
              <Select
                aria-labelledby="contrast-select-label"
                size="small"
                value={accessibility.contrastLevel}
                onChange={(event) => dispatch(setContrastLevel(event.target.value as AccessibilitySettings['contrastLevel']))}
                sx={{ minHeight: 44, minWidth: 180 }}
              >
                {contrastOptions.map((level) => (
                  <MenuItem key={level} value={level} sx={{ minHeight: 44 }}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center" aria-label="Indicateurs de confort immédiat">
              <Chip label={accessibility.reducedMotion ? 'Mouvements réduits' : 'Animations actives'} color="secondary" />
              <Chip label={accessibility.soundEnabled ? 'Audio actif' : 'Audio coupé'} color="secondary" variant="outlined" />
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AccessibilityControls;
