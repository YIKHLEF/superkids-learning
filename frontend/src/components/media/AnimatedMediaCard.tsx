import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface AnimatedMediaCardProps {
  title: string;
  detail: string;
  children: React.ReactNode;
}

const AnimatedMediaCard: React.FC<AnimatedMediaCardProps> = ({ title, detail, children }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
    <Box sx={{ p: 2, borderRadius: 2, boxShadow: 1, bgcolor: 'background.paper' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {detail}
      </Typography>
      {children}
    </Box>
  </motion.div>
);

export default AnimatedMediaCard;
