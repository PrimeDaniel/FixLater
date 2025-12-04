import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import socketService from '../utils/socket';
import { toast } from 'react-toastify';
import './Messages.css';

const Chat = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchConversation();
    fetchMessages();

    // Join conversation room
    socketService.joinConversation(id);

    // Listen for new messages
    socketService.onNewMessage((message) => {
      if (message.conversation_id === parseInt(id)) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
        
        // Mark as read if not sent by current user
        if (message.sender_id !== user?.id) {
          socketService.markAsRead(id);
        }
      }
    });

    // Listen for typing indicators
    socketService.onUserTyping(({ userId }) => {
      if (userId !== user?.id) {
        setIsTyping(true);
      }
    });

    socketService.onUserStopTyping(({ userId }) => {
      if (userId !== user?.id) {
        setIsTyping(false);
      }
    });

    return () => {
      socketService.leaveConversation(id);
      socketService.removeListener('new_message');
      socketService.removeListener('user_typing');
      socketService.removeListener('user_stop_typing');
    };
  }, [id, user]);

  const fetchConversation = async () => {
    try {
      const response = await api.get(`/api/messages/conversation/${id}`);
      setConversation(response.data.conversation);
    } catch (error) {
      console.error('Fetch conversation error:', error);
      toast.error('Failed to load conversation');
      navigate('/messages');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/api/messages/conversation/${id}/messages`);
      setMessages(response.data.messages || []);
      scrollToBottom();
      
      // Mark messages as read
      socketService.markAsRead(id);
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    socketService.typing(id);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(id);
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    socketService.sendMessage(id, newMessage.trim());
    setNewMessage('');
    socketService.stopTyping(id);

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  if (loading || !conversation) {
    return <div className="loading">Loading...</div>;
  }

  const otherUser = conversation.requester_id === user?.id
    ? {
        id: conversation.provider_id,
        name: conversation.provider_name,
        photo: conversation.provider_photo,
      }
    : {
        id: conversation.requester_id,
        name: conversation.requester_name,
        photo: conversation.requester_photo,
      };

  return (
    <div className="page">
      <div className="container">
        <div className="chat-container">
          <div className="chat-header">
            {otherUser.photo && (
              <img
                src={otherUser.photo}
                alt={otherUser.name}
                className="chat-avatar"
              />
            )}
            <div className="chat-info">
              <h2>{otherUser.name}</h2>
              <Link to={`/tasks/${conversation.task_id}`} className="chat-task-link">
                {conversation.task_title}
              </Link>
            </div>
          </div>

          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-state">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-wrapper ${
                    message.sender_id === user?.id ? 'sent' : 'received'
                  }`}
                >
                  {message.sender_photo && (
                    <img
                      src={message.sender_photo}
                      alt={message.sender_name}
                      className="message-avatar"
                    />
                  )}
                  <div className="message-bubble">
                    <p className="message-text">{message.message}</p>
                    <span className="message-time">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="typing-indicator">{otherUser.name} is typing...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="message-input-container">
            <form onSubmit={handleSubmit} className="message-input-form">
              <textarea
                className="message-input"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                rows="1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                className="send-button"
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
