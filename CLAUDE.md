# Phangan Serenity - AI Context Guide

## 🚀 Project Overview
This is a **React + Vite + Supabase** application for a Massage & Wellness Shop in Koh Phangan.
It includes:
- **Booking System**: Customers book slots; Staff manages schedule.
- **Shop**: Customers buy products (Coconut Oil, etc.).
- **Admin Dashboard**: For managing orders and bookings.

## 🏗️ Core Architecture
- **Frontend**: React, TailwindCSS, Lucide Icons.
- **Backend**: Supabase (Postgres, Auth, Edge Functions).
- **State Management**: `contexts.tsx` (Hybrid: Local State + Supabase Sync).
- **Routing**: `react-router-dom` with `ProtectedRoute.tsx`.

## 📂 Key Files (Read These First)
- **`types.ts`**: The source of truth for all data models (User, Booking, Order).
- **`contexts.tsx`**: The main business logic hub.
- **`lib/queries.ts`**: React Query hooks for fetching data.
- **`App.tsx`**: Main routing configuration.

## 🚫 Ignored Context (Do Not Read)
To save context window, **IGNORE** these unless specifically asked:
- `node_modules/`
- `dist/`
- `public/` (Images)
- `docs/archive/`
- `*.sql` (Use `types.ts` for schema reference instead)

## 💡 Coding Guidelines
1.  **Strict Types**: Always use interfaces from `types.ts`.
2.  **Supabase First**: All new logic must use Supabase, not mock data.
3.  **Role Security**: Always check `user.role` before allowing sensitive actions.
4.  **UI Consistency**: Use Lucide icons (no emojis) and Tailwind classes.
