import React from 'react';
import { Box, Typography } from '@mui/material';
import { PictogramAsset } from './pictograms';

interface PictogramProps {
  pictogram: PictogramAsset;
  size?: number;
  showLabel?: boolean;
}

const Pictogram: React.FC<PictogramProps> = ({ pictogram, size = 120, showLabel = true }) => (
  <Box
    role="img"
    aria-label={pictogram.label}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      p: 2,
      borderRadius: 2,
      bgcolor: 'background.paper',
      boxShadow: 1,
      width: size + 32,
    }}
  >
    <Box
      component="img"
      src={pictogram.src}
      alt={pictogram.description}
      sx={{ width: size, height: size, objectFit: 'contain' }}
    />
    {showLabel && (
      <Typography variant="body1" sx={{ fontWeight: 700 }}>
        {pictogram.label}
      </Typography>
    )}
  </Box>
);

export default Pictogram;
