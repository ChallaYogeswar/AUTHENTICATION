const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../models/database');
const { hashPassword, verifyPassword, validatePassword } = require('../utils/password');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { auditLog } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Apply audit logging to all auth routes
router.use(auditLog);

// Input validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }),
  body('name').trim().isLength({ min: 1, max: 255 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail()
];

const resetPasswordValidation = [
  body('token').isLength({ min: 32, max: 64 }),
  body('newPassword').isLength({ min: 8, max: 128 })
];

// POST /api/auth/register
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const { email, password, name } = req.body;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, name, passwordHash]
    );

    const user = result.rows[0];

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

    await query(
      'INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, new Date(Date.now() + 24 * 60 * 60 * 1000)] // 24 hours
    );

    // Send verification email (async, don't wait)
    sendVerificationEmail(user, verificationToken).catch(error => {
      logger.error('Failed to send verification email', error);
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      userId: user.id
    });

  } catch (error) {
    logger.error('Registration error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const result = await query(
      'SELECT id, email, name, password_hash, email_verified, is_active, failed_login_attempts, locked_until FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.locked_until && user.locked_until > new Date()) {
      return res.status(423).json({
        error: 'Account is temporarily locked due to too many failed login attempts',
        lockedUntil: user.locked_until
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(user.password_hash, password);
    if (!isValidPassword) {
      // Increment failed attempts
      await query(
        'UPDATE users SET failed_login_attempts = failed_login_attempts + 1, locked_until = CASE WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL \'30 minutes\' ELSE locked_until END WHERE id = $1',
        [user.id]
      );

      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Reset failed attempts on successful login
    await query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Create session
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.name = user.name;
    req.session.emailVerified = user.email_verified;

    // Store session in database for tracking
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionTokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');

    await query(
      'INSERT INTO sessions (user_id, session_token_hash, device_name, user_agent, ip_address, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        user.id,
        sessionTokenHash,
        req.body.deviceName || 'Unknown Device',
        req.headers['user-agent'],
        req.ip,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      ]
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.email_verified
      }
    });

  } catch (error) {
    logger.error('Login error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    if (req.session.userId) {
      // Mark session as revoked in database
      await query('UPDATE sessions SET revoked = TRUE WHERE user_id = $1 AND revoked = FALSE', [req.session.userId]);
    }

    req.session.destroy((err) => {
      if (err) {
        logger.error('Session destroy error', err);
        return res.status(500).json({ error: 'Logout failed' });
      }

      res.clearCookie('sid');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  } catch (error) {
    logger.error('Logout error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await query(
      'SELECT id, email, name, email_verified, phone_number, created_at FROM users WHERE id = $1',
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      req.session.destroy();
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json(user);
  } catch (error) {
    logger.error('Get user error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const { email } = req.body;

    // Find user (don't reveal if email exists or not)
    const result = await query('SELECT id, name, email FROM users WHERE LOWER(email) = LOWER($1) AND is_active = TRUE', [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      await query(
        'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [user.id, tokenHash, new Date(Date.now() + 60 * 60 * 1000)] // 1 hour
      );

      // Send reset email (async)
      sendPasswordResetEmail(user, resetToken).catch(error => {
        logger.error('Failed to send password reset email', error);
      });
    }

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If email exists, reset link sent'
    });

  } catch (error) {
    logger.error('Forgot password error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', resetPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const { token, newPassword } = req.body;

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    // Hash token to find in database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await query(
      'SELECT pr.id, pr.user_id, pr.used, pr.expires_at, u.email FROM password_resets pr JOIN users u ON pr.user_id = u.id WHERE pr.token_hash = $1 AND pr.used = FALSE AND pr.expires_at > NOW()',
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const resetRequest = result.rows[0];

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password and mark token as used
    await query('BEGIN');
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, resetRequest.user_id]);
    await query('UPDATE password_resets SET used = TRUE WHERE id = $1', [resetRequest.id]);
    await query('COMMIT');

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    await query('ROLLBACK');
    logger.error('Reset password error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/verify-email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await query(
      'SELECT ev.id, ev.user_id, ev.verified, ev.expires_at, u.email FROM email_verifications ev JOIN users u ON ev.user_id = u.id WHERE ev.token_hash = $1 AND ev.verified = FALSE AND ev.expires_at > NOW()',
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    const verification = result.rows[0];

    // Mark email as verified
    await query('BEGIN');
    await query('UPDATE users SET email_verified = TRUE WHERE id = $1', [verification.user_id]);
    await query('UPDATE email_verifications SET verified = TRUE WHERE id = $1', [verification.id]);
    await query('COMMIT');

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    await query('ROLLBACK');
    logger.error('Email verification error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', [body('email').isEmail().normalizeEmail()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const { email } = req.body;

    const result = await query(
      'SELECT id, name, email FROM users WHERE LOWER(email) = LOWER($1) AND email_verified = FALSE AND is_active = TRUE',
      [email]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

      await query(
        'INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [user.id, tokenHash, new Date(Date.now() + 24 * 60 * 60 * 1000)]
      );

      // Send verification email
      sendVerificationEmail(user, verificationToken).catch(error => {
        logger.error('Failed to resend verification email', error);
      });
    }

    res.json({
      success: true,
      message: 'If email exists and is unverified, verification link sent'
    });

  } catch (error) {
    logger.error('Resend verification error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
