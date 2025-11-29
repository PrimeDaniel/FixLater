import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          FixLater
        </Link>
        <div className="navbar-menu">
          {user ? (
            <>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              {user.user_type === 'provider' && (
                <Link to="/applications" className="navbar-link">
                  My Applications
                </Link>
              )}
              <Link to="/messages" className="navbar-link">
                Messages
              </Link>
              <Link to="/notifications" className="navbar-link">
                Notifications
              </Link>
              <Link to={`/profile/${user.id}`} className="navbar-link">
                Profile
              </Link>
              <Link to="/settings" className="navbar-link">
                Settings
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

