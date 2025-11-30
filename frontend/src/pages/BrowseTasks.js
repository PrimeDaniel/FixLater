import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './BrowseTasks.css';

const BrowseTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: 'open',
    search: '',
  });

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      
      const res = await api.get(`/api/tasks?${params}`);
      let filteredTasks = res.data.tasks || [];
      
      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.location.toLowerCase().includes(searchLower)
        );
      }
      
      setTasks(filteredTasks);
    } catch (error) {
      console.error('Fetch error:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'cleaning', icon: '🧹', label: 'Cleaning' },
    { value: 'handyman', icon: '🔧', label: 'Handyman' },
    { value: 'babysitting', icon: '👶', label: 'Babysitting' },
    { value: 'labor', icon: '💪', label: 'Labor' },
    { value: 'moving', icon: '📦', label: 'Moving' },
    { value: 'gardening', icon: '🌱', label: 'Gardening' },
    { value: 'other', icon: '✨', label: 'Other' },
  ];

  return (
    <div className="browse-tasks-page">
      <div className="browse-hero">
        <div className="container">
          <h1>Browse Available Tasks</h1>
          <p>Find tasks in your area or post your own</p>
          {!user && (
            <div className="browse-cta">
              <Link to="/register" className="btn btn-primary">
                Sign Up to Apply
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="container">
        <div className="browse-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search tasks by title, description, or location..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="category-pills">
            <button
              className={`category-pill ${filters.category === '' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, category: '' })}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`category-pill ${filters.category === cat.value ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, category: cat.value })}
              >
                <span className="category-icon">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No tasks found</h3>
            <p>Try adjusting your filters or check back later</p>
            {user && user.user_type === 'requester' && (
              <Link to="/tasks/create" className="btn btn-primary">
                Create a Task
              </Link>
            )}
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} isLoggedIn={!!user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TaskCard = ({ task, isLoggedIn }) => {
  const getCategoryIcon = (category) => {
    const icons = {
      cleaning: '🧹',
      handyman: '🔧',
      babysitting: '👶',
      labor: '💪',
      moving: '📦',
      gardening: '🌱',
      other: '✨',
    };
    return icons[category] || '✨';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#10b981',
      assigned: '#3b82f6',
      completed: '#6b7280',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  return (
    <Link to={`/tasks/${task.id}`} className="task-card" style={{ textDecoration: 'none' }}>
      <div className="task-card-image">
        {task.images && task.images.length > 0 ? (
          <img src={task.images[0].image_url} alt={task.title} />
        ) : (
          <div className="task-placeholder">
            <span className="placeholder-icon">{getCategoryIcon(task.category)}</span>
          </div>
        )}
        <div className="task-card-badge" style={{ backgroundColor: getStatusColor(task.status) }}>
          {task.status}
        </div>
      </div>

      <div className="task-card-content">
        <div className="task-card-header">
          <h3>{task.title}</h3>
          <div className="task-card-category">
            <span>{getCategoryIcon(task.category)}</span>
            {task.category}
          </div>
        </div>

        <p className="task-card-description">
          {task.description.length > 120
            ? task.description.substring(0, 120) + '...'
            : task.description}
        </p>

        <div className="task-card-meta">
          <div className="task-card-location">
            <span>📍</span>
            {task.location}
          </div>
          {task.suggested_price && (
            <div className="task-card-price">
              ${task.suggested_price}
            </div>
          )}
        </div>

        <div className="task-card-footer">
          <div className="task-card-requester">
            {task.requester_photo ? (
              <img src={task.requester_photo} alt={task.requester_name} />
            ) : (
              <div className="requester-avatar">{task.requester_name?.charAt(0)}</div>
            )}
            <span>{task.requester_name}</span>
          </div>
          {task.application_count > 0 && (
            <div className="task-card-applications">
              👥 {task.application_count} {task.application_count === 1 ? 'applicant' : 'applicants'}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BrowseTasks;
