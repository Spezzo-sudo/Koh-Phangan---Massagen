# Phangan Serenity - Mobile Wellness Platform 🏝️

**Status:** Production-Ready MVP with Real Backend

This is a React-based Single Page Application (SPA) for booking mobile massage and beauty services on Koh Phangan, Thailand.
It functions like "Uber for Massages" - therapists travel to the customer's location.

## ⚡ What's Ready

✅ **Real Authentication** - Email/Password signup with Supabase Auth
✅ **Live Database** - Supabase PostgreSQL with proper schema
✅ **Email Notifications** - Ready for Resend.com integration
✅ **Production Deployment** - Deploy to Vercel or Hostinger
✅ **Test Data** - Seeding scripts for therapists, customers, services
✅ **Mobile Responsive** - Tailwind CSS mobile-first design
✅ **Type Safe** - Full TypeScript support

## 📚 Getting Started

### For New Developers (Read in Order)

1. **[QUICKSTART.md](QUICKSTART.md)** - Setup in 5 minutes
2. **[USER_CREATION_FLOW.md](USER_CREATION_FLOW.md)** - How users sign up (READ THIS IF CONFUSED)
3. **[AGENTS.md](AGENTS.md)** - Business logic & architecture
4. **[TECH_SPEC.md](TECH_SPEC.md)** - Database schema
5. **[SEEDING.md](SEEDING.md)** - How to add test data
6. **[PRODUCTION.md](PRODUCTION.md)** - Deployment guide

### Quick Setup

```bash
npm install
cp .env.example .env  # Fill with Supabase credentials
npm run dev           # http://localhost:5174
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS |
| **State** | React Context API |
| **Backend** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth + JWT |
| **Email** | Resend.com (production) |
| **Maps** | Google Maps API (prepared) |
| **Hosting** | Vercel or Hostinger VPS |

## 🎯 Key Features

### Customer Features
- Browse available therapists & services
- Book appointments to your location
- View booking history & status
- Cancel with full refund (5+ hours)
- Real email notifications

### Therapist Features
- View assigned bookings
- Update availability & blocked slots
- Manage schedule
- Real-time notifications

### Admin Features
- Dashboard with analytics
- Manage therapists & services
- View all bookings
- Financial reports

## 🔐 Authentication

Three user roles with separate dashboards:
- **Customer** - Book massages
- **Therapist** - Manage jobs
- **Admin** - System management

All secured with Supabase Row-Level Security (RLS)

## 📦 Database Structure

```
profiles (users)
├── id (auth user)
├── email
├── role (customer|therapist|admin)
├── full_name
└── [therapist fields: skills, available, etc]

services
├── id
├── title, description
├── price_60, price_90
├── category (Massage|Nails|Packages)
└── staff_required

bookings
├── id
├── customer_id → profiles
├── therapist_id → profiles
├── service_id → services
├── scheduled_date, scheduled_time
├── status (pending|confirmed|completed|cancelled)
└── location, gps coordinates
```

## 🚀 Deployment

### Easiest: Vercel (Recommended)

```bash
git push origin main
# Go to vercel.com → Import project → Done!
```

### Self-Hosted: Hostinger VPS

See [PRODUCTION.md](PRODUCTION.md) for Nginx + PM2 setup

## 🔧 Environment Variables

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-maps-key
VITE_RESEND_API_KEY=your-resend-key      # Optional (prod)
VITE_EMAIL_FROM=noreply@yourdomain.com   # Optional (prod)
```

## 📊 Project Status

### Phase 1: MVP (✅ Complete)
- [x] Real authentication
- [x] Database integration
- [x] Booking system
- [x] Email notifications (infrastructure ready)
- [x] Production docs

### Phase 2: Polish (🔄 In Progress)
- [ ] Admin dashboard
- [ ] Payment processing (Stripe)
- [ ] Analytics
- [ ] Performance optimization

### Phase 3: Scale
- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Advanced scheduling
- [ ] Reviews & ratings

## 📱 Browser Support

- iOS Safari 12+
- Chrome Android
- Desktop (all modern browsers)

## 🤖 AI Development

For AI agents (Claude, Cursor, etc.):

```
READ FIRST: AGENTS.md → TECH_SPEC.md → Code
```

Key constraints:
- Never delete mock data (fallback safety)
- Always test with both dev & prod data
- Maintain type safety
- Keep RLS policies updated

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Supabase not configured" | Check .env file |
| "Email not sending (dev)" | Check browser console |
| "Build fails" | `npm install` && `npm run build` |
| "Auth not working" | Create test users in Supabase Auth tab |

## 📞 Support

- **Docs**: See markdown files in repo
- **Supabase Issues**: https://supabase.com/docs
- **React Questions**: https://react.dev
- **Deployment**: Check PRODUCTION.md

## 📄 License

MIT License - See LICENSE file

---

**Ready to deploy?** → See [PRODUCTION.md](PRODUCTION.md)
**Need test data?** → See [SEEDING.md](SEEDING.md)
**Want to code?** → See [AGENTS.md](AGENTS.md)
