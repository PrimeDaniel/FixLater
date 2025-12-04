import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Badge from '@mui/material/Badge';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Mark read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Mark all read error:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="error">
              <Typography variant="body2" color="text.secondary">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </Typography>
            </Badge>
          )}
        </Box>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outlined" color="secondary">
            Mark All as Read
          </Button>
        )}
      </Box>

      {notifications.length === 0 ? (
        <Card>
          <CardContent>
            <Typography textAlign="center" color="text.secondary">
              No notifications yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {notifications.map((notification, index) => (
            <Card
              key={notification.id}
              sx={{
                mb: 2,
                bgcolor: !notification.read ? 'action.hover' : 'background.paper',
                cursor: !notification.read ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (!notification.read) {
                  markAsRead(notification.id);
                }
              }}
            >
              <CardContent>
                <Typography variant="body1" gutterBottom>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.created_at).toLocaleString()}
                </Typography>
              </CardContent>
              {notification.related_task_id && (
                <>
                  <Divider />
                  <CardActions>
                    <Button
                      component={Link}
                      to={`/tasks/${notification.related_task_id}`}
                      size="small"
                      variant="text"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Task
                    </Button>
                  </CardActions>
                </>
              )}
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Notifications;
