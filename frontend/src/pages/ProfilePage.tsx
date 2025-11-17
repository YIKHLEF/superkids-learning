import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Slider,
  TextField,
  Chip,
  Stack,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  useTheme,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { RootState } from '../store';
import {
  togglePreference,
  updateIepGoals,
  updateRoles,
  updateSensoryPreferences,
  updateUiPreferences,
} from '../store/slices/profileSlice';
import {
  toggleSetting,
  setFontSize,
  setPalette,
  setContrastLevel,
  setColorScheme,
  setGlobalVolume,
  updateAccessibility,
} from '../store/slices/settingsSlice';
import { IEPGoal, SensoryPreference, UserRole } from '../types';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile.currentProfile);
  const accessibility = useSelector((state: RootState) => state.settings.accessibility);
  const theme = useTheme();
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarName, setAvatarName] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [iepGoals, setIepGoals] = useState<IEPGoal[]>(profile?.iepGoals || []);
  const [newGoal, setNewGoal] = useState<IEPGoal>({
    id: crypto.randomUUID(),
    title: '',
    description: '',
    targetDate: '',
    status: 'not_started',
  });
  const [roles, setRoles] = useState<UserRole[]>(profile?.roles || []);
  const [sensoryPreferences, setSensoryPreferences] = useState<SensoryPreference[]>(
    profile?.sensoryPreferences || []
  );
  const uiPreferences = profile?.uiPreferences ?? accessibility;

  useEffect(() => {
    if (profile?.uiPreferences) {
      dispatch(updateAccessibility(profile.uiPreferences));
    }
  }, [dispatch, profile?.uiPreferences]);

  useEffect(() => {
    setIepGoals(profile?.iepGoals || []);
    setRoles(profile?.roles || []);
    setSensoryPreferences(profile?.sensoryPreferences || []);
  }, [profile]);

  const fontSizeMap = {
    small: 14,
    medium: 16,
    large: 18,
    'extra-large': 20,
  };

  const handleFontSizeChange = (value: number) => {
    const sizes: Array<keyof typeof fontSizeMap> = ['small', 'medium', 'large', 'extra-large'];
    const index = Math.floor((value / 100) * (sizes.length - 1));
    const nextSize = sizes[index];
    dispatch(setFontSize(nextSize));
    dispatch(updateUiPreferences({ fontSize: nextSize }));
  };

  const handleContrastChange = (value: number) => {
    const levels: Array<typeof accessibility.contrastLevel> = ['standard', 'high', 'maximum'];
    const index = Math.floor((value / 100) * (levels.length - 1));
    const nextLevel = levels[index];
    dispatch(setContrastLevel(nextLevel));
    dispatch(updateUiPreferences({ contrastLevel: nextLevel, highContrast: nextLevel !== 'standard' }));
  };

  const validateAvatar = (file: File) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return 'Format non supporté. Utilise PNG, JPEG ou WEBP.';
    }

    if (file.size > maxSize) {
      return 'Fichier trop volumineux (5 Mo maximum).';
    }

    return null;
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateAvatar(file);
    if (validationError) {
      setAvatarError(validationError);
      setUploadMessage('');
      return;
    }

    setAvatarError(null);
    setAvatarName(file.name);
    setUploadMessage('Avatar prêt à être envoyé.');
  };

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;
    const updatedGoals = [...iepGoals, { ...newGoal, id: crypto.randomUUID() }];
    setIepGoals(updatedGoals);
    dispatch(updateIepGoals(updatedGoals));
    setNewGoal({ id: crypto.randomUUID(), title: '', description: '', targetDate: '', status: 'not_started' });
  };

  const handleUpdateGoal = (id: string, field: keyof IEPGoal, value: string) => {
    const updatedGoals = iepGoals.map((goal) => (goal.id === id ? { ...goal, [field]: value } : goal));
    setIepGoals(updatedGoals);
    dispatch(updateIepGoals(updatedGoals));
  };

  const handleRemoveGoal = (id: string) => {
    const updatedGoals = iepGoals.filter((goal) => goal.id !== id);
    setIepGoals(updatedGoals);
    dispatch(updateIepGoals(updatedGoals));
  };

  const toggleSensoryPreference = (preference: SensoryPreference) => {
    const hasPreference = sensoryPreferences.includes(preference);
    const updated = hasPreference
      ? sensoryPreferences.filter((pref) => pref !== preference)
      : [...sensoryPreferences, preference];
    setSensoryPreferences(updated);
    dispatch(updateSensoryPreferences(updated));
  };

  const toggleRole = (role: UserRole) => {
    const updated = roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role];
    setRoles(updated);
    dispatch(updateRoles(updated));
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
        Mon Profil
      </Typography>

      <Grid container spacing={3}>
        {/* Informations du profil */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={profile?.avatarUrl}
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  mb: 2,
                  backgroundColor: 'primary.light',
                  fontSize: '3rem',
                }}
              >
                {profile?.name?.charAt(0) || '👤'}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {profile?.name || 'Mon nom'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {profile?.age || 0} ans
              </Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                fullWidth
                sx={{ minHeight: 44 }}
              >
                Modifier le profil
              </Button>
              <Box sx={{ mt: 3, textAlign: 'left' }}>
                <Typography component="label" htmlFor="avatar-upload" fontWeight={600}>
                  Mettre à jour l'avatar
                </Typography>
                <input
                  id="avatar-upload"
                  name="avatar"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarChange}
                  aria-describedby="avatar-error"
                  style={{ marginTop: 8 }}
                />
                {avatarName && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Fichier sélectionné : {avatarName}
                  </Typography>
                )}
                {avatarError && (
                  <Typography
                    id="avatar-error"
                    role="alert"
                    aria-live="assertive"
                    color="error"
                    variant="body2"
                    sx={{ mt: 1 }}
                  >
                    {avatarError}
                  </Typography>
                )}
                {uploadMessage && !avatarError && (
                  <Typography color="success.main" variant="body2" sx={{ mt: 1 }}>
                    {uploadMessage}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Préférences */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Préférences d'apprentissage
              </Typography>

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Préférences sensorielles
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                {(Object.values(SensoryPreference) as SensoryPreference[]).map((preference) => (
                  <Chip
                    key={preference}
                    label={preference.replace('_', ' ').toLowerCase()}
                    color={sensoryPreferences.includes(preference) ? 'primary' : 'default'}
                    onClick={() => toggleSensoryPreference(preference)}
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
              </Stack>

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Préférences sensorielles & UI
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="palette-label">Palette neuro-inclusive</InputLabel>
                    <Select
                      labelId="palette-label"
                      label="Palette neuro-inclusive"
                      value={uiPreferences.palette}
                      onChange={(event) => {
                        const palette = event.target.value as typeof accessibility.palette;
                        dispatch(setPalette(palette));
                        dispatch(updateUiPreferences({ palette }));
                      }}
                    >
                      <MenuItem value="calm">Apaisante</MenuItem>
                      <MenuItem value="vibrant">Stimulante douce</MenuItem>
                      <MenuItem value="monochrome">Monochrome</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="color-scheme-label">Contraste clair/sombre</InputLabel>
                    <Select
                      labelId="color-scheme-label"
                      label="Contraste clair/sombre"
                      value={uiPreferences.colorScheme}
                      onChange={(event) => {
                        const colorScheme = event.target.value as typeof accessibility.colorScheme;
                        dispatch(setColorScheme(colorScheme));
                        dispatch(updateUiPreferences({ colorScheme }));
                      }}
                    >
                      <MenuItem value="light">Clair</MenuItem>
                      <MenuItem value="dark">Sombre</MenuItem>
                      <MenuItem value="auto">Auto</MenuItem>
                    </Select>
                  </FormControl>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Intensité du contraste
                  </Typography>
                  <Slider
                    aria-label="Intensité du contraste"
                    value={
                      ['standard', 'high', 'maximum'].indexOf(uiPreferences.contrastLevel) *
                      (100 / (['standard', 'high', 'maximum'].length - 1))
                    }
                    onChange={(_, value) => handleContrastChange(value as number)}
                    step={50}
                    marks
                    min={0}
                    max={100}
                    sx={{ maxWidth: 360, mb: 2 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Niveau actuel : {uiPreferences.contrastLevel}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Volume global
                  </Typography>
                  <Slider
                    aria-label="Volume global"
                    value={uiPreferences.globalVolume}
                    onChange={(_, value) => {
                      const volume = value as number;
                      dispatch(setGlobalVolume(volume));
                      dispatch(updateUiPreferences({
                        globalVolume: volume,
                        soundEnabled: volume > 0,
                      }));
                    }}
                    step={10}
                    marks
                    min={0}
                    max={100}
                    sx={{ maxWidth: 360, mb: 2 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {uiPreferences.globalVolume === 0
                      ? 'Sons désactivés'
                      : `Volume à ${uiPreferences.globalVolume}%`}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                    aria-label="Prévisualisation du thème"
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                      Prévisualisation immédiate
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Typographie actuelle, contrastes et palette appliqués en direct.
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      <Chip label="Bouton" color="primary" />
                      <Chip label="Secondaire" color="secondary" />
                      <Chip label="Texte" variant="outlined" />
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={accessibility.soundEnabled}
                      onChange={() => {
                        const nextSoundEnabled = !accessibility.soundEnabled;
                        dispatch(togglePreference('soundEnabled'));
                        dispatch(toggleSetting('soundEnabled'));
                        dispatch(
                          updateUiPreferences({
                            soundEnabled: nextSoundEnabled,
                            globalVolume: nextSoundEnabled ? accessibility.globalVolume : 0,
                          })
                        );
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '1rem' }}>
                      Activer les sons
                    </Typography>
                  }
                  sx={{ mb: 2 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={accessibility.animationsEnabled}
                      onChange={() => {
                        const nextAnimations = !accessibility.animationsEnabled;
                        dispatch(togglePreference('animationsEnabled'));
                        dispatch(toggleSetting('animationsEnabled'));
                        dispatch(updateUiPreferences({ animationsEnabled: nextAnimations }));
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '1rem' }}>
                      Activer les animations
                    </Typography>
                  }
                  sx={{ mb: 2 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={accessibility.dyslexiaFont}
                      onChange={() => {
                        const nextDyslexia = !accessibility.dyslexiaFont;
                        dispatch(togglePreference('dyslexiaMode'));
                        dispatch(toggleSetting('dyslexiaFont'));
                        dispatch(updateUiPreferences({ dyslexiaFont: nextDyslexia }));
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '1rem' }}>
                      Mode dyslexie (police spéciale)
                    </Typography>
                  }
                  sx={{ mb: 2 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={accessibility.highContrast}
                      onChange={() => {
                        const nextHighContrast = !accessibility.highContrast;
                        dispatch(togglePreference('highContrastMode'));
                        dispatch(toggleSetting('highContrast'));
                        dispatch(
                          updateUiPreferences({
                            highContrast: nextHighContrast,
                            contrastLevel: nextHighContrast ? 'maximum' : accessibility.contrastLevel,
                          })
                        );
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '1rem' }}>
                      Mode haute contraste
                    </Typography>
                  }
                  sx={{ mb: 2 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={accessibility.audioCuesEnabled}
                      onChange={() => {
                        const nextAudioCues = !accessibility.audioCuesEnabled;
                        dispatch(toggleSetting('audioCuesEnabled'));
                        dispatch(updateUiPreferences({ audioCuesEnabled: nextAudioCues }));
                      }}
                    />
                  }
                  label={<Typography sx={{ fontSize: '1rem' }}>Indices audio discrets</Typography>}
                  sx={{ mb: 2 }}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Paramètres d'accessibilité
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={accessibility.reducedMotion}
                    onChange={() => {
                      const nextReducedMotion = !accessibility.reducedMotion;
                      dispatch(toggleSetting('reducedMotion'));
                      dispatch(updateUiPreferences({ reducedMotion: nextReducedMotion }));
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '1rem' }}>
                    Réduire les mouvements
                  </Typography>
                }
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={accessibility.autoRead}
                    onChange={() => {
                      const nextAutoRead = !accessibility.autoRead;
                      dispatch(toggleSetting('autoRead'));
                      dispatch(updateUiPreferences({ autoRead: nextAutoRead }));
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '1rem' }}>
                    Lecture automatique du texte
                  </Typography>
                }
                sx={{ mb: 3 }}
              />

              <Typography variant="body2" sx={{ mb: 1 }}>
                Taille du texte
              </Typography>
              <Slider
                value={
                  Object.keys(fontSizeMap).indexOf(accessibility.fontSize) *
                  (100 / (Object.keys(fontSizeMap).length - 1))
                }
                onChange={(_, value) => handleFontSizeChange(value as number)}
                step={33.33}
                marks
                min={0}
                max={100}
                sx={{ maxWidth: 400 }}
              />
              <Typography variant="caption" color="text.secondary">
                Taille actuelle: {accessibility.fontSize}
              </Typography>
            </CardContent>
          </Card>

          {/* Objectifs IEP structurés */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Objectifs IEP
              </Typography>
              <Stack spacing={2} sx={{ mb: 3 }}>
                {iepGoals.map((goal) => (
                  <Box key={goal.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <TextField
                      fullWidth
                      label="Titre"
                      value={goal.title}
                      onChange={(e) => handleUpdateGoal(goal.id, 'title', e.target.value)}
                      sx={{ mb: 2 }}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Description"
                      value={goal.description || ''}
                      onChange={(e) => handleUpdateGoal(goal.id, 'description', e.target.value)}
                      sx={{ mb: 2 }}
                      multiline
                      minRows={2}
                    />
                    <TextField
                      fullWidth
                      label="Date cible"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={goal.targetDate || ''}
                      onChange={(e) => handleUpdateGoal(goal.id, 'targetDate', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      select
                      fullWidth
                      label="Statut"
                      value={goal.status}
                      onChange={(e) => handleUpdateGoal(goal.id, 'status', e.target.value)}
                    >
                      <MenuItem value="not_started">Non commencé</MenuItem>
                      <MenuItem value="in_progress">En cours</MenuItem>
                      <MenuItem value="achieved">Atteint</MenuItem>
                    </TextField>
                    <Button color="error" sx={{ mt: 1 }} onClick={() => handleRemoveGoal(goal.id)}>
                      Supprimer l'objectif
                    </Button>
                  </Box>
                ))}
              </Stack>

              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Ajouter un objectif
              </Typography>
              <TextField
                fullWidth
                label="Titre"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                sx={{ mb: 2 }}
                multiline
                minRows={2}
              />
              <TextField
                fullWidth
                label="Date cible"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={handleAddGoal} disabled={!newGoal.title.trim()}>
                Ajouter
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Rôles associés au profil
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {(Object.values(UserRole) as UserRole[]).map((role) => (
                  <Chip
                    key={role}
                    label={role.toLowerCase()}
                    color={roles.includes(role) ? 'primary' : 'default'}
                    onClick={() => toggleRole(role)}
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
