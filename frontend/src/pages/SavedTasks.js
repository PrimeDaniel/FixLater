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
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import FavoritesIcon from '@mui/icons-material/Favorite';

const SavedTasks = () => {
  const [savedTasks, setSavedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState({});

  useEffect(() => {
    fetchSavedTasks();
  }, []);

  const fetchSavedTasks = async () => {
    try {
      setLoading(true);
      // Get saved task IDs from localStorage
      const savedTaskIds = JSON.parse(localStorage.getItem('savedTasks') || '[]');

      if (savedTaskIds.length === 0) {
        setSavedTasks([]);
        setLoading(false);
        return;
      }

      // Fetch all tasks and filter
      const response = await api.get('/api/tasks');
      const allTasks = response.data.tasks || [];

      // Filter tasks that are in saved list
      const saved = allTasks.filter((task) => savedTaskIds.includes(task.id));
      setSavedTasks(saved);

      // Create a map of task ids to task objects
      const taskMap = {};
      saved.forEach((task) => {
        taskMap[task.id] = task;
      });
      setTasks(taskMap);
    } catch (err) {
      setError('Failed to load saved tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedTask = (taskId) => {
    const saved = JSON.parse(localStorage.getItem('savedTasks') || '[]');
    const updated = saved.filter((id) => id !== taskId);
    localStorage.setItem('savedTasks', JSON.stringify(updated));
    setSavedTasks(savedTasks.filter((task) => task.id !== taskId));
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
    if (daysOld < 1) return '#FF6B6B';
    if (daysOld < 3) return '#FFA500';
    return '#4CAF50';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
          <BookmarkIcon sx={{ fontSize: 40, color: '#667eea' }} />
          <Typography variant="h3" component="h1">
            Saved Tasks
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your bookmarked tasks for easy access later
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Loading State */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : savedTasks.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <BookmarkBorderIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No saved tasks yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Browse available tasks and save your favorites to view them here later
            </Typography>
            <Button
              component={Link}
              to="/browse-tasks"
              variant="contained"
              color="primary"
            >
              Browse Tasks
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Count */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              You have <strong>{savedTasks.length}</strong> saved task{savedTasks.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {/* Tasks Grid */}
          <Grid container spacing={3}>
            {savedTasks.map((task) => (
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

                    {/* Save Button */}
                    <IconButton
                      onClick={() => removeSavedTask(task.id)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        color: '#667eea',
                        '&:hover': { bgcolor: 'white' },
                      }}
                    >
                      <BookmarkIcon />
                    </IconButton>

                    {/* Status Badge */}
                    <Chip
                      label={task.status.toUpperCase()}
                      color={getStatusColor(task.status)}
                      sx={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        fontWeight: 600,
                      }}
                    />

                    {/* Urgency Indicator */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 60,
                        right: 12,
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
                        <Typography variant="caption" sx={{ color: '#FF9800', fontWeight: 600 }}>
                          ⚡ {task.application_count} application{task.application_count !== 1 ? 's' : ''}
                        </Typography>
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
                      View Task
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

export default SavedTasks;
