# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

### 1. Security
- [ ] **Supabase RLS Policies** - Verify all tables have Row-Level Security enabled
- [ ] **API Keys** - Never commit `.env` file. Use `.env.example` as template
- [ ] **CORS Configuration** - Set correct domain in Supabase project settings
- [ ] **Input Validation** - All form inputs validated on frontend & backend
- [ ] **HTTPS** - Domain has valid SSL certificate

### 2. Database
- [ ] **Backup Strategy** - Enable automated Supabase backups
- [ ] **Indexes** - Add indexes on frequently queried fields:
  - `bookings.customer_id`
  - `bookings.therapist_id`
  - `bookings.scheduled_date`
- [ ] **Constraints** - All foreign keys properly configured
- [ ] **Test Data** - Load sample therapists, services, bookings

### 3. Frontend
- [ ] **Environment Variables** - Production URLs set correctly
- [ ] **Build Optimization**:
  - [ ] Remove console.log() statements
  - [ ] Enable minification (automatic via Vite)
  - [ ] Test bundle size: `npm run build`
- [ ] **Performance**:
  - [ ] Images optimized (use Supabase Storage)
  - [ ] Code splitting active (lazy routes)
  - [ ] LCP optimized

### 4. Authentication
- [ ] **Email Verification** - Supabase email templates configured
- [ ] **Password Reset** - Email links working properly
- [ ] **Session Management** - Tokens properly stored & refreshed
- [ ] **Role-Based Access** - Customer/Therapist/Admin dashboards secured

### 5. Email Service
- [ ] **Replace Mock Email** - Implement real service:
  - Option A: Resend.com (recommended for SaaS)
  - Option B: SendGrid
  - Option C: Supabase Edge Functions
- [ ] **Email Templates** - Design booking confirmation, cancellation, etc.
- [ ] **Test Email Delivery** - Send test emails to actual addresses

### 6. Payment (If applicable)
- [ ] **Stripe Integration** - Public/Secret keys configured
- [ ] **PCI Compliance** - Never store card data locally
- [ ] **Webhook Handling** - Payment success/failure flows

### 7. Monitoring & Logging
- [ ] **Error Tracking** - Set up Sentry or similar
- [ ] **Analytics** - Google Analytics or alternative
- [ ] **Uptime Monitoring** - UptimeRobot or similar
- [ ] **Database Logs** - Monitor Supabase logs for errors

### 8. Hosting Options (Recommended for Hostinger)

#### Option A: Hostinger App Platform (Easiest)
- Push code to GitHub
- Connect to Hostinger App Platform
- Auto-deploys on push
- Includes free SSL

#### Option B: Hostinger VPS + Docker
- Deploy via Docker container
- More control, slightly more setup
- Can run background jobs if needed

#### Option C: Vercel/Netlify (Recommended)
- Free tier available
- Automatic CI/CD
- Edge functions support
- Easiest to scale

## Deployment Steps (Vercel)

```bash
# 1. Create GitHub repo
git init
git add .
git commit -m "Initial commit"
git push -u origin main

# 2. Go to vercel.com, import project
# 3. Add environment variables in Vercel dashboard
# 4. Deploy!
```

## Deployment Steps (Hostinger VPS)

```bash
# 1. SSH into VPS
ssh root@your-vps-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone repo
cd /var/www
git clone https://github.com/yourusername/phangan-serenity.git
cd phangan-serenity

# 4. Install & build
npm install
npm run build

# 5. Install PM2 (process manager)
sudo npm install -g pm2

# 6. Create PM2 config
cat > ecosystem.config.js << 'EOFPM2'
module.exports = {
  apps: [{
    name: 'phangan-serenity',
    script: './server.js', // You'll need to create this
    instances: 'max',
    exec_mode: 'cluster',
    env: { NODE_ENV: 'production' }
  }]
};
EOFPM2

# 7. Start app
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# 8. Setup Nginx reverse proxy
# (See Nginx config below)
```

## Nginx Configuration (For VPS)

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificate (install certbot first)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment

1. **Test User Registration** - Create customer, therapist, admin accounts
2. **Test Booking Flow** - Complete a test booking end-to-end
3. **Email Verification** - Check confirmation emails arrive
4. **Mobile Testing** - Test on real iPhone & Android
5. **Performance Check** - Run Lighthouse audit
6. **Monitor Logs** - Watch for errors in first 24 hours

## Domains (DNS)

If using custom domain (recommended for production):

1. Buy domain on Hostinger
2. Point A record to server IP or Vercel IP
3. Add CNAME for www
4. Wait 24 hours for DNS propagation
5. Enable SSL (auto with Vercel/Certbot)

## Environment Variables (Production)

```bash
# Use Supabase production project
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Use production Google Maps key
VITE_GOOGLE_MAPS_API_KEY=your-production-google-key

# Email service
VITE_EMAIL_API_KEY=your-production-email-key
VITE_EMAIL_FROM=bookings@phanganserenity.com

# Optional: Stripe
VITE_STRIPE_PUBLIC_KEY=your-production-stripe-key
```

## Monitoring Tools

- **Errors**: Sentry.io
- **Analytics**: Google Analytics
- **Uptime**: UptimeRobot
- **Performance**: Vercel Analytics or New Relic
- **Database**: Supabase Dashboard

## Support & Troubleshooting

- Supabase Issues: https://supabase.com/docs
- Deployment Issues: Check deployment logs
- Auth Issues: Check Supabase Auth settings
- Email Issues: Check spam folder, logs

---

**Questions?** Check AGENTS.md, TECH_SPEC.md, or TODO_NEXT.md
