import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from '@mui/material';
import {
  Home as HomeIcon,
  Extension as ActivitiesIcon,
  Person as ProfileIcon,
  Analytics as AnalyticsIcon,
  LibraryBooks as ResourcesIcon,
  Message as MessagesIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

const navigationItems = [
  { label: 'Accueil', path: '/dashboard', icon: <HomeIcon /> },
  { label: 'Activités', path: '/activities', icon: <ActivitiesIcon /> },
  { label: 'Mon Profil', path: '/profile', icon: <ProfileIcon /> },
  { label: 'Mes Progrès', path: '/analytics', icon: <AnalyticsIcon /> },
  { label: 'Ressources', path: '/resources', icon: <ResourcesIcon /> },
  { label: 'Messages', path: '/messages', icon: <MessagesIcon /> },
];

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
          SuperKids
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Apprendre en s'amusant
        </Typography>
      </Box>

      <List sx={{ px: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                minHeight: 56,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 44, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '1rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Navigation;
