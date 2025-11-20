import { Service, ServiceType, Therapist, Product, Booking, Addon, Expense } from './types';

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
    image: 'https://picsum.photos/id/106/800/600',
    staffRequired: 1
  },
  {
    id: 's2',
    title: 'Aroma Oil Massage',
    description: 'Gentle massage using aromatic essential oils to promote relaxation and rejuvenate the skin.',
    price60: 400,
    price90: 600,
    type: ServiceType.OIL,
    category: 'Massage',
    image: 'https://picsum.photos/id/65/800/600',
    staffRequired: 1
  },
  {
    id: 's3',
    title: 'Deep Tissue Sports',
    description: 'Focuses on realigning deeper layers of muscles and connective tissue. Great for chronic aches.',
    price60: 500,
    price90: 750,
    type: ServiceType.DEEP_TISSUE,
    category: 'Massage',
    image: 'https://picsum.photos/id/338/800/600',
    staffRequired: 1
  },
  {
    id: 's4',
    title: 'Aloe Vera After Sun',
    description: 'Cooling treatment for sun-damaged skin. Essential after a long day at Haad Rin beach.',
    price60: 400,
    price90: 600,
    type: ServiceType.ALOE_VERA,
    category: 'Massage',
    image: 'https://picsum.photos/id/360/800/600',
    staffRequired: 1
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
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    staffRequired: 1
  },
  {
    id: 'n2',
    title: 'Luxury Pedicure',
    description: 'Complete foot care with soak, scrub, callus removal, massage and polish.',
    price60: 650, // Standard
    price90: 1100, // Luxury Spa Version
    type: ServiceType.PEDICURE,
    category: 'Nails',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=800&q=80',
    staffRequired: 1
  },
  {
    id: 'n3',
    title: 'Gel Polish Extension',
    description: 'Long-lasting gel polish with nail extension options.',
    price60: 800,
    price90: 1200,
    type: ServiceType.NAIL_ART,
    category: 'Nails',
    image: 'https://images.unsplash.com/photo-1632345031635-fe1822b5d8c2?auto=format&fit=crop&w=800&q=80',
    staffRequired: 1
  },
  // --- PACKAGES & EVENTS ---
  {
    id: 'pk1',
    title: 'Bridal Glow Package',
    description: 'The full experience: Manicure, Pedicure, and a relaxing Aroma Massage. (Note: 2 Specialists will attend)',
    price60: 1500, // 2 Hours approx
    price90: 2500, // 3 Hours Premium
    type: ServiceType.PACKAGE,
    category: 'Packages',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
    staffRequired: 2 // Requires 1 Massage + 1 Nail artist
  },
  {
    id: 'pk2',
    title: 'Full Moon Party Neon Glow',
    description: 'Professional Neon Body Paint & Waterproof Makeup for the biggest party on earth. We come to your hostel/hotel.',
    price60: 600, 
    price90: 1000, // Group session or full body
    type: ServiceType.PACKAGE,
    category: 'Packages',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    staffRequired: 1
  }
];

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

export const THERAPISTS: Therapist[] = [
  {
    id: 't1',
    name: 'Ms. Ang',
    image: 'https://picsum.photos/id/64/300/300',
    skills: [ServiceType.THAI, ServiceType.FOOT, ServiceType.PACKAGE],
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
    skills: [ServiceType.THAI, ServiceType.OIL, ServiceType.DEEP_TISSUE, ServiceType.ALOE_VERA, ServiceType.PACKAGE],
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
    recentReview: "Her nail art is amazing! So precise.",
    socialHandles: {
        instagram: 'may.nails.phangan',
        facebook: 'maybeautyphangan'
    }
  },
  {
    id: 't5',
    name: 'Ms. Pim',
    image: 'https://images.unsplash.com/photo-1595239960035-78cb77234264?auto=format&fit=crop&w=300&q=80',
    skills: [ServiceType.MANICURE, ServiceType.PEDICURE, ServiceType.NAIL_ART, ServiceType.PACKAGE],
    bio: 'Expert in Gel and Acrylic extensions. Creative designs.',
    rating: 4.8,
    available: true,
    locationBase: 'Thong Sala',
    verified: true,
    reviewCount: 18,
    recentReview: "Love my new nails, thank you!",
    socialHandles: {
        instagram: 'pim_creative_nails'
    }
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
  },
  // NEW COSMETICS
  {
    id: 'p4',
    name: 'OPI Nail Polish - Phangan Red',
    description: 'Long lasting premium nail polish in signature red.',
    price: 350,
    image: 'https://images.unsplash.com/photo-1632345031635-fe1822b5d8c2?auto=format&fit=crop&w=400&q=80',
    category: 'Nail Polish'
  },
  {
    id: 'p5',
    name: 'Waterproof Mascara',
    description: 'Perfect for humid tropical weather. Smudge-proof.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80',
    category: 'Makeup'
  },
  {
    id: 'p6',
    name: 'SPF 30 Lip Balm',
    description: 'Protect your lips from the strong island sun.',
    price: 150,
    image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=400&q=80',
    category: 'Makeup'
  }
];

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
  },
  {
    id: 'b3',
    serviceId: 's3',
    therapistId: 't2',
    date: new Date(Date.now() - 172800000).toISOString(),
    time: '16:00',
    duration: 60,
    addons: [],
    totalPrice: 500,
    customerName: 'Mike Ross',
    customerPhone: '+1 202 555 0199',
    location: 'Bottle Beach Resort',
    status: 'completed'
  }
];

export const MOCK_EXPENSES: Expense[] = [
    {
        id: 'e1',
        title: 'New Coconut Oil Stock (5L)',
        amount: 1200,
        date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        category: 'supplies',
        type: 'expense'
    },
    {
        id: 'e2',
        title: 'Facebook Ads - Full Moon Promo',
        amount: 2000,
        date: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        category: 'marketing',
        type: 'expense'
    },
    {
        id: 'e3',
        title: 'Staff Uniforms (New Team)',
        amount: 1500,
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        category: 'other',
        type: 'expense'
    }
];