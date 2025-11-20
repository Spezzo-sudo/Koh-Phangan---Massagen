
export enum ServiceType {
  THAI = 'Thai Massage',
  OIL = 'Oil Massage',
  DEEP_TISSUE = 'Deep Tissue',
  FOOT = 'Foot Reflexology',
  ALOE_VERA = 'Aloe Vera Sunburn',
  MANICURE = 'Manicure',
  PEDICURE = 'Pedicure',
  NAIL_ART = 'Nail Art & Gel',
  PACKAGE = 'Wellness Package'
}

export type ServiceCategory = 'Massage' | 'Nails' | 'Packages';

export interface Service {
  id: string;
  title: string;
  description: string;
  price60: number; // Base price (often for ~60 mins or standard treatment)
  price90: number; // Extended price (or premium version)
  type: ServiceType;
  category: ServiceCategory; // New field for filtering
  image: string;
}

export interface Addon {
    id: string;
    title: string;
    price: number;
    description: string;
}

export interface Therapist {
  id: string;
  name: string;
  image: string;
  skills: ServiceType[];
  bio: string;
  rating: number;
  available: boolean;
  locationBase: string; // Where they are based
  verified?: boolean;
  reviewCount?: number;
  recentReview?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Booking {
  id: string;
  serviceId: string;
  therapistId: string;
  date: string;
  time: string;
  duration: 60 | 90;
  addons: string[]; // Array of Addon IDs
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  location: string; // Address or Hotel Name
  coordinates?: { lat: number; lng: number }; // For Maps
  notes?: string;
  status: 'pending' | 'confirmed' | 'on_way' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'declined';
}

export type CreateBookingInput = Omit<Booking, 'id' | 'status'>;

export interface User {
  id: string;
  role: 'customer' | 'therapist' | 'admin';
  name: string;
  email: string;
  avatar_url?: string; // Supabase often uses snake_case
}

export type Language = 'en' | 'de' | 'th' | 'fr' | 'es' | 'zh' | 'hi' | 'ar';

// --- SUPABASE DATABASE TYPES (SQL MIRROR) ---
export interface DB_Booking {
  id: string;
  created_at: string;
  customer_id: string;
  therapist_id: string;
  service_id: string;
  scheduled_date: string; // ISO timestamp
  scheduled_time: string; // e.g "14:00"
  duration: number;
  total_price: number;
  status: string;
  location_text: string;
  notes: string | null;
}

export type Database = any;
