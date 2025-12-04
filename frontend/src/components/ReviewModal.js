import React, { useState } from 'react';
import api from '../utils/api';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';

const ReviewModal = ({ task, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating < 1 || rating > 5) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/reviews', {
        task_id: task.id,
        rating,
        review_text: reviewText,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Review Provider</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <Box sx={{ mb: 2 }}>
            <Typography component="legend">Rating *</Typography>
            <Rating
              name="rating"
              value={rating}
              onChange={(_, value) => setRating(value || 1)}
              max={5}
            />
          </Box>
          <TextField
            label="Review (Optional)"
            multiline
            rows={5}
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            fullWidth
            placeholder="Share your experience..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button type="submit" color="primary" variant="contained" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ReviewModal;
