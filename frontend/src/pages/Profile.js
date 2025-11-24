import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    if (user?.user_type === 'provider') {
      fetchReviews();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/api/users/${id}`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/api/reviews/provider/${id}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Fetch reviews error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <div className="page"><div className="container"><p>User not found</p></div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="profile">
          <div className="profile-header">
            {user.profile_photo && (
              <img src={user.profile_photo} alt={user.name} className="profile-photo" />
            )}
            <div className="profile-info">
              <h1>{user.name}</h1>
              <p className="profile-type">
                {user.user_type === 'provider' ? 'Service Provider' : 'Requester'}
              </p>
              {user.bio && <p className="profile-bio">{user.bio}</p>}
            </div>
          </div>

          {user.user_type === 'provider' && user.stats && (
            <div className="profile-stats">
              <div className="stat-card">
                <div className="stat-value">{user.stats.average_rating.toFixed(1)}</div>
                <div className="stat-label">Average Rating</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{user.stats.review_count}</div>
                <div className="stat-label">Reviews</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{user.stats.completed_tasks}</div>
                <div className="stat-label">Completed Tasks</div>
              </div>
            </div>
          )}

          {user.user_type === 'provider' && reviews.length > 0 && (
            <div className="reviews-section">
              <h2>Reviews</h2>
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div>
                        <strong>{review.requester_name}</strong>
                        <div className="review-rating">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </div>
                      </div>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.review_text && <p>{review.review_text}</p>}
                    {review.task_title && (
                      <p className="review-task">Task: {review.task_title}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

