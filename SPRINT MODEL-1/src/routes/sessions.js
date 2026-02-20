const express = require('express');
const { query } = require('../models/database');
const { requireAuth, auditLog } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication and audit logging to all session routes
router.use(requireAuth);
router.use(auditLog);

// GET /api/sessions - Get all active sessions for current user
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, device_name, user_agent, ip_address, created_at, expires_at,
              CASE WHEN id = $2 THEN true ELSE false END as is_current
       FROM sessions
       WHERE user_id = $1 AND revoked = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [req.user.id, req.session.id]
    );

    const sessions = result.rows.map(session => ({
      id: session.id,
      deviceName: session.device_name || 'Unknown Device',
      userAgent: session.user_agent,
      ipAddress: session.ip_address,
      createdAt: session.created_at,
      expiresAt: session.expires_at,
      isCurrent: session.is_current
    }));

    res.json({ sessions });
  } catch (error) {
    logger.error('Get sessions error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/sessions/:sessionId - Revoke specific session
router.delete('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Verify the session belongs to the current user
    const result = await query(
      'SELECT id FROM sessions WHERE id = $1 AND user_id = $2 AND revoked = FALSE',
      [sessionId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Revoke the session
    await query('UPDATE sessions SET revoked = TRUE WHERE id = $1', [sessionId]);

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    logger.error('Revoke session error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/sessions/revoke-all - Revoke all sessions except current
router.post('/revoke-all', async (req, res) => {
  try {
    // Revoke all sessions for the user except the current one
    await query(
      'UPDATE sessions SET revoked = TRUE WHERE user_id = $1 AND id != $2',
      [req.user.id, req.session.id]
    );

    res.json({
      success: true,
      message: 'All other sessions revoked successfully'
    });
  } catch (error) {
    logger.error('Revoke all sessions error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
