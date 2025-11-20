# Phangan Serenity - Mobile Wellness Platform 🏝️

**Status:** MVP / High-Fidelity Prototype (Mock Data)

This is a React-based Single Page Application (SPA) for booking mobile massage and beauty services on Koh Phangan, Thailand. 
It functions like "Uber for Massages" - therapists travel to the customer's location.

## 🤖 For AI Agents & Developers

If you are an AI Coding Agent (Claude, Cursor, Windsurf, etc.) or a new developer joining the project, **please read these files in order before writing code:**

1.  **`AGENTS.md`** - **START HERE.** The "Brain" of the project. Business logic, architectural decisions, and domain context.
2.  **`.cursorrules`** - Coding standards, UI guidelines, and restricted files.
3.  **`TODO_NEXT.md`** - The immediate roadmap for migrating from Mock Data to Live Data.
4.  **`TECH_SPEC.md`** - Database schema (SQL) and technical configuration details.

## 🚀 Quick Start

1.  Install dependencies: `npm install`
2.  Start development server: `npm run dev`
3.  The app will run in "Mock Mode" by default (no API keys required).

## 🛠️ Tech Stack

*   **Frontend:** React 18, Vite, TypeScript
*   **Styling:** Tailwind CSS (Mobile First)
*   **Icons:** Lucide React
*   **State:** React Context API (`DataContext`, `AuthContext`)
*   **Backend (Planned):** Supabase (PostgreSQL + Auth)
*   **Maps (Planned):** Google Maps Platform (Places API)

## ⚠️ Crucial Architecture Note

The application currently uses a **Service Layer Pattern** to abstract data sources.
*   `constants.ts` contains Mock Data.
*   `lib/supabase.ts` and `hooks/usePlacesAutocomplete.ts` are the bridge to real data.
*   **DO NOT** delete the mock data until the backend connection is fully verified.
