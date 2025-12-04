import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Chip from '@mui/material/Chip';

const CreateTask = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    suggested_price: '',
  });
  const [images, setImages] = useState([]);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [currentSlot, setCurrentSlot] = useState({
    start_time: null,
    end_time: null,
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await api.post('/api/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setImages([...images, ...response.data.image_urls]);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload images');
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addAvailabilitySlot = () => {
    if (!currentSlot.start_time || !currentSlot.end_time) {
      setError('Please select both start and end times');
      return;
    }

    if (currentSlot.end_time <= currentSlot.start_time) {
      setError('End time must be after start time');
      return;
    }

    setAvailabilitySlots([
      ...availabilitySlots,
      {
        start_time: currentSlot.start_time.toISOString(),
        end_time: currentSlot.end_time.toISOString(),
      },
    ]);

    setCurrentSlot({ start_time: null, end_time: null });
    setError('');
  };

  const removeSlot = (index) => {
    setAvailabilitySlots(availabilitySlots.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (availabilitySlots.length === 0) {
      setError('Please add at least one availability slot');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/tasks', {
        ...formData,
        suggested_price: formData.suggested_price ? parseFloat(formData.suggested_price) : null,
        availability_slots: availabilitySlots,
        image_urls: images,
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Task
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Post a task and find the right provider
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Task Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            placeholder="e.g., Need help moving furniture"
          />

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            multiline
            rows={5}
            placeholder="Describe the task in detail..."
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              label="Category"
              onChange={handleChange}
            >
              <MenuItem value="">Select a category</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            placeholder="e.g., 123 Main St, City, State"
          />

          <TextField
            label="Suggested Price (Optional)"
            name="suggested_price"
            type="number"
            value={formData.suggested_price}
            onChange={handleChange}
            fullWidth
            margin="normal"
            inputProps={{ min: 0, step: 0.01 }}
            placeholder="0.00"
          />

          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Task Images
            </Typography>
            <Button variant="outlined" component="label">
              Upload Images
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleImageUpload}
              />
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              You can upload multiple images
            </Typography>
            {images.length > 0 && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {images.map((url, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        style={{ width: '100%', borderRadius: 8 }}
                      />
                      <IconButton
                        onClick={() => removeImage(index)}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' },
                        }}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Availability Slots *
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add time slots when you're available to receive help
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <DatePicker
                  selected={currentSlot.start_time}
                  onChange={(date) => setCurrentSlot({ ...currentSlot, start_time: date })}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={new Date()}
                  customInput={<TextField label="Start Time" fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <DatePicker
                  selected={currentSlot.end_time}
                  onChange={(date) => setCurrentSlot({ ...currentSlot, end_time: date })}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={currentSlot.start_time || new Date()}
                  customInput={<TextField label="End Time" fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="contained"
                  onClick={addAvailabilitySlot}
                  fullWidth
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Grid>
            </Grid>

            {availabilitySlots.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {availabilitySlots.map((slot, index) => (
                  <Chip
                    key={index}
                    label={`${new Date(slot.start_time).toLocaleString()} - ${new Date(slot.end_time).toLocaleString()}`}
                    onDelete={() => removeSlot(index)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? 'Creating Task...' : 'Create Task'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateTask;
