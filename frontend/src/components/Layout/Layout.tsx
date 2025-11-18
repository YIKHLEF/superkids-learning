import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navigation from './Navigation';
import Header from './Header';
import AccessibilityControls from './AccessibilityControls';

const Layout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navigation />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box component="section" sx={{ px: 3 }}>
          <AccessibilityControls />
        </Box>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
