# 🚀 Enterprise Auth System - Deployment Guide

## **Prerequisites**

### **Required Software**
- **Docker Desktop** (for full containerized deployment)
- **Node.js 18+** (for manual deployment)
- **PostgreSQL 15+** (for manual database)
- **Redis 7+** (for manual cache)

### **System Requirements**
- **RAM:** 4GB minimum, 8GB recommended
- **Disk:** 5GB free space
- **OS:** Windows 10/11, macOS, or Linux

---

## **📋 Deployment Options**

### **Option 1: Docker Deployment (Recommended)**

#### **Prerequisites Check**
```bash
# Verify Docker is running
docker --version
docker-compose --version
```

#### **Full System Deployment**
```bash
# Navigate to project root
cd "ENTERPRISE MODEL-2"

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

#### **Service URLs**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Database:** localhost:5432
- **Redis:** localhost:6379
- **nginx:** http://localhost:80

#### **Stop Services**
```bash
docker-compose down
```

---

### **Option 2: Manual Deployment**

#### **Step 1: Database Setup**
```bash
# Install PostgreSQL locally or use a cloud instance
# Create database
createdb enterprise_auth

# Run schema
psql -d enterprise_auth -f database/schema.sql
```

#### **Step 2: Redis Setup**
```bash
# Install Redis locally or use cloud Redis
redis-server
```

#### **Step 3: Backend Deployment**
```bash
cd backend

# Install dependencies (if not done)
npm install

# Build application
npm run build

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Start production server
npm run start:prod
```

#### **Step 4: Frontend Deployment**
```bash
cd frontend

# Install dependencies (if not done)
npm install

# Build for production
npm run build

# Start production server
npm run start
```

---

## **🔧 Environment Configuration**

### **Required Environment Variables**

#### **Backend (.env)**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=enterprise_auth

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12

# Email (SendGrid)
SENDGRID_API_KEY=SG.your-sendgrid-api-key

# SMS (Twilio)
TWILIO_ACCOUNT_SID=AC.your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Application
NODE_ENV=production
PORT=3001
```

#### **Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Enterprise Auth
```

---

## **🔒 Security Configuration**

### **SSL/TLS Setup**
```bash
# Generate self-signed certificate (development only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Update nginx configuration with SSL
# Edit nginx/nginx.conf
```

### **Production Security**
- Change all default passwords
- Use strong JWT secrets
- Configure proper CORS
- Enable rate limiting
- Set up monitoring and logging

---

## **📊 Monitoring & Health Checks**

### **Health Endpoints**
- **Backend Health:** http://localhost:3001/health
- **Database Health:** Check PostgreSQL connection
- **Redis Health:** Check Redis ping

### **Logs**
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Application logs (manual deployment)
# Backend logs are in console
# Frontend logs in terminal
```

---

## **🔄 Updates & Maintenance**

### **Application Updates**
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### **Database Migrations**
```bash
# Run migrations (if implemented)
npm run migration:run
```

---

## **🚨 Troubleshooting**

### **Common Issues**

#### **Port Conflicts**
```bash
# Check what's using ports
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432
```

#### **Database Connection Issues**
```bash
# Test database connection
psql -h localhost -p 5432 -U postgres -d enterprise_auth
```

#### **Build Failures**
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

#### **Docker Issues**
```bash
# Reset Docker
docker system prune -a
docker-compose down -v
docker-compose up -d --build
```

---

## **📞 Support**

For deployment issues:
1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Ensure all prerequisites are installed
4. Check network connectivity

---

## **✅ Deployment Checklist**

- [ ] Docker Desktop installed and running
- [ ] All environment variables configured
- [ ] Database schema created
- [ ] SSL certificates configured (production)
- [ ] Firewall rules updated
- [ ] Domain configured (production)
- [ ] Monitoring set up
- [ ] Backup strategy implemented

**System is now ready for production deployment! 🎉**
