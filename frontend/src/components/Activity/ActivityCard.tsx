import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
} from '@mui/material';
import { Activity, DifficultyLevel } from '../../types';

interface ActivityCardProps {
  activity: Activity;
  onStart: (activityId: string) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onStart }) => {
  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER:
        return 'success';
      case DifficultyLevel.INTERMEDIATE:
        return 'warning';
      case DifficultyLevel.ADVANCED:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <Box
        sx={{
          height: 200,
          backgroundColor: 'secondary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4rem',
        }}
      >
        {activity.thumbnailUrl ? (
          <CardMedia
            component="img"
            height="200"
            image={activity.thumbnailUrl}
            alt={activity.title}
          />
        ) : (
          '🎯'
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label={activity.difficulty}
            size="small"
            color={getDifficultyColor(activity.difficulty)}
          />
          <Chip label={`${activity.duration} min`} size="small" variant="outlined" />
        </Box>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {activity.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          {activity.description}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => onStart(activity.id)}
        >
          Commencer
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
