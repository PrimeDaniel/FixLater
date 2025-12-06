import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Rating from '@mui/material/Rating';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Medal from '@mui/icons-material/EmojiEvents';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const Rankings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  const categories = [
    'cleaning',
    'handyman',
    'babysitting',
    'labor',
    'moving',
    'gardening',
    'other',
  ];

  useEffect(() => {
    fetchTopProviders();
  }, [selectedCategory]);

  const fetchTopProviders = async () => {
    try {
      setLoading(true);
      let url = '/api/reviews/top-providers';
      if (selectedCategory) {
        url += `?category=${selectedCategory}`;
        setSearchParams({ category: selectedCategory });
      } else {
        setSearchParams({});
      }
      const response = await api.get(url);
      setProviders(response.data.providers || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (rank) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#667eea';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EmojiEventsIcon sx={{ fontSize: 40, color: '#FFD700' }} />
          Top Providers Rankings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Discover the best service providers in your category
        </Typography>

        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {providers.length === 0 ? (
        <Card>
          <CardContent>
            <Typography textAlign="center" color="text.secondary">
              No providers found in this category yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top 3 Spotlight Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {providers.slice(0, 3).map((provider, index) => (
              <Grid item xs={12} sm={6} md={4} key={provider.provider_id}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: `3px solid ${getMedalColor(index + 1)}`,
                    boxShadow: `0 8px 24px rgba(0,0,0,0.15)`,
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -15,
                      right: 20,
                      bgcolor: getMedalColor(index + 1),
                      borderRadius: '50%',
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 28,
                      fontWeight: 'bold',
                    }}
                  >
                    #{index + 1}
                  </Box>

                  <CardContent sx={{ textAlign: 'center', pt: 4 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        margin: '0 auto 16px',
                        bgcolor: '#667eea',
                        fontSize: 32,
                      }}
                    >
                      {provider.provider_name.charAt(0).toUpperCase()}
                    </Avatar>

                    <Typography variant="h5" component="h2" gutterBottom>
                      {provider.provider_name}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Rating value={provider.avg_rating || 0} readOnly precision={0.5} />
                      <Typography variant="body2" color="text.secondary">
                        {provider.avg_rating ? provider.avg_rating.toFixed(1) : 'N/A'} / 5.0
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-around" sx={{ mb: 2 }}>
                      <Box textAlign="center">
                        <Typography variant="h6">{provider.review_count || 0}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {provider.review_count === 1 ? 'Review' : 'Reviews'}
                        </Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="h6">{provider.completed_tasks || 0}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {provider.completed_tasks === 1 ? 'Task' : 'Tasks'}
                        </Typography>
                      </Box>
                    </Box>

                    {selectedCategory && (
                      <Chip
                        label={selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Full Rankings Table */}
          {providers.length > 3 && (
            <Box>
              <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                Full Rankings
              </Typography>
              <TableContainer component={Card}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.main' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Provider</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Rating
                      </TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Reviews
                      </TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Completed Tasks
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {providers.map((provider, index) => (
                      <TableRow
                        key={provider.provider_id}
                        sx={{
                          bgcolor: index < 3 ? 'action.hover' : 'background.paper',
                          '&:hover': { bgcolor: 'action.selected' },
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontWeight="bold">
                              #{index + 1}
                            </Typography>
                            {index < 3 && <Medal sx={{ color: getMedalColor(index + 1), fontSize: 20 }} />}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: '#667eea', width: 32, height: 32, fontSize: 14 }}>
                              {provider.provider_name.charAt(0).toUpperCase()}
                            </Avatar>
                            {provider.provider_name}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                            <Rating value={provider.avg_rating || 0} readOnly size="small" />
                            <Typography variant="body2">
                              {provider.avg_rating ? provider.avg_rating.toFixed(1) : 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">{provider.review_count || 0}</TableCell>
                        <TableCell align="center">{provider.completed_tasks || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Rankings;
