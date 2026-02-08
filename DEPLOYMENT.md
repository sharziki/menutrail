# MenuTrail Deployment Guide

This guide covers deploying MenuTrail to a VPS (Virtual Private Server).

## Prerequisites

- VPS with Ubuntu 22.04 LTS (or similar)
- Docker & Docker Compose installed
- Domain name pointed to your VPS IP
- SSL certificate (Let's Encrypt recommended)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/menutrail.git
cd menutrail
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

Fill in all required environment variables:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Stripe Payments
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# DoorDash Delivery (optional)
DOORDASH_DEVELOPER_ID="..."
DOORDASH_KEY_ID="..."
DOORDASH_SIGNING_SECRET="..."

# App URL (your domain)
NEXT_PUBLIC_APP_URL="https://menutrail.yourdomain.com"

# Email (Resend)
RESEND_API_KEY="re_..."

# File Upload (Uploadthing)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."

# Google Places API (for address autocomplete)
GOOGLE_PLACES_API_KEY="..."
```

### 3. Build and Start

```bash
# Build the Docker image
docker-compose build

# Start the containers
docker-compose up -d

# Check logs
docker-compose logs -f menutrail
```

### 4. Run Database Migrations

```bash
# Run Prisma migrations
docker-compose exec menutrail npx prisma migrate deploy
```

## Production Deployment with Nginx & SSL

### 1. Create Nginx Config

```bash
mkdir -p nginx
nano nginx/nginx.conf
```

```nginx
events {
    worker_connections 1024;
}

http {
    upstream menutrail {
        server menutrail:3000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name menutrail.yourdomain.com;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name menutrail.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

        # Proxy settings
        location / {
            proxy_pass http://menutrail;
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
}
```

### 2. Get SSL Certificate with Certbot

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d menutrail.yourdomain.com

# Copy certificates
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/menutrail.yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/menutrail.yourdomain.com/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl
```

### 3. Start with Nginx

```bash
docker-compose --profile with-nginx up -d
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Supabase) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret API key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ | For Stripe webhooks |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your production URL |
| `DOORDASH_DEVELOPER_ID` | ❌ | DoorDash developer ID |
| `DOORDASH_KEY_ID` | ❌ | DoorDash API key ID |
| `DOORDASH_SIGNING_SECRET` | ❌ | DoorDash signing secret |
| `RESEND_API_KEY` | ⚠️ | For sending emails |
| `UPLOADTHING_SECRET` | ⚠️ | For file uploads |
| `UPLOADTHING_APP_ID` | ⚠️ | Uploadthing app ID |
| `GOOGLE_PLACES_API_KEY` | ⚠️ | For address autocomplete |

✅ = Required | ⚠️ = Recommended | ❌ = Optional

## Useful Commands

```bash
# View logs
docker-compose logs -f menutrail

# Restart application
docker-compose restart menutrail

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose build --no-cache
docker-compose up -d

# Run Prisma Studio (database GUI)
docker-compose exec menutrail npx prisma studio

# Shell into container
docker-compose exec menutrail sh
```

## Webhook URLs

Configure these URLs in your service dashboards:

- **Stripe Webhook**: `https://menutrail.yourdomain.com/api/webhooks/stripe`
- **DoorDash Webhook**: `https://menutrail.yourdomain.com/api/webhooks/doordash`

## Monitoring

### Health Check

```bash
curl https://menutrail.yourdomain.com/api/health
```

### Container Status

```bash
docker-compose ps
```

## Backup

### Database
Since we use Supabase, backups are handled automatically. You can also create manual backups from the Supabase dashboard.

### Files
If using local file storage, backup the volumes:

```bash
docker run --rm -v menutrail_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz /data
```

## Scaling

For high traffic, consider:

1. **Multiple containers**: Use `docker-compose up -d --scale menutrail=3`
2. **Load balancer**: Add Nginx or Traefik as load balancer
3. **CDN**: Use Cloudflare for static assets and DDoS protection
4. **Database**: Upgrade Supabase plan for more connections

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs menutrail

# Check if port is in use
sudo lsof -i :3000
```

### Database connection issues
```bash
# Test connection from container
docker-compose exec menutrail npx prisma db pull
```

### Build fails
```bash
# Clear Docker cache
docker builder prune -a

# Rebuild from scratch
docker-compose build --no-cache
```
