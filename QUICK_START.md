# Quick Start Guide for Deployment

## 🚀 Fastest Deployment (5 minutes)

### Local Machine
```bash
cd /Users/user57/Documents/Wefetch\ Project/sustainability-project

# Copy and configure environment
cp .env.example .env
# Edit .env with your database credentials

# Make startup script executable
chmod +x start-production.sh

# Run!
./start-production.sh
```

**Access:**
- Admin: http://localhost:5173/company
- Client: http://localhost:5173/client

---

## 🐳 Docker Deployment (3 commands)

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with production values

# 2. Start all services
docker-compose up -d

# 3. View logs
docker-compose logs -f backend
```

**Access:**
- App: http://localhost/company or http://localhost/client
- API: http://localhost/api

### Stop Services
```bash
docker-compose down
```

### View Status
```bash
docker-compose ps
```

---

## ☁️ Cloud Deployment

### Render.com (Easiest for Cloud)
1. Push code to GitHub
2. Connect repository to Render.com
3. Set environment variables manually or in `.env`
4. Deploy!

### AWS EC2
1. Launch EC2 instance (Ubuntu 22.04 recommended)
2. SSH and run:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql-client

git clone <your-repo>
cd sustainability-project
cp .env.example .env
# Edit .env

npm install
cd frontend && npm run build && cd ..

npm install -g pm2
pm2 start src/server.js --name "api"
pm2 startup
```

### Using Docker on Any VPS
1. Install Docker & Docker Compose
2. Clone repo, configure `.env`
3. Run `docker-compose up -d`

---

## 🔧 Configuration

### Step 1: Create .env file
```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost          # Change to remote host if needed
DB_PORT=5432
DB_NAME=sustainability_db
JWT_SECRET=your_long_random_secret_min_32_chars
PORT=5001
NODE_ENV=production
```

### Step 2: Database Setup
```bash
# For local deployment:
psql -U postgres -f migrations/20260222_add_prd_screen_tables.sql -d sustainability_db
psql -U postgres -f migrations/20260308_fix_notifications_types.sql -d sustainability_db
psql -U postgres -f migrations/20260308_add_client_portal.sql -d sustainability_db
psql -U postgres -f migrations/20260309_enable_cross_org_messages.sql -d sustainability_db
psql -U postgres -f migrations/20260309_enable_cross_org_data_requests.sql -d sustainability_db
```

---

## ✅ Verification Checklist

After deployment, verify:

### 1. Database ✓
```bash
psql -d sustainability_db -c "SELECT COUNT(*) FROM users;"
```

### 2. Backend API ✓
```bash
curl http://localhost:5001/health
# Should return: {"status":"ok"}
```

### 3. Frontend ✓
Open http://localhost:5173/company in browser
- Should see login page
- No JavaScript errors in console

### 4. Authentication ✓
- Login with admin credentials
- Data requests page loads
- Messages page accessible

### 5. Data Requests ✓
- Navigate to Data Requests
- See existing requests
- Create new request
- Recipient dropdown populated

### 6. Cross-Org Features ✓
- Send data request to another org
- Login as that org
- Verify request appears in their client portal

---

## 📊 Deployment Options Comparison

| Method | Setup Time | Cost | Scaling | Monitoring |
|--------|-----------|------|---------|-----------|
| Local Script | 5 min | Free | ❌ | Manual |
| Docker Local | 10 min | Free | ✓ partial | Manual |
| Docker Compose | 15 min | Free | ✓ good | Docker |
| AWS | 20 min | Low | ✓✓ Excellent | CloudWatch |
| Render | 10 min | Low | ✓ Auto | Built-in |
| Heroku | 10 min | Medium | ✓ Auto | Built-in |

**Recommendation:** Start with **Docker Compose** for simplicity and scalability.

---

## 🆘 Troubleshooting

**Port 5001/5173 already in use:**
```bash
lsof -i :5001
kill -9 <PID>
```

**Database connection error:**
```bash
psql -U postgres -h localhost -d sustainability_db -c "SELECT 1;"
```

**Frontend not connecting to API:**
Check `VITE_API_BASE_URL` environment variable.

**Docker containers not starting:**
```bash
docker-compose logs -f
```

**Migrations failed:**
```bash
# Check applied migrations
psql -d sustainability_db -c "\dt" 
```

---

## 📞 Support

For detailed information:
1. See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide
2. Check [README.md](./README.md) for development setup
3. Review [render.yaml](./render.yaml) for cloud config

---

**Happy deploying! 🚀**
