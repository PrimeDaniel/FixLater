import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
import FormHelperText from '@mui/material/FormHelperText';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    user_type: 'requester',
    name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.user_type, formData.name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Create Account
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Join FixLater today
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />

          <TextField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Account Type</InputLabel>
            <Select
              name="user_type"
              value={formData.user_type}
              label="Account Type"
              onChange={handleChange}
            >
              <MenuItem value="requester">Requester (I need help with tasks)</MenuItem>
              <MenuItem value="provider">Provider (I offer services)</MenuItem>
            </Select>
            <FormHelperText>
              {formData.user_type === 'requester'
                ? 'You can post tasks and hire providers'
                : 'You can post tasks AND apply to other tasks'}
            </FormHelperText>
          </FormControl>

          <TextField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />

          <TextField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />

          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </Box>

        <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
          Already have an account? <Link to="/login" style={{ color: '#667eea' }}>Login</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Register;
