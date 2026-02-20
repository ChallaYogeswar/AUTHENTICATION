import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import * as twilio from 'twilio';

@Injectable()
export class MailService {
  private twilioClient: twilio.Twilio;

  constructor(private configService: ConfigService) {
    // SendGrid setup
    sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));

    // Twilio setup
    this.twilioClient = twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<void> {
    const msg = {
      to,
      from: this.configService.get('FROM_EMAIL', 'noreply@yourapp.com'),
      subject,
      text,
      html,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendSMS(to: string, message: string): Promise<void> {
    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to,
      });
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = 'Welcome to Enterprise Auth!';
    const html = `
      <h1>Welcome ${name}!</h1>
      <p>Your account has been successfully created.</p>
      <p>You can now log in and start using our platform.</p>
    `;

    await this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const html = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await this.sendEmail(email, subject, html);
  }

  async sendEmailVerification(email: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${verificationToken}`;
    const subject = 'Verify Your Email';
    const html = `
      <h1>Email Verification</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `;

    await this.sendEmail(email, subject, html);
  }

  async sendLoginNotification(email: string, loginInfo: any): Promise<void> {
    const subject = 'New Login Detected';
    const html = `
      <h1>New Login</h1>
      <p>We detected a new login to your account:</p>
      <ul>
        <li>Time: ${new Date().toLocaleString()}</li>
        <li>IP: ${loginInfo.ipAddress}</li>
        <li>Device: ${loginInfo.userAgent}</li>
      </ul>
      <p>If this wasn't you, please change your password immediately.</p>
    `;

    await this.sendEmail(email, subject, html);
  }

  async sendMFACode(phoneNumber: string, code: string): Promise<void> {
    const message = `Your MFA code is: ${code}. This code expires in 5 minutes.`;
    await this.sendSMS(phoneNumber, message);
  }
}
