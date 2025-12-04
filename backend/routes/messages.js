const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get or create conversation for a task
router.post('/conversation', authenticate, async (req, res) => {
  try {
    const { task_id, other_user_id } = req.body;

    // Verify task exists and user is involved
    const taskResult = await pool.query(
      'SELECT requester_id, assigned_provider_id FROM tasks WHERE id = $1',
      [task_id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult.rows[0];
    const userId = req.user.id;

    // Determine requester and provider
    let requesterId, providerId;
    if (task.requester_id === userId) {
      requesterId = userId;
      providerId = other_user_id;
    } else if (task.assigned_provider_id === userId || other_user_id === task.requester_id) {
      requesterId = task.requester_id;
      providerId = userId === task.assigned_provider_id ? userId : other_user_id;
    } else {
      return res.status(403).json({ error: 'Not authorized for this task' });
    }

    // Check if conversation exists
    let conversation = await pool.query(
      'SELECT * FROM conversations WHERE task_id = $1 AND requester_id = $2 AND provider_id = $3',
      [task_id, requesterId, providerId]
    );

    if (conversation.rows.length === 0) {
      // Create new conversation
      conversation = await pool.query(
        `INSERT INTO conversations (task_id, requester_id, provider_id, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING *`,
        [task_id, requesterId, providerId]
      );
    }

    res.json({ conversation: conversation.rows[0] });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all conversations for user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*,
              t.title as task_title,
              t.status as task_status,
              u1.name as requester_name,
              u1.profile_photo as requester_photo,
              u2.name as provider_name,
              u2.profile_photo as provider_photo,
              (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != $1 AND m.read = FALSE) as unread_count,
              (SELECT message FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_time
       FROM conversations c
       JOIN tasks t ON c.task_id = t.id
       JOIN users u1 ON c.requester_id = u1.id
       JOIN users u2 ON c.provider_id = u2.id
       WHERE c.requester_id = $1 OR c.provider_id = $1
       ORDER BY last_message_time DESC NULLS LAST`,
      [req.user.id]
    );

    res.json({ conversations: result.rows });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages for a conversation
router.get('/conversation/:id/messages', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify user is part of conversation
    const convResult = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND (requester_id = $2 OR provider_id = $2)',
      [id, req.user.id]
    );

    if (convResult.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await pool.query(
      `SELECT m.*, 
              u.name as sender_name,
              u.profile_photo as sender_photo
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    res.json({ messages: result.rows.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get conversation details
router.get('/conversation/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.*,
              t.title as task_title,
              t.status as task_status,
              u1.id as requester_id,
              u1.name as requester_name,
              u1.profile_photo as requester_photo,
              u2.id as provider_id,
              u2.name as provider_name,
              u2.profile_photo as provider_photo
       FROM conversations c
       JOIN tasks t ON c.task_id = t.id
       JOIN users u1 ON c.requester_id = u1.id
       JOIN users u2 ON c.provider_id = u2.id
       WHERE c.id = $1 AND (c.requester_id = $2 OR c.provider_id = $2)`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ conversation: result.rows[0] });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
