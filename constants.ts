
import { Service, ServiceType, Therapist, Product, Booking, Addon } from './types';

export const SERVICES: Service[] = [
  // --- MASSAGES ---
  {
    id: 's1',
    title: 'Traditional Thai Massage',
    description: 'Ancient healing system combining acupressure, Indian Ayurvedic principles, and assisted yoga postures.',
    price60: 300,
    price90: 450,
    type: ServiceType.THAI,
    category: 'Massage',
    image: 'https://picsum.photos/id/106/800/600'
  },
  {
    id: 's2',
    title: 'Aroma Oil Massage',
    description: 'Gentle massage using aromatic essential oils to promote relaxation and rejuvenate the skin.',
    price60: 400,
    price90: 600,
    type: ServiceType.OIL,
    category: 'Massage',
    image: 'https://picsum.photos/id/65/800/600'
  },
  {
    id: 's3',
    title: 'Deep Tissue Sports',
    description: 'Focuses on realigning deeper layers of muscles and connective tissue. Great for chronic aches.',
    price60: 500,
    price90: 750,
    type: ServiceType.DEEP_TISSUE,
    category: 'Massage',
    image: 'https://picsum.photos/id/338/800/600'
  },
  {
    id: 's4',
    title: 'Aloe Vera After Sun',
    description: 'Cooling treatment for sun-damaged skin. Essential after a long day at Haad Rin beach.',
    price60: 400,
    price90: 600,
    type: ServiceType.ALOE_VERA,
    category: 'Massage',
    image: 'https://picsum.photos/id/360/800/600'
  },
  // --- NAILS & BEAUTY ---
  {
    id: 'n1',
    title: 'Classic Manicure',
    description: 'Nail shaping, cuticle care, hand massage, and regular polish application.',
    price60: 550, // Standard
    price90: 950, // Spa Version (scrub + mask)
    type: ServiceType.MANICURE,
    category: 'Nails',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'n2',
    title: 'Luxury Pedicure',
    description: 'Complete foot care with soak, scrub, callus removal, massage and polish.',
    price60: 650, // Standard
    price90: 1100, // Luxury Spa Version
    type: ServiceType.PEDICURE,
    category: 'Nails',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'n3',
    title: 'Gel Polish Extension',
    description: 'Long-lasting gel polish with nail extension options.',
    price60: 800,
    price90: 1200,
    type: ServiceType.NAIL_ART,
    category: 'Nails',
    image: 'https://images.unsplash.com/photo-1632345031635-fe1822b5d8c2?auto=format&fit=crop&w=800&q=80'
  },
  // --- PACKAGES ---
  {
    id: 'pk1',
    title: 'Bridal Glow Package',
    description: 'The full experience: Manicure, Pedicure, and a relaxing Aroma Massage.',
    price60: 1500, // 2 Hours approx
    price90: 2500, // 3 Hours Premium
    type: ServiceType.PACKAGE,
    category: 'Packages',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80'
  }
];

export const BOOKING_ADDONS: Addon[] = [
    {
        id: 'a1',
        title: 'Tiger Balm Upgrade',
        price: 100,
        description: 'Apply cooling Tiger Balm to specific problem areas.'
    },
    {
        id: 'a2',
        title: 'Premium Coconut Oil',
        price: 50,
        description: 'Upgrade to 100% organic cold-pressed coconut oil.'
    },
    {
        id: 'a3',
        title: 'Gel Polish Removal',
        price: 200,
        description: 'Professional removal of old gel polish.'
    },
    {
        id: 'a4',
        title: 'Nail Art (Per Finger)',
        price: 50,
        description: 'Custom design on a single nail.'
    }
];

export const THERAPISTS: Therapist[] = [
  {
    id: 't1',
    name: 'Ms. Ang',
    image: 'https://picsum.photos/id/64/300/300',
    skills: [ServiceType.THAI, ServiceType.FOOT],
    bio: 'Specialist in traditional Wat Pho style Thai massage. 15 years experience.',
    rating: 4.9,
    available: true,
    locationBase: 'Thong Sala',
    verified: true,
    reviewCount: 124,
    recentReview: "Best Thai massage I've ever had!"
  },
  {
    id: 't2',
    name: 'Ms. Noi',
    image: 'https://picsum.photos/id/331/300/300',
    skills: [ServiceType.THAI, ServiceType.OIL, ServiceType.DEEP_TISSUE, ServiceType.ALOE_VERA],
    bio: 'All-rounder with strong hands for deep tissue and a gentle touch for oil massage.',
    rating: 4.8,
    available: true,
    locationBase: 'Srithanu',
    verified: true,
    reviewCount: 89,
    recentReview: "Fixed my back pain in one session."
  },
  {
    id: 't3',
    name: 'Ms. Lek',
    image: 'https://picsum.photos/id/342/300/300',
    skills: [ServiceType.OIL, ServiceType.ALOE_VERA],
    bio: 'Expert in aromatherapy and skin care treatments.',
    rating: 4.7,
    available: false, // Currently offline
    locationBase: 'Haad Rin',
    verified: false,
    reviewCount: 45,
    recentReview: "Very relaxing and professional."
  },
  {
    id: 't4',
    name: 'Ms. May',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    skills: [ServiceType.MANICURE, ServiceType.PEDICURE, ServiceType.NAIL_ART, ServiceType.PACKAGE, ServiceType.FOOT],
    bio: 'Certified Nail Technician & Beauty specialist. Brings the spa to your villa.',
    rating: 4.9,
    available: true,
    locationBase: 'Baan Tai',
    verified: true,
    reviewCount: 32,
    recentReview: "Her nail art is amazing! So precise."
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Organic Coconut Oil',
    description: '100% Cold pressed Koh Phangan Coconut Oil.',
    price: 250,
    image: 'https://picsum.photos/id/24/400/400',
    category: 'Oils'
  },
  {
    id: 'p2',
    name: 'Tiger Balm Red',
    description: 'Classic relief for muscular aches and pains.',
    price: 120,
    image: 'https://picsum.photos/id/412/400/400',
    category: 'Balms'
  },
  {
    id: 'p3',
    name: 'Lemongrass Essential Oil',
    description: 'Pure essential oil to keep mosquitoes away and smell fresh.',
    price: 180,
    image: 'https://picsum.photos/id/504/400/400',
    category: 'Aroma'
  }
];

export const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

// Mock Data for Google Maps Autocomplete
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

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    serviceId: 's1',
    therapistId: 't1',
    date: new Date().toISOString(),
    time: '14:00',
    duration: 60,
    addons: [],
    totalPrice: 300,
    customerName: 'John Doe',
    customerPhone: '+66 123 456 789',
    location: 'Srithanu Zen Beach Bungalows, Bungalow B4',
    status: 'confirmed'
  },
  {
    id: 'b2',
    serviceId: 's2',
    therapistId: 't1',
    date: new Date(Date.now() + 86400000).toISOString(),
    time: '10:00',
    duration: 90,
    addons: ['a1'],
    totalPrice: 700,
    customerName: 'Sarah Smith',
    customerPhone: '+49 151 444 555',
    location: 'Baan Tai Villas',
    status: 'pending'
  }
];
