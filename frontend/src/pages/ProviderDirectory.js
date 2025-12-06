import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Badge from '@mui/material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const ProviderDirectory = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'rating',
    searchTerm: '',
  });

  const categories = [
    'cleaning',
    'handyman',
    'babysitting',
    'labor',
    'moving',
    'gardening',
    'other',
  ];

  const sortOptions = [
    { value: 'rating', label: 'Highest Rating' },
    { value: 'reviewCount', label: 'Most Reviews' },
    { value: 'completedTasks', label: 'Most Tasks Completed' },
    { value: 'newest', label: 'Newest Members' },
  ];

  useEffect(() => {
    fetchProviders();
  }, [filters]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.category) params.append('category', filters.category);

      const response = await api.get(`/api/users/providers?${params}`);
      let providerList = response.data.providers || [];

      // Filter by search term
      if (filters.searchTerm) {
        providerList = providerList.filter(
          (provider) =>
            provider.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            provider.bio?.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      }

      // Sort providers
      if (filters.sortBy === 'rating') {
        providerList.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
      } else if (filters.sortBy === 'reviewCount') {
        providerList.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
      } else if (filters.sortBy === 'completedTasks') {
        providerList.sort((a, b) => (b.completed_tasks || 0) - (a.completed_tasks || 0));
      } else if (filters.sortBy === 'newest') {
        providerList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      setProviders(providerList);
    } catch (error) {
      console.error('Fetch providers error:', error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const getTrustBadges = (provider) => {
    const badges = [];
    if (provider.avg_rating >= 4.8) badges.push({ label: 'Top Rated', color: 'gold' });
    if (provider.completed_tasks >= 50) badges.push({ label: 'Expert', color: 'primary' });
    if (provider.verified) badges.push({ label: 'Verified', color: 'success' });
    return badges;
  };

  const getSpecialtyColor = (specialty) => {
    const colors = {
      cleaning: '#FF9800',
      handyman: '#2196F3',
      babysitting: '#E91E63',
      labor: '#FF5252',
      moving: '#9C27B0',
      gardening: '#4CAF50',
      other: '#757575',
    };
    return colors[specialty] || '#757575';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
          <WorkIcon sx={{ fontSize: 40, color: '#667eea' }} />
          <Typography variant="h3" component="h1">
            Find Service Providers
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Browse skilled professionals in your area and check their reviews
        </Typography>

        {/* Search and Filter Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Search Providers"
                placeholder="Enter name or specialty..."
                fullWidth
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters({ ...filters, searchTerm: e.target.value })
                }
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Specialty</InputLabel>
                <Select
                  value={filters.category}
                  label="Specialty"
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                >
                  <MenuItem value="">All Specialties</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  label="Sort By"
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={fetchProviders}
                fullWidth
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : providers.length === 0 ? (
        <Card>
          <CardContent>
            <Typography textAlign="center" color="text.secondary" variant="h6">
              No providers found matching your criteria
            </Typography>
            <Typography textAlign="center" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your filters or check back later
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Count */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Found <strong>{providers.length}</strong> provider{providers.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {/* Providers Grid */}
          <Grid container spacing={3}>
            {providers.map((provider) => (
              <Grid item xs={12} sm={6} md={4} key={provider.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  {/* Cover Image */}
                  <Box
                    sx={{
                      height: 150,
                      bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      pb: 2,
                      position: 'relative',
                    }}
                  >
                    {provider.verified && (
                      <Badge
                        badgeContent={
                          <VerifiedUserIcon
                            sx={{
                              fontSize: 24,
                              color: '#4CAF50',
                              bgcolor: 'white',
                              borderRadius: '50%',
                            }}
                          />
                        }
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                        }}
                      >
                        <Box />
                      </Badge>
                    )}
                  </Box>

                  {/* Avatar */}
                  <Box sx={{ mt: -3, mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: '#667eea',
                        fontSize: 32,
                        fontWeight: 700,
                        border: '4px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                    >
                      {provider.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </Box>

                  {/* Content Section */}
                  <CardContent sx={{ pb: 1, textAlign: 'center', flex: 1 }}>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      {provider.name}
                    </Typography>

                    {/* Specialty Chips */}
                    {provider.specialties && provider.specialties.length > 0 && (
                      <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {provider.specialties.slice(0, 2).map((specialty, idx) => (
                          <Chip
                            key={idx}
                            label={specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                            size="small"
                            sx={{
                              bgcolor: getSpecialtyColor(specialty),
                              color: 'white',
                              fontWeight: 500,
                            }}
                          />
                        ))}
                      </Box>
                    )}

                    {/* Rating */}
                    <Box sx={{ mb: 1 }}>
                      <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} sx={{ mb: 0.5 }}>
                        <Rating
                          value={provider.avg_rating || 0}
                          readOnly
                          precision={0.5}
                          size="small"
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(provider.avg_rating || 0).toFixed(1)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {provider.review_count || 0} review{(provider.review_count || 0) !== 1 ? 's' : ''}
                      </Typography>
                    </Box>

                    {/* Bio */}
                    {provider.bio && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: 40,
                        }}
                      >
                        {provider.bio}
                      </Typography>
                    )}

                    {/* Stats */}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1,
                          bgcolor: '#f0f2f5',
                          textAlign: 'center',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                          {provider.completed_tasks || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tasks Done
                        </Typography>
                      </Paper>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1,
                          bgcolor: '#f0f2f5',
                          textAlign: 'center',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#764ba2' }}>
                          {provider.response_rate || 100}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Response Rate
                        </Typography>
                      </Paper>
                    </Box>

                    {/* Badges */}
                    {getTrustBadges(provider).length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
                        {getTrustBadges(provider).map((badge, idx) => (
                          <Chip
                            key={idx}
                            icon={<StarIcon sx={{ fontSize: 16 }} />}
                            label={badge.label}
                            size="small"
                            variant="outlined"
                            color={badge.color === 'gold' ? 'warning' : badge.color}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>

                  {/* Action Button */}
                  <CardActions sx={{ pt: 0 }}>
                    <Button
                      component={Link}
                      to={`/profile/${provider.id}`}
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      View Profile
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default ProviderDirectory;
