import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Applications.css';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/api/applications');
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Fetch applications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;

    try {
      await api.delete(`/api/applications/${applicationId}`);
      fetchApplications();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to withdraw application');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>My Applications</h1>
          <p>Track your submitted applications</p>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state">
            <p>You haven't submitted any applications yet.</p>
            {user?.user_type === 'provider' && (
              <Link to="/dashboard" className="btn btn-primary">
                Browse Tasks
              </Link>
            )}
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((app) => (
              <div key={app.id} className="card application-card">
                <div className="application-header">
                  <h3>{app.title || 'Task'}</h3>
                  <span className={`application-status application-status-${app.status}`}>
                    {app.status}
                  </span>
                </div>
                {app.description && <p className="application-description">{app.description}</p>}
                <div className="application-details">
                  <div className="detail-item">
                    <strong>Proposed Price:</strong> ${app.proposed_price}
                  </div>
                  {app.start_time && app.end_time && (
                    <div className="detail-item">
                      <strong>Selected Time:</strong>{' '}
                      {new Date(app.start_time).toLocaleString()} -{' '}
                      {new Date(app.end_time).toLocaleString()}
                    </div>
                  )}
                  {app.requester_name && (
                    <div className="detail-item">
                      <strong>Requester:</strong>{' '}
                      <Link to={`/profile/${app.requester_id || ''}`}>
                        {app.requester_name}
                      </Link>
                    </div>
                  )}
                </div>
                <div className="application-actions">
                  <Link to={`/tasks/${app.task_id}`} className="btn btn-primary btn-sm">
                    View Task
                  </Link>
                  {app.status === 'pending' && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;

