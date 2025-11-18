import React from 'react';
import { Box, Card, CardContent, Chip, Grid, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { EventAvailable, Forum, TaskAlt } from '@mui/icons-material';

const calendarEvents = [
  {
    title: 'Séance orthophoniste',
    date: '2025-11-20',
    owner: 'Therapeute',
    goal: 'Communication',
  },
  {
    title: 'Rituel autonomie matin',
    date: '2025-11-21',
    owner: 'Parent',
    goal: 'Autonomie',
  },
];

const forumThreads = [
  {
    title: 'Idées pour réduire l’anxiété avant l’école',
    replies: 4,
    author: 'Educateur',
  },
  {
    title: 'Quels pictos pour encourager les demandes ?',
    replies: 3,
    author: 'Orthophoniste',
  },
];

const sharedTasks = [
  { title: 'Ajouter un pictogramme "pause"', owner: 'Parent', status: 'En cours' },
  { title: 'Programmer séance vidéo-modélisation', owner: 'Educateur', status: 'Planifié' },
];

const CollaborationPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Collaboration & Calendrier
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <EventAvailable color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Calendrier partagé
                </Typography>
              </Stack>
              <List>
                {calendarEvents.map((event) => (
                  <ListItem key={event.title} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <ListItemText
                      primary={event.title}
                      secondary={`${event.date} • ${event.owner}`}
                    />
                    <Chip label={event.goal} color="primary" variant="outlined" />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Forum color="secondary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Forum expert
                </Typography>
              </Stack>
              <List>
                {forumThreads.map((thread) => (
                  <ListItem key={thread.title} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <ListItemText
                      primary={thread.title}
                      secondary={`${thread.replies} réponses • ${thread.author}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <TaskAlt color="success" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Objectifs collaboratifs
                </Typography>
              </Stack>
              <List>
                {sharedTasks.map((task) => (
                  <ListItem key={task.title} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <ListItemText primary={task.title} secondary={`Responsable : ${task.owner}`} />
                    <Chip label={task.status} color="success" variant="outlined" />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CollaborationPage;

