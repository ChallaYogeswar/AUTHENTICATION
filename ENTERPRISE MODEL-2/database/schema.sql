-- ============================================
-- ENTERPRISE AUTH MODEL 2 - DATABASE SCHEMA
-- ============================================

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
