import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  Image as ImageIcon,
  MenuBook as BookIcon,
  School as GuideIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const ResourcesPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  const videos = [
    {
      id: '1',
      title: 'Comment dire bonjour',
      category: 'Communication',
      duration: '2:30',
      description: 'Apprends les différentes façons de saluer',
    },
    {
      id: '2',
      title: 'Partager avec les autres',
      category: 'Social',
      duration: '3:15',
      description: 'Vidéo sur le partage et le tour de rôle',
    },
    {
      id: '3',
      title: 'Se laver les mains étape par étape',
      category: 'Autonomie',
      duration: '1:45',
      description: 'Toutes les étapes pour bien se laver les mains',
    },
  ];

  const pictograms = [
    { id: '1', name: 'Émotions basiques', count: 12, category: 'Émotions' },
    { id: '2', name: 'Routines quotidiennes', count: 24, category: 'Autonomie' },
    { id: '3', name: 'Aliments', count: 36, category: 'Vocabulaire' },
    { id: '4', name: 'Actions', count: 20, category: 'Verbes' },
  ];

  const validateResourceFile = (file: File) => {
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/webm',
    ];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return 'Format non supporté. Ajoute une image, un PDF ou une vidéo mp4/webm.';
    }

    if (file.size > maxSize) {
      return 'Fichier trop volumineux (10 Mo maximum).';
    }

    return null;
  };

  const handleResourceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateResourceFile(file);
    if (validationError) {
      setUploadError(validationError);
      setUploadStatus('');
      return;
    }

    setUploadError(null);
    setSelectedFile(file.name);
    setUploadStatus('Fichier validé et prêt à être envoyé.');
  };

  const socialStories = [
    {
      id: '1',
      title: 'Ma première journée d\'école',
      description: 'Une histoire pour se préparer à aller à l\'école',
      pages: 8,
    },
    {
      id: '2',
      title: 'Aller chez le dentiste',
      description: 'Découvre ce qui se passe lors d\'une visite chez le dentiste',
      pages: 10,
    },
    {
      id: '3',
      title: 'Jouer avec mes amis',
      description: 'Comment interagir et jouer avec d\'autres enfants',
      pages: 6,
    },
  ];

  const guides = [
    {
      id: '1',
      title: 'Guide pour les parents',
      description: 'Comprendre et utiliser l\'application efficacement',
      type: 'PDF',
    },
    {
      id: '2',
      title: 'Stratégies d\'apprentissage',
      description: 'Meilleures pratiques basées sur la recherche',
      type: 'PDF',
    },
    {
      id: '3',
      title: 'FAQ - Questions fréquentes',
      description: 'Réponses aux questions courantes',
      type: 'Web',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Bibliothèque de Ressources
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Explore notre collection de vidéos, pictogrammes, histoires et guides
      </Typography>

      <TextField
        fullWidth
        placeholder="Rechercher une ressource..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Typography fontWeight={600}>Ajouter une nouvelle ressource</Typography>
        <input
          aria-describedby="resource-upload-feedback"
          type="file"
          name="resource"
          onChange={handleResourceUpload}
          accept="image/png,image/jpeg,image/webp,application/pdf,video/mp4,video/webm"
        />
        {selectedFile && !uploadError && (
          <Chip label={`Sélectionné : ${selectedFile}`} color="success" />
        )}
      </Box>
      <Box id="resource-upload-feedback" aria-live="assertive" sx={{ mb: 2 }}>
        {uploadError && (
          <Typography color="error" role="alert">
            {uploadError}
          </Typography>
        )}
        {uploadStatus && !uploadError && (
          <Typography color="success.main">{uploadStatus}</Typography>
        )}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<VideoIcon />} label="Vidéos" />
          <Tab icon={<ImageIcon />} label="Pictogrammes" />
          <Tab icon={<BookIcon />} label="Histoires Sociales" />
          <Tab icon={<GuideIcon />} label="Guides" />
        </Tabs>
      </Box>

      {/* Onglet Vidéos */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {videos.map((video) => (
            <Grid item xs={12} md={6} lg={4} key={video.id}>
              <Card>
                <Box
                  sx={{
                    height: 180,
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                  }}
                >
                  🎬
                </Box>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip label={video.category} size="small" color="primary" />
                    <Typography variant="caption" color="text.secondary">
                      {video.duration}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {video.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {video.description}
                  </Typography>
                  <Button variant="contained" fullWidth>
                    Regarder
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Onglet Pictogrammes */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {pictograms.map((pack) => (
            <Grid item xs={12} sm={6} md={4} key={pack.id}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ fontSize: '4rem', mb: 2 }}>📁</Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {pack.name}
                  </Typography>
                  <Chip label={pack.category} size="small" color="secondary" sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {pack.count} pictogrammes
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Parcourir
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Onglet Histoires Sociales */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {socialStories.map((story) => (
            <Grid item xs={12} md={6} key={story.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        width: 100,
                        height: 120,
                        backgroundColor: 'secondary.light',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        flexShrink: 0,
                      }}
                    >
                      📖
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        {story.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {story.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                        {story.pages} pages
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button variant="contained" size="small">
                          Lire
                        </Button>
                        <Button variant="outlined" size="small">
                          Télécharger
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Onglet Guides */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          {guides.map((guide) => (
            <Grid item xs={12} md={6} key={guide.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        backgroundColor: 'warning.light',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        flexShrink: 0,
                      }}
                    >
                      📄
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {guide.title}
                        </Typography>
                        <Chip label={guide.type} size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {guide.description}
                      </Typography>
                      <Button variant="outlined">Consulter</Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default ResourcesPage;
