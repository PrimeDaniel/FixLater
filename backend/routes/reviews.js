const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticate, requireUserType } = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', authenticate, requireUserType('requester', 'provider'), [
  body('task_id').isInt(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('review_text').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { task_id, rating, review_text } = req.body;

    // Get task
    const taskResult = await pool.query(
      'SELECT requester_id, assigned_provider_id, status, scheduled_time FROM tasks WHERE id = $1',
      [task_id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult.rows[0];

    // Check if task is completed and scheduled time has passed
    if (task.status !== 'completed' && task.status !== 'assigned') {
      return res.status(400).json({ error: 'Task must be completed to review' });
    }

    if (task.scheduled_time && new Date(task.scheduled_time) > new Date()) {
      return res.status(400).json({ error: 'Cannot review before scheduled time' });
    }

    // Determine provider_id and requester_id
    let provider_id, requester_id;
    if (req.user.user_type === 'requester') {
      requester_id = req.user.id;
      provider_id = task.assigned_provider_id;
    } else {
      provider_id = req.user.id;
      requester_id = task.requester_id;
    }

    if (!provider_id) {
      return res.status(400).json({ error: 'No provider assigned to task' });
    }

    // Check if review already exists
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE task_id = $1',
      [task_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'Review already exists for this task' });
    }

    // Create review
    const result = await pool.query(
      `INSERT INTO reviews (task_id, provider_id, requester_id, rating, review_text)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [task_id, provider_id, requester_id, rating, review_text || null]
    );

    // Mark task as completed
    await pool.query('UPDATE tasks SET status = $1 WHERE id = $2', ['completed', task_id]);

    res.status(201).json({ review: result.rows[0] });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reviews for a provider
router.get('/provider/:provider_id', async (req, res) => {
  try {
    const { provider_id } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.name as requester_name, u.profile_photo as requester_photo, t.title as task_title
       FROM reviews r
       JOIN users u ON r.requester_id = u.id
       JOIN tasks t ON r.task_id = t.id
       WHERE r.provider_id = $1
       ORDER BY r.created_at DESC`,
      [provider_id]
    );

    // Calculate average rating
    const avgResult = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE provider_id = $1',
      [provider_id]
    );

    res.json({
      reviews: result.rows,
      average_rating: parseFloat(avgResult.rows[0].avg_rating) || 0,
      review_count: parseInt(avgResult.rows[0].review_count) || 0,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

