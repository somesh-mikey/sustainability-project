# Pre-Deployment Checklist

Use this checklist before deploying to production.

## 🔐 Security & Configuration

- [ ] **Secrets Management**
  - [ ] `.env` file created from `.env.example`
  - [ ] `.env` is in `.gitignore` (NOT committed to repo)
  - [ ] `JWT_SECRET` is 32+ characters, strong random string
  - [ ] Database password is strong (12+ chars, mixed case, numbers, symbols)
  - [ ] No credentials in code comments
  - [ ] No API keys logged anywhere

- [ ] **Environment Variables**
  - [ ] `NODE_ENV=production` (not development)
  - [ ] `DB_HOST` points to production database
  - [ ] `VITE_API_BASE_URL` points to backend (not localhost)
  - [ ] `PORT=5001` (or your desired port)
  - [ ] All required vars set (see `.env.example`)

- [ ] **Access Control**
  - [ ] Database user has minimal required permissions
  - [ ] SSH keys configured for server access
  - [ ] Firewall rules restrict non-essential ports
  - [ ] Only 80/443 exposed publicly
  - [ ] Database only accessible internally

---

## 🗄️ Database

- [ ] **Backup Strategy**
  - [ ] Database backup script created
  - [ ] Backup location verified (external storage)
  - [ ] Test restore from backup
  - [ ] Automated backup scheduled

- [ ] **Migrations**
  - [ ] All migrations applied in order:
    - [ ] `20260222_add_prd_screen_tables.sql`
    - [ ] `20260308_fix_notifications_types.sql`
    - [ ] `20260308_add_client_portal.sql`
    - [ ] `20260309_enable_cross_org_messages.sql`
    - [ ] `20260309_enable_cross_org_data_requests.sql`
  - [ ] Verify with `psql -d sustainability_db -c "\dt"`
  - [ ] No pending migrations

- [ ] **Data**
  - [ ] Admin user seeded
  - [ ] Test organizations created
  - [ ] Test data in place for verification

---

## 🖥️ Backend

- [ ] **Build & Dependencies**
  - [ ] `npm install` run with production flag
  - [ ] No dev dependencies installed
  - [ ] Node version compatibility checked (v18+)
  - [ ] `node_modules/` size acceptable
  - [ ] Package-lock.json present

- [ ] **Code Quality**
  - [ ] No console.log statements in production code
  - [ ] Error handling in place
  - [ ] No hardcoded URLs/IPs
  - [ ] API rate limiting configured
  - [ ] CORS configured for frontend domain only

- [ ] **Server Health**
  - [ ] `/health` endpoint responds
  - [ ] Server doesn't crash on startup
  - [ ] Error logs are written
  - [ ] Memory usage acceptable

---

## 🎨 Frontend

- [ ] **Build**
  - [ ] `npm run build` completes without errors
  - [ ] `dist/` folder created
  - [ ] Bundle size reasonable (< 500KB gzipped)
  - [ ] No build warnings

- [ ] **Configuration**
  - [ ] No localhost URLs in production build
  - [ ] `VITE_API_BASE_URL` points to correct API
  - [ ] Environment variables for API URL set
  - [ ] Asset paths correct

- [ ] **Functionality**
  - [ ] Login page loads
  - [ ] Routes work (company/client)
  - [ ] API calls succeed
  - [ ] No 404 errors in console
  - [ ] Images/assets load correctly

---

## 🧪 Testing

- [ ] **End-to-End Smoke Tests**
  - [ ] Admin can login
  - [ ] Client can login
  - [ ] Admin can create data request
  - [ ] Client receives cross-org data request ✅ (recent test passed)
  - [ ] Admin can send message
  - [ ] Client receives message
  - [ ] Reports generate successfully
  - [ ] File uploads work

- [ ] **Browser Compatibility**
  - [ ] Chrome / Chromium
  - [ ] Firefox
  - [ ] Safari
  - [ ] Mobile (iOS/Android)

- [ ] **Performance**
  - [ ] Page load time < 3s
  - [ ] API response time < 500ms
  - [ ] No memory leaks (DevTools)
  - [ ] Network tab shows no failed requests

- [ ] **Error Handling**
  - [ ] Network error shows proper message
  - [ ] 404 page serves correctly
  - [ ] Server errors logged
  - [ ] User gets feedback on all actions

---

## 📦 Deployment Infrastructure

### Local Deployment
- [ ] PostgreSQL installed and running
- [ ] Node.js v18+ installed
- [ ] npm/node versions match development
- [ ] Ports 5001 and 5173 available
- [ ] Startup script has execute permissions

### Docker Deployment
- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] `docker-compose.yml` configured
- [ ] All Dockerfiles present (backend, frontend)
- [ ] `.env` file copied to root
- [ ] `docker-compose build` succeeds
- [ ] `docker-compose up -d` starts all services
- [ ] `docker-compose logs` shows no errors

### Cloud Deployment (AWS/Heroku/Render)
- [ ] Cloud account created and verified
- [ ] Database service provisioned
- [ ] Environment variables set in cloud dashboard
- [ ] Deployment connection to GitHub working
- [ ] Auto-deploy on push configured (if desired)

---

## 🔌 Connectivity & Ports

- [ ] **Backend**
  - [ ] Port 5001 listening
  - [ ] Database connection works
  - [ ] API endpoints responsive

- [ ] **Frontend**
  - [ ] Port 5173 (or 80/443 if behind proxy) serving
  - [ ] Static files loading
  - [ ] API calls routing to backend

- [ ] **Database**
  - [ ] Port 5432 listening (local only, not public)
  - [ ] Connection pool configured
  - [ ] Timeout values set

- [ ] **Reverse Proxy (if applicable)**
  - [ ] Nginx/Apache configured
  - [ ] SSL certificates valid
  - [ ] Routing rules in place
  - [ ] HTTPS redirect working

---

## 📊 Monitoring & Logging

- [ ] **Application Logging**
  - [ ] Error logs configured
  - [ ] Access logs enabled
  - [ ] Log rotation set up
  - [ ] Sensitive data not logged

- [ ] **System Monitoring**
  - [ ] CPU usage monitored
  - [ ] Memory usage monitored
  - [ ] Disk space checked
  - [ ] Network connectivity verified

- [ ] **Alerting**
  - [ ] High error rate alerts configured
  - [ ] Server down alerts configured
  - [ ] Database connection alerts configured

- [ ] **Process Management**
  - [ ] PM2/systemd configured for auto-restart
  - [ ] Services start on boot
  - [ ] Crashes are logged and reported

---

## 📋 Documentation

- [ ] **Runbooks Created**
  - [ ] How to restart services
  - [ ] How to check logs
  - [ ] How to backup database
  - [ ] How to recover from errors

- [ ] **Credentials Store**
  - [ ] Database root password stored securely
  - [ ] JWT secret backed up
  - [ ] SSH keys backed up
  - [ ] Recovery codes saved

- [ ] **Deployment Records**
  - [ ] Deployment date logged
  - [ ] Version deployed noted
  - [ ] Configuration changes documented
  - [ ] Issues and fixes logged

---

## ✅ Final Review

- [ ] **Code Review**
  - [ ] All changes reviewed
  - [ ] No build errors
  - [ ] No linting errors

- [ ] **Testing Complete**
  - [ ] All features smoke tested
  - [ ] Cross-org requests verified ✅
  - [ ] Messages delivering ✅
  - [ ] Reports generating ✅

- [ ] **Go/No-Go Decision**
  - [ ] Team approved deployment
  - [ ] Rollback plan ready
  - [ ] Support team notified
  - [ ] Users notified of downtime (if any)

---

## 🚀 Deployment Steps

1. **Database Setup** (5 min)
   ```bash
   psql -U postgres -d sustainability_db -f migrations/*.sql
   ```

2. **Backend Deployment** (5 min)
   ```bash
   npm install --production
   NODE_ENV=production node src/server.js &
   ```

3. **Frontend Build & Deploy** (5 min)
   ```bash
   cd frontend && npm run build
   http-server dist -p 5173 &
   ```

4. **Verification** (5 min)
   - [ ] All endpoints responding
   - [ ] Database queries working
   - [ ] Frontend loading

5. **Smoke Tests** (10 min)
   - [ ] Login working
   - [ ] Data requests visible
   - [ ] Cross-org features working

---

## 🔄 Post-Deployment

- [ ] Monitor error logs for first 24 hours
- [ ] Check database disk usage
- [ ] Verify backup runs automatically
- [ ] Notify users of successful deployment
- [ ] Schedule post-deployment review
- [ ] Update deployment documentation

---

**Last Verified:** 2026-03-09
**Status:** ✅ Ready for Production
**Recent Tests:** 
- ✅ Data requests (cross-org delivery verified)
- ✅ Messaging (tested)
- ✅ Reports (tested)
- ✅ Frontend build (passed)
