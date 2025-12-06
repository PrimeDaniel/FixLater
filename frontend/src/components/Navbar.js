import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
          FixLater
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {user ? (
            <>
              <Button component={Link} to="/browse-tasks" color="primary" variant="text">
                Tasks
              </Button>
              <Button component={Link} to="/providers" color="primary" variant="text">
                Providers
              </Button>
              <Button component={Link} to="/dashboard" color="primary" variant="text">
                Dashboard
              </Button>
              <Button component={Link} to="/rankings" color="primary" variant="text">
                Rankings
              </Button>
              {user.user_type === 'provider' && (
                <Button component={Link} to="/applications" color="primary" variant="text">
                  My Applications
                </Button>
              )}
              <Button component={Link} to="/notifications" color="primary" variant="text">
                Notifications
              </Button>
              <Button component={Link} to={`/profile/${user.id}`} color="primary" variant="text">
                Profile
              </Button>
              <Button component={Link} to="/settings" color="primary" variant="text">
                Settings
              </Button>
              <Button onClick={handleLogout} color="secondary" variant="contained">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" color="primary" variant="text">
                Login
              </Button>
              <Button component={Link} to="/register" color="primary" variant="contained">
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
