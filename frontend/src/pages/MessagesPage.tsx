import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  Button,
  Divider,
  Badge,
  IconButton,
} from '@mui/material';
import { Send as SendIcon, AttachFile as AttachIcon } from '@mui/icons-material';

const MessagesPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [messageText, setMessageText] = useState('');

  const conversations = [
    {
      id: '1',
      name: 'Mme Dupont',
      role: 'Éducatrice',
      lastMessage: 'Excellent progrès cette semaine!',
      time: 'Il y a 2h',
      unread: 2,
      avatar: '👩‍🏫',
    },
    {
      id: '2',
      name: 'M. Martin',
      role: 'Thérapeute',
      lastMessage: 'Rendez-vous confirmé pour demain',
      time: 'Hier',
      unread: 0,
      avatar: '👨‍⚕️',
    },
    {
      id: '3',
      name: 'Parent - Papa',
      role: 'Parent',
      lastMessage: 'Comment s\'est passée la journée?',
      time: 'Il y a 5h',
      unread: 1,
      avatar: '👨',
    },
  ];

  const messages = [
    {
      id: '1',
      sender: 'Mme Dupont',
      text: 'Bonjour! Comment allez-vous aujourd\'hui?',
      time: '10:30',
      isOwn: false,
    },
    {
      id: '2',
      sender: 'Moi',
      text: 'Très bien merci! Les activités se passent super bien.',
      time: '10:35',
      isOwn: true,
    },
    {
      id: '3',
      sender: 'Mme Dupont',
      text: 'Excellent progrès cette semaine! Continuez comme ça.',
      time: '11:20',
      isOwn: false,
    },
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
        Messages
      </Typography>

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 250px)' }}>
        {/* Liste des conversations */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
              <List>
                {conversations.map((conversation, index) => (
                  <React.Fragment key={conversation.id}>
                    <ListItem
                      button
                      selected={selectedConversation === conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: 'primary.light',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={conversation.unread}
                          color="error"
                          overlap="circular"
                        >
                          <Avatar sx={{ backgroundColor: 'secondary.light', fontSize: '1.5rem' }}>
                            {conversation.avatar}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {conversation.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {conversation.time}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="caption" color="primary">
                              {conversation.role}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {conversation.lastMessage}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < conversations.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Zone de conversation */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* En-tête de la conversation */}
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ backgroundColor: 'secondary.light', fontSize: '1.5rem' }}>
                  👩‍🏫
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Mme Dupont
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Éducatrice
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Messages */}
            <CardContent sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        backgroundColor: message.isOwn ? 'primary.main' : 'grey.200',
                        color: message.isOwn ? 'white' : 'text.primary',
                        borderRadius: 2,
                        p: 2,
                      }}
                    >
                      <Typography variant="body1">{message.text}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.8,
                          textAlign: 'right',
                        }}
                      >
                        {message.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>

            {/* Zone de saisie */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="large" sx={{ minWidth: 44, minHeight: 44 }}>
                  <AttachIcon />
                </IconButton>
                <TextField
                  fullWidth
                  placeholder="Écrivez votre message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  multiline
                  maxRows={3}
                />
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleSendMessage}
                  sx={{ minWidth: 120, minHeight: 44 }}
                >
                  Envoyer
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MessagesPage;
