# 🚀 Quick Start Guide

## Development Setup (First Time)

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/phangan-serenity.git
cd phangan-serenity

# 2. Install dependencies
npm install

# 3. Configure environment
# Copy .env.example to .env and fill in your Supabase credentials
cp .env.example .env

# 4. Start dev server
npm run dev
# App will be at: http://localhost:5174/

# 5. In another terminal, seed test data
# Option A: Use SQL Editor (see SEEDING.md)
# Option B: Node script
node seed.js
```

## Quick Commands

```bash
# Development
npm run dev          # Start dev server

# Build & Deploy
npm run build        # Build for production (creates /dist folder)
npm run preview      # Preview production build locally

# Database
node seed.js         # Seed test data (requires .env configured)

# Testing
npm test             # Run tests (when setup)
```

## Create Test Users

1. Go to Supabase Auth tab
2. Click **+ Create new user**
3. Add test email & password
4. Set User Metadata:
```json
{
  "full_name": "Test User",
  "role": "customer"
}
```

### Pre-seeded Test Accounts (After running seed.js)

**Therapist:**
- Email: `ms.ang@phanganserenity.com`
- Password: (set it in Auth tab)

**Customer:**
- Email: `john@example.com`
- Password: (set it in Auth tab)

**Admin:**
- Email: `admin@phanganserenity.com`
- Password: (set it in Auth tab)

## Email Setup

### Development (No Setup Needed)
- Emails are logged to console
- No API key required

### Production (Resend)
1. Create account at [resend.com](https://resend.com)
2. Get API key
3. Add to `.env`:
```
VITE_RESEND_API_KEY=re_xxxxx
VITE_EMAIL_FROM=bookings@yourdomain.com
```

## Deployment to Vercel

```bash
# 1. Create GitHub repo
git init
git add .
git commit -m "Initial commit"
git push -u origin main

# 2. Go to vercel.com
# - Click "New Project"
# - Import your GitHub repo
# - Add Environment Variables (from .env)
# - Click Deploy!

# 3. That's it! Your app is live
```

## Common Issues

### "Supabase not configured"
- Check `.env` file exists with correct values
- Make sure VITE_ prefix is there

### "Email not sending"
- For dev: Check browser console
- For prod: Check Resend dashboard

### "Build fails"
- Run `npm install` again
- Clear node_modules: `rm -rf node_modules && npm install`

## Project Structure

```
phangan-serenity/
├── pages/              # Page components
├── components/         # Reusable UI components
├── lib/                # Services (Supabase, Email, etc)
├── hooks/              # Custom React hooks
├── contexts.tsx        # State management
├── types.ts            # TypeScript types
├── constants.ts        # Mock data & constants
├── .env                # Secrets (DO NOT commit)
├── .env.example        # Template (commit this)
├── PRODUCTION.md       # Deployment guide
├── SEEDING.md          # Data seeding guide
├── TECH_SPEC.md        # Database schema
├── AGENTS.md           # Business logic
└── README.md           # Project overview
```

## Important Docs

- **PRODUCTION.md** - Full deployment guide
- **SEEDING.md** - How to add test data
- **TECH_SPEC.md** - Database schema & config
- **AGENTS.md** - Business rules & architecture

## Next Steps

1. ✅ Setup dev environment
2. ✅ Create test users
3. ✅ Test booking flow
4. ✅ Configure email (Resend)
5. ⬜ Build admin dashboard
6. ⬜ Add payment processing (Stripe)
7. ⬜ Deploy to production

## Support

- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev

---

**Questions?** Check the other markdown files in the repo!
