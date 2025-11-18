import React from 'react';
import { Card, CardContent, CardHeader, Typography, Stack, Chip } from '@mui/material';

interface InfoCardProps {
  title: string;
  subtitle?: string;
  description: string;
  badges?: string[];
  action?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, subtitle, description, badges = [], action }) => (
  <Card
    elevation={1}
    aria-label={`${title} card`}
    component="article"
    tabIndex={0}
    sx={{
      outline: 'none',
      minHeight: 44,
      '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
      '&:focus-visible': {
        boxShadow: '0 0 0 3px rgba(93, 139, 244, 0.35)',
      },
    }}
  >
    <CardHeader
      title={
        <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      }
      subheader={subtitle}
      action={action}
      sx={{ pb: 0 }}
    />
    <CardContent>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
      {badges.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" aria-label="tags">
          {badges.map((badge) => (
            <Chip key={badge} label={badge} color="primary" variant="outlined" />
          ))}
        </Stack>
      )}
    </CardContent>
  </Card>
);

export default InfoCard;
