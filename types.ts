
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
  staffRequired?: number; // New: Number of staff members required (e.g. 2 for packages)
}

export interface Addon {
    id: string;
    title: string;
    price: number;
    description: string;
    validFor?: ServiceCategory[]; // Optional: Restrict addon to specific categories
}

export interface Therapist {
  id: string;
  name: string;
  image: string;
  skills: ServiceType[];
  bio: string;
  rating: number;
  available: boolean; // Global "On/Off" switch
  locationBase: string; // Where they are based
  verified?: boolean;
  reviewCount?: number;
  recentReview?: string;
  socialHandles?: {
      instagram?: string;
      facebook?: string;
      website?: string;
  };
  // NEW: Specific blocked slots (e.g. "2024-03-20T14:00")
  blockedSlots?: string[]; 
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
  customerEmail?: string; // Added for email notifications
  customerPhone: string;
  location: string; // Address or Hotel Name
  coordinates?: { lat: number; lng: number }; // For Maps
  notes?: string;
  status: 'pending' | 'confirmed' | 'on_way' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'declined';
}

export type CreateBookingInput = Omit<Booking, 'id' | 'status'>;

// --- NEW: EXPENSES FOR ADMIN DASHBOARD ---
export interface Expense {
    id: string;
    title: string;
    amount: number;
    date: string;
    category: 'marketing' | 'supplies' | 'salary' | 'commission' | 'other';
    type: 'expense'; // discriminator
    attachmentUrl?: string; // URL to the uploaded receipt (Image/PDF)
}

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

export interface DataContextType {
  bookings: Booking[];
  addBooking: (booking: CreateBookingInput) => Promise<void>; // Async now
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>; // Async now
  
  // Availability Management
  therapists: Therapist[];
  toggleTherapistBlock: (therapistId: string, date: string, time: string) => void;
  checkAvailability: (therapistId: string, date: string, time: string, duration: number) => boolean;
  updateTherapist: (id: string, updates: Partial<Therapist>) => Promise<void>; // NEW: For Admin Management

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  // Admin / Financials
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'type'>) => Promise<void>;
  // UI States (HARDENING Phase 0)
  isLoading: boolean;
  error: string | null;
}
