import React from 'react';
import { useSelector } from 'react-redux';
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar } from '@mui/material';
import { Settings as SettingsIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { RootState } from '../../store';

const Header: React.FC = () => {
  const profile = useSelector((state: RootState) => state.profile.currentProfile);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Bonjour, {profile?.name || 'Ami'} 👋
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="large"
            aria-label="notifications"
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            <NotificationsIcon />
          </IconButton>

          <IconButton
            size="large"
            aria-label="settings"
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            <SettingsIcon />
          </IconButton>

          <Avatar
            alt={profile?.name}
            src={profile?.avatarUrl}
            sx={{ width: 44, height: 44, ml: 1 }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
