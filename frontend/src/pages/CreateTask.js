import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './CreateTask.css';

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
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Create New Task</h1>
          <p>Post a task and find the right provider</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-task-form">
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Need help moving furniture"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe the task in detail..."
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g., 123 Main St, City, State"
            />
          </div>

          <div className="form-group">
            <label>Suggested Price (Optional)</label>
            <input
              type="number"
              name="suggested_price"
              value={formData.suggested_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>Task Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
            <small>You can upload multiple images</small>
            {images.length > 0 && (
              <div className="image-preview-grid">
                {images.map((url, index) => (
                  <div key={index} className="image-preview">
                    <img src={url} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Availability Slots *</label>
            <p className="form-hint">Add time slots when you're available to receive help</p>
            <div className="slot-picker">
              <div className="slot-inputs">
                <div>
                  <label>Start Time</label>
                  <DatePicker
                    selected={currentSlot.start_time}
                    onChange={(date) => setCurrentSlot({ ...currentSlot, start_time: date })}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                  />
                </div>
                <div>
                  <label>End Time</label>
                  <DatePicker
                    selected={currentSlot.end_time}
                    onChange={(date) => setCurrentSlot({ ...currentSlot, end_time: date })}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={currentSlot.start_time || new Date()}
                  />
                </div>
                <button
                  type="button"
                  onClick={addAvailabilitySlot}
                  className="btn btn-secondary"
                >
                  Add Slot
                </button>
              </div>
            </div>

            {availabilitySlots.length > 0 && (
              <div className="slots-list">
                {availabilitySlots.map((slot, index) => (
                  <div key={index} className="slot-item">
                    <span>
                      {new Date(slot.start_time).toLocaleString()} -{' '}
                      {new Date(slot.end_time).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSlot(index)}
                      className="btn btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Task...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;

