const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/users/providers
// Query params: category, searchTerm, sortBy
router.get('/providers', async (req, res) => {
  const { category, searchTerm, sortBy } = req.query;
  let sql = `SELECT u.id, u.name, u.profile_photo, u.bio, u.created_at,
                    u.service_area_center, u.service_area_radius,
                    AVG(r.rating) as avg_rating,
                    COUNT(r.id) as review_count,
                    (
                      SELECT COUNT(*) FROM tasks t
                      WHERE t.assigned_provider_id = u.id AND t.status = 'completed'
                    ) as completed_tasks
             FROM users u
             LEFT JOIN reviews r ON r.provider_id = u.id
             WHERE u.user_type = 'provider'`;
  const params = [];

  if (category) {
    sql += ' AND $1 = ANY(u.bio)'; // This is a placeholder; adjust as needed
    params.push(category);
  }

  if (searchTerm) {
    sql += params.length ? ' AND' : ' AND';
    sql += ` (LOWER(u.name) LIKE $${params.length + 1} OR LOWER(u.bio) LIKE $${params.length + 1})`;
    params.push(`%${searchTerm.toLowerCase()}%`);
  }

  sql += ' GROUP BY u.id';

  if (sortBy === 'reviewCount') {
    sql += ' ORDER BY review_count DESC';
  } else if (sortBy === 'completedTasks') {
    sql += ' ORDER BY completed_tasks DESC';
  } else if (sortBy === 'newest') {
    sql += ' ORDER BY u.created_at DESC';
  } else {
    sql += ' ORDER BY avg_rating DESC NULLS LAST';
  }

  try {
    const result = await pool.query(sql, params);
    res.json({ providers: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
