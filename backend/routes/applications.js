const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticate, requireUserType } = require('../middleware/auth');

const router = express.Router();

// Get applications (provider sees their own, requester sees for their tasks)
router.get('/', authenticate, async (req, res) => {
  try {
    let sql = '';
    let params = [];

    if (req.user.user_type === 'provider') {
      sql = `
        SELECT a.*, t.title, t.description, t.category, t.location, t.status as task_status,
               tas.start_time, tas.end_time, u.name as requester_name
        FROM applications a
        JOIN tasks t ON a.task_id = t.id
        JOIN task_availability_slots tas ON a.selected_slot_id = tas.id
        JOIN users u ON t.requester_id = u.id
        WHERE a.provider_id = $1
        ORDER BY a.created_at DESC
      `;
      params = [req.user.id];
    } else {
      sql = `
        SELECT a.*, t.title, u.name as provider_name, u.profile_photo as provider_photo,
               tas.start_time, tas.end_time
        FROM applications a
        JOIN tasks t ON a.task_id = t.id
        JOIN users u ON a.provider_id = u.id
        JOIN task_availability_slots tas ON a.selected_slot_id = tas.id
        WHERE t.requester_id = $1
        ORDER BY a.created_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(sql, params);
    res.json({ applications: result.rows });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Apply to task
router.post('/', authenticate, requireUserType('provider'), [
  body('task_id').isInt(),
  body('proposed_price').isFloat({ min: 0 }),
  body('selected_slot_id').isInt(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { task_id, proposed_price, selected_slot_id } = req.body;

    // Check if task exists and is open
    const taskResult = await pool.query('SELECT status, requester_id FROM tasks WHERE id = $1', [task_id]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult.rows[0];
    if (task.status !== 'open') {
      return res.status(400).json({ error: 'Task is not open for applications' });
    }

    if (task.requester_id === req.user.id) {
      return res.status(400).json({ error: 'Cannot apply to your own task' });
    }

    // Check if slot belongs to task
    const slotResult = await pool.query(
      'SELECT id FROM task_availability_slots WHERE id = $1 AND task_id = $2',
      [selected_slot_id, task_id]
    );
    if (slotResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid time slot' });
    }

    // Check if already applied
    const existingResult = await pool.query(
      'SELECT id FROM applications WHERE task_id = $1 AND provider_id = $2',
      [task_id, req.user.id]
    );
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Already applied to this task' });
    }

    // Create application
    const result = await pool.query(
      `INSERT INTO applications (task_id, provider_id, proposed_price, selected_slot_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [task_id, req.user.id, proposed_price, selected_slot_id]
    );

    // Create notification for requester
    await pool.query(
      `INSERT INTO notifications (user_id, type, message, related_task_id)
       VALUES ($1, 'application_received', $2, $3)`,
      [task.requester_id, `New application received for task: ${task_id}`, task_id]
    );

    res.status(201).json({ application: result.rows[0] });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept/Reject application
router.patch('/:id', authenticate, requireUserType('requester', 'provider'), [
  body('status').isIn(['accepted', 'rejected']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Get application
    const appResult = await pool.query(
      'SELECT a.*, t.requester_id, t.status as task_status FROM applications a JOIN tasks t ON a.task_id = t.id WHERE a.id = $1',
      [id]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = appResult.rows[0];

    // Check authorization
    if (req.user.user_type === 'requester' && application.requester_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (req.user.user_type === 'provider' && application.provider_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update application
    await pool.query('UPDATE applications SET status = $1 WHERE id = $2', [status, id]);

    // If accepted, update task
    if (status === 'accepted') {
      await pool.query(
        'UPDATE tasks SET status = $1, assigned_provider_id = $2 WHERE id = $3',
        ['assigned', application.provider_id, application.task_id]
      );

      // Reject other applications
      await pool.query(
        'UPDATE applications SET status = $1 WHERE task_id = $2 AND id != $3',
        ['rejected', application.task_id, id]
      );

      // Get scheduled time
      const slotResult = await pool.query(
        'SELECT start_time FROM task_availability_slots WHERE id = $1',
        [application.selected_slot_id]
      );

      if (slotResult.rows.length > 0) {
        await pool.query(
          'UPDATE tasks SET scheduled_time = $1 WHERE id = $2',
          [slotResult.rows[0].start_time, application.task_id]
        );
      }

      // Create notifications
      await pool.query(
        `INSERT INTO notifications (user_id, type, message, related_task_id)
         VALUES ($1, 'application_accepted', $2, $3)`,
        [application.provider_id, 'Your application was accepted!', application.task_id]
      );
    } else {
      // Rejected
      await pool.query(
        `INSERT INTO notifications (user_id, type, message, related_task_id)
         VALUES ($1, 'application_rejected', $2, $3)`,
        [application.provider_id, 'Your application was not selected.', application.task_id]
      );
    }

    res.json({ message: 'Application updated' });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Withdraw application
router.delete('/:id', authenticate, requireUserType('provider'), async (req, res) => {
  try {
    const { id } = req.params;

    const appResult = await pool.query(
      `SELECT a.*, tas.start_time FROM applications a
       JOIN task_availability_slots tas ON a.selected_slot_id = tas.id
       WHERE a.id = $1 AND a.provider_id = $2`,
      [id, req.user.id]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = appResult.rows[0];

    // Check 24 hour rule
    const hoursUntil = (new Date(application.start_time) - new Date()) / (1000 * 60 * 60);
    if (hoursUntil < 24) {
      return res.status(400).json({ error: 'Cannot withdraw less than 24 hours before scheduled time' });
    }

    await pool.query('UPDATE applications SET status = $1 WHERE id = $2', ['withdrawn', id]);

    res.json({ message: 'Application withdrawn' });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

