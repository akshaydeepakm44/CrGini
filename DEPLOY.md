# DiziGini Production Deployment Guide (`http://dizigini.com/`)

This guide outlines how to deploy the repository onto your production server so it maps directly to `http://dizigini.com/`.

---

## Architecture Overview

```
                      Internet Request
                             │
                  http://dizigini.com/
                             │
                     ┌───────▼───────┐
                     │  Nginx (80)   │
                     └───┬───────┬───┘
                         │       │
             Static / SPA│       │ /api/ Reverse Proxy
                         │       │
             ┌───────────▼─┐   ┌─▼─────────────┐
             │frontend/dist│   │ Node.js (5001)│
             └─────────────┘   └───────┬───────┘
                                       │
                               ┌───────▼───────┐
                               │  PostgreSQL   │
                               │ (dizigini_db) │
                               └───────────────┘
```

> **Dual Serving Fallback:**  
> The Node.js Express server (`backend/src/server.js`) also automatically serves `frontend/dist` as a fallback. Even if Nginx proxies all traffic to port 5001, both frontend (`/`) and backend (`/api`) work out of the box!

---

## 1. Fast Setup on the Server

### Step A: Pull the Latest Code
```bash
cd /var/www/dizi  # (or your server project path)
git fetch origin dizi-new
git checkout dizi-new
git pull origin dizi-new
```

### Step B: Build the Frontend
```bash
cd frontend
npm install
npm run build
```
This generates the optimized production bundle in `frontend/dist/`.

### Step C: Configure Backend & Start PM2
```bash
cd ../backend
npm install

# Verify your .env has your production database credentials:
# CLIENT_URL=http://dizigini.com,https://dizigini.com,http://www.dizigini.com,https://www.dizigini.com
# PORTAL_BASE_URL=http://dizigini.com

# Start or restart using PM2:
pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs
pm2 save
```

---

## 2. Nginx Domain Mapping (`http://dizigini.com/`)

1. Copy the included Nginx config:
   ```bash
   sudo cp nginx.dizigini.conf /etc/nginx/sites-available/dizigini.com
   ```

2. Edit the root path if your project is not at `/var/www/dizi`:
   ```bash
   sudo nano /etc/nginx/sites-available/dizigini.com
   # Ensure: root /var/www/dizi/frontend/dist;
   ```

3. Enable the site and test Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/dizigini.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. *(Optional)* Add free SSL Certificate via Let's Encrypt:
   ```bash
   sudo certbot --nginx -d dizigini.com -d www.dizigini.com
   ```

---

## 3. Verify Deployment

- **Landing Page**: Open `http://dizigini.com/` in your browser.
- **API Health Check**: `http://dizigini.com/api/health` should return `{"status":"online","service":"DiziGini Portal API"}`.
- **Client Portal**: `http://dizigini.com/portal`
- **Lead Specialist Portal**: `http://dizigini.com/lead`
- **Admin Console**: `http://dizigini.com/admin`
