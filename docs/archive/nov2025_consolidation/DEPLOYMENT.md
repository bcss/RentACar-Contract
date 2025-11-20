# RCCMS Deployment Guide

**Last Updated:** November 17, 2025  
**Deployment Options:** Replit, Docker, VPS  
**Target Audience:** DevOps Engineers, System Administrators

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Replit Deployment (Recommended)](#replit-deployment-recommended)
3. [Docker Deployment](#docker-deployment)
4. [VPS Deployment](#vps-deployment)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Production Checklist](#production-checklist)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Quick Start

**Recommended Path:** Replit (easiest, managed infrastructure)

```bash
# 1. Clone repository
git clone <repo-url>

# 2. Install dependencies
npm install

# 3. Set environment variables
cp .env.example .env
# Edit .env with your values

# 4. Push database schema
npm run db:push

# 5. Start development server
npm run dev
```

---

## Replit Deployment (Recommended)

### Why Replit?

- ✅ **Zero Infrastructure Management** - Fully managed platform
- ✅ **Built-in PostgreSQL** - Neon database included
- ✅ **Auto-scaling** - Handles traffic spikes automatically
- ✅ **Free Tier Available** - Start without cost
- ✅ **One-Click Deployment** - No complex setup
- ✅ **Rollback Support** - Checkpoint-based rollback
- ✅ **HTTPS Included** - Automatic SSL certificates

### Deployment Steps

#### 1. Initial Setup

1. Fork/import repository to Replit
2. Replit auto-detects Node.js and installs dependencies
3. Database is automatically provisioned (Neon)

#### 2. Configure Environment Secrets

Navigate to **Secrets** tab (padlock icon) and add:

```env
# Required Secrets
DATABASE_URL=<auto-populated by Replit>
SESSION_SECRET=<generate: openssl rand -base64 32>
SUPER_ADMIN_PASSWORD=<secure password>

# Optional
SUPER_ADMIN_USERNAME=superadmin  # defaults to 'superadmin'
NODE_ENV=production
```

**Generate SESSION_SECRET:**
```bash
openssl rand -base64 32
```

#### 3. Database Schema Migration

Run in Replit Shell:
```bash
npm run db:push
```

This syncs the Drizzle schema to PostgreSQL.

#### 4. Deploy Application

1. Click **"Deploy"** button in Replit
2. Select **"Autoscale"** deployment type (recommended)
3. Wait for build to complete
4. Application available at: `https://<your-repl>.replit.app`

#### 5. Verify Deployment

1. Visit deployment URL
2. Login with superadmin credentials
3. Check dashboard loads correctly
4. Test contract creation workflow

### Production Secrets (Replit)

**Add via Deployment Settings:**

1. Click **"Deploy"** → **"Set up your published app"**
2. Scroll to **"Deployment secrets"**
3. Add secrets:
   - `SUPER_ADMIN_PASSWORD` (required!)
   - `SESSION_SECRET` (recommended)
   - `NODE_ENV=production` (optional)

**Critical:** Without `SUPER_ADMIN_PASSWORD`, production deployment will crash for security reasons.

### Database Persistence (Replit)

**Important Facts:**
- ✅ **Data persists across deployments** - Database is NOT reset on publish
- ✅ **Separate dev/production databases** - Development data isolated
- ✅ **Schema changes auto-sync** - Drizzle ORM handles migrations
- ⚠️ **Schema breaking changes** - May cause brief downtime

**Rollback Support:**
- Replit creates automatic checkpoints
- Can restore code + database to previous state
- Access via **"Rollback"** tab

### Scaling (Replit)

**Autoscale Deployment:**
- Automatically scales with traffic
- Handles concurrent users
- Load balancing included

**Reserved VM:**
- Always-on deployment
- Faster response times
- Higher cost

### Custom Domain (Replit)

1. Navigate to **Deployment** → **"Domains"**
2. Click **"Add custom domain"**
3. Point your domain CNAME to Replit hostname
4. SSL certificate auto-generated

---

## Docker Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- PostgreSQL database (external)

### Docker Setup

#### 1. Create Dockerfile

```dockerfile
# File: Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --production

# Copy application code
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/rccms
      - SESSION_SECRET=${SESSION_SECRET}
      - SUPER_ADMIN_PASSWORD=${SUPER_ADMIN_PASSWORD}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=rccms
      - POSTGRES_USER=rccms_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 3. Environment File

Create `.env`:
```env
POSTGRES_PASSWORD=<generate secure password>
SESSION_SECRET=<generate: openssl rand -base64 32>
SUPER_ADMIN_PASSWORD=<your admin password>
```

#### 4. Deploy with Docker Compose

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

#### 5. Database Migration

```bash
# Run inside app container
docker-compose exec app npm run db:push
```

### Docker Production Recommendations

1. **Use managed database** (AWS RDS, DigitalOcean Managed PostgreSQL)
2. **Enable health checks** in docker-compose
3. **Set up log aggregation** (ELK stack, CloudWatch)
4. **Use Docker secrets** instead of environment variables
5. **Implement backup strategy** for PostgreSQL
6. **Use nginx reverse proxy** for SSL termination

---

## VPS Deployment

### Prerequisites

- Ubuntu 22.04 LTS
- 2GB RAM minimum (4GB recommended)
- 20GB disk space
- Root/sudo access

### VPS Setup

#### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install nginx (reverse proxy)
sudo apt install -y nginx

# Install certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Database Setup

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE rccms;
CREATE USER rccms_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE rccms TO rccms_user;
\q
```

#### 3. Application Deployment

```bash
# Create app user
sudo adduser --disabled-password rccms

# Switch to app user
sudo su - rccms

# Clone repository
git clone <repo-url> app
cd app

# Install dependencies
npm ci --production

# Create .env file
cat > .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://rccms_user:your_secure_password@localhost:5432/rccms
SESSION_SECRET=$(openssl rand -base64 32)
SUPER_ADMIN_PASSWORD=your_admin_password
EOF

# Build frontend
npm run build

# Run database migration
npm run db:push
```

#### 4. Process Manager (PM2)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application
pm2 start npm --name "rccms" -- start

# Configure auto-restart on server reboot
pm2 startup systemd
# Run the command output by above
pm2 save

# View logs
pm2 logs rccms
```

#### 5. Nginx Reverse Proxy

Create `/etc/nginx/sites-available/rccms`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/rccms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d your-domain.com
```

Certbot auto-configures nginx for HTTPS and sets up auto-renewal.

#### 7. Firewall Setup

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | Session encryption key | `<32+ char random string>` |
| `SUPER_ADMIN_PASSWORD` | Admin password (production only) | `SecureP@ssw0rd123` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPER_ADMIN_USERNAME` | Admin username | `superadmin` |
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |

### Generate Secrets

```bash
# SESSION_SECRET (32 characters)
openssl rand -base64 32

# SUPER_ADMIN_PASSWORD (strong password)
openssl rand -base64 24
```

---

## Database Setup

### Neon (Serverless PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. Copy `DATABASE_URL` from connection details
4. Add to environment variables
5. Run `npm run db:push`

### Self-Hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql

# Create database
sudo -u postgres createdb rccms

# Create user with password
sudo -u postgres psql
CREATE USER rccms_user WITH ENCRYPTED PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE rccms TO rccms_user;
```

### Database Migration

**Drizzle ORM handles schema automatically:**

```bash
# Push schema to database (creates/updates tables)
npm run db:push

# Force push (if conflicts)
npm run db:push --force
```

**No manual SQL migrations needed!**

---

## Production Checklist

### Pre-Deployment

- [ ] Set strong `SUPER_ADMIN_PASSWORD`
- [ ] Generate random `SESSION_SECRET`
- [ ] Configure `DATABASE_URL` (production database)
- [ ] Set `NODE_ENV=production`
- [ ] Run `npm run build` (frontend assets)
- [ ] Run `npm run db:push` (database schema)
- [ ] Test application locally with production env
- [ ] Review security audit report
- [ ] Backup production database plan

### Security

- [ ] Change default admin password immediately
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure firewall rules
- [ ] Set up rate limiting (already in code)
- [ ] Enable security headers (already in code via Helmet.js)
- [ ] Review user roles and permissions
- [ ] Disable development tools in production
- [ ] Sanitize error messages (no stack traces)

### Monitoring

- [ ] Set up application logging
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Monitor database performance
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure backup automation
- [ ] Set up alerts for errors/downtime

### Performance

- [ ] Enable gzip compression (nginx)
- [ ] Configure browser caching
- [ ] Optimize database queries (indexes)
- [ ] Set connection pool limits
- [ ] Test under load

---

## Monitoring & Maintenance

### Health Checks

**Endpoint:** `GET /api/system-health`

Returns:
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 3600,
  "version": "2.0"
}
```

### Logs

**Replit:**
- View in Console tab
- Access logs via Deployment dashboard

**PM2 (VPS):**
```bash
pm2 logs rccms
pm2 logs rccms --lines 100
pm2 logs rccms --err    # Errors only
```

**Docker:**
```bash
docker-compose logs -f app
docker-compose logs --tail=100 app
```

### Database Backup

**Replit:**
- Automatic backups via checkpoints
- Manual: Export via Database tab

**Self-Hosted:**
```bash
# Backup
pg_dump -U rccms_user rccms > backup_$(date +%Y%m%d).sql

# Restore
psql -U rccms_user rccms < backup_20251117.sql
```

**Automate Backups:**
```bash
# Add to crontab (daily at 2 AM)
0 2 * * * pg_dump -U rccms_user rccms > /backups/rccms_$(date +\%Y\%m\%d).sql
```

### Updates

**Application Updates:**
```bash
# Pull latest code
git pull origin main

# Install new dependencies
npm ci --production

# Build frontend
npm run build

# Push schema changes
npm run db:push

# Restart application
pm2 restart rccms  # VPS
# OR
docker-compose restart app  # Docker
# OR redeploy on Replit
```

### Troubleshooting

**Database Connection Errors:**
- Verify `DATABASE_URL` is correct
- Check database server is running
- Test connection: `psql $DATABASE_URL`

**Session Issues:**
- Clear browser cookies
- Verify `SESSION_SECRET` is set
- Check PostgreSQL session store

**Permission Errors:**
- Verify user role in database
- Check `canAccessReports` flag
- Review route middleware

**Performance Issues:**
- Check database query performance
- Monitor server resources (CPU, RAM)
- Review application logs for errors

---

## Support & Resources

**Documentation:**
- [User Guide](USER_GUIDE.md)
- [Admin Guide](ADMIN_GUIDE.md)
- [Technical Documentation](TECHNICAL_DOCUMENTATION.md)
- [Operational Runbook](OPERATIONAL_RUNBOOK.md)

**External Resources:**
- [Replit Docs](https://docs.replit.com)
- [Neon Database Docs](https://neon.tech/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Deployment Status:** Production-Ready  
**Recommended Platform:** Replit (easiest) or VPS (full control)  
**Minimum Requirements:** 2GB RAM, PostgreSQL 15+, Node.js 20+
