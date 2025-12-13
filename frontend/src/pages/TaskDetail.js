import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ReviewModal from '../components/ReviewModal';
import ApplicationItem from '../components/ApplicationItem';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ImageIcon from '@mui/icons-material/Image';

const TaskDetail = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth(); // Assuming useAuth provides loading state
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [applicationData, setApplicationData] = useState({
    proposed_price: '',
    selected_slot_id: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchTask();
    if (user) {
      checkIfSaved();
    }
  }, [id, user]);

  const fetchTask = async () => {
    try {
      const response = await api.get(`/api/tasks/${id}`);
      setTask(response.data.task);
    } catch (error) {
      setError('Task not found');
    } finally {
      setLoading(false);
    }
  };

  // Check if task is saved (Bookmarked) via API
  const checkIfSaved = async () => {
    try {
      const response = await api.get('/api/tasks/saved');
      const savedTasks = response.data.tasks;
      const isBookmarked = savedTasks.some(t => t.id === parseInt(id));
      setIsSaved(isBookmarked);
    } catch (err) {
      console.error('Failed to check saved status', err);
    }
  };

  // Toggle save status via API
  const toggleSave = async () => {
    if (!user) {
      // If not logged in, redirect to login or show error
      navigate('/login', { state: { from: `/tasks/${id}` } });
      return;
    }

    try {
      if (isSaved) {
        await api.delete(`/api/tasks/${id}/save`);
        setIsSaved(false);
      } else {
        await api.post(`/api/tasks/${id}/save`);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to toggle save', err);
      setError('Failed to update bookmark');
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');

    if (!applicationData.proposed_price || !applicationData.selected_slot_id) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/applications', {
        task_id: parseInt(id),
        proposed_price: parseFloat(applicationData.proposed_price),
        selected_slot_id: parseInt(applicationData.selected_slot_id),
      });

      setShowApplyForm(false);
      fetchTask();
      navigate('/applications');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptApplication = async (applicationId) => {
    try {
      await api.patch(`/api/applications/${applicationId}`, { status: 'accepted' });
      fetchTask();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept application');
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      await api.patch(`/api/applications/${applicationId}`, { status: 'rejected' });
      fetchTask();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject application');
    }
  };

  const handleCancelTask = async () => {
    try {
      await api.patch(`/api/tasks/${id}`, { status: 'cancelled' });
      fetchTask();
      setShowConfirmDialog(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel task');
    }
  };

  const handleReviewSuccess = () => {
    fetchTask();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return '#10b981';
      case 'assigned':
        return '#3b82f6';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!task) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Task not found</Alert>
      </Container>
    );
  }

  const isRequester = user && user.id === task.requester_id;
  const isProvider = user && user.user_type === 'provider';
  const canApply = isProvider && task.status === 'open' && !isRequester;
  const canReview = isRequester && task.status === 'assigned' && task.scheduled_time && new Date(task.scheduled_time) <= new Date();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Task Header */}
          <Card sx={{ mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              {task.images && task.images.length > 0 ? (
                <CardMedia
                  component="img"
                  height="400"
                  image={task.images[0].image_url}
                  alt={task.title}
                />
              ) : (
                <Box
                  sx={{
                    height: 400,
                    bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ImageIcon sx={{ fontSize: 80, color: 'white', opacity: 0.5 }} />
                </Box>
              )}

              {/* Save Button */}
              <Button
                startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                onClick={toggleSave}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'white',
                  color: '#667eea',
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            </Box>

            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" sx={{ mb: 2 }}>
                <Box flex={1}>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                    {task.title}
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip
                      label={task.status.toUpperCase()}
                      sx={{
                        bgcolor: getStatusColor(task.status),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      label={task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                </Box>
              </Box>

              {/* Task Meta Info */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOnIcon sx={{ color: '#667eea', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {task.location}
                  </Typography>
                </Box>

                {task.suggested_price && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <AttachMoneyIcon sx={{ color: '#28a745', fontSize: 20 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#28a745' }}>
                      ${task.suggested_price.toFixed(2)} suggested
                    </Typography>
                  </Box>
                )}

                <Box display="flex" alignItems="center" gap={1}>
                  <EventIcon sx={{ color: '#999', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Posted {new Date(task.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Description */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                About this task
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                {task.description}
              </Typography>

              {/* Images Gallery */}
              {task.images && task.images.length > 1 && (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    More images
                  </Typography>
                  <ImageList cols={3} gap={8} sx={{ mb: 3 }}>
                    {task.images.slice(1).map((img) => (
                      <ImageListItem key={img.id}>
                        <img
                          src={img.image_url}
                          alt={task.title}
                          style={{ borderRadius: 8, cursor: 'pointer' }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </>
              )}

              {/* Availability Slots */}
              {task.availability_slots && task.availability_slots.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Available time slots
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {task.availability_slots.map((slot) => (
                      <Paper key={slot.id} sx={{ p: 2, bgcolor: '#f9f9f9', border: '1px solid #eee' }}>
                        <Typography variant="body2">
                          <strong>{new Date(slot.start_time).toLocaleDateString()}</strong>
                          {' '} {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          {/* Requester Applications View */}
          {isRequester && task.applications && task.applications.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Applications ({task.applications.length})
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {task.applications.map((app) => (
                    <ApplicationItem
                      key={app.id}
                      application={app}
                      onAccept={handleAcceptApplication}
                      onReject={handleRejectApplication}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Task Creator Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Task Posted By
              </Typography>
              <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: '#667eea',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                  component={Link}
                  to={`/profile/${task.requester_id}`}
                >
                  {task.requester_name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography
                    component={Link}
                    to={`/profile/${task.requester_id}`}
                    sx={{
                      fontWeight: 600,
                      color: '#667eea',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                      display: 'block',
                    }}
                  >
                    {task.requester_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Member since {new Date(task.requester_joined).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Apply Section */}
          {canApply && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                {!showApplyForm ? (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    onClick={() => setShowApplyForm(true)}
                  >
                    Apply to This Task
                  </Button>
                ) : (
                  <Box component="form" onSubmit={handleApply}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Select Time Slot *</InputLabel>
                      <Select
                        value={applicationData.selected_slot_id}
                        label="Select Time Slot *"
                        onChange={(e) =>
                          setApplicationData({
                            ...applicationData,
                            selected_slot_id: e.target.value,
                          })
                        }
                        required
                      >
                        <MenuItem value="">Choose a time slot</MenuItem>
                        {task.availability_slots?.map((slot) => (
                          <MenuItem key={slot.id} value={slot.id}>
                            {new Date(slot.start_time).toLocaleDateString()}{' '}
                            {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="Proposed Price"
                      type="number"
                      fullWidth
                      inputProps={{ step: '0.01', min: '0' }}
                      value={applicationData.proposed_price}
                      onChange={(e) =>
                        setApplicationData({
                          ...applicationData,
                          proposed_price: e.target.value,
                        })
                      }
                      required
                      sx={{ mb: 2 }}
                    />

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      type="submit"
                      disabled={submitting}
                      sx={{ mb: 1 }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      fullWidth
                      onClick={() => setShowApplyForm(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Requester Actions */}
          {isRequester && (
            <Card>
              <CardContent>
                {task.status === 'open' && (
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={() => setShowConfirmDialog(true)}
                    sx={{ mb: 1 }}
                  >
                    Cancel Task
                  </Button>
                )}

                {canReview && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => setShowReviewModal(true)}
                  >
                    Submit Review
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Confirm Cancel Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Cancel Task?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this task? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Keep Task</Button>
          <Button
            onClick={handleCancelTask}
            color="error"
            variant="contained"
          >
            Cancel Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          task={task}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </Container>
  );
};

export default TaskDetail;
