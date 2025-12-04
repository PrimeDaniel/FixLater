const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const userSocketMap = new Map(); // userId -> socketId

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    userSocketMap.set(socket.userId, socket.id);

    // Join conversation rooms
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { conversation_id, message } = data;

        // Verify user is part of this conversation
        const convResult = await pool.query(
          'SELECT * FROM conversations WHERE id = $1 AND (requester_id = $2 OR provider_id = $2)',
          [conversation_id, socket.userId]
        );

        if (convResult.rows.length === 0) {
          socket.emit('error', { message: 'Not authorized for this conversation' });
          return;
        }

        const conversation = convResult.rows[0];

        // Save message to database
        const result = await pool.query(
          `INSERT INTO messages (conversation_id, sender_id, message, created_at)
           VALUES ($1, $2, $3, NOW())
           RETURNING *`,
          [conversation_id, socket.userId, message]
        );

        const newMessage = result.rows[0];

        // Get sender info
        const userResult = await pool.query(
          'SELECT id, name, profile_photo FROM users WHERE id = $1',
          [socket.userId]
        );
        newMessage.sender = userResult.rows[0];

        // Emit to conversation room
        io.to(`conversation_${conversation_id}`).emit('new_message', newMessage);

        // Send notification to other user
        const otherUserId = conversation.requester_id === socket.userId 
          ? conversation.provider_id 
          : conversation.requester_id;

        // Create notification
        await pool.query(
          `INSERT INTO notifications (user_id, message, related_task_id, created_at)
           VALUES ($1, $2, $3, NOW())`,
          [otherUserId, `New message from ${userResult.rows[0].name}`, conversation.task_id]
        );

        // Emit notification if user is online
        const otherUserSocketId = userSocketMap.get(otherUserId);
        if (otherUserSocketId) {
          io.to(otherUserSocketId).emit('new_notification', {
            message: `New message from ${userResult.rows[0].name}`,
            conversation_id,
          });
        }
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (conversationId) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
      });
    });

    socket.on('stop_typing', (conversationId) => {
      socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
        userId: socket.userId,
      });
    });

    // Mark messages as read
    socket.on('mark_read', async (data) => {
      try {
        const { conversation_id } = data;
        
        await pool.query(
          `UPDATE messages SET read = TRUE 
           WHERE conversation_id = $1 AND sender_id != $2 AND read = FALSE`,
          [conversation_id, socket.userId]
        );

        socket.to(`conversation_${conversation_id}`).emit('messages_read', {
          conversation_id,
          reader_id: socket.userId,
        });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      userSocketMap.delete(socket.userId);
    });
  });
};
