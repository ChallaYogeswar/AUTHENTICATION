# 🏢 Model 2 - Complete Implementation Plan
## **Production-Ready, Feature-Complete, Enterprise-Grade Auth**

---

## **📋 Executive Summary**

**Timeline:** 6-8 weeks (team of 2-3) | 10-12 weeks (solo)  
**Complexity:** High  
**Best For:** Production SaaS, enterprise apps, high-scale systems  
**User Capacity:** 100,000+ users  
**Enterprise Features:** SSO, RBAC, Audit, Compliance

---

## **🎯 Goals & Philosophy**

- Enterprise-grade security and compliance
- Delightful user experience
- Highly scalable architecture
- Extensible for future needs (SSO, biometrics, etc.)
- Production observability
- Compliance-ready (SOC2, GDPR, HIPAA-ready)

---

## **🏗️ Technical Architecture**

### **System Design (Microservices-Ready)**

```
                    ┌─────────────┐
                    │   Browser   │
                    │  (React)    │
                    └──────┬──────┘
                           │ HTTPS
                           ↓
                    ┌─────────────┐
                    │  CDN/WAF    │ ← Cloudflare/CloudFront
                    └──────┬──────┘
                           │
                           ↓
                    ┌─────────────┐
                    │   API GW    │ ← Kong/NGINX
                    │  + Auth     │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ↓                  ↓                  ↓
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Auth Service │   │ User Service │   │ RBAC Service │
│  (NestJS)    │   │  (NestJS)    │   │  (NestJS)    │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ↓                 ↓                 ↓
┌────────────┐    ┌────────────┐    ┌────────────┐
│ PostgreSQL │    │   Redis    │    │   Vault    │
│  (Primary) │    │  (Cache)   │    │ (Secrets)  │
└────────────┘    └────────────┘    └────────────┘
        │
        ↓
┌────────────┐
│ PostgreSQL │
│ (Replica)  │
└────────────┘
```

---

## **🛠️ Tech Stack (Production-Grade)**

### **Backend - NestJS (TypeScript)**

**Why NestJS:**
- Strong typing with TypeScript
- Dependency injection
- Modular architecture
- Built-in validation
- Testing utilities
- Swagger integration
- Microservices-ready

```json
{
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/typeorm": "^10.0.1",
    "@nestjs/throttler": "^5.1.1",
    "@nestjs/swagger": "^7.1.17",
    
    "typeorm": "^0.3.19",
    "pg": "^8.11.3",
    "redis": "^4.6.12",
    "ioredis": "^5.3.2",
    
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-github2": "^0.1.12",
    
    "argon2": "^0.31.2",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    
    "@simplewebauthn/server": "^9.0.0",
    "speakeasy": "^2.0.0",
    "qrcode": "^1.5.3",
    
    "@sendgrid/mail": "^8.1.0",
    "twilio": "^4.20.0",
    
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "csurf": "^1.11.0",
    
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1",
    "@sentry/node": "^7.99.0",
    
    "uuid": "^9.0.1",
    "dayjs": "^1.11.10"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.3.0",
    "@types/node": "^20.11.5",
    "@types/passport-jwt": "^4.0.0",
    "@types/passport-local": "^1.0.38",
    "typescript": "^5.3.3",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.4"
  }
}
```

### **Frontend - Next.js + TypeScript**

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    
    "@tanstack/react-query": "^5.17.19",
    "axios": "^1.6.5",
    "zustand": "^4.5.0",
    
    "react-hook-form": "^7.49.3",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",
    
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    
    "tailwindcss": "^3.4.1",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    
    "@simplewebauthn/browser": "^9.0.0",
    "qrcode.react": "^3.1.0",
    
    "lucide-react": "^0.312.0",
    "date-fns": "^3.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/node": "^20.11.5",
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "prettier": "^3.2.4"
  }
}
```

### **Database - PostgreSQL 15+ with Extensions**

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gin";  -- Better indexing

-- Configure connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
```

### **Cache & Queue - Redis 7+ (Cluster Mode)**

```bash
# Redis Cluster Configuration
redis-cli --cluster create \
  127.0.0.1:7000 127.0.0.1:7001 \
  127.0.0.1:7002 127.0.0.1:7003 \
  127.0.0.1:7004 127.0.0.1:7005 \
  --cluster-replicas 1
```

```javascript
// Redis connection with clustering
import { Cluster } from 'ioredis';

const redis = new Cluster([
  { port: 7000, host: '127.0.0.1' },
  { port: 7001, host: '127.0.0.1' },
  { port: 7002, host: '127.0.0.1' },
], {
  redisOptions: {
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined
  }
});
```

### **Identity Provider Options**

**Option 1: Self-Hosted (Keycloak)**
- Full control
- Open source
- SAML + OIDC support
- User federation

**Option 2: Managed (Auth0/Okta)**
- Less maintenance
- Proven reliability
- Built-in compliance
- Higher cost

**Option 3: Custom OAuth2/OIDC Server**
- Using `node-oidc-provider`
- Full customization
- More development effort

**Recommendation for Model 2:** Start with custom OAuth2/OIDC, integrate Keycloak later for enterprise SSO

### **Secrets Management**

**HashiCorp Vault**

```bash
# Vault setup
vault server -dev

# Enable KV secrets engine
vault secrets enable -version=2 kv

# Store secrets
vault kv put kv/auth/production \
  jwt_secret=xxx \
  db_password=xxx \
  redis_password=xxx
```

### **Message Queue - BullMQ (Redis-based)**

```typescript
// For async tasks like emails, webhooks
import { Queue, Worker } from 'bullmq';

const emailQueue = new Queue('email', {
  connection: redisConnection
});

const emailWorker = new Worker('email', async (job) => {
  await sendEmail(job.data);
}, { connection: redisConnection });
```

---

## **🗄️ Database Schema (Extended)**

```sql
-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  name VARCHAR(255) NOT NULL,
  preferred_username VARCHAR(100) UNIQUE,
  password_hash TEXT,  -- Nullable for OAuth-only users
  phone_number VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  locale VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  
  -- Security
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  backup_codes_generated BOOLEAN DEFAULT FALSE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  
  -- Tracking
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  last_password_change_at TIMESTAMP,
  
  -- Soft delete
  deleted_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_username ON users(LOWER(preferred_username));
CREATE INDEX idx_users_active ON users(is_active, deleted_at);
CREATE INDEX idx_users_metadata ON users USING GIN(metadata);

-- ============================================
-- ROLES & PERMISSIONS (RBAC)
-- ============================================

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  is_system BOOLEAN DEFAULT FALSE,  -- Prevent deletion of system roles
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_roles_name ON roles(name);

-- User role assignments
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,  -- Optional time-limited roles
  
  UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_expiry ON user_roles(expires_at) WHERE expires_at IS NOT NULL;

-- Permissions cache for fast lookups
CREATE MATERIALIZED VIEW user_permissions AS
SELECT 
  ur.user_id,
  array_agg(DISTINCT p.permission) as permissions
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
CROSS JOIN LATERAL jsonb_array_elements_text(r.permissions) p(permission)
WHERE (ur.expires_at IS NULL OR ur.expires_at > NOW())
GROUP BY ur.user_id;

CREATE UNIQUE INDEX idx_user_permissions ON user_permissions(user_id);

-- ============================================
-- OAUTH & SOCIAL LOGIN
-- ============================================

CREATE TABLE oauth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,  -- google, github, apple, etc.
  provider_user_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255),
  access_token_hash TEXT,
  refresh_token_hash TEXT,
  token_expires_at TIMESTAMP,
  scopes TEXT[],
  profile_data JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  
  UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_oauth_user ON oauth_providers(user_id);
CREATE INDEX idx_oauth_provider ON oauth_providers(provider, provider_user_id);

-- ============================================
-- MULTI-FACTOR AUTHENTICATION
-- ============================================

CREATE TABLE mfa_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,  -- totp, sms, webauthn, backup_codes
  name VARCHAR(100),  -- User-friendly name like "iPhone"
  secret TEXT,  -- Encrypted TOTP secret or credential data
  enabled BOOLEAN DEFAULT TRUE,
  verified BOOLEAN DEFAULT FALSE,
  
  -- WebAuthn specific
  credential_id TEXT UNIQUE,
  public_key TEXT,
  counter INTEGER DEFAULT 0,
  transports TEXT[],
  
  -- Usage tracking
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  
  -- Prevent multiple of same type
  UNIQUE(user_id, type, credential_id)
);

CREATE INDEX idx_mfa_user ON mfa_methods(user_id);
CREATE INDEX idx_mfa_credential ON mfa_methods(credential_id) WHERE credential_id IS NOT NULL;

-- Backup codes
CREATE TABLE mfa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_backup_codes_user ON mfa_backup_codes(user_id);

-- ============================================
-- SESSIONS & TOKENS
-- ============================================

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Token info
  access_token_hash TEXT,
  refresh_token_hash TEXT NOT NULL,
  
  -- Device info
  device_id VARCHAR(255),
  device_name VARCHAR(255),
  device_type VARCHAR(50),  -- mobile, desktop, tablet
  user_agent TEXT,
  ip_address VARCHAR(45),
  location JSONB,  -- { city, country, coords }
  
  -- Security
  trusted_device BOOLEAN DEFAULT FALSE,
  
  -- Timing
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  
  -- Control
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,
  revoke_reason VARCHAR(100)
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token_hash);
CREATE INDEX idx_sessions_device ON sessions(device_id);
CREATE INDEX idx_sessions_active ON sessions(user_id, expires_at, revoked) 
  WHERE revoked = FALSE;
CREATE INDEX idx_sessions_expiry ON sessions(expires_at);

-- ============================================
-- PASSWORD MANAGEMENT
-- ============================================

CREATE TABLE password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  ip_address VARCHAR(45)
);

CREATE INDEX idx_password_resets_token ON password_resets(token_hash);
CREATE INDEX idx_password_resets_expiry ON password_resets(expires_at);

-- Password history (prevent reuse)
CREATE TABLE password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_password_history_user ON password_history(user_id, created_at DESC);

-- ============================================
-- EMAIL VERIFICATION
-- ============================================

CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,  -- New email being verified
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP
);

CREATE INDEX idx_email_verifications_token ON email_verifications(token_hash);

-- ============================================
-- MAGIC LINKS (PASSWORDLESS)
-- ============================================

CREATE TABLE magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  ip_address VARCHAR(45)
);

CREATE INDEX idx_magic_links_token ON magic_links(token_hash);
CREATE INDEX idx_magic_links_expiry ON magic_links(expires_at);

-- ============================================
-- OTP (SMS/Email)
-- ============================================

CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  identifier VARCHAR(255) NOT NULL,  -- Email or phone
  code_hash TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,  -- sms, email, voice
  purpose VARCHAR(50) NOT NULL,  -- login, verify, reset
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP
);

CREATE INDEX idx_otp_identifier ON otp_codes(identifier, expires_at);
CREATE INDEX idx_otp_expiry ON otp_codes(expires_at);

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_type VARCHAR(50) DEFAULT 'user',  -- user, system, admin, service
  
  -- What
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(50),  -- auth, security, admin, data
  action VARCHAR(50) NOT NULL,  -- create, read, update, delete
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  
  -- Details
  status VARCHAR(20),  -- success, failure, pending
  severity VARCHAR(20),  -- info, warning, error, critical
  message TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Context
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id UUID,
  request_id VARCHAR(100),
  
  -- When
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Retention
  expires_at TIMESTAMP  -- For auto-cleanup
);

CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_event ON audit_logs(event_type, created_at DESC);
CREATE INDEX idx_audit_category ON audit_logs(event_category, created_at DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_metadata ON audit_logs USING GIN(metadata);
CREATE INDEX idx_audit_expiry ON audit_logs(expires_at) WHERE expires_at IS NOT NULL;

-- Partition audit logs by month for better performance
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- ============================================
-- SECURITY EVENTS
-- ============================================

CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  event_type VARCHAR(100) NOT NULL,  -- suspicious_login, brute_force, etc.
  risk_level VARCHAR(20),  -- low, medium, high, critical
  
  -- Detection details
  triggers JSONB,  -- What triggered the alert
  indicators JSONB,  -- Risk indicators
  
  -- Context
  ip_address VARCHAR(45),
  location JSONB,
  device_fingerprint TEXT,
  
  -- Response
  action_taken VARCHAR(50),  -- blocked, challenged, logged, alerted
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_security_events_user ON security_events(user_id, created_at DESC);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_risk ON security_events(risk_level);
CREATE INDEX idx_security_events_unresolved ON security_events(resolved, created_at) 
  WHERE resolved = FALSE;

-- ============================================
-- DEVICE FINGERPRINTS & TRUST
-- ============================================

CREATE TABLE trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  device_fingerprint TEXT,
  
  device_name VARCHAR(255),
  device_type VARCHAR(50),
  user_agent TEXT,
  
  first_seen_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  trust_expires_at TIMESTAMP,
  
  trusted BOOLEAN DEFAULT TRUE,
  
  UNIQUE(user_id, device_id)
);

CREATE INDEX idx_trusted_devices_user ON trusted_devices(user_id);
CREATE INDEX idx_trusted_devices_device ON trusted_devices(device_id);

-- ============================================
-- WEBHOOKS & INTEGRATIONS
-- ============================================

CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  url TEXT NOT NULL,
  secret TEXT NOT NULL,  -- For signature verification
  events TEXT[] NOT NULL,  -- Array of event types to subscribe to
  
  active BOOLEAN DEFAULT TRUE,
  
  -- Delivery tracking
  last_triggered_at TIMESTAMP,
  last_success_at TIMESTAMP,
  last_failure_at TIMESTAMP,
  failure_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhooks_user ON webhooks(user_id);
CREATE INDEX idx_webhooks_active ON webhooks(active);

-- Webhook delivery logs
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  
  status VARCHAR(20),  -- pending, success, failure
  response_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP
);

CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id, created_at DESC);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status, next_retry_at);

-- ============================================
-- CONSENT & PRIVACY (GDPR/CCPA)
-- ============================================

CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  consent_type VARCHAR(50) NOT NULL,  -- privacy_policy, terms, marketing, etc.
  version VARCHAR(20) NOT NULL,
  
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMP,
  revoked_at TIMESTAMP,
  
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_consents_user ON user_consents(user_id, consent_type);

-- Data deletion requests
CREATE TABLE data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  status VARCHAR(20) DEFAULT 'pending',  -- pending, processing, completed, failed
  requested_at TIMESTAMP DEFAULT NOW(),
  scheduled_for TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- What to delete
  scope JSONB,  -- { data_types: [], include_backups: true }
  
  -- Verification
  verification_token TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP
);

CREATE INDEX idx_deletion_requests_status ON data_deletion_requests(status, scheduled_for);

-- ============================================
-- RATE LIMITING (Alternative to Redis)
-- ============================================

CREATE TABLE rate_limits (
  id VARCHAR(255) PRIMARY KEY,  -- Composite: "ip:endpoint" or "user:action"
  attempts INTEGER DEFAULT 0,
  reset_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_reset ON rate_limits(reset_at);

-- ============================================
-- FEATURE FLAGS
-- ============================================

CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  
  -- Rollout strategy
  rollout_percentage INTEGER DEFAULT 0,  -- 0-100
  user_whitelist UUID[],
  user_blacklist UUID[],
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- API KEYS (for API access)
-- ============================================

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,  -- First chars for identification
  key_hash TEXT NOT NULL,
  
  scopes TEXT[],
  
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Clean expired tokens/sessions
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW() AND revoked = FALSE;
  DELETE FROM password_resets WHERE expires_at < NOW() AND used = FALSE;
  DELETE FROM magic_links WHERE expires_at < NOW() AND used = FALSE;
  DELETE FROM otp_codes WHERE expires_at < NOW() AND used = FALSE;
  DELETE FROM email_verifications WHERE expires_at < NOW() AND verified = FALSE;
  DELETE FROM audit_logs WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (use pg_cron extension)
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('cleanup-tokens', '0 2 * * *', 'SELECT cleanup_expired_tokens()');

-- ============================================
-- INITIAL DATA
-- ============================================

-- Default roles
INSERT INTO roles (name, description, permissions, is_system) VALUES
('admin', 'Full system access', '["*"]', true),
('user', 'Standard user access', '["read:own", "write:own"]', true),
('moderator', 'Content moderation access', '["read:all", "write:content", "delete:content"]', true);
```

---

## **🔐 Advanced Security Implementation**

### **OAuth2/OIDC Server**

```typescript
// auth/oauth2.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

@Injectable()
export class OAuth2Service {
  constructor(private jwtService: JwtService) {}

  // Authorization Code Flow
  async generateAuthorizationCode(userId: string, clientId: string, scope: string[]): Promise<string> {
    const code = randomBytes(32).toString('base64url');
    
    // Store in Redis with 10-minute expiry
    await redis.setex(
      `auth_code:${code}`,
      600,
      JSON.stringify({ userId, clientId, scope, createdAt: Date.now() })
    );
    
    return code;
  }

  // Exchange code for tokens
  async exchangeCodeForTokens(code: string, clientId: string) {
    const data = await redis.get(`auth_code:${code}`);
    if (!data) throw new UnauthorizedException('Invalid or expired code');
    
    const authData = JSON.parse(data);
    if (authData.clientId !== clientId) {
      throw new UnauthorizedException('Client mismatch');
    }
    
    // Delete code (one-time use)
    await redis.del(`auth_code:${code}`);
    
    const accessToken = await this.generateAccessToken(authData.userId, authData.scope);
    const refreshToken = await this.generateRefreshToken(authData.userId);
    const idToken = await this.generateIdToken(authData.userId);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      id_token: idToken,
      token_type: 'Bearer',
      expires_in: 900  // 15 minutes
    };
  }

  // Generate JWT Access Token
  private async generateAccessToken(userId: string, scopes: string[]) {
    const user = await this.userRepo.findOne(userId);
    
    return this.jwtService.sign({
      sub: userId,
      email: user.email,
      scope: scopes.join(' '),
      type: 'access'
    }, {
      expiresIn: '15m'
    });
  }

  // Generate Refresh Token
  private async generateRefreshToken(userId: string) {
    const token = randomBytes(64).toString('base64url');
    const hash = await argon2.hash(token);
    
    // Store in database
    await this.sessionRepo.create({
      userId,
      refreshTokenHash: hash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // 7 days
    });
    
    return token;
  }

  // Generate ID Token (OIDC)
  private async generateIdToken(userId: string) {
    const user = await this.userRepo.findOne(userId);
    
    return this.jwtService.sign({
      sub: userId,
      email: user.email,
      email_verified: user.emailVerified,
      name: user.name,
      preferred_username: user.preferredUsername,
      picture: user.avatarUrl,
      iat: Math.floor(Date.now() / 1000),
      type: 'id'
    }, {
      expiresIn: '1h'
    });
  }

  // Token Refresh
  async refreshAccessToken(refreshToken: string) {
    const hash = await argon2.hash(refreshToken);
    const session = await this.sessionRepo.findByRefreshToken(hash);
    
    if (!session || session.revoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    // Refresh token rotation
    const newRefreshToken = await this.generateRefreshToken(session.userId);
    const newAccessToken = await this.generateAccessToken(session.userId, ['read', 'write']);
    
    // Revoke old refresh token
    await this.sessionRepo.update(session.id, { revoked: true });
    
    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      token_type: 'Bearer',
      expires_in: 900
    };
  }
}
```

### **WebAuthn/Passkeys Implementation**

```typescript
// auth/webauthn.service.ts
import { Injectable } from '@nestjs/common';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server';

@Injectable()
export class WebAuthnService {
  private rpName = 'YourApp';
  private rpID = 'yourdomain.com';
  private origin = 'https://yourdomain.com';

  // Registration - Step 1: Generate options
  async generateRegistrationOptions(userId: string) {
    const user = await this.userRepo.findOne(userId);
    
    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpID,
      userID: userId,
      userName: user.email,
      userDisplayName: user.name,
      
      // Attestation
      attestationType: 'none',
      
      // Exclude already registered authenticators
      excludeCredentials: await this.getUserCredentials(userId),
      
      // Authenticator selection
      authenticatorSelection: {
        residentKey: 'preferred',  // Enable passkeys
        userVerification: 'preferred',
        authenticatorAttachment: 'platform'  // Platform authenticator (biometric)
      }
    });
    
    // Store challenge in session
    await redis.setex(
      `webauthn_challenge:${userId}`,
      300,  // 5 minutes
      options.challenge
    );
    
    return options;
  }

  // Registration - Step 2: Verify response
  async verifyRegistrationResponse(userId: string, response: any) {
    const expectedChallenge = await redis.get(`webauthn_challenge:${userId}`);
    if (!expectedChallenge) {
      throw new BadRequestException('Challenge expired');
    }
    
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID
    });
    
    if (!verification.verified) {
      throw new BadRequestException('Verification failed');
    }
    
    // Store credential
    const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;
    
    await this.mfaRepo.create({
      userId,
      type: 'webauthn',
      credentialId: Buffer.from(credentialID).toString('base64'),
      publicKey: Buffer.from(credentialPublicKey).toString('base64'),
      counter,
      enabled: true,
      verified: true
    });
    
    await redis.del(`webauthn_challenge:${userId}`);
    
    return { success: true };
  }

  // Authentication - Step 1: Generate options
  async generateAuthenticationOptions(userId?: string) {
    const options = await generateAuthenticationOptions({
      rpID: this.rpID,
      userVerification: 'preferred',
      
      // If userId provided, only allow their credentials
      allowCredentials: userId ? await this.getUserCredentials(userId) : undefined
    });
    
    // Store challenge
    const key = userId ? `webauthn_auth:${userId}` : `webauthn_auth:${options.challenge}`;
    await redis.setex(key, 300, options.challenge);
    
    return options;
  }

  // Authentication - Step 2: Verify response
  async verifyAuthenticationResponse(response: any) {
    const credentialId = response.id;
    
    // Find credential
    const credential = await this.mfaRepo.findByCredentialId(credentialId);
    if (!credential) {
      throw new UnauthorizedException('Unknown credential');
    }
    
    const expectedChallenge = await redis.get(`webauthn_auth:${credential.userId}`);
    if (!expectedChallenge) {
      throw new BadRequestException('Challenge expired');
    }
    
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      authenticator: {
        credentialID: Buffer.from(credential.credentialId, 'base64'),
        credentialPublicKey: Buffer.from(credential.publicKey, 'base64'),
        counter: credential.counter
      }
    });
    
    if (!verification.verified) {
      throw new UnauthorizedException('Authentication failed');
    }
    
    // Update counter
    await this.mfaRepo.update(credential.id, {
      counter: verification.authenticationInfo.newCounter,
      lastUsedAt: new Date()
    });
    
    await redis.del(`webauthn_auth:${credential.userId}`);
    
    return {
      verified: true,
      userId: credential.userId
    };
  }

  private async getUserCredentials(userId: string) {
    const credentials = await this.mfaRepo.find({
      where: { userId, type: 'webauthn', enabled: true }
    });
    
    return credentials.map(c => ({
      id: Buffer.from(c.credentialId, 'base64'),
      type: 'public-key' as const,
      transports: c.transports || []
    }));
  }
}
```

### **TOTP (Authenticator App) Implementation**

```typescript
// auth/totp.service.ts
import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TotpService {
  // Enable TOTP for user
  async setupTotp(userId: string) {
    const user = await this.userRepo.findOne(userId);
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `YourApp (${user.email})`,
      issuer: 'YourApp'
    });
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    // Temporarily store secret (not enabled yet)
    await redis.setex(
      `totp_setup:${userId}`,
      600,  // 10 minutes to complete setup
      secret.base32
    );
    
    return {
      secret: secret.base32,  // Manual entry backup
      qrCode: qrCodeUrl
    };
  }

  // Verify and enable TOTP
  async verifyAndEnableTotp(userId: string, token: string) {
    const secret = await redis.get(`totp_setup:${userId}`);
    if (!secret) {
      throw new BadRequestException('Setup expired, please restart');
    }
    
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2  // Allow 2 time steps tolerance
    });
    
    if (!verified) {
      throw new BadRequestException('Invalid code');
    }
    
    // Save to database (encrypted)
    const encryptedSecret = await this.encryptSecret(secret);
    
    await this.mfaRepo.create({
      userId,
      type: 'totp',
      secret: encryptedSecret,
      enabled: true,
      verified: true
    });
    
    // Generate backup codes
    const backupCodes = await this.generateBackupCodes(userId);
    
    await redis.del(`totp_setup:${userId}`);
    
    return {
      success: true,
      backupCodes  // Show once, user must save
    };
  }

  // Verify TOTP code during login
  async verifyTotp(userId: string, token: string) {
    const mfaMethod = await this.mfaRepo.findOne({
      where: { userId, type: 'totp', enabled: true }
    });
    
    if (!mfaMethod) {
      throw new BadRequestException('TOTP not enabled');
    }
    
    const secret = await this.decryptSecret(mfaMethod.secret);
    
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    });
    
    if (verified) {
      await this.mfaRepo.update(mfaMethod.id, {
        lastUsedAt: new Date()
      });
    }
    
    return verified;
  }

  // Generate backup codes
  private async generateBackupCodes(userId: string) {
    const codes = [];
    
    for (let i = 0; i < 10; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
      
      const hash = await argon2.hash(code);
      
      await this.backupCodesRepo.create({
        userId,
        codeHash: hash
      });
    }
    
    return codes;
  }

  // Verify backup code
  async verifyBackupCode(userId: string, code: string) {
    const backupCodes = await this.backupCodesRepo.find({
      where: { userId, used: false }
    });
    
    for (const bc of backupCodes) {
      if (await argon2.verify(bc.codeHash, code)) {
        await this.backupCodesRepo.update(bc.id, {
          used: true,
          usedAt: new Date()
        });
        return true;
      }
    }
    
    return false;
  }
}
```

### **Risk Engine for Adaptive Security**

```typescript
// security/risk-engine.service.ts
import { Injectable } from '@nestjs/common';

interface RiskFactors {
  newDevice: boolean;
  newLocation: boolean;
  newIp: boolean;
  vpnDetected: boolean;
  impossibleTravel: boolean;
  suspiciousUserAgent: boolean;
  failedAttemptsRecent: number;
}

@Injectable()
export class RiskEngineService {
  async calculateRiskScore(userId: string, context: any): Promise<number> {
    const factors = await this.analyzeRiskFactors(userId, context);
    
    let score = 0;
    
    // Device & location risk
    if (factors.newDevice) score += 30;
    if (factors.newLocation) score += 20;
    if (factors.newIp) score += 15;
    
    // Travel anomalies
    if (factors.impossibleTravel) score += 50;
    
    // Network risk
    if (factors.vpnDetected) score += 10;
    
    // User agent anomalies
    if (factors.suspiciousUserAgent) score += 25;
    
    // Recent failures
    score += Math.min(factors.failedAttemptsRecent * 10, 40);
    
    return Math.min(score, 100);
  }

  async shouldChallengeMfa(riskScore: number, user: any): Promise<boolean> {
    // Always challenge if MFA enabled and high risk
    if (user.twoFactorEnabled && riskScore >= 60) {
      return true;
    }
    
    // Challenge on medium risk if sensitive account
    if (riskScore >= 40 && user.roles.includes('admin')) {
      return true;
    }
    
    return false;
  }

  async shouldBlockLogin(riskScore: number): Promise<boolean> {
    return riskScore >= 80;
  }

  private async analyzeRiskFactors(userId: string, context: any): Promise<RiskFactors> {
    const user = await this.userRepo.findOne(userId);
    const recentSessions = await this.sessionRepo.findRecent(userId, 30);
    
    // Check if device is new
    const knownDevices = await this.trustedDevicesRepo.find({ where: { userId } });
    const newDevice = !knownDevices.some(d => d.deviceId === context.deviceId);
    
    // Check if IP is new
    const knownIps = recentSessions.map(s => s.ipAddress);
    const newIp = !knownIps.includes(context.ip);
    
    // Check location
    const newLocation = await this.isNewLocation(userId, context.location);
    
    // Impossible travel detection
    const impossibleTravel = await this.detectImpossibleTravel(
      userId,
      context.location,
      context.timestamp
    );
    
    // VPN detection
    const vpnDetected = await this.detectVpn(context.ip);
    
    // User agent analysis
    const suspiciousUserAgent = this.analyzeUserAgent(context.userAgent);
    
    // Failed attempts
    const failedAttemptsRecent = await this.getRecentFailedAttempts(userId);
    
    return {
      newDevice,
      newLocation,
      newIp,
      impossibleTravel,
      vpnDetected,
      suspiciousUserAgent,
      failedAttemptsRecent
    };
  }

  private async detectImpossibleTravel(
    userId: string,
    currentLocation: any,
    timestamp: Date
  ): Promise<boolean> {
    const lastSession = await this.sessionRepo.findLastSession(userId);
    
    if (!lastSession || !lastSession.location) {
      return false;
    }
    
    // Calculate distance between locations
    const distance = this.calculateDistance(
      lastSession.location,
      currentLocation
    );
    
    // Calculate time difference
    const timeDiff = (timestamp.getTime() - lastSession.lastActivityAt.getTime()) / 1000 / 60 / 60; // hours
    
    // If traveled more than 500 km in less than 1 hour
    if (distance > 500 && timeDiff < 1) {
      return true;
    }
    
    return false;
  }

  private async detectVpn(ip: string): Promise<boolean> {
    // Use IP intelligence API
    // Example: IPQualityScore, IPHub, etc.
    try {
      const response = await axios.get(
        `https://ipqualityscore.com/api/json/ip/${process.env.IPQS_KEY}/${ip}`
      );
      
      return response.data.vpn || response.data.proxy || response.data.tor;
    } catch {
      return false;
    }
  }
}
```

---

## **🎨 Frontend Architecture (Next.js)**

### **Project Structure**

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── security/
│   │   │   ├── sessions/
│   │   │   ├── mfa/
│   │   │   └── audit/
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   └── layout.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SocialLogin.tsx
│   │   ├── MfaDialog.tsx
│   │   └── PasskeyButton.tsx
│   ├── security/
│   │   ├── SessionList.tsx
│   │   ├── AuditLog.tsx
│   │   └── TotpSetup.tsx
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       └── toast.tsx
├── lib/
│   ├── api/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   └── client.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useMfa.ts
│   │   └── useWebAuthn.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   └── utils/
│       ├── validation.ts
│       └── crypto.ts
├── types/
│   ├── auth.ts
│   └── api.ts
└── middleware.ts
```

### **Authentication Hook with MFA Support**

```typescript
// lib/hooks/useAuth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaRequired: boolean;
  mfaSession: string | null;
  
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyMfa: (code: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      mfaRequired: false,
      mfaSession: null,

      login: async (email, password) => {
        set({ isLoading: true });
        
        try {
          const result = await authApi.login({ email, password });
          
          if (result.mfaRequired) {
            set({ 
              mfaRequired: true,
              mfaSession: result.mfaSession,
              isLoading: false 
            });
            return { success: true, mfaRequired: true };
          }
          
          set({
            user: result.user,
            isAuthenticated: true,
            mfaRequired: false,
            isLoading: false
          });
          
          return { success: true, mfaRequired: false };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      verifyMfa: async (code) => {
        const { mfaSession } = get();
        
        if (!mfaSession) {
          throw new Error('No MFA session');
        }
        
        set({ isLoading: true });
        
        try {
          const result = await authApi.verifyMfa({ 
            session: mfaSession,
            code 
          });
          
          set({
            user: result.user,
            isAuthenticated: true,
            mfaRequired: false,
            mfaSession: null,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        
        try {
          await authApi.register(data);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            mfaRequired: false,
            mfaSession: null
          });
        }
      },

      checkAuth: async () => {
        try {
          const user = await authApi.me();
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      }
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

---

*Due to length constraints, this is Part 1 of Model 2. The complete plan continues with:*

- **Complete API Implementation**
- **SSO/SAML Integration**
- **Advanced RBAC System**
- **Monitoring & Observability**
- **Deployment Architecture**
- **CI/CD Pipeline**
- **Security Hardening Checklist**
- **Compliance Documentation**
- **Load Testing Strategy**
- **Disaster Recovery Plan**

**This document provides the foundation. Model 2 requires 6-8 weeks for full implementation with all enterprise features.**
