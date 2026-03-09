# Deployment Guide - Sustainability Platform

## Overview
This application consists of:
- **Backend**: Node.js/Express API on port 5001
- **Frontend**: React/Vite SPA on port 5173
- **Database**: PostgreSQL (sustainability_db)

---

## Quick Start (Local Deployment)

### 1. Database Setup
```bash
# Ensure PostgreSQL is running
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database if needed
createdb sustainability_db

# Apply migrations in order
psql -U postgres -d sustainability_db -f migrations/20260222_add_prd_screen_tables.sql
psql -U postgres -d sustainability_db -f migrations/20260308_fix_notifications_types.sql
psql -U postgres -d sustainability_db -f migrations/20260308_add_client_portal.sql
psql -U postgres -d sustainability_db -f migrations/20260309_enable_cross_org_messages.sql
psql -U postgres -d sustainability_db -f migrations/20260309_enable_cross_org_data_requests.sql
```

### 2. Backend Setup
```bash
# Create .env file in root directory
cat > .env << 'EOF'
NODE_ENV=production
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sustainability_db
JWT_SECRET=your_long_random_secret_key_min_32_chars
PORT=5001
EOF

# Install dependencies
npm install

# Start backend
NODE_ENV=production node src/server.js
```

### 3. Frontend Setup
```bash
# Build for production
cd frontend
npm install
npm run build

# Serve built files (install if needed)
npm install -g http-server
http-server dist -p 5173 -c-1
```

**Access the app:**
- Admin portal: http://localhost:5173/company
- Client portal: http://localhost:5173/client

---

## Docker Deployment (Recommended)

### Create Dockerfile (Backend)
```dockerfile
# Root directory Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5001

CMD ["node", "src/server.js"]
```

### Create frontend/Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g http-server
COPY --from=builder /app/dist ./dist
EXPOSE 5173
CMD ["http-server", "dist", "-p", "5173", "-c-1"]
```

### Create docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: sustainability-db
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-sustainability_db}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: .
    container_name: sustainability-api
    ports:
      - "5001:5001"
    environment:
      NODE_ENV: production
      DB_USER: ${DB_USER:-postgres}
      DB_PASSWORD: ${DB_PASSWORD:-postgres}
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-sustainability_db}
      JWT_SECRET: ${JWT_SECRET:-change-me-in-production}
      PORT: 5001
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
    container_name: sustainability-ui
    ports:
      - "5173:5173"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy with Docker Compose
```bash
# Create .env file with production values
cp .env.example .env
# Edit .env with production credentials

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Cloud Deployment Options

### Option A: AWS (EC2 + RDS)
```bash
# 1. Create RDS PostgreSQL instance
# 2. Launch EC2 instance (t3.micro or larger)
# 3. SSH into instance and run:

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL client
sudo apt-get install -y postgresql-client

# Clone repository
git clone <repo-url>
cd sustainability-project

# Setup backend
npm install
cat > .env << 'EOF'
NODE_ENV=production
DB_HOST=<RDS-endpoint>
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=<RDS-password>
DB_NAME=sustainability_db
JWT_SECRET=<random-32-char-secret>
PORT=5001
EOF

# Apply migrations
psql -h <RDS-endpoint> -U admin -d sustainability_db -f migrations/*.sql

# Start backend with PM2
npm install -g pm2
pm2 start src/server.js --name "api"
pm2 startup
pm2 save

# Setup frontend
cd frontend
npm install
npm run build

# Serve frontend with Nginx (reverse proxy)
sudo apt-get install -y nginx
# Configure nginx to proxy port 5001 and serve static port 5173
```

### Option B: Heroku
```bash
# Create app
heroku create sustainability-platform

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run migrations
heroku run "node -e \"require('pg-migrations').run()\""
```

### Option C: Render.com (Already configured)
```yaml
# render.yaml (already in repo)
# Modify to update build commands and environment

# Deploy
git push
# Render automatically deploys on push to main
```

### Option D: DigitalOcean App Platform
```bash
# Connect GitHub repo
# Configure environment variables in DigitalOcean dashboard:
# - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
# - JWT_SECRET
# - NODE_ENV=production

# App Platform automatically builds and deploys
```

---

## Production Checklist

- [ ] **Database**
  - [ ] All migrations applied successfully
  - [ ] Database backups configured
  - [ ] Connection pooling enabled for large deployments
  - [ ] Indexes verified with `\d+ table_name` in psql

- [ ] **Backend Security**
  - [ ] JWT_SECRET is 32+ characters, strong random string
  - [ ] .env file is in .gitignore (NOT committed)
  - [ ] NODE_ENV=production
  - [ ] CORS configured for frontend domain only
  - [ ] API rate limiting enabled (if needed)

- [ ] **Frontend**
  - [ ] Build optimized (`npm run build`)
  - [ ] VITE_API_BASE_URL correctly points to backend
  - [ ] No hardcoded localhost URLs
  - [ ] Cache headers configured (dist files)

- [ ] **Infrastructure**
  - [ ] HTTPS/SSL certificate installed
  - [ ] Reverse proxy (Nginx/Apache) configured
  - [ ] Firewall rules: only allow 443 (HTTPS), 80 (HTTP redirect), 5432 (DB - internal only)
  - [ ] Auto-restart on failure (PM2, systemd, docker restart policy)

- [ ] **Monitoring**
  - [ ] Error logging configured
  - [ ] Database backups scheduled
  - [ ] Uptime monitoring enabled
  - [ ] Log rotation configured

- [ ] **Testing Pre-Deployment**
  - [ ] Login flow works (admin & client)
  - [ ] Data requests visible on client side
  - [ ] Messages delivered cross-org
  - [ ] Reports generate successfully
  - [ ] File uploads work

---

## Environment Variables Reference

```env
# Database
DB_USER=postgres
DB_PASSWORD=secure_password
DB_HOST=localhost          # Change to RDS endpoint in production
DB_PORT=5432
DB_NAME=sustainability_db

# Application
NODE_ENV=production
PORT=5001
JWT_SECRET=your_32_char_minimum_secret_key_here

# Optional
API_LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
```

---

## Maintenance Commands

### Backup Database
```bash
pg_dump -U postgres sustainability_db > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
psql -U postgres sustainability_db < backup_20260309.sql
```

### View Logs (Docker)
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart Services (Docker)
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Update Code (Docker)
```bash
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Troubleshooting

**Port already in use:**
```bash
# Find process on port
lsof -i :5001

# Kill process
kill -9 <PID>
```

**Database connection error:**
```bash
# Test connection
psql -U postgres -h localhost -d sustainability_db -c "SELECT version();"
```

**Frontend not connecting to API:**
```bash
# Check API URL in frontend/.env.production
VITE_API_BASE_URL=http://yourdomain.com:5001

# Or if using reverse proxy:
VITE_API_BASE_URL=/api
```

**Migrations not applied:**
```bash
# Check migration status
psql -d sustainability_db -c "SELECT * FROM schema_migrations;"

# Reapply single migration
psql -d sustainability_db -f migrations/20260309_enable_cross_org_data_requests.sql
```

---

## Recommended Deployment Flow

1. **Development**: Local testing with `npm run dev`
2. **Staging**: Docker deployment with production config
3. **Testing**: Full smoke test (login, data requests, messages, reports)
4. **Production**: Same Docker setup, different credentials & domain

See README.md for local development setup.
