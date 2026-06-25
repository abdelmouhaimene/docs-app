# Environment Setup Guide

## Overview

This project uses environment variables to configure different deployment scenarios:
- **Local Development**: Run Node.js directly with npm
- **Docker Development**: Run with Docker Compose for development
- **Staging**: Test deployment with Docker Compose
- **Production**: Production deployment with Docker Compose

---

## File Structure & Purpose

```
MCA-DOCS/
├── .env                     ← Local dev (Docker) - USE FOR: npm run docker:dev
├── .env.example             ← Template for local dev
├── .env.production          ← Template for production
├── .env.staging             ← Template for staging
│
├── apps/api/
│   ├── .env                 ← Local dev (npm) - USE FOR: npm run api:dev
│   └── .env.example         ← Template for local dev
│
└── apps/client/
    ├── .env.local           ← Local dev (npm) - USE FOR: npm run client:dev
    └── .env.example         ← Template for local dev
```

---

## When to Use Each File

### 🖥️ **LOCAL DEVELOPMENT - Running Locally (npm run)**

**Scenario**: Developing locally on your machine without Docker

**Setup**:
```bash
# Backend: apps/api/.env (already exists)
# Frontend: apps/client/.env.local (already exists)
```

**Commands**:
```bash
npm run api:dev      # Uses apps/api/.env
npm run client:dev   # Uses apps/client/.env.local
npm run dev          # Runs both (concurrently)
```

**Values**: Can be simple (localhost, development credentials)
```env
# apps/api/.env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/mca_docs_dev
JWT_SECRET=dev-secret-key-change-in-production
CORS_ORIGIN=http://localhost:3000

# apps/client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

### 🐳 **DOCKER DEVELOPMENT - Using Docker (npm run docker:dev)**

**Scenario**: Developing with Docker Compose on your machine

**Setup**:
```bash
# Root: .env (copy from .env.example)
cp .env.example .env
```

**Commands**:
```bash
npm run docker:dev         # Start all services
npm run docker:dev:build   # Rebuild and start
npm run docker:dev:down    # Stop all services
```

**Values**: Development credentials are fine
```env
# .env (root)
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=admin123
MONGO_DATABASE=mca_docs_dev
API_PORT=3001
CLIENT_PORT=3000
```

**Docker Compose file**: `docker-compose.dev.yml` (has hardcoded values, doesn't read .env)

---

### 🌐 **STAGING - Testing Before Production**

**Scenario**: Test full deployment on a staging server

**Setup on Staging Server**:
```bash
# Copy staging template
cp .env.staging .env

# Edit with YOUR staging values
nano .env
```

**Commands**:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

**Values**: Use staging credentials (different from production)
```env
MONGO_ROOT_USERNAME=staging_admin
MONGO_ROOT_PASSWORD=your_staging_password
MONGO_DATABASE=mca_docs_staging
JWT_SECRET=your_staging_jwt_secret
NEXT_PUBLIC_API_URL=http://staging-server-ip:4001/api/v1
```

**Docker Compose file**: `docker-compose.prod.yml` (reads from .env)

---

### 🔒 **PRODUCTION - Live Deployment**

**Scenario**: Deploy to production server

**Setup on Production Server**:
```bash
# Copy production template
cp .env.production .env

# Edit with YOUR production values
nano .env
```

**Commands**:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

**Values**: MUST be secure and production-ready
```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=YOUR_STRONG_SECURE_PASSWORD_32_CHARS
MONGO_DATABASE=mca_docs_prod
JWT_SECRET=YOUR_RANDOM_JWT_SECRET_32_CHARS_MIN
NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1  # HTTPS!
```

**Docker Compose file**: `docker-compose.prod.yml` (reads from .env)

---

## Step-by-Step Setup

### For Local Development (npm)

Already set up! Just use existing files:
```bash
# Backend and frontend will work with existing .env files
npm run dev
```

### For Docker Development

```bash
# 1. Copy development template
cp .env.example .env

# 2. Start Docker services
npm run docker:dev

# 3. Access services
# Frontend: http://localhost:3000
# API: http://localhost:3001/api/v1
# Mongo Express: http://localhost:8081
```

### For Production on Linux Server

```bash
# 1. Transfer project to server
scp -r MCA-DOCS/ user@server:/home/user/

# 2. SSH into server
ssh user@server
cd /home/user/MCA-DOCS

# 3. Copy production template
cp .env.production .env

# 4. Edit with production values
nano .env

# 5. Generate secure passwords
openssl rand -base64 32    # For MONGO_ROOT_PASSWORD
openssl rand -base64 32    # For JWT_SECRET

# 6. Update these three values:
#    MONGO_ROOT_PASSWORD=<generated-password>
#    JWT_SECRET=<generated-secret>
#    NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:4001/api/v1

# 7. Build and deploy
docker-compose -f docker-compose.prod.yml up -d --build

# 8. Verify
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs
```

---

## Environment Variables Reference

### Root .env (Docker deployment)

Used by: `docker-compose.prod.yml` and `docker-compose.dev.yml`

| Variable | Default | Purpose | Must Change |
|----------|---------|---------|------------|
| `MONGO_ROOT_USERNAME` | `admin` | MongoDB root user | No* |
| `MONGO_ROOT_PASSWORD` | Varies | MongoDB password | **YES (Prod)** |
| `MONGO_DATABASE` | `mca_docs_*` | Database name | No |
| `MONGO_PORT` | `27017` | MongoDB port | No |
| `API_PORT` | `4001` (prod) / `3001` (dev) | API service port | No |
| `CLIENT_PORT` | `4000` (prod) / `3000` (dev) | Frontend service port | No |
| `JWT_SECRET` | Varies | Auth token secret | **YES (Prod)** |
| `JWT_EXPIRATION` | `7d` | Token expiration | No |
| `CORS_ORIGIN` | `*` | Allowed origins | No* |
| `NEXT_PUBLIC_API_URL` | Varies | Frontend API URL | **YES** |
| `MAX_FILE_SIZE` | `10485760` | Max upload size | No |
| `UPLOAD_PATH` | `/app/documents` | Upload directory | No |

### apps/api/.env (Local npm development)

Used by: `npm run api:dev`

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | Application mode (development/production) |
| `PORT` | API server port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Auth token secret |
| `CORS_ORIGIN` | Allowed origins |
| `UPLOAD_PATH` | File upload directory |
| `MAX_FILE_SIZE` | Max file size in bytes |
| `API_PREFIX` | API endpoint prefix |

### apps/client/.env.local (Local npm development)

Used by: `npm run client:dev`

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Public API endpoint |

---

## Security Best Practices

### 1. Never Commit .env Files
```bash
# Verify .gitignore includes these
cat .gitignore

# Should contain:
# .env
# .env.local
# .env.*.local
```

### 2. Generate Strong Passwords
```bash
# For MONGO_ROOT_PASSWORD
openssl rand -base64 32

# For JWT_SECRET
openssl rand -base64 32

# Output example:
# wQ2m8j3K9pL0xZ1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2w
```

### 3. File Permissions on Linux
```bash
# Restrict access to .env (production server)
chmod 600 .env      # Only owner can read/write
chmod 644 .env.*    # Others can read templates
```

### 4. Different Secrets Per Environment

| Environment | MONGO_ROOT_PASSWORD | JWT_SECRET |
|-------------|-------------------|-----------|
| Development | `admin123` | `dev-secret-key` |
| Staging | `YOUR_STAGING_PASSWORD` | `YOUR_STAGING_JWT` |
| Production | `YOUR_PROD_PASSWORD` | `YOUR_PROD_JWT` |

### 5. Rotate Secrets Periodically
- Change `JWT_SECRET` every 6-12 months
- Change `MONGO_ROOT_PASSWORD` every 3-6 months
- After any security incident, change immediately

---

## Troubleshooting

### Docker Won't Start - Invalid .env Format

```bash
# Check syntax
cat .env | grep "="

# Should be: KEY=VALUE
# Not valid:
# KEY = VALUE  (spaces around =)
# KEY=          (empty value)
# = VALUE       (no key)
```

### API Can't Connect to MongoDB

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check credentials in .env
grep MONGO_ROOT_PASSWORD .env
grep MONGO_DATABASE .env

# View MongoDB logs
docker-compose logs mongodb
```

### Frontend Can't Reach API

```bash
# Check NEXT_PUBLIC_API_URL is correct
grep NEXT_PUBLIC_API_URL .env

# Should be accessible from browser:
# curl http://YOUR_API_URL/health
```

---

## Quick Reference Commands

```bash
# Local development
npm run dev                              # Both backend and frontend
npm run api:dev                          # Backend only
npm run client:dev                       # Frontend only

# Docker development
npm run docker:dev                       # Start
npm run docker:dev:build                 # Build and start
npm run docker:dev:down                  # Stop

# Production (on server)
docker-compose -f docker-compose.prod.yml up -d --build
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml down

# View environment
cat .env
grep MONGO .env
grep JWT .env
```

---

## Summary Table

| Use Case | Files to Setup | Template To Use | Docker Compose |
|----------|---|---|---|
| **Local Dev (npm)** | `apps/api/.env` + `apps/client/.env.local` | Use existing | N/A |
| **Docker Dev** | Root `.env` | `.env.example` | `docker-compose.dev.yml` |
| **Staging** | Root `.env` | `.env.staging` | `docker-compose.prod.yml` |
| **Production** | Root `.env` | `.env.production` | `docker-compose.prod.yml` |

---

## Next Steps

1. ✅ For local development: Already set up (use existing files)
2. ✅ For Docker dev: `cp .env.example .env` then `npm run docker:dev`
3. ⏳ For staging/production: Copy appropriate template when ready to deploy

Questions? Check the specific `.env.*` file in the root directory for detailed comments!
