# ⚡ Model 1.5 - Complete Implementation Plan
## **Smart Middle Ground - Model 2 Architecture, Model 1 Features**

---

## **📋 Executive Summary**

**Timeline:** 3-4 weeks (1-2 developers)  
**Complexity:** Medium  
**Best For:** Growing startups, serious MVPs, products planning to scale  
**User Capacity:** 50,000+ users  
**Philosophy:** Build the right foundation, ship features incrementally

---

## **🎯 Strategy & Philosophy**

### **The Problem with Traditional Approaches**

**Problem with Model 1:**
- Monolithic code → Hard to add features later
- Simple sessions → Can't easily add OAuth later
- No modularity → Technical debt accumulates

**Problem with jumping to Model 2:**
- 6-8 weeks before launch → Too slow
- Over-engineering → Wasting time on features you might not need
- Complexity overhead → Harder to maintain

### **The Model 1.5 Solution**

**Core Principle:** Use Model 2's architecture, but only build Model 1's features

```
┌─────────────────────────────────────────────┐
│  Model 1.5 = Architecture of Model 2        │
│              + Feature Scope of Model 1     │
│              = Fast to Ship + Easy to Grow  │
└─────────────────────────────────────────────┘
```

**What This Means:**

1. **Use proper architecture** (NestJS, modular services, proper auth flow)
2. **But ship minimal features** (just login, register, sessions)
3. **Easy to add more** (OAuth, MFA, RBAC) when you need them

---

## **🏗️ Technical Architecture**

### **System Design (Simplified but Scalable)**

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ HTTPS
       ↓
┌─────────────┐
│   NGINX     │ ← Reverse proxy + SSL termination
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  NestJS API │ ← Modular monolith (not microservices yet)
│  (Single)   │ ← But designed to split later
└──────┬──────┘
       │
    ┌──┴──┐
    ↓     ↓
┌────────┐ ┌────────┐
│Postgres│ │ Redis  │
└────────┘ └────────┘
```

**Key Differences from Model 1:**
- ✅ Modular code structure (easy to split into microservices)
- ✅ Proper OAuth2/JWT foundation (can add social login anytime)
- ✅ Clean separation of concerns (auth, users, sessions)
- ❌ No microservices yet (keep it simple)
- ❌ No external IdP (self-contained)

---

## **🛠️ Tech Stack**

### **Backend: NestJS + TypeScript**

**Why NestJS over Express?**
- Modular architecture (easy to extend)
- Dependency injection (cleaner code)
- TypeScript first (catch bugs early)
- Built-in validation
- Easy testing

```json
{
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/typeorm": "^10.0.1",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/throttler": "^5.1.1",
    
    "typeorm": "^0.3.19",
    "pg": "^8.11.3",
    "redis": "^4.6.12",
    
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    
    "argon2": "^0.31.2",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    
    "@sendgrid/mail": "^8.1.0",
    
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.3.0",
    "@types/node": "^20.11.5",
    "typescript": "^5.3.3",
    "jest": "^29.7.0"
  }
}
```

### **Frontend: React + Vite (Not Next.js)**

**Why Vite over Next.js?**
- Faster for Model 1.5 scope
- Simpler deployment
- Can migrate to Next.js later if needed

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    
    "axios": "^1.6.5",
    "zustand": "^4.5.0",
    
    "react-hook-form": "^7.49.3",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",
    
    "tailwindcss": "^3.4.1",
    "lucide-react": "^0.312.0"
  }
}
```

### **Database: PostgreSQL 15+**

Same as Model 2, but simplified schema (only what we need now)

### **Cache: Redis 7**

For sessions and rate limiting (single instance, not cluster)

---

## **🗂️ Project Structure (The Secret Sauce)**

### **Backend Structure (NestJS Modules)**

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/                    ← Auth module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   └── reset-password.dto.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── local-auth.guard.ts
│   │   │   └── strategies/
│   │   │       ├── jwt.strategy.ts
│   │   │       └── local.strategy.ts
│   │   │
│   │   ├── users/                   ← User module
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   │       └── update-user.dto.ts
│   │   │
│   │   ├── sessions/                ← Session module
│   │   │   ├── sessions.service.ts
│   │   │   ├── sessions.module.ts
│   │   │   └── entities/
│   │   │       └── session.entity.ts
│   │   │
│   │   ├── mail/                    ← Email module
│   │   │   ├── mail.service.ts
│   │   │   └── mail.module.ts
│   │   │
│   │   └── audit/                   ← Audit logging
│   │       ├── audit.service.ts
│   │       ├── audit.module.ts
│   │       └── entities/
│   │           └── audit-log.entity.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   └── guards/
│   │       └── throttler.guard.ts
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── redis.config.ts
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── test/
├── .env.example
├── nest-cli.json
├── tsconfig.json
└── package.json
```

**Why This Structure Matters:**

```typescript
// ✅ GOOD: Model 1.5 approach (modular)
// Easy to add OAuth module later:
src/modules/oauth/
  ├── oauth.controller.ts
  ├── oauth.service.ts
  ├── oauth.module.ts
  └── strategies/
      ├── google.strategy.ts
      └── github.strategy.ts

// ❌ BAD: Model 1 approach (monolithic)
// Everything in auth.js - hard to extend
src/
  ├── auth.js          ← 2000 lines, all auth logic
  └── database.js      ← All DB queries
```

---

## **🗄️ Database Schema (Minimal but Extensible)**

### **Phase 1: Initial Schema (Ship This First)**

```sql
-- ============================================
-- CORE TABLES (Launch with these)
-- ============================================

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  
  is_active BOOLEAN DEFAULT TRUE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP
);

CREATE INDEX idx_users_email ON users(LOWER(email));

-- Sessions (JWT refresh tokens)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL UNIQUE,
  
  device_name VARCHAR(255),
  user_agent TEXT,
  ip_address VARCHAR(45),
  
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  
  revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(refresh_token_hash);
CREATE INDEX idx_sessions_active ON sessions(user_id, expires_at) 
  WHERE revoked = FALSE;

-- Password Resets
CREATE TABLE password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_password_resets_token ON password_resets(token_hash);

-- Email Verifications
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_email_verifications_token ON email_verifications(token_hash);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_event ON audit_logs(event_type);
```

### **Phase 2: Ready to Add (When Needed)**

```sql
-- ============================================
-- OAUTH (Add when you need social login)
-- ============================================

-- Just run this migration when ready:
CREATE TABLE oauth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  access_token_hash TEXT,
  refresh_token_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(provider, provider_user_id)
);

-- ============================================
-- MFA (Add when you need 2FA)
-- ============================================

CREATE TABLE mfa_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  secret TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- RBAC (Add when you need roles)
-- ============================================

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  permissions JSONB DEFAULT '[]'
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);
```

**The Magic:** You ship with Phase 1, add Phase 2 tables only when needed (1-2 weeks later)

---

## **🔐 Authentication Implementation**

### **JWT Strategy with Refresh Tokens**

```typescript
// modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    // Hash password
    const passwordHash = await argon2.hash(registerDto.password);
    
    // Create user
    const user = await this.usersService.create({
      email: registerDto.email,
      name: registerDto.name,
      passwordHash
    });
    
    // Send verification email
    await this.sendVerificationEmail(user);
    
    return {
      message: 'Registration successful. Please check your email.'
    };
  }

  async login(loginDto: LoginDto, context: LoginContext) {
    // Find user
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Check if locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account locked. Try again later.');
    }
    
    // Verify password
    const valid = await argon2.verify(user.passwordHash, loginDto.password);
    
    if (!valid) {
      // Increment failed attempts
      await this.handleFailedLogin(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Reset failed attempts
    await this.usersService.update(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date()
    });
    
    // Generate tokens
    const tokens = await this.generateTokens(user, context);
    
    // Log audit
    await this.auditService.log({
      userId: user.id,
      eventType: 'LOGIN_SUCCESS',
      ipAddress: context.ip,
      userAgent: context.userAgent
    });
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified
      }
    };
  }

  async generateTokens(user: User, context: LoginContext) {
    // Generate access token (short-lived)
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'access'
      },
      { expiresIn: '15m' }
    );
    
    // Generate refresh token (long-lived)
    const refreshToken = randomBytes(64).toString('base64url');
    const refreshTokenHash = await argon2.hash(refreshToken);
    
    // Store session
    await this.sessionsService.create({
      userId: user.id,
      refreshTokenHash,
      deviceName: this.parseDeviceName(context.userAgent),
      userAgent: context.userAgent,
      ipAddress: context.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    
    return {
      accessToken,
      refreshToken
    };
  }

  async refreshTokens(refreshToken: string) {
    // Hash the token
    const hash = await argon2.hash(refreshToken);
    
    // Find session
    const session = await this.sessionsService.findByToken(hash);
    
    if (!session || session.revoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    // Get user
    const user = await this.usersService.findById(session.userId);
    
    // Generate new tokens
    const newRefreshToken = randomBytes(64).toString('base64url');
    const newRefreshTokenHash = await argon2.hash(newRefreshToken);
    
    // Update session (refresh token rotation)
    await this.sessionsService.update(session.id, {
      refreshTokenHash: newRefreshTokenHash,
      lastActivityAt: new Date()
    });
    
    // Generate new access token
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'access'
      },
      { expiresIn: '15m' }
    );
    
    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  }

  async logout(userId: string, sessionId: string) {
    await this.sessionsService.revoke(sessionId);
    
    await this.auditService.log({
      userId,
      eventType: 'LOGOUT',
    });
  }

  private async handleFailedLogin(userId: string) {
    const user = await this.usersService.findById(userId);
    const attempts = user.failedLoginAttempts + 1;
    
    const updates: any = { failedLoginAttempts: attempts };
    
    // Lock account after 5 failed attempts
    if (attempts >= 5) {
      updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
    
    await this.usersService.update(userId, updates);
    
    await this.auditService.log({
      userId,
      eventType: 'LOGIN_FAILED',
      metadata: { attempts }
    });
  }
}
```

### **JWT Guards**

```typescript
// modules/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is public
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler()
    );
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }
}

// modules/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
      ignoreExpiration: false
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email
    };
  }
}
```

### **Controllers**

```typescript
// modules/auth/auth.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  Req, 
  UseGuards,
  Get,
  HttpCode 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto, @Req() req) {
    const context = {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };
    
    return this.authService.login(loginDto, context);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user, @Body('sessionId') sessionId: string) {
    return this.authService.logout(user.id, sessionId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user) {
    return this.usersService.findById(user.id);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetDto);
  }
}
```

---

## **🎨 Frontend Implementation**

### **API Client with Automatic Token Refresh**

```typescript
// lib/api/client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        // Request new tokens
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken }
        );
        
        // Save new tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### **Auth Store**

```typescript
// lib/stores/authStore.ts
import { create } from 'zustand';
import api from '../api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (registerData) => {
    set({ isLoading: true });
    
    try {
      await api.post('/auth/register', registerData);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.clear();
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  }
}));
```

---

## **📦 Deployment Strategy**

### **Docker Compose (Production-Ready)**

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Backend
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:password@postgres:5432/auth_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: auth_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Cache
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  # Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - frontend_build:/usr/share/nginx/html
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  frontend_build:
```

---

## **✅ Implementation Timeline**

### **Week 1: Foundation**
- [ ] Set up NestJS project structure
- [ ] Database schema + migrations
- [ ] User entity + repository
- [ ] Password hashing utilities
- [ ] Basic auth service (register/login)

### **Week 2: Core Features**
- [ ] JWT strategy + guards
- [ ] Refresh token mechanism
- [ ] Session management
- [ ] Password reset flow
- [ ] Email verification

### **Week 3: Frontend**
- [ ] React project setup
- [ ] Auth store
- [ ] Login/Register forms
- [ ] Protected routes
- [ ] Profile page
- [ ] Session management UI

### **Week 4: Polish & Deploy**
- [ ] Rate limiting
- [ ] Audit logging
- [ ] Error handling
- [ ] Testing
- [ ] Docker setup
- [ ] Deploy to production

---

## **🚀 Future Growth Path**

### **After Launch (Add as Needed)**

**Week 5-6: Social Login**
```typescript
// Just add these files:
src/modules/oauth/
  ├── oauth.module.ts
  ├── oauth.service.ts
  └── strategies/
      ├── google.strategy.ts
      └── github.strategy.ts
```

**Week 7-8: MFA**
```typescript
// Add MFA module:
src/modules/mfa/
  ├── mfa.module.ts
  ├── mfa.service.ts
  └── totp.service.ts
```

**Week 9-10: RBAC**
```typescript
// Add roles module:
src/modules/roles/
  ├── roles.module.ts
  ├── roles.service.ts
  └── guards/
      └── roles.guard.ts
```

---

## **📊 Comparison: Why Model 1.5 Wins**

| Aspect | Model 1 | Model 1.5 | Model 2 |
|--------|---------|-----------|---------|
| Time to Ship | 2 weeks | 3-4 weeks | 6-8 weeks |
| Code Quality | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Easy to Extend | ❌ | ✅ | ✅ |
| Feature Complete | Basic | Basic | Full |
| Over-engineering | No | No | Possible |
| Production Ready | Sort of | Yes | Yes |
| Learning Curve | Easy | Medium | Hard |

**The Sweet Spot:** Model 1.5 gives you 80% of Model 2's benefits at 50% of the time investment

---

## **🎯 When to Choose Model 1.5**

✅ **Choose Model 1.5 if:**
- You need to launch in 3-4 weeks
- You plan to add OAuth/MFA later
- You want clean, maintainable code
- You expect to scale to 10k+ users
- You have 1-2 developers

❌ **Don't choose Model 1.5 if:**
- You need OAuth/SSO from day 1
- You're building an internal tool only
- You need to ship in under 2 weeks
- You have < 1000 expected users

---

**Model 1.5 is the pragmatic choice for serious startups who want to move fast without accumulating technical debt.**
