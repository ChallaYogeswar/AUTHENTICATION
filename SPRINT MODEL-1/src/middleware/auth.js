const { query } = require('../models/database');
const logger = require('../utils/logger');

// Middleware to check if user is authenticated
async function requireAuth(req, res, next) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user still exists and is active
    const result = await query(
      'SELECT id, email, name, email_verified, is_active FROM users WHERE id = $1',
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      // User doesn't exist, destroy session
      req.session.destroy();
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Middleware to log audit events
async function auditLog(req, res, next) {
  const originalSend = res.send;
  res.send = function(data) {
    // Log after response is sent
    setImmediate(async () => {
      try {
        const userId = req.session?.userId || req.user?.id;
        const eventType = getEventType(req);
        if (eventType) {
          await query(`
            INSERT INTO audit_logs (user_id, event_type, ip_address, user_agent, metadata)
            VALUES ($1, $2, $3, $4, $5)
          `, [
            userId,
            eventType,
            req.ip,
            req.headers['user-agent'],
            JSON.stringify({
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
              userAgent: req.headers['user-agent']
            })
          ]);
        }
      } catch (error) {
        logger.error('Audit log error', error);
      }
    });

    originalSend.call(this, data);
  };

  next();
}

function getEventType(req) {
  const path = req.path;
  const method = req.method;

  if (path === '/login' && method === 'POST') return 'LOGIN_ATTEMPT';
  if (path === '/register' && method === 'POST') return 'REGISTRATION';
  if (path === '/logout' && method === 'POST') return 'LOGOUT';
  if (path === '/forgot-password' && method === 'POST') return 'PASSWORD_RESET_REQUEST';
  if (path === '/reset-password' && method === 'POST') return 'PASSWORD_RESET';
  if (path === '/verify-email' && method === 'GET') return 'EMAIL_VERIFICATION';
  if (path === '/resend-verification' && method === 'POST') return 'EMAIL_VERIFICATION_RESEND';

  return null;
}

module.exports = {
  requireAuth,
  auditLog
};
