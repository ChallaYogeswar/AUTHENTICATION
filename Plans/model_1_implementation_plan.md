# 🚀 Model 1 - Complete Implementation Plan
## Fastest to Ship - Production-Ready Baseline Auth

---

## 📋 Executive Summary

Timeline: 2-3 weeks (1 developer) | 1-2 weeks (2 developers)  
Complexity: Low  
Best For: MVPs, startups, internal tools, quick launches  
User Capacity: Up to 10,000 users

---

## 🎯 Goals & Philosophy

- Ship fast, iterate later
- Zero external dependencies (no Auth0, no IdP)
- Single monolithic service (no microservices)
- Strong security fundamentals
- Modern UX basics
- Easy to understand and maintain

---

## 🏗️ Technical Architecture

### System Design

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ HTTPS
       ↓
┌─────────────┐
│   NGINX     │ ← Reverse Proxy + Rate Limiting
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Node.js    │ ← Express/Fastify Auth Service
│  (Single)   │
└──────┬──────┘
       │
    ┌──┴──┐
    ↓     ↓
┌────────┐ ┌────────┐
│Postgres│ │ Redis  │
└────────┘ └────────┘
```

Service Structure:
- 1 Backend Service - handles all auth logic
- No microservices - keep it simple
- Session-based auth with HttpOnly cookies
- JWT for API clients (optional mobile/SPA)

---

## 🛠️ Tech Stack (Detailed)

### Backend

Primary: Node.js + Express

```bash
# Core Framework
express: ^4.18.2
helmet: ^7.1.0          # Security headers
cors: ^2.8.5            # CORS handling
express-rate-limit: ^7.1.5  # Rate limiting
express-validator: ^7.0.1   # Input validation

# Database
pg: ^8.11.3             # PostgreSQL client
pg-pool: ^3.6.1         # Connection pooling

# Redis
redis: ^4.6.12          # Session store + rate limiting
connect-redis: ^7.1.0   # Express session with Redis

# Security
argon2: ^0.31.2         # Password hashing
jsonwebtoken: ^9.0.2    # JWT (if needed)
express-session: ^1.17.3  # Session management
cookie-parser: ^1.4.6   # Cookie parsing
crypto: built-in         # Token generation

# Email
nodemailer: ^6.9.8      # Email sending
@sendgrid/mail: ^8.1.0  # Or SendGrid

# Utilities
dotenv: ^16.3.1         # Environment variables
winston: ^3.11.0        # Logging
joi: ^17.11.0           # Schema validation
uuid: ^9.0.1            # ID generation
```

Alternative: Python + FastAPI

```python
# Core Framework
fastapi==0.109.0
uvicorn[standard]==0.27.0  # ASGI server
python-multipart==0.0.6     # Form handling

# Database
asyncpg==0.29.0         # PostgreSQL async
sqlalchemy==2.0.25      # ORM
alembic==1.13.1         # Migrations

# Redis
redis==5.0.1            # Redis client
aioredis==2.0.1         # Async Redis

# Security
argon2-cffi==23.1.0     # Password hashing
python-jose[cryptography]==3.3.0  # JWT
passlib==1.7.4          # Password utilities

# Email
fastapi-mail==1.4.1     # Email sending

# Utilities
pydantic==2.5.3         # Data validation
python-dotenv==1.0.0    # Environment variables
```

### Database

PostgreSQL 15+

```bash
# Installation
# Ubuntu/Debian
sudo apt install postgresql-15 postgresql-contrib

# macOS
brew install postgresql@15

# Docker
docker run -d \
  --name auth-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=auth_db \
  -p 5432:5432 \
  postgres:15-alpine
```

Connection Pool Settings:
```javascript
// Node.js pg Pool
{
  max: 20,              // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}
```

### Cache & Sessions

Redis 7+

```bash
# Installation
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis

# Docker
docker run -d \
  --name auth-redis \
  -p 6379:6379 \
  redis:7-alpine
```

Redis Configuration:
```conf
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Frontend

React 18 + Vite

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "axios": "^1.6.5",
    "zustand": "^4.4.7",          // State management
    "react-hook-form": "^7.49.3",  // Form handling
    "zod": "^3.22.4",              // Validation
    "@hookform/resolvers": "^3.3.4"
  },
  "devDependencies": {
    "vite": "^5.0.11",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33"
  }
}
```

Styling:
- Tailwind CSS for utility-first styling
- Or Bootstrap 5 for component library
- Keep it minimal - no heavy UI frameworks

---

## 🗄️ Database Schema (PostgreSQL)

### Migration Strategy
Use node-pg-migrate or Knex.js for migrations

```sql
-- Migration 001: Initial Schema

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Sessions Table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL,
  device_name VARCHAR(255),
  user_agent TEXT,
  ip_address VARCHAR(45),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_token_hash ON sessions(session_token_hash);

-- Password Reset Tokens
CREATE TABLE password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_password_resets_token_hash ON password_resets(token_hash);
CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);

-- Email Verification Tokens
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_email_verifications_token_hash ON email_verifications(token_hash);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Rate Limiting (optional, can use Redis instead)
CREATE TABLE rate_limits (
  id VARCHAR(255) PRIMARY KEY,  -- IP or user_id
  attempts INTEGER DEFAULT 0,
  reset_at TIMESTAMP NOT NULL
);
```

### Database Indexes Strategy

```sql
-- Performance Indexes
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
CREATE INDEX idx_sessions_active ON sessions(user_id, expires_at) 
  WHERE revoked = FALSE;
CREATE INDEX idx_audit_logs_recent ON audit_logs(created_at DESC) 
  WHERE created_at > NOW() - INTERVAL '30 days';
```

---

## 🔐 Security Implementation

### Password Hashing - Argon2id

Node.js Implementation:

```javascript
const argon2 = require('argon2');

// Hashing configuration
const ARGON2_CONFIG = {
  type: argon2.argon2id,
  memoryCost: 65536,      // 64 MB
  timeCost: 3,            // 3 iterations
  parallelism: 4          // 4 threads
};

// Hash password
async function hashPassword(password) {
  return await argon2.hash(password, ARGON2_CONFIG);
}

// Verify password
async function verifyPassword(hash, password) {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    return false;
  }
}
```

Password Policy:
```javascript
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&()_+-=[]{}|;:,.<>?'
};

function validatePassword(password) {
  const errors = [];
  
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Minimum ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Must contain lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Must contain number');
  }
  
  if (!/[!@#$%^&()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Must contain special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Session Management

Express Session Configuration:

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');

// Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

// Session configuration
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sid',  // Don't use default 'connect.sid'
  cookie: {
    secure: true,          // HTTPS only
    httpOnly: true,        // No JavaScript access
    maxAge: 1000  60  60  24  7,  // 7 days
    sameSite: 'strict',    // CSRF protection
    domain: process.env.COOKIE_DOMAIN
  },
  rolling: true  // Reset expiry on each request
}));
```

Session Cleanup Job:

```javascript
// Run daily to clean expired sessions
const { CronJob } = require('cron');

const cleanupJob = new CronJob('0 2   ', async () => {
  await db.query(`
    DELETE FROM sessions 
    WHERE expires_at < NOW() OR revoked = TRUE
  `);
  console.log('Session cleanup completed');
});

cleanupJob.start();
```

### Rate Limiting

Express Rate Limit:

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// General API rate limit
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 15  60  1000,  // 15 minutes
  max: 100,  // 100 requests per window
  message: 'Too many requests, please try again later'
});

// Strict auth endpoint limits
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 15  60  1000,
  max: 5,  // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true  // Don't count successful logins
});

// Apply to routes
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

Account Lockout:

```javascript
async function handleFailedLogin(userId) {
  const result = await db.query(`
    UPDATE users 
    SET failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE 
          WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '30 minutes'
          ELSE locked_until 
        END
    WHERE id = $1
    RETURNING failed_login_attempts, locked_until
  `, [userId]);
  
  return result.rows[0];
}

async function resetFailedAttempts(userId) {
  await db.query(`
    UPDATE users 
    SET failed_login_attempts = 0, 
        locked_until = NULL 
    WHERE id = $1
  `, [userId]);
}
```

### CSRF Protection

```javascript
const csrf = require('csurf');

const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
});

// Apply to state-changing routes
app.post('/api/auth/', csrfProtection);
app.put('/api/', csrfProtection);
app.delete('/api/', csrfProtection);

// Endpoint to get CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));
```

---

## 📡 API Endpoints (Complete)

### Authentication Routes

```javascript
// POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}

// Response: 201 Created
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "userId": "uuid-here"
}

// POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// Response: 200 OK
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true
  }
}
// Sets HttpOnly cookie with session ID

// POST /api/auth/logout
// No body needed - uses session cookie

// Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}

// GET /api/auth/me
// Protected route - requires session

// Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "emailVerified": true,
  "createdAt": "2024-01-01T00:00:00Z"
}

// POST /api/auth/forgot-password
{
  "email": "user@example.com"
}

// Response: 200 OK
{
  "success": true,
  "message": "If email exists, reset link sent"
}

// POST /api/auth/reset-password
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}

// Response: 200 OK
{
  "success": true,
  "message": "Password reset successful"
}

// GET /api/auth/verify-email?token=xyz
// Response: Redirect to login with success message

// POST /api/auth/resend-verification
{
  "email": "user@example.com"
}
```

### Profile Routes

```javascript
// GET /api/profile
// Protected - returns current user profile

// PUT /api/profile
{
  "name": "New Name",
  "phone": "+1234567890"
}

// POST /api/profile/change-password
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}

// POST /api/profile/change-email
{
  "newEmail": "newemail@example.com",
  "password": "CurrentPass123!"
}
// Sends verification to new email
```

### Session Management Routes

```javascript
// GET /api/sessions
// Returns all active sessions for current user

// Response:
{
  "sessions": [
    {
      "id": "uuid",
      "deviceName": "Chrome on MacOS",
      "ipAddress": "192.168.1.1",
      "createdAt": "2024-01-01T00:00:00Z",
      "isCurrent": true
    }
  ]
}

// DELETE /api/sessions/:sessionId
// Revoke specific session

// POST /api/sessions/revoke-all
// Revoke all sessions except current
```

---

## 🎨 Frontend Implementation

### Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── ForgotPasswordForm.jsx
│   │   │   ├── ResetPasswordForm.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── AuthLayout.jsx
│   │   └── common/
│   │       ├── Input.jsx
│   │       ├── Button.jsx
│   │       └── Alert.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useForm.js
│   ├── services/
│   │   └── api.js
│   ├── store/
│   │   └── authStore.js
│   ├── utils/
│   │   ├── validation.js
│   │   └── storage.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Profile.jsx
│   │   └── Sessions.jsx
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

### Authentication Store (Zustand)

```javascript
// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          set({ 
            user: response.data.user, 
            isAuthenticated: true,
            isLoading: false 
          });
          return { success: true };
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Login failed',
            isLoading: false 
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/auth/register', data);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false 
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },

      checkAuth: async () => {
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          set({ user: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);
```

### API Service

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,  // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for CSRF token
api.interceptors.request.use(
  async (config) => {
    // Get CSRF token for state-changing requests
    if (['post', 'put', 'delete'].includes(config.method)) {
      const csrfToken = sessionStorage.getItem('csrf-token');
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Session expired - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Login Form Component

```jsx
// src/components/auth/LoginForm.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    clearError();
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          Sign In
        </h2>
        
        {error && (
          <Alert type="error" message={error} onClose={clearError} />
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={validationErrors.email}
            placeholder="you@example.com"
            required
          />
          
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={validationErrors.password}
            placeholder="••••••••"
            required
          />
          
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-600">
                Remember me
              </span>
            </label>
            
            <Link 
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </Link>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link 
            to="/register"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### Protected Route Component

```jsx
// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
```

---

## 📧 Email Templates

### Email Service Setup

```javascript
// src/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
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
}

// Password reset
async function sendPasswordResetEmail(user, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
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
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
```

---

## 🧪 Testing Strategy

### Unit Tests (Jest)

```javascript
// __tests__/auth.test.js
const { hashPassword, verifyPassword } = require('../utils/password');
const { validatePassword } = require('../utils/validation');

describe('Password Utilities', () => {
  test('should hash password correctly', async () => {
    const password = 'TestPass123!';
    const hash = await hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50);
  });

  test('should verify correct password', async () => {
    const password = 'TestPass123!';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(hash, password);
    
    expect(isValid).toBe(true);
  });

  test('should reject incorrect password', async () => {
    const password = 'TestPass123!';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(hash, 'WrongPass123!');
    
    expect(isValid).toBe(false);
  });

  test('should validate strong password', () => {
    const result = validatePassword('SecurePass123!');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject weak password', () => {
    const result = validatePassword('weak');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```javascript
// __tests__/integration/auth.test.js
const request = require('supertest');
const app = require('../app');

describe('Auth API Integration', () => {
  test('POST /api/auth/register - should create new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'TestPass123!',
        name: 'Test User'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.userId).toBeDefined();
  });

  test('POST /api/auth/login - should login with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPass123!'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  test('GET /api/auth/me - should require authentication', async () => {
    const response = await request(app)
      .get('/api/auth/me');
    
    expect(response.status).toBe(401);
  });
});
```

### E2E Tests (Playwright)

```javascript
// e2e/auth.spec.js
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('complete registration and login flow', async ({ page }) => {
    // Go to registration page
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'TestPass123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('text=Registration successful')).toBeVisible();
    
    // Go to login
    await page.goto('/login');
    
    // Fill login form
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'TestPass123!');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
});
```

---

## 🚀 Deployment Guide

### Environment Variables

```bash
# .env.production
NODE_ENV=production

# Server
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/auth_db
DB_POOL_MAX=20

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Security
SESSION_SECRET=your-super-secret-session-key-min-32-chars
CSRF_SECRET=your-csrf-secret
JWT_SECRET=your-jwt-secret-if-using-jwt

# Cookies
COOKIE_DOMAIN=.yourdomain.com
COOKIE_SECURE=true

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com

# Frontend
FRONTEND_URL=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Docker Setup

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: auth_db
      POSTGRES_USER: auth_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### NGINX Configuration

```nginx
# nginx.conf
upstream backend {
    server app:3000;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=20r/s;

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API routes
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Auth routes with stricter limits
    location /api/auth/ {
        limit_req zone=auth burst=3 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📊 Monitoring & Logging

### Winston Logger Setup

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'auth-service' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
```

### Audit Logging

```javascript
// middleware/auditLog.js
const logger = require('../utils/logger');

async function logAuditEvent(userId, eventType, metadata, req) {
  const auditEntry = {
    user_id: userId,
    event_type: eventType,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
    metadata: metadata
  };

  await db.query(`
    INSERT INTO audit_logs (user_id, event_type, ip_address, user_agent, metadata)
    VALUES ($1, $2, $3, $4, $5)
  `, [
    auditEntry.user_id,
    auditEntry.event_type,
    auditEntry.ip_address,
    auditEntry.user_agent,
    JSON.stringify(auditEntry.metadata)
  ]);

  logger.info('Audit event', auditEntry);
}

// Usage in routes
app.post('/api/auth/login', async (req, res) => {
  // ... login logic ...
  
  await logAuditEvent(user.id, 'LOGIN_SUCCESS', {
    method: 'password'
  }, req);
});
```

---

## ✅ Checklist Before Launch

### Security
- [ ] HTTPS enforced (no HTTP traffic)
- [ ] All cookies are HttpOnly, Secure, SameSite
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Security headers set (CSP, HSTS, etc.)
- [ ] Passwords hashed with Argon2id
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] Secrets stored in environment variables
- [ ] Session timeout configured
- [ ] Account lockout after failed attempts

### Functionality
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Email verification works
- [ ] Password reset works
- [ ] Session persistence works
- [ ] Profile updates work
- [ ] Session management works

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Load testing completed
- [ ] Security testing completed

### Infrastructure
- [ ] Database backups configured
- [ ] Redis persistence enabled
- [ ] Logs rotation configured
- [ ] Monitoring/alerts set up
- [ ] SSL certificates valid
- [ ] Domain DNS configured
- [ ] Email service configured and tested

### Documentation
- [ ] API documentation complete
- [ ] Environment variables documented
- [ ] Deployment guide written
- [ ] Runbook for incidents
- [ ] User documentation

---

## 📈 Performance Targets

- Login latency: < 200ms (p95)
- Registration latency: < 300ms (p95)
- Session check: < 50ms (p95)
- Support: 100 concurrent users minimum
- Database connections: 10-20 pool size
- Rate limits: 5 req/15min for auth endpoints

---

## 🔄 Maintenance Tasks

### Daily
- Monitor error logs
- Check failed login attempts
- Review suspicious activity

### Weekly
- Database cleanup (expired tokens)
- Session cleanup
- Review audit logs

### Monthly
- Update dependencies
- Security patches
- Review and rotate secrets
- Database backup testing
- Performance review

---

## 📚 Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Argon2 Password Hashing](https://github.com/P-H-C/phc-winner-argon2)

---

## 🎯 Success Metrics

After 1 month:
- 99% uptime
- Zero security incidents
- < 1% failed registration rate
- < 5% password reset rate
- Average login time < 200ms

---

Model 1 is designed to get you to market fast with strong fundamentals. Ship it, learn from users, then decide if you need Model 2's advanced features.
