import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Search as SearchIcon,
  Tag as TagIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  fetchResources,
  searchResources,
  setFilters,
  setSearch,
  toggleFavorite,
} from '../store/slices/resourceSlice';
import { pictogramLibrary, pictogramsById } from '../components/accessibility/pictograms';
import { Resource } from '../types';

const resourceTypes = [
  { value: 'video', label: 'Vidéos' },
  { value: 'pictogram', label: 'Pictogrammes' },
  { value: 'social_story', label: 'Histoires sociales' },
  { value: 'guide', label: 'Guides' },
  { value: 'tutorial', label: 'Tutoriels' },
];

const categoryOptions = ['Émotions', 'Communication', 'Autonomie', 'Apprentissages'];

const tagPalette = ['émotions', 'communication', 'autonomie', 'routine', 'joie', 'aider'];

const ResourcesPage: React.FC = () => {
  const dispatch = useDispatch();
  const { items, favorites, filters, search, status } = useSelector(
    (state: RootState) => state.resources
  );
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    dispatch(fetchResources(filters));
  }, [dispatch, filters]);

  const handleTypeChange = (event: SelectChangeEvent) => {
    dispatch(setFilters({ ...filters, type: event.target.value || undefined }));
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    dispatch(setFilters({ ...filters, category: event.target.value || undefined }));
  };

  const handleSearch = (value: string) => {
    setLocalSearch(value);
    dispatch(setSearch(value));
    dispatch(searchResources({ query: value, params: filters }));
  };

  const handleToggleFavorite = (resource: Resource) => {
    dispatch(toggleFavorite({ id: resource.id, isFavorite: !resource.isFavorite }));
  };

  const filteredTags = useMemo(() => filters.tags || [], [filters.tags]);

  const addTag = (tag: string) => {
    const newTags = filteredTags.includes(tag)
      ? filteredTags.filter((t) => t !== tag)
      : [...filteredTags, tag];
    dispatch(setFilters({ ...filters, tags: newTags }));
  };

  const renderPictogram = (resource: Resource) => {
    const candidate = resource.assetUrl
      ? { src: resource.assetUrl, label: resource.title }
      : pictogramsById[resource.tags[0]] || pictogramLibrary[0];

    return (
      <Box
        sx={{
          height: 120,
          backgroundColor: 'secondary.light',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src={candidate.src}
          alt={candidate.label}
          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
        />
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Bibliothèque de Ressources
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Rechercher, filtrer et enregistrer vos contenus préférés.
      </Typography>

      <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Rechercher une ressource..."
          value={localSearch}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Select
          displayEmpty
          value={filters.type || ''}
          onChange={handleTypeChange}
          renderValue={(value) => value || 'Type'}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Tous les types</MenuItem>
          {resourceTypes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <Select
          displayEmpty
          value={filters.category || ''}
          onChange={handleCategoryChange}
          renderValue={(value) => value || 'Catégorie'}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Toutes les catégories</MenuItem>
          {categoryOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap" gap={1}>
        {tagPalette.map((tag) => (
          <Chip
            key={tag}
            icon={<TagIcon />}
            label={tag}
            color={filteredTags.includes(tag) ? 'primary' : 'default'}
            onClick={() => addTag(tag)}
          />
        ))}
      </Stack>

      <Grid container spacing={3} alignItems="stretch">
        {items.map((resource) => (
          <Grid item xs={12} md={6} lg={4} key={resource.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {resource.type === 'pictogram' ? (
                renderPictogram(resource)
              ) : (
                <Box
                  sx={{
                    height: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    gap: 1,
                  }}
                >
                  <CategoryIcon />
                  <Typography>{resource.type}</Typography>
                </Box>
              )}
              <CardContent sx={{ flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Chip label={resource.category} size="small" />
                  <IconButton
                    aria-label={resource.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    onClick={() => handleToggleFavorite(resource)}
                    color={resource.isFavorite || favorites[resource.id] ? 'error' : 'default'}
                  >
                    {resource.isFavorite || favorites[resource.id] ? (
                      <FavoriteIcon />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                </Stack>
                <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
                  {resource.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {resource.description}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {resource.tags.slice(0, 4).map((tag) => (
                    <Chip key={tag} size="small" label={tag} />
                  ))}
                </Stack>
                <Button
                  variant="outlined"
                  href={resource.url || resource.assetUrl}
                  target="_blank"
                  sx={{ mt: 2 }}
                >
                  Ouvrir
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {status === 'loading' && (
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Chargement des ressources...
        </Typography>
      )}

      {items.length === 0 && status === 'succeeded' && (
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Aucune ressource trouvée pour les filtres actuels.
        </Typography>
      )}
    </Box>
  );
};

export default ResourcesPage;
