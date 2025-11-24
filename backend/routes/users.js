const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query(
      'SELECT id, email, user_type, name, profile_photo, bio, service_area_center, service_area_radius FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // If provider, get stats
    if (user.user_type === 'provider') {
      const statsResult = await pool.query(
        `SELECT 
          AVG(r.rating) as avg_rating,
          COUNT(DISTINCT r.id) as review_count,
          COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks
         FROM users u
         LEFT JOIN tasks t ON t.assigned_provider_id = u.id
         LEFT JOIN reviews r ON r.provider_id = u.id
         WHERE u.id = $1
         GROUP BY u.id`,
        [id]
      );

      user.stats = {
        average_rating: parseFloat(statsResult.rows[0]?.avg_rating) || 0,
        review_count: parseInt(statsResult.rows[0]?.review_count) || 0,
        completed_tasks: parseInt(statsResult.rows[0]?.completed_tasks) || 0,
      };
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.patch('/:id', authenticate, [
  body('name').optional().trim().notEmpty(),
  body('bio').optional().trim(),
  body('profile_photo').optional().isURL(),
  body('service_area_center').optional().isObject(),
  body('service_area_radius').optional().isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    if (parseInt(id) !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { name, bio, profile_photo, service_area_center, service_area_radius } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      params.push(name);
    }

    if (bio !== undefined) {
      updates.push(`bio = $${paramCount++}`);
      params.push(bio);
    }

    if (profile_photo) {
      updates.push(`profile_photo = $${paramCount++}`);
      params.push(profile_photo);
    }

    if (service_area_center) {
      updates.push(`service_area_center = $${paramCount++}`);
      params.push(JSON.stringify(service_area_center));
    }

    if (service_area_radius) {
      updates.push(`service_area_radius = $${paramCount++}`);
      params.push(service_area_radius);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    params.push(id);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      params
    );

    res.json({ message: 'Profile updated' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.patch('/:id/password', authenticate, [
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { current_password, new_password } = req.body;

    if (parseInt(id) !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get current password
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, id]);

    res.json({ message: 'Password updated' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

