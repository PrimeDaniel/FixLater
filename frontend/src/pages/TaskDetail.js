import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ReviewModal from '../components/ReviewModal';
import './TaskDetail.css';

const TaskDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    proposed_price: '',
    selected_slot_id: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await api.get(`/api/tasks/${id}`);
      setTask(response.data.task);
    } catch (error) {
      setError('Task not found');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');

    if (!applicationData.proposed_price || !applicationData.selected_slot_id) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/applications', {
        task_id: parseInt(id),
        proposed_price: parseFloat(applicationData.proposed_price),
        selected_slot_id: parseInt(applicationData.selected_slot_id),
      });

      setShowApplyForm(false);
      fetchTask(); // Refresh to see updated application count
      navigate('/applications');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptApplication = async (applicationId) => {
    try {
      await api.patch(`/api/applications/${applicationId}`, { status: 'accepted' });
      fetchTask();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept application');
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      await api.patch(`/api/applications/${applicationId}`, { status: 'rejected' });
      fetchTask();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject application');
    }
  };

  const handleCancelTask = async () => {
    if (!window.confirm('Are you sure you want to cancel this task?')) return;

    try {
      await api.patch(`/api/tasks/${id}`, { status: 'cancelled' });
      fetchTask();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel task');
    }
  };

  const handleReviewSuccess = () => {
    fetchTask();
  };

  const canReview = isRequester && 
    task.status === 'assigned' && 
    task.scheduled_time && 
    new Date(task.scheduled_time) <= new Date();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!task) {
    return <div className="page"><div className="container"><p>Task not found</p></div></div>;
  }

  const isRequester = user && user.id === task.requester_id;
  const isProvider = user && user.user_type === 'provider';
  const canApply = isProvider && task.status === 'open' && !isRequester;

  return (
    <div className="page">
      <div className="container">
        <div className="task-detail">
          <div className="task-main">
            <div className="task-header">
              <h1>{task.title}</h1>
              <div className={`task-status task-status-${task.status}`}>
                {task.status}
              </div>
            </div>

            <div className="task-meta-info">
              <span className="task-category">{task.category}</span>
              <span className="task-location">📍 {task.location}</span>
              {task.suggested_price && (
                <span className="task-price">${task.suggested_price}</span>
              )}
            </div>

            <div className="task-description">
              <h2>Description</h2>
              <p>{task.description}</p>
            </div>

            {task.images && task.images.length > 0 && (
              <div className="task-images">
                <h2>Images</h2>
                <div className="images-grid">
                  {task.images.map((img) => (
                    <img key={img.id} src={img.image_url} alt={task.title} />
                  ))}
                </div>
              </div>
            )}

            {task.availability_slots && task.availability_slots.length > 0 && (
              <div className="task-availability">
                <h2>Available Time Slots</h2>
                <ul>
                  {task.availability_slots.map((slot) => (
                    <li key={slot.id}>
                      {new Date(slot.start_time).toLocaleString()} -{' '}
                      {new Date(slot.end_time).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isRequester && task.status === 'open' && (
              <button onClick={handleCancelTask} className="btn btn-danger">
                Cancel Task
              </button>
            )}

            {canReview && (
              <button onClick={() => setShowReviewModal(true)} className="btn btn-primary">
                Submit Review
              </button>
            )}
          </div>

          <div className="task-sidebar">
            {isRequester && task.applications && task.applications.length > 0 && (
              <div className="applications-section">
                <h2>Applications ({task.applications.length})</h2>
                {task.applications.map((app) => (
                  <div key={app.id} className="application-card">
                    <Link to={`/profile/${app.provider_id}`}>
                      <div className="application-header">
                        {app.provider_photo && (
                          <img
                            src={app.provider_photo}
                            alt={app.provider_name}
                            className="provider-photo"
                          />
                        )}
                        <span>{app.provider_name}</span>
                      </div>
                    </Link>
                    <div className="application-details">
                      <p>Proposed Price: <strong>${app.proposed_price}</strong></p>
                      <p>
                        Selected Time:{' '}
                        {new Date(app.start_time).toLocaleString()} -{' '}
                        {new Date(app.end_time).toLocaleString()}
                      </p>
                      <p className={`application-status application-status-${app.status}`}>
                        {app.status}
                      </p>
                    </div>
                    {app.status === 'pending' && (
                      <div className="application-actions">
                        <button
                          onClick={() => handleAcceptApplication(app.id)}
                          className="btn btn-success btn-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectApplication(app.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {canApply && (
              <div className="apply-section">
                {!showApplyForm ? (
                  <button
                    onClick={() => setShowApplyForm(true)}
                    className="btn btn-primary btn-block"
                  >
                    Apply to This Task
                  </button>
                ) : (
                  <form onSubmit={handleApply} className="apply-form">
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-group">
                      <label>Proposed Price *</label>
                      <input
                        type="number"
                        value={applicationData.proposed_price}
                        onChange={(e) =>
                          setApplicationData({
                            ...applicationData,
                            proposed_price: e.target.value,
                          })
                        }
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Select Time Slot *</label>
                      <select
                        value={applicationData.selected_slot_id}
                        onChange={(e) =>
                          setApplicationData({
                            ...applicationData,
                            selected_slot_id: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Choose a time slot</option>
                        {task.availability_slots.map((slot) => (
                          <option key={slot.id} value={slot.id}>
                            {new Date(slot.start_time).toLocaleString()} -{' '}
                            {new Date(slot.end_time).toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplyForm(false)}
                      className="btn btn-secondary btn-block"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {showReviewModal && (
          <ReviewModal
            task={task}
            onClose={() => setShowReviewModal(false)}
            onSuccess={handleReviewSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default TaskDetail;

