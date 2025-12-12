const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Save a task (bookmark)
router.post('/:id/save', authenticate, async (req, res) => {
  const userId = req.user.id;
  const taskId = parseInt(req.params.id);
  try {
    await pool.query(
      'INSERT INTO saved_tasks (user_id, task_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, taskId]
    );
    res.json({ success: true, message: 'Task saved' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Unsave a task
router.delete('/:id/save', authenticate, async (req, res) => {
  const userId = req.user.id;
  const taskId = parseInt(req.params.id);
  try {
    await pool.query(
      'DELETE FROM saved_tasks WHERE user_id = $1 AND task_id = $2',
      [userId, taskId]
    );
    res.json({ success: true, message: 'Task unsaved' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all saved tasks for the user
router.get('/saved', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT t.* FROM saved_tasks s
       JOIN tasks t ON s.task_id = t.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [userId]
    );
    res.json({ tasks: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
