const express = require('express');
const { body, validationResult, query } = require('express-validator');
const pool = require('../config/database');
const { authenticate, optionalAuthenticate, requireUserType } = require('../middleware/auth');
const NodeGeocoder = require('node-geocoder');

const router = express.Router();

const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
});

// Get all tasks with filters
router.get('/', [
  query('category').optional(),
  query('min_price').optional().isFloat(),
  query('max_price').optional().isFloat(),
  query('status').optional().isIn(['open', 'assigned', 'completed', 'cancelled']),
  query('lat').optional().isFloat(),
  query('lng').optional().isFloat(),
  query('radius').optional().isInt(), // in km
], async (req, res) => {
  try {
    const { category, min_price, max_price, status, lat, lng, radius } = req.query;
    let sql = `
      SELECT 
        t.*,
        u.name as requester_name,
        u.profile_photo as requester_photo,
        COUNT(DISTINCT a.id) as application_count,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', ti.id,
              'image_url', ti.image_url
            )
          ) FILTER (WHERE ti.id IS NOT NULL),
          '[]'
        ) as images
      FROM tasks t
      LEFT JOIN users u ON t.requester_id = u.id
      LEFT JOIN task_images ti ON t.id = ti.task_id
      LEFT JOIN applications a ON t.id = a.task_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (category) {
      sql += ` AND t.category = $${paramCount++}`;
      params.push(category);
    }

    if (min_price) {
      sql += ` AND (t.suggested_price >= $${paramCount++} OR t.suggested_price IS NULL)`;
      params.push(min_price);
    }

    if (max_price) {
      sql += ` AND (t.suggested_price <= $${paramCount++} OR t.suggested_price IS NULL)`;
      params.push(max_price);
    }

    if (status) {
      sql += ` AND t.status = $${paramCount++}`;
      params.push(status);
    } else {
      sql += ` AND t.status = 'open'`;
    }

    sql += ` GROUP BY t.id, u.name, u.profile_photo ORDER BY t.created_at DESC`;

    const result = await pool.query(sql, params);
    
    let tasks = result.rows;

    // Filter by distance if location provided
    if (lat && lng && radius) {
      tasks = tasks.filter(task => {
        if (!task.location_coords) return false;
        const taskLat = task.location_coords.lat;
        const taskLng = task.location_coords.lng;
        const distance = calculateDistance(lat, lng, taskLat, taskLng);
        return distance <= radius;
      });
    }

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single task with details (optional auth - public view but auth needed for applications)
router.get('/:id', optionalAuthenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const taskResult = await pool.query(
      `SELECT t.*, u.name as requester_name, u.profile_photo as requester_photo
       FROM tasks t
       JOIN users u ON t.requester_id = u.id
       WHERE t.id = $1`,
      [id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult.rows[0];

    // Get images
    const imagesResult = await pool.query(
      'SELECT id, image_url FROM task_images WHERE task_id = $1 ORDER BY created_at',
      [id]
    );
    task.images = imagesResult.rows;

    // Get availability slots
    const slotsResult = await pool.query(
      'SELECT id, start_time, end_time FROM task_availability_slots WHERE task_id = $1 ORDER BY start_time',
      [id]
    );
    task.availability_slots = slotsResult.rows;

    // Get applications if requester (or if no auth, don't show)
    if (req.user && req.user.id === task.requester_id) {
      const appsResult = await pool.query(
        `SELECT a.*, u.name as provider_name, u.profile_photo as provider_photo,
                tas.start_time, tas.end_time
         FROM applications a
         JOIN users u ON a.provider_id = u.id
         JOIN task_availability_slots tas ON a.selected_slot_id = tas.id
         WHERE a.task_id = $1
         ORDER BY a.created_at DESC`,
        [id]
      );
      task.applications = appsResult.rows;
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create task
router.post('/', authenticate, requireUserType('requester', 'provider'), [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('category').notEmpty(),
  body('location').trim().notEmpty(),
  body('availability_slots').isArray({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, location, suggested_price, availability_slots, image_urls } = req.body;

    // Geocode location
    const geoResult = await geocoder.geocode(location);
    let location_coords = null;
    if (geoResult && geoResult.length > 0) {
      location_coords = {
        lat: geoResult[0].latitude,
        lng: geoResult[0].longitude,
      };
    }

    // Create task
    const taskResult = await pool.query(
      `INSERT INTO tasks (requester_id, title, description, category, location, location_coords, suggested_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, title, description, category, location, JSON.stringify(location_coords), suggested_price || null]
    );

    const task = taskResult.rows[0];

    // Add availability slots
    for (const slot of availability_slots) {
      await pool.query(
        'INSERT INTO task_availability_slots (task_id, start_time, end_time) VALUES ($1, $2, $3)',
        [task.id, slot.start_time, slot.end_time]
      );
    }

    // Add images
    if (image_urls && Array.isArray(image_urls)) {
      for (const image_url of image_urls) {
        await pool.query(
          'INSERT INTO task_images (task_id, image_url) VALUES ($1, $2)',
          [task.id, image_url]
        );
      }
    }

    res.status(201).json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task status (accept application, cancel, etc.)
router.patch('/:id', authenticate, [
  body('status').optional().isIn(['assigned', 'completed', 'cancelled']),
  body('assigned_provider_id').optional().isInt(),
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_provider_id } = req.body;

    // Check ownership
    const taskResult = await pool.query('SELECT requester_id, status, scheduled_time FROM tasks WHERE id = $1', [id]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult.rows[0];

    if (task.requester_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check cancellation time (24 hours before)
    if (status === 'cancelled' && task.scheduled_time) {
      const hoursUntil = (new Date(task.scheduled_time) - new Date()) / (1000 * 60 * 60);
      if (hoursUntil < 24) {
        return res.status(400).json({ error: 'Cannot cancel less than 24 hours before scheduled time' });
      }
    }

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount++}`);
      params.push(status);
    }

    if (assigned_provider_id) {
      updates.push(`assigned_provider_id = $${paramCount++}`);
      params.push(assigned_provider_id);
      
      // Get scheduled time from application
      const appResult = await pool.query(
        'SELECT tas.start_time FROM applications a JOIN task_availability_slots tas ON a.selected_slot_id = tas.id WHERE a.task_id = $1 AND a.provider_id = $2',
        [id, assigned_provider_id]
      );
      if (appResult.rows.length > 0) {
        updates.push(`scheduled_time = $${paramCount++}`);
        params.push(appResult.rows[0].start_time);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    params.push(id);
    await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      params
    );

    res.json({ message: 'Task updated' });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to calculate distance
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = router;

