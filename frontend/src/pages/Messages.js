import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Messages.css';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/api/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Fetch conversations error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Messages</h1>
          <p>Chat with providers and requesters</p>
        </div>

        {conversations.length === 0 ? (
          <div className="empty-state">
            <p>No conversations yet.</p>
            <p>Start a conversation from a task detail page.</p>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map((conv) => {
              const otherUser = conv.requester_id === user?.id 
                ? { name: conv.provider_name, photo: conv.provider_photo }
                : { name: conv.requester_name, photo: conv.requester_photo };

              return (
                <Link
                  key={conv.id}
                  to={`/messages/${conv.id}`}
                  className="conversation-card card"
                >
                  <div className="conversation-header">
                    {otherUser.photo && (
                      <img
                        src={otherUser.photo}
                        alt={otherUser.name}
                        className="conversation-avatar"
                      />
                    )}
                    <div className="conversation-info">
                      <h3>{otherUser.name}</h3>
                      <p className="conversation-task">{conv.task_title}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="unread-badge">{conv.unread_count}</span>
                    )}
                  </div>
                  {conv.last_message && (
                    <div className="conversation-preview">
                      <p className="last-message">{conv.last_message}</p>
                      <span className="last-message-time">
                        {new Date(conv.last_message_time).toLocaleString()}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
