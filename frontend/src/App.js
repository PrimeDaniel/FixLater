import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTask from './pages/CreateTask';
import TaskDetail from './pages/TaskDetail';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import socketService from './utils/socket';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token);

        // Listen for new notifications
        socketService.onNewNotification((data) => {
          toast.info(data.message, {
            position: 'top-right',
            autoClose: 5000,
          });
        });
      }
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.removeListener('new_notification');
    };
  }, [user]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks/create"
          element={
            <PrivateRoute>
              <CreateTask />
            </PrivateRoute>
          }
        />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route
          path="/applications"
          element={
            <PrivateRoute>
              <Applications />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages/:id"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
      </Routes>
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

