
import { Addon } from './types';

// ⚠️ NOTE: SERVICES are now loaded from Supabase public.services table
// See lib/queries.ts useServices() hook
// For test data, run SEED_DATA.sql in Supabase SQL Editor

export const BOOKING_ADDONS: Addon[] = [
    {
        id: 'a1',
        title: 'Tiger Balm Upgrade',
        price: 100,
        description: 'Apply cooling Tiger Balm to specific problem areas.',
        validFor: ['Massage', 'Packages']
    },
    {
        id: 'a2',
        title: 'Premium Coconut Oil',
        price: 50,
        description: 'Upgrade to 100% organic cold-pressed coconut oil.',
        validFor: ['Massage', 'Packages']
    },
    {
        id: 'a3',
        title: 'Gel Polish Removal',
        price: 200,
        description: 'Professional removal of old gel polish.',
        validFor: ['Nails', 'Packages']
    },
    {
        id: 'a4',
        title: 'Nail Art (Per Finger)',
        price: 50,
        description: 'Custom design on a single nail.',
        validFor: ['Nails', 'Packages']
    },
    {
        id: 'a5',
        title: 'Fake Lashes',
        price: 150,
        description: 'High quality lashes for your night out.',
        validFor: ['Packages']
    }
];

// ⚠️ NOTE: THERAPISTS are now loaded from Supabase public.profiles table WHERE role='therapist'
// See lib/queries.ts useTherapists() hook

// ⚠️ NOTE: PRODUCTS are now loaded from Supabase public.products table
// See lib/queries.ts (to be created)
// For now, shop feature is not using real database yet

export const TIME_SLOTS = [
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export const KOH_PHANGAN_LOCATIONS = [
    "Thong Sala Pier, Koh Phangan",
    "Haad Rin Beach (Full Moon Party)",
    "Srithanu Zen Beach",
    "Haad Yao Beach",
    "Secret Beach (Haad Son)",
    "Bottle Beach",
    "Thong Nai Pan Noi",
    "Thong Nai Pan Yai",
    "Baan Tai 7-Eleven",
    "Chaloklum Fishing Village",
    "Koh Ma (Mae Haad)",
    "Than Sadet Waterfall"
];

// ⚠️ NOTE: BOOKINGS are now loaded from Supabase public.bookings table
// See lib/queries.ts useBookings() hook

// ⚠️ NOTE: EXPENSES are now loaded from Supabase public.expenses table (if feature is implemented)
// Admin dashboard should fetch from DB, not constants
