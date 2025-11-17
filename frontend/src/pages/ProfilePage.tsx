import React, { useState } from 'react';
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
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { RootState } from '../store';
import { togglePreference, updateIepGoals, updateRoles, updateSensoryPreferences } from '../store/slices/profileSlice';
import { toggleSetting, setFontSize } from '../store/slices/settingsSlice';
import { IEPGoal, SensoryPreference, UserRole } from '../types';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile.currentProfile);
  const settings = useSelector((state: RootState) => state.settings.accessibility);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarName, setAvatarName] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [iepGoals, setIepGoals] = useState<IEPGoal[]>(profile?.iepGoals || []);
  const [newGoal, setNewGoal] = useState<IEPGoal>({
    id: crypto.randomUUID(),
    title: '',
    status: 'not_started',
  });
  const [roles, setRoles] = useState<UserRole[]>(profile?.roles || []);
  const [sensoryPreferences, setSensoryPreferences] = useState<SensoryPreference[]>(
    profile?.sensoryPreferences || []
  );

  const fontSizeMap = {
    small: 14,
    medium: 16,
    large: 18,
    'extra-large': 20,
  };

  const handleFontSizeChange = (value: number) => {
    const sizes: Array<keyof typeof fontSizeMap> = ['small', 'medium', 'large', 'extra-large'];
    const index = Math.floor((value / 100) * (sizes.length - 1));
    dispatch(setFontSize(sizes[index]));
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
    setNewGoal({ id: crypto.randomUUID(), title: '', status: 'not_started' });
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

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile?.preferences.soundEnabled ?? true}
                      onChange={() => dispatch(togglePreference('soundEnabled'))}
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
                      checked={profile?.preferences.animationsEnabled ?? true}
                      onChange={() => dispatch(togglePreference('animationsEnabled'))}
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
                      checked={profile?.preferences.dyslexiaMode ?? false}
                      onChange={() => dispatch(togglePreference('dyslexiaMode'))}
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
                      checked={profile?.preferences.highContrastMode ?? false}
                      onChange={() => dispatch(togglePreference('highContrastMode'))}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '1rem' }}>
                      Mode haute contraste
                    </Typography>
                  }
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Paramètres d'accessibilité
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.reducedMotion}
                    onChange={() => dispatch(toggleSetting('reducedMotion'))}
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
                    checked={settings.autoRead}
                    onChange={() => dispatch(toggleSetting('autoRead'))}
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
                  Object.keys(fontSizeMap).indexOf(settings.fontSize) *
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
                Taille actuelle: {settings.fontSize}
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
