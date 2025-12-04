# Deployment Guide - FixLater

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Deployment](#database-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Domain & SSL](#domain--ssl)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] No console.log or debug statements in production code
- [ ] Error handling implemented for all API endpoints
- [ ] Input validation on all user inputs
- [ ] No hardcoded secrets or credentials
- [ ] Code reviewed by another developer

### Security
- [ ] Change JWT_SECRET to a strong random value
- [ ] CORS configured to specific domain (not all)
- [ ] Rate limiting implemented
- [ ] SQL injection prevention (parameterized queries used)
- [ ] HTTPS enforced
- [ ] Headers security configured (HSTS, CSP, etc.)

### Performance
- [ ] Database indexes verified
- [ ] Images compressed before upload
- [ ] Pagination implemented for large result sets
- [ ] API response times acceptable
- [ ] Frontend bundle size optimized

### Documentation
- [ ] API documentation up-to-date
- [ ] Environment variables documented
- [ ] Deployment procedures documented
- [ ] Emergency contact info available

---

## Environment Setup

### Recommended Hosting Providers

#### Backend Options
1. **Heroku** (Easiest for beginners)
2. **AWS EC2** (More control, scalable)
3. **DigitalOcean** (Good balance, affordable)
4. **Railway** (Modern alternative to Heroku)
5. **Render** (Heroku alternative)

#### Database Options
1. **AWS RDS** (Managed PostgreSQL)
2. **Heroku PostgreSQL** (Included with Heroku)
3. **DigitalOcean Managed Databases**
4. **Azure Database for PostgreSQL**
5. **PlanetScale** (if you switch to MySQL)

#### File Storage Options
1. **AWS S3** (Industry standard)
2. **Cloudflare R2** (Cheaper S3 alternative)
3. **DigitalOcean Spaces** (Similar to S3)

#### Frontend Options
1. **Vercel** (Best for React)
2. **Netlify** (Simple, great DX)
3. **AWS CloudFront + S3**
4. **GitHub Pages** (Free but limited)

---

## Database Deployment

### AWS RDS PostgreSQL Setup

#### 1. Create RDS Instance
```bash
# Via AWS Console or AWS CLI
aws rds create-db-instance \
  --db-instance-identifier fixlater-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --storage-type gp2 \
  --publicly-accessible true
```

#### 2. Configure Security Group
- Allow inbound traffic on port 5432
- Restrict to your application server's IP

#### 3. Update Environment Variables
```env
DB_HOST=fixlater-db.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=fixlater
DB_USER=postgres
DB_PASSWORD=YOUR_SECURE_PASSWORD
```

#### 4. Run Migrations
```bash
# Connect from your local machine or deployment server
cd backend
npm run migrate

# Verify tables created
psql -h fixlater-db.xxxxx.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d fixlater \
     -c "\dt"
```

### Database Backups

#### Automated Backups (AWS)
```bash
# Configure in AWS Console
# Backup retention period: 7-30 days
# Backup window: Daily at 3 AM UTC
```

#### Manual Backups
```bash
# Backup database
pg_dump -h localhost -U postgres -d fixlater > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h localhost -U postgres -d fixlater < backup_20250101.sql
```

---

## Backend Deployment

### Option 1: Heroku Deployment

#### 1. Install Heroku CLI
```bash
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

#### 2. Prepare Backend for Heroku
```javascript
// In backend/server.js, add:
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 3. Create Heroku App
```bash
cd backend
heroku login
heroku create fixlater-api
```

#### 4. Set Environment Variables
```bash
heroku config:set JWT_SECRET=your_super_secret_key
heroku config:set DB_HOST=your_rds_host
heroku config:set DB_PORT=5432
heroku config:set DB_NAME=fixlater
heroku config:set DB_USER=postgres
heroku config:set DB_PASSWORD=your_password
heroku config:set AWS_ACCESS_KEY_ID=your_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
heroku config:set AWS_BUCKET_NAME=fixlater-uploads
```

#### 5. Update package.json
```json
{
  "engines": {
    "node": "16.13.0",
    "npm": "8.1.0"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

#### 6. Add Procfile
Create `backend/Procfile`:
```
web: node server.js
release: npm run migrate
```

#### 7. Deploy
```bash
git push heroku main
# Or if on different branch:
git push heroku your-branch:main
```

#### 8. Verify Deployment
```bash
heroku logs --tail
# Visit https://fixlater-api.herokuapp.com/api/health
```

### Option 2: DigitalOcean Deployment

#### 1. Create Droplet
```bash
# Via DigitalOcean Console
# Ubuntu 20.04 LTS, 2GB RAM, $6/month
```

#### 2. SSH into Server
```bash
ssh root@your_server_ip
```

#### 3. Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt install -y nodejs

# Install PostgreSQL client
apt install -y postgresql-client-12

# Install PM2 (process manager)
npm install -g pm2
```

#### 4. Clone Repository
```bash
cd /home
git clone https://github.com/yourusername/fixlater.git
cd fixlater/backend
```

#### 5. Install Dependencies & Setup
```bash
npm install
```

#### 6. Create .env File
```bash
nano .env
# Add your configuration
```

#### 7. Run Database Migrations
```bash
npm run migrate
```

#### 8. Start with PM2
```bash
pm2 start server.js --name "fixlater-api"
pm2 startup
pm2 save

# View logs
pm2 logs fixlater-api
```

#### 9. Setup Nginx Reverse Proxy
```bash
apt install -y nginx

# Edit config
nano /etc/nginx/sites-available/default
```

Add this config:
```nginx
server {
    listen 80;
    server_name api.fixlater.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Restart Nginx:
```bash
nginx -s reload
```

---

## Frontend Deployment

### Option 1: Vercel Deployment

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Deploy
```bash
cd frontend
vercel
# Follow prompts
```

#### 4. Set Environment Variables
```bash
vercel env add REACT_APP_API_URL
# Enter: https://api.fixlater.com/api
```

#### 5. Configure API URL
In `frontend/src/utils/api.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### Option 2: Netlify Deployment

#### 1. Connect GitHub
- Go to netlify.com
- Click "New site from Git"
- Select your GitHub repo

#### 2. Configure Build
```
Build command: npm run build
Publish directory: frontend/build
```

#### 3. Set Environment Variables
```
Site settings → Environment
REACT_APP_API_URL=https://api.fixlater.com/api
```

#### 4. Deploy
Netlify automatically deploys on git push

---

## Domain & SSL

### Setup Custom Domain

#### 1. Purchase Domain
- GoDaddy, Namecheap, Route53, etc.

#### 2. Point Domain to Server
**For Heroku:**
```
Type: CNAME
Name: api
Value: fixlater-api.herokuapp.com
```

**For DigitalOcean:**
```
Type: A
Name: api
Value: your_server_ip
```

#### 3. Configure SSL (Free with Let's Encrypt)

**Heroku:** Automatic with custom domain

**DigitalOcean:**
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.fixlater.com
```

#### 4. Auto-Renew SSL
```bash
systemctl enable certbot.timer
systemctl start certbot.timer
```

### Update Frontend to Use Production API
```javascript
// frontend/src/utils/api.js
const API_BASE_URL = 
  process.env.REACT_APP_API_URL || 
  'https://api.fixlater.com/api';
```

---

## Monitoring & Maintenance

### Health Checks
```bash
# Setup automated health check
# Backend: https://api.fixlater.com/api/health
# Configure uptime monitoring (StatusPage, Pingdom)
```

### Logs & Errors
```bash
# Heroku
heroku logs --tail

# DigitalOcean
pm2 logs fixlater-api
tail -f /var/log/nginx/error.log
```

### Error Tracking
Implement error tracking service:
```javascript
// Install Sentry
npm install @sentry/node

// Initialize in server.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "YOUR_SENTRY_DSN" });
```

### Performance Monitoring
```javascript
// Install New Relic or similar
npm install newrelic
```

### Database Maintenance
```sql
-- Vacuum and analyze (PostgreSQL maintenance)
VACUUM ANALYZE;

-- Check index usage
SELECT * FROM pg_stat_user_indexes;

-- Monitor connections
SELECT datname, usename, application_name, state 
FROM pg_stat_activity;
```

---

## Rollback Procedures

### Heroku Rollback
```bash
# View release history
heroku releases

# Rollback to previous version
heroku rollback v123

# Redeploy current version
git push heroku main
```

### DigitalOcean Rollback
```bash
# Stop current version
pm2 stop fixlater-api

# Revert to previous commit
git checkout previous-commit-hash
npm install

# Restart
pm2 restart fixlater-api
```

### Database Rollback
```bash
# Restore from backup
psql -h your_db_host -U postgres -d fixlater < backup_20250101.sql
```

---

## Production Checklist

### Before Going Live
- [ ] Security review completed
- [ ] Load testing done
- [ ] Database backed up
- [ ] Monitoring setup
- [ ] Error tracking configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Backup procedures tested
- [ ] Rollback plan documented
- [ ] Support team trained
- [ ] Documentation complete

### Ongoing Maintenance
- [ ] Daily backup verification
- [ ] Weekly log review
- [ ] Monthly security updates
- [ ] Quarterly performance review
- [ ] Dependency updates (monthly)

### Performance Targets
- API response time: < 200ms
- Database query time: < 100ms
- Frontend load time: < 3s
- 99.9% uptime

---

## Cost Optimization

### Estimated Monthly Costs
```
Backend (Heroku):         $7-50
Database (AWS RDS):       $10-50
Frontend (Vercel):        Free-50
File Storage (S3):        $1-20
Domain:                   ~$10
SSL Certificate:          Free

Total:                    ~$40-180
```

### Cost Reduction Tips
1. Use Cloudflare R2 instead of S3 (50% cheaper)
2. Use Heroku free tier in development
3. Compress and optimize images
4. Use database connection pooling
5. Implement caching strategies
6. Monitor and clean up old data

---

## Security Hardening

### Production Environment Variables
```env
# Secure values
JWT_SECRET=generate_with: `openssl rand -base64 32`
DB_PASSWORD=use_strong_random_password
AWS_SECRET_ACCESS_KEY=from_AWS_console
```

### Security Headers (Nginx)
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'" always;
```

### Database Security
- Use strong passwords (16+ characters)
- Enable encryption at rest
- Enable SSL/TLS for connections
- Regular backups
- Restrict network access

### API Security
- Enable rate limiting
- Validate all inputs
- Use HTTPS only
- Implement CORS properly
- Add API key authentication (if needed)

---

## Troubleshooting Deployment

### Common Issues

#### Application Won't Start
```bash
# Check logs
heroku logs --tail
pm2 logs

# Verify environment variables
heroku config
env | grep DB_

# Test locally first
npm run dev
```

#### Database Connection Failed
```bash
# Test connection
psql -h your_db_host -U postgres -d fixlater -c "SELECT 1"

# Check credentials in .env
cat .env

# Verify security group allows access
```

#### Slow Performance
```bash
# Check server resources
pm2 monit

# Database query analysis
EXPLAIN ANALYZE SELECT * FROM tasks;

# Optimize indexes
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
```

#### Memory Leaks
```bash
# Monitor memory
pm2 monit

# Restart app to clear memory
pm2 restart fixlater-api

# Implement proper cleanup
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
```

---

## Post-Deployment

### Monitoring First Week
- Check logs every 4 hours
- Monitor uptime
- Test critical user flows
- Monitor performance metrics
- Watch error tracking

### User Communication
- Notify users of launch
- Provide feedback mechanism
- Monitor support channels
- Collect usage metrics

### Future Enhancements
- Add analytics (Google Analytics, Mixpanel)
- Implement feature flags
- Setup A/B testing
- Plan scaling strategy

---

## Useful Resources
- [Heroku Deployment Guide](https://devcenter.heroku.com/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [AWS Documentation](https://docs.aws.amazon.com/)
- [Vercel Deployment](https://vercel.com/docs)
- [PostgreSQL Backup Guide](https://www.postgresql.org/docs/current/backup.html)
