# Deploying to Render.com

Render is a modern cloud platform perfect for full-stack applications. This guide walks you through deploying your sustainability platform to Render.

## Prerequisites

- GitHub account with your repository pushed
- Render account (free at render.com)
- Access to your GitHub repository settings

## Step 1: Prepare Your Repository

Make sure all changes are committed and pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 2: Sign Up for Render

1. Go to [render.com](https://render.com)
2. Click "Sign up" (can use GitHub account for faster signup)
3. Connect your GitHub account when prompted

## Step 3: Deploy Using Blueprint

The easiest way is using Render's Blueprint feature which automatically deploys your entire stack:

1. **Go to Dashboard** → Click "New" → Select "Blueprint"
2. **Connect Repository**: 
   - Select your GitHub repository
   - Choose `main` branch (or your default branch)
3. **Review Configuration**:
   - The `render.yaml` file will be auto-detected
   - Render will show you the services to be created:
     - PostgreSQL database (free tier)
     - Node.js web service (free tier)
4. **Click "Apply"**
5. Wait 5-10 minutes for deployment to complete

## Step 4: Verify Deployment

Once deployment completes:

1. **Check Logs**:
   - Go to your service dashboard
   - Click the "Logs" tab
   - Look for messages like:
     ```
     ✅ Applied: 20260222_add_prd_screen_tables.sql
     ✅ All migrations applied successfully
     ✅ App listening on port 10000
     ```

2. **Test the API**:
   - Get your service URL from the dashboard (e.g., `https://sustainability-app-xxxx.onrender.com`)
   - Test: `https://your-service-url.onrender.com/auth/login`
   - Should return 404 (route not found) or similar, not a connection error

3. **Access Your App**:
   - Visit: `https://your-service-url.onrender.com`
   - Admin portal: `https://your-service-url.onrender.com/company`
   - Client portal: `https://your-service-url.onrender.com/client`

## Step 5: Configure Environment Variables

Render automatically creates the database and JWT_SECRET, but you may want to customize:

1. **In Render Dashboard**, go to your web service
2. **Click "Environment"** tab
3. Available variables:
   - `NODE_ENV`: Already set to `production`
   - `JWT_SECRET`: Auto-generated (change if desired)
   - `DATABASE_URL`: Auto-set by Render (do not change)
   - `PORT`: Set to `10000` (do not change)

4. **Add custom variables** (optional):
   - `FRONTEND_URL`: Set to your Render URL for CORS
     - Example: `https://sustainability-app-xxxx.onrender.com`

## Step 6: Set Up CORS (If Needed)

If frontend and backend are on different domains:

1. Edit `/src/app.js` (if not already set)
2. Make sure `FRONTEND_URL` environment variable is used:
   ```javascript
   const allowedOrigins = process.env.FRONTEND_URL
     ? [process.env.FRONTEND_URL, "http://localhost:5173"]
     : ["http://localhost:5173"];
   ```

## Step 7: Database Access (Optional)

To connect to your database directly:

1. **Get connection details**:
   - Go to your PostgreSQL database service in Render
   - Click "Info" tab
   - Copy connection string

2. **Connect from your machine**:
   ```bash
   psql "your-connection-string"
   ```

3. **Run queries**:
   ```sql
   SELECT * FROM users LIMIT 5;
   SELECT * FROM data_requests;
   ```

## Step 8: Enable Custom Domain (Optional)

To use your own domain:

1. **In Render Dashboard**, go to web service settings
2. **Click "Custom Domains"**
3. **Add domain** (e.g., `app.yourdomain.com`)
4. **Follow DNS setup instructions**
5. **Enable automatic SSL** (automatic)

## Troubleshooting

### App crashes immediately

**Check logs** for errors:
- Go to Logs tab in Render dashboard
- Look for error messages
- Common issues:
  - Migration failed: Check database connection
  - Out of memory: Update to paid tier
  - Port already in use: Render handles this, shouldn't occur

**Common fix**:
```bash
# Push a fix to GitHub
git push origin main

# Render will auto-redeploy
```

### Database connection fails

1. **Verify DATABASE_URL** is set in Environment
2. **Check migrations** ran successfully in logs:
   ```
   ✅ Applied: 20260222_add_prd_screen_tables.sql
   ✅ Applied: 20260308_...
   ```
3. If migrations failed:
   - Connect to database directly and verify tables exist
   - If tables don't exist, you may need to manually run migrations:
     ```
     Connect to DB → Run migrations/*.sql files in order
     ```

### Frontend not loading

1. **Check static files** were built:
   - Logs should show: `npm run build` completed
   - File should exist: `frontend/dist/index.html`

2. **Clear browser cache**: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)

3. **Test API directly**:
   ```bash
   curl https://your-service-url.onrender.com/auth/login
   ```

### Login returns 401

1. **Check migrations ran**: Verify users table exists
2. **Check JWT_SECRET**: Should be 32+ chars in Environment
3. **Test with seed data**:
   - Logs should show: `User seeded` or similar
   - Default: admin@example.com / admin123

## Free Tier Limitations

**Render Free Plan includes:**
- ✅ 0.5 vCPU for web service (spins down after 15 min inactivity)
- ✅ 1 PostgreSQL database (0.5 storage)
- ✅ 750 hours/month (enough for always-on)
- ✅ Automatic SSL/HTTPS

**Limitations:**
- ⚠️ Service spins down after 15 minutes of inactivity (free tier only)
- ⚠️ ~30 second startup delay when spinning back up
- ⚠️ Limited resources

**Upgrade to Paid** if you need:
- Always-on service (no spin-down)
- More CPU/Memory
- Priority support

## Next Steps

1. **Test thoroughly**:
   - Create a test account
   - Send a data request between organizations
   - Send a message between orgs
   - Generate a report

2. **Monitor**: Check logs regularly for errors

3. **Backup strategy**: 
   - Enable automatic backups in Render dashboard (paid feature)
   - Or use manual exports: `pg_dump`

## Manual Deployment (Alternative)

If Blueprint doesn't work, deploy manually:

```bash
# 1. Create New Web Service
# Backend service → Connect GitHub → Choose branch

# 2. Build Command
npm install && cd frontend && npm install && npm run build && cd ..

# 3. Start Command
npm run migrate && npm run seed && npm start

# 4. Add environment variables
# NODE_ENV=production
# JWT_SECRET=<your-secret>
# DATABASE_URL=<your-database-url>
# PORT=10000

# 5. Create PostgreSQL service
# Plan: Free or Starter
# Name: sustainability-db

# 6. Link database to web service
# Add DATABASE_URL environment variable pointing to DB connection string
```

## Questions?

- **Render Docs**: https://render.com/docs
- **Support**: support@render.com
- **Community**: Discord at render.com
