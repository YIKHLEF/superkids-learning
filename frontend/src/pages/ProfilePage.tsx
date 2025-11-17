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
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { RootState } from '../store';
import { togglePreference } from '../store/slices/profileSlice';
import { toggleSetting, setFontSize } from '../store/slices/settingsSlice';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile.currentProfile);
  const settings = useSelector((state: RootState) => state.settings.accessibility);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarName, setAvatarName] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

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

          {/* Objectifs d'apprentissage */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Mes objectifs d'apprentissage
              </Typography>
              {profile?.iepGoals && profile.iepGoals.length > 0 ? (
                <Box component="ul" sx={{ pl: 2 }}>
                  {profile.iepGoals.map((goal, index) => (
                    <Typography component="li" key={index} sx={{ mb: 1 }}>
                      {goal}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucun objectif défini pour le moment
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
