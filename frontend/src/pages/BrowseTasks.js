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
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import LightningBoltIcon from '@mui/icons-material/ElectricBolt';

const BrowseTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: 'open',
    sortBy: 'newest',
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
    { value: 'newest', label: 'Newest First' },
    { value: 'highestPrice', label: 'Highest Price' },
    { value: 'lowestPrice', label: 'Lowest Price' },
    { value: 'mostApplications', label: 'Most Applications' },
  ];

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      
      const response = await api.get(`/api/tasks?${params}`);
      let filteredTasks = response.data.tasks || [];

      // Filter by search term
      if (filters.searchTerm) {
        filteredTasks = filteredTasks.filter(
          (task) =>
            task.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      }

      // Sort tasks
      if (filters.sortBy === 'highestPrice') {
        filteredTasks.sort((a, b) => (b.suggested_price || 0) - (a.suggested_price || 0));
      } else if (filters.sortBy === 'lowestPrice') {
        filteredTasks.sort((a, b) => (a.suggested_price || 0) - (b.suggested_price || 0));
      } else if (filters.sortBy === 'mostApplications') {
        filteredTasks.sort((a, b) => (b.application_count || 0) - (a.application_count || 0));
      } else {
        // newest (default)
        filteredTasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      setTasks(filteredTasks);
    } catch (error) {
      console.error('Fetch tasks error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'assigned':
        return 'info';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getUrgencyColor = (createdAt) => {
    const daysOld = (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
    if (daysOld < 1) return '#FF6B6B'; // Red - just posted
    if (daysOld < 3) return '#FFA500'; // Orange - less than 3 days
    return '#4CAF50'; // Green - older posts
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
          <TrendingUpIcon sx={{ fontSize: 40, color: '#667eea' }} />
          <Typography variant="h3" component="h1">
            Available Tasks
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Browse and apply to tasks posted by users in your area
        </Typography>

        {/* Search and Filter Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Search Tasks"
                placeholder="Enter title or description..."
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

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="assigned">Assigned</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
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
                onClick={fetchTasks}
                fullWidth
              >
                Update Results
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
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent>
            <Typography textAlign="center" color="text.secondary" variant="h6">
              No tasks found matching your criteria
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
              Showing <strong>{tasks.length}</strong> task{tasks.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {/* Tasks Grid */}
          <Grid container spacing={3}>
            {tasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
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
                  {/* Image Section */}
                  <Box sx={{ position: 'relative' }}>
                    {task.images && task.images.length > 0 ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={task.images[0].image_url}
                        alt={task.title}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        <Typography variant="h4">
                          {task.category.charAt(0).toUpperCase()}
                        </Typography>
                      </Box>
                    )}

                    {/* Status Badge */}
                    <Chip
                      label={task.status.toUpperCase()}
                      color={getStatusColor(task.status)}
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 600,
                      }}
                    />

                    {/* Urgency Indicator */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: getUrgencyColor(task.created_at),
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    />
                  </Box>

                  {/* Content Section */}
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1,
                      }}
                    >
                      {task.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {task.description}
                    </Typography>

                    {/* Category Chip */}
                    <Chip
                      label={task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />

                    {/* Details */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {/* Location */}
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOnIcon sx={{ fontSize: 18, color: '#667eea' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {task.location}
                        </Typography>
                      </Box>

                      {/* Price */}
                      {task.suggested_price && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <AttachMoneyIcon sx={{ fontSize: 18, color: '#28a745' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#28a745' }}>
                            ${task.suggested_price.toFixed(2)}
                          </Typography>
                        </Box>
                      )}

                      {/* Posted Date */}
                      <Box display="flex" alignItems="center" gap={1}>
                        <EventIcon sx={{ fontSize: 18, color: '#999' }} />
                        <Typography variant="caption" color="text.secondary">
                          Posted {new Date(task.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>

                      {/* Applications Count */}
                      {task.application_count > 0 && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <LightningBoltIcon sx={{ fontSize: 16, color: '#FF9800' }} />
                          <Typography variant="caption" sx={{ color: '#FF9800', fontWeight: 600 }}>
                            {task.application_count} application{task.application_count !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>

                  {/* Action Button */}
                  <CardActions sx={{ pt: 0 }}>
                    <Button
                      component={Link}
                      to={`/tasks/${task.id}`}
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      View Details & Apply
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

export default BrowseTasks;
