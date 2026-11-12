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

---

## 4. Hotfix Deployment Runbook (`hotfix/phase-0-security`)

### Environment Prerequisites
- `NODE_ENV=production` must be set in `backend/.env` and in PM2 environment (`ecosystem.config.cjs`).
- `JWT_SECRET` must be set with **at least 32 characters** of high-entropy random data. Server fails closed and terminates immediately if shorter than 32 characters or unset outside dev/test.
- **Confirm `JWT_SECRET_PREVIOUS` is UNSET** (empty / commented out) in `backend/.env` to ensure no insecure development or legacy fallback secrets are accepted.

### Deployment Execution (Step-by-Step)
```bash
# Step 1: SSH into server
ssh ubuntu@dizigini.com
cd /home/ubuntu/Dizigini  # (or your server root /var/www/dizi)

# Step 2: Database Snapshot Backup
pg_dump -U postgres -h 127.0.0.1 -d dizigini_db -F c -b -v -f ~/backup_dizigini_$(date +%Y%m%d_%H%M%S).dump

# Step 3: Pull Hotfix Branch
PREV_COMMIT=$(git rev-parse HEAD)
git fetch origin
git checkout hotfix/phase-0-security
git pull origin hotfix/phase-0-security

# Step 4: Build Frontend Static Bundle
cd frontend
npm install --production=false
npm run build
cd ..

# Step 5: Update Backend Dependencies & Restart PM2
cd backend
npm install --production
# Restart real PM2 app 'dizigini-backend' with updated environment
pm2 restart dizigini-backend --update-env
pm2 save
cd ..

# Step 6: Verify PM2 Process & Environment
pm2 status dizigini-backend
pm2 env 0 | grep -E "NODE_ENV|JWT_SECRET"
# Must confirm: NODE_ENV: 'production'
# Must confirm: JWT_SECRET_PREVIOUS is unset

# Step 7: Post-Deploy Security Verification
# 1. Unauthenticated hit to sample management must return HTTP 401:
curl -s -o /dev/null -w "%{http_code}\n" http://dizigini.com/api/samples/manage
# Expected: 401

# 2. Direct static access to /storage must return HTTP 404 (leak closed):
curl -s -o /dev/null -w "%{http_code}\n" http://dizigini.com/storage/buckets/dizigini-assets/test.pdf
# Expected: 404

# 3. Public 404 demo isolation check:
curl -s http://dizigini.com/api/samples/non-existent-test-slug | grep -o "availableShowcases"
# Expected: Returns availableShowcases strictly containing data-i2i and siift-ai only

# 4. Check post-deploy logs for any unauthenticated anomalies:
pm2 logs dizigini-backend --lines 50

# Step 8: Rollback Procedure (in case of unexpected issue)
# git checkout $PREV_COMMIT
# cd frontend && npm run build && cd ../backend && pm2 restart dizigini-backend --update-env
```

---

## 5. Integration API Security & Nginx Configuration (`/api/integration/v1/`)

> [!WARNING]
> **HTTPS Mandate for Integration API**: The server-to-server Integration API (`ENABLE_INTEGRATION_API`) must **ONLY** be enabled in production environments when serving over **HTTPS** (SSL/TLS). Exposing API keys (`X-API-Key`) over plain HTTP risks man-in-the-middle credential interception.

- **Feature Flag**: `ENABLE_INTEGRATION_API=false` by default. Set `ENABLE_INTEGRATION_API=true` in `backend/.env` only when SSL is configured.
- **Nginx Streamed Multipart Configuration**:
  Add this location block to `/etc/nginx/sites-available/dizigini.com` before the general `/api/` proxy block:

```nginx
    # --------------------------------------------------------------------------
    # Integration API Reverse Proxy (Streamed Multipart File Uploads)
    # --------------------------------------------------------------------------
    location /api/integration/ {
        proxy_pass http://dizigini_api;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 30MB payload limit for PDF uploads
        client_max_body_size 30M;

        # Disable Nginx request body buffering to stream directly to backend disk/storage
        proxy_request_buffering off;
        proxy_buffering off;

        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
```

---

## 6. Integration API Key Issuance & Zero-Downtime Rotation Procedure

### Initial API Key Issuance
```bash
# On server (or local administrative console):
cd /home/ubuntu/Dizigini/backend
node scripts/issue-api-key.js --client-name "DizitalGini Production" --scopes "prospects:write,assets:write"
# Output displays the plain key once (dzg_live_<hex32>). Copy and configure in DizitalGini client env.
```

### Zero-Downtime Key Rotation Runbook
To rotate an API key without service interruption:
1. **Step 1 - Issue New Key**:
   Run `node scripts/issue-api-key.js --client-name "DizitalGini Production (Rotated <Date>)"`. Store the new raw key.
2. **Step 2 - Verify New Key**:
   Test health endpoint using new key:
   ```bash
   curl -H "X-API-Key: dzg_live_NEWKEY" https://dizigini.com/api/integration/v1/health
   # Must return 200 { status: 'ok', ... }
   ```
3. **Step 3 - Switch Originating Client (DizitalGini)**:
   Update `DIZIGINI_API_KEY` in DizitalGini's environment to the new key and deploy/restart DizitalGini.
4. **Step 4 - Revoke Old Key**:
   Revoke the previous key securely via stdin/prompt (never pass plaintext keys in command line flags):
   ```bash
   node scripts/revoke-api-key.js --client-id "client_OLD_ID"
   # OR securely input the old key via prompt:
   node scripts/revoke-api-key.js
   # Enter API key to revoke: dzg_live_OLDKEY
   ```
5. **Step 5 - Confirm Revocation**:
   ```bash
   curl -H "X-API-Key: dzg_live_OLDKEY" https://dizigini.com/api/integration/v1/health
   # Must return 403 { success: false, error: 'CLIENT_REVOKED' }
   ```


