import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="landing">
      <div className="hero">
        <div className="container">
          <h1>FixLater</h1>
          <p className="hero-subtitle">Connect with trusted service providers in your area</p>
          <p className="hero-description">
            Need help with cleaning, handyman work, babysitting, or other tasks? 
            Find reliable providers or offer your services to others.
          </p>
          {!user && (
            <div className="hero-cta">
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                Login
              </Link>
            </div>
          )}
          {user && (
            <div className="hero-cta">
              <Link to="/dashboard" className="btn btn-primary btn-large">
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="features">
        <div className="container">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>For Requesters</h3>
              <ul>
                <li>Post tasks with details and images</li>
                <li>Set your availability</li>
                <li>Review applications and choose providers</li>
                <li>Rate and review after completion</li>
              </ul>
            </div>
            <div className="feature-card">
              <h3>For Providers</h3>
              <ul>
                <li>Browse available tasks in your area</li>
                <li>Apply with your bid and preferred time</li>
                <li>Build your profile with reviews</li>
                <li>Set your service area</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

