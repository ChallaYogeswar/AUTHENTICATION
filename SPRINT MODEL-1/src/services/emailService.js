const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email verification
async function sendVerificationEmail(user, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Verify Your Email',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background: #4F46E5;
                color: white;
                text-decoration: none;
                border-radius: 6px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Welcome, ${user.name}!</h2>
              <p>Thanks for signing up. Please verify your email address by clicking the button below:</p>
              <p style="margin: 30px 0;">
                <a href="${verifyUrl}" class="button">Verify Email</a>
              </p>
              <p>Or copy this link: ${verifyUrl}</p>
              <p>This link expires in 24 hours.</p>
              <p style="color: #666; font-size: 14px;">
                If you didn't create this account, please ignore this email.
              </p>
            </div>
          </body>
        </html>
      `
    });
    logger.info('Verification email sent', { userId: user.id, email: user.email });
  } catch (error) {
    logger.error('Failed to send verification email', { error: error.message, userId: user.id });
    throw error;
  }
}

// Password reset
async function sendPasswordResetEmail(user, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html>
          <body>
            <div class="container">
              <h2>Password Reset Request</h2>
              <p>Hi ${user.name},</p>
              <p>You requested to reset your password. Click the button below:</p>
              <p style="margin: 30px 0;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy this link: ${resetUrl}</p>
              <p>This link expires in 1 hour.</p>
              <p style="color: #666; font-size: 14px;">
                If you didn't request this, please ignore this email. Your password won't change.
              </p>
            </div>
          </body>
        </html>
      `
    });
    logger.info('Password reset email sent', { userId: user.id, email: user.email });
  } catch (error) {
    logger.error('Failed to send password reset email', { error: error.message, userId: user.id });
    throw error;
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
