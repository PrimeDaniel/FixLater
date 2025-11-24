import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: user?.user_type === 'provider' ? 'open' : '',
  });

  useEffect(() => {
    fetchData();
  }, [user, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks
      const tasksParams = new URLSearchParams();
      if (filters.category) tasksParams.append('category', filters.category);
      if (filters.status) tasksParams.append('status', filters.status);
      
      if (user?.user_type === 'provider') {
        // Providers see all open tasks
        tasksParams.append('status', 'open');
        const tasksRes = await api.get(`/api/tasks?${tasksParams}`);
        setTasks(tasksRes.data.tasks || []);
      } else {
        // Requesters see their own tasks - filter by status if provided
        if (filters.status) {
          tasksParams.append('status', filters.status);
        }
        const tasksRes = await api.get(`/api/tasks?${tasksParams}`);
        const allTasks = tasksRes.data.tasks || [];
        // Filter to only show tasks created by this requester
        setTasks(allTasks.filter(t => t.requester_id === user?.id));
      }

      // Fetch applications
      if (user) {
        const appsRes = await api.get('/api/applications');
        setApplications(appsRes.data.applications || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'cleaning',
    'handyman',
    'babysitting',
    'labor',
    'moving',
    'gardening',
    'other',
  ];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>

        {user?.user_type === 'provider' ? (
          <>
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Browse Available Tasks</h2>
                <div className="filters">
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {tasks.length === 0 ? (
                <p>No tasks available at the moment.</p>
              ) : (
                <div className="grid">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-section">
              <h2>My Applications</h2>
              {applications.length === 0 ? (
                <p>You haven't applied to any tasks yet.</p>
              ) : (
                <div className="applications-list">
                  {applications.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="dashboard-actions">
              <Link to="/tasks/create" className="btn btn-primary">
                Create New Task
              </Link>
            </div>

            <div className="dashboard-section">
              <h2>My Tasks</h2>
              <div className="filters">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="assigned">Assigned</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              {tasks.length === 0 ? (
                <p>You haven't created any tasks yet.</p>
              ) : (
                <div className="grid">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} showApplications={true} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const TaskCard = ({ task, showApplications = false }) => {
  return (
    <div className="card task-card">
      <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {task.images && task.images.length > 0 && (
          <img
            src={task.images[0].image_url}
            alt={task.title}
            className="task-image"
          />
        )}
        <h3>{task.title}</h3>
        <p className="task-category">{task.category}</p>
        <p className="task-description">{task.description.substring(0, 100)}...</p>
        <div className="task-meta">
          <span className="task-location">📍 {task.location}</span>
          {task.suggested_price && (
            <span className="task-price">${task.suggested_price}</span>
          )}
        </div>
        {showApplications && task.application_count > 0 && (
          <div className="task-applications">
            {task.application_count} application{task.application_count !== 1 ? 's' : ''}
          </div>
        )}
        <div className={`task-status task-status-${task.status}`}>
          {task.status}
        </div>
      </Link>
    </div>
  );
};

const ApplicationCard = ({ application }) => {
  return (
    <div className="card application-card">
      <h3>{application.title}</h3>
      <p>{application.description}</p>
      <div className="application-meta">
        <span>Proposed: ${application.proposed_price}</span>
        <span className={`application-status application-status-${application.status}`}>
          {application.status}
        </span>
      </div>
      <Link to={`/tasks/${application.task_id}`} className="btn btn-primary btn-sm">
        View Task
      </Link>
    </div>
  );
};

export default Dashboard;

