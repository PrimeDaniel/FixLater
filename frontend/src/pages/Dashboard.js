import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: user?.user_type === 'provider' ? 'open' : '',
  });

  useEffect(() => {
    fetchData();
  }, [user, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks
      const tasksParams = new URLSearchParams();
      if (filters.category) tasksParams.append('category', filters.category);
      if (filters.status) tasksParams.append('status', filters.status);
      
      if (user?.user_type === 'provider') {
        // Providers see all open tasks
        tasksParams.append('status', 'open');
        const tasksRes = await api.get(`/api/tasks?${tasksParams}`);
        setTasks(tasksRes.data.tasks || []);
      } else {
        // Requesters see their own tasks - filter by status if provided
        if (filters.status) {
          tasksParams.append('status', filters.status);
        }
        const tasksRes = await api.get(`/api/tasks?${tasksParams}`);
        const allTasks = tasksRes.data.tasks || [];
        // Filter to only show tasks created by this requester
        setTasks(allTasks.filter(t => t.requester_id === user?.id));
      }

      // Fetch applications
      if (user) {
        const appsRes = await api.get('/api/applications');
        setApplications(appsRes.data.applications || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'cleaning',
    'handyman',
    'babysitting',
    'labor',
    'moving',
    'gardening',
    'other',
  ];

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
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.name}!
        </Typography>
      </Box>

      {user?.user_type === 'provider' ? (
        <>
          <Box sx={{ mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h5" component="h2">
                Browse Available Tasks
              </Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
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
            {tasks.length === 0 ? (
              <Typography>No tasks available at the moment.</Typography>
            ) : (
              <Grid container spacing={3}>
                {tasks.map((task) => (
                  <Grid item xs={12} sm={6} md={4} key={task.id}>
                    <TaskCard task={task} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              My Applications
            </Typography>
            {applications.length === 0 ? (
              <Typography>You haven't applied to any tasks yet.</Typography>
            ) : (
              <Grid container spacing={3}>
                {applications.map((app) => (
                  <Grid item xs={12} sm={6} key={app.id}>
                    <ApplicationCard application={app} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>
            <Button component={Link} to="/tasks/create" variant="contained" color="primary" size="large">
              Create New Task
            </Button>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h5" component="h2">
                My Tasks
              </Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="assigned">Assigned</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {tasks.length === 0 ? (
              <Typography>You haven't created any tasks yet.</Typography>
            ) : (
              <Grid container spacing={3}>
                {tasks.map((task) => (
                  <Grid item xs={12} sm={6} md={4} key={task.id}>
                    <TaskCard task={task} showApplications={true} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

const TaskCard = ({ task, showApplications = false }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'success';
      case 'assigned': return 'info';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {task.images && task.images.length > 0 && (
        <CardMedia
          component="img"
          height="200"
          image={task.images[0].image_url}
          alt={task.title}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h3">
          {task.title}
        </Typography>
        <Chip label={task.category} size="small" sx={{ mb: 1 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {task.description.substring(0, 100)}...
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2">📍 {task.location}</Typography>
          {task.suggested_price && (
            <Typography variant="body1" fontWeight="bold" color="primary">
              ${task.suggested_price}
            </Typography>
          )}
        </Box>
        {showApplications && task.application_count > 0 && (
          <Typography variant="body2" color="text.secondary">
            {task.application_count} application{task.application_count !== 1 ? 's' : ''}
          </Typography>
        )}
        <Chip 
          label={task.status} 
          color={getStatusColor(task.status)}
          size="small"
          sx={{ mt: 1 }}
        />
      </CardContent>
      <CardActions>
        <Button component={Link} to={`/tasks/${task.id}`} size="small" variant="contained" fullWidth>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

const ApplicationCard = ({ application }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h6" component="h3">
          {application.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {application.description}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2">Proposed: ${application.proposed_price}</Typography>
          <Chip 
            label={application.status}
            color={getStatusColor(application.status)}
            size="small"
          />
        </Box>
      </CardContent>
      <CardActions>
        <Button component={Link} to={`/tasks/${application.task_id}`} size="small" variant="outlined" fullWidth>
          View Task
        </Button>
      </CardActions>
    </Card>
  );
};

export default Dashboard;
