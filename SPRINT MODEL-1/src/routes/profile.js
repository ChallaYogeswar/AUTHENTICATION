const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../models/database');
const { hashPassword, validatePassword } = require('../utils/password');
const { requireAuth, auditLog } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication and audit logging to all profile routes
router.use(requireAuth);
router.use(auditLog);

// Input validation
const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 255 }),
  body('phone').optional().isMobilePhone()
];

const changePasswordValidation = [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 8, max: 128 })
];

const changeEmailValidation = [
  body('newEmail').isEmail().normalizeEmail(),
  body('password').exists()
];

// GET /api/profile - Get current user profile
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, name, phone_number, email_verified, created_at, updated_at, last_login_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phone_number,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at
    });
  } catch (error) {
    logger.error('Get profile error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profile - Update user profile
router.put('/', updateProfileValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const { name, phone } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (phone !== undefined) {
      updates.push(`phone_number = $${paramCount++}`);
      values.push(phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.user.id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, name, phone_number, updated_at`,
      values
    );

    const updatedUser = result.rows[0];
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phoneNumber: updatedUser.phone_number,
        updatedAt: updatedUser.updated_at
      }
    });
  } catch (error) {
    logger.error('Update profile error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/profile/change-password - Change password
router.post('/change-password', changePasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'New password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    // Get current password hash
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password_hash } = result.rows[0];

    // Verify current password
    const { verifyPassword } = require('../utils/password');
    const isValidCurrentPassword = await verifyPassword(password_hash, currentPassword);
    if (!isValidCurrentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newPasswordHash, req.user.id]);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/profile/change-email - Request email change
router.post('/change-email', changeEmailValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const { newEmail, password } = req.body;

    // Check if new email is already taken
    const existingUser = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2', [newEmail, req.user.id]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email is already in use' });
    }

    // Verify current password
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const { password_hash } = result.rows[0];

    const { verifyPassword } = require('../utils/password');
    const isValidPassword = await verifyPassword(password_hash, password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // Generate email change token (store new email temporarily)
    const crypto = require('crypto');
    const changeToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(changeToken).digest('hex');

    // Store email change request (you might want a separate table for this)
    // For now, we'll use a simple approach with metadata
    await query(
      'INSERT INTO audit_logs (user_id, event_type, ip_address, user_agent, metadata) VALUES ($1, $2, $3, $4, $5)',
      [
        req.user.id,
        'EMAIL_CHANGE_REQUEST',
        req.ip,
        req.headers['user-agent'],
        JSON.stringify({ newEmail, tokenHash, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) })
      ]
    );

    // Send verification email to new email address
    const { sendVerificationEmail } = require('../services/emailService');
    const user = { id: req.user.id, name: req.user.name, email: newEmail };

    await sendVerificationEmail(user, changeToken);

    res.json({
      success: true,
      message: 'Email change request sent. Please check your new email for verification.'
    });
  } catch (error) {
    logger.error('Change email error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
