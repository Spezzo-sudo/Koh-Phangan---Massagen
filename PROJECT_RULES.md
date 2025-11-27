# Project Rules & Coding Standards

## Core Principles
1. **No Emojis in UI**: Use Lucide React icons instead of emojis for all UI elements.
2. **Strict TypeScript**: No `any` types. All data structures must have explicit interfaces.
3. **Premium Design**: All UI must feel polished and professional, not like an MVP.

## Code Organization
1. **File Size Limit**: If a component exceeds 250 lines, refactor into smaller sub-components.
2. **Centralized Logic**: Shared utilities go in `lib/utils.ts`, shared hooks in `hooks/`.
3. **Type Definitions**: All shared types live in `types.ts` or `types/index.ts`.

## Data Management
1. **React Query First**: All data fetching uses React Query hooks from `lib/queries.ts`.
2. **No Mock Data in Components**: Mock data belongs in `data/mocks.ts`, not hardcoded in components.
3. **Database First**: Design the Supabase schema before writing React code.

## Naming Conventions
1. **Components**: PascalCase (e.g., `BookingPage.tsx`)
2. **Hooks**: camelCase with `use` prefix (e.g., `useServices`)
3. **Utilities**: camelCase (e.g., `formatPrice`)

## Documentation
1. **Source of Truth**: `TECH_SPEC.md` and `ROADMAP.md` must always be current.
2. **No Dead Code**: Delete unused code instead of commenting it out.
3. **Archiving**: Old docs go to `docs/archive/`, not the project root.

## AI Collaboration
1. **Context Hygiene**: Keep the project root clean. Use `.claudignore` and `.cursorignore`.
2. **Concept First**: For complex features, create a concept doc before coding.
3. **Modular Components**: Smaller files = better AI context management.
