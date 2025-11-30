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
          <div className="hero-content">
            <h1>FixLater</h1>
            <p className="hero-subtitle">Your Local Service Marketplace</p>
            <p className="hero-description">
              Connect with trusted service providers for cleaning, handyman work, babysitting, and more.
              Post tasks or offer your skills to help others in your community.
            </p>
            <div className="hero-cta">
              {!user ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-large">
                    Get Started Free
                  </Link>
                  <Link to="/browse" className="btn btn-secondary btn-large">
                    Browse Tasks
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="btn btn-primary btn-large">
                    Go to Dashboard
                  </Link>
                  <Link to="/browse" className="btn btn-secondary btn-large">
                    Browse Tasks
                  </Link>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Tasks Completed</div>
              </div>
              <div className="stat">
                <div className="stat-number">500+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat">
                <div className="stat-number">4.8★</div>
                <div className="stat-label">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="features">
        <div className="container">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Post Your Task</h3>
              <p>Describe what you need, add photos, set your budget, and publish your task in minutes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Get Applications</h3>
              <p>Receive bids from qualified providers. Review profiles, ratings, and choose the best fit.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Task Completed</h3>
              <p>Work gets done professionally. Pay securely and leave a review to help the community.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="categories-section">
        <div className="container">
          <h2>Popular Categories</h2>
          <div className="categories-grid">
            <Link to="/browse?category=cleaning" className="category-item">
              <span className="category-emoji">🧹</span>
              <span>Cleaning</span>
            </Link>
            <Link to="/browse?category=handyman" className="category-item">
              <span className="category-emoji">🔧</span>
              <span>Handyman</span>
            </Link>
            <Link to="/browse?category=babysitting" className="category-item">
              <span className="category-emoji">👶</span>
              <span>Babysitting</span>
            </Link>
            <Link to="/browse?category=labor" className="category-item">
              <span className="category-emoji">💪</span>
              <span>Labor</span>
            </Link>
            <Link to="/browse?category=moving" className="category-item">
              <span className="category-emoji">📦</span>
              <span>Moving</span>
            </Link>
            <Link to="/browse?category=gardening" className="category-item">
              <span className="category-emoji">🌱</span>
              <span>Gardening</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of requesters and providers in your local community</p>
          <div className="cta-buttons">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary btn-large">
                  Sign Up Now
                </Link>
                <Link to="/browse" className="btn btn-outline btn-large">
                  Explore Tasks
                </Link>
              </>
            ) : (
              <Link to="/tasks/create" className="btn btn-primary btn-large">
                Create Your First Task
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

