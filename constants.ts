
import { Service, ServiceType, Therapist, Product, Booking } from './types';

export const SERVICES: Service[] = [
  {
    id: 's1',
    title: 'Traditional Thai Massage',
    description: 'Ancient healing system combining acupressure, Indian Ayurvedic principles, and assisted yoga postures.',
    price60: 300,
    price90: 450,
    type: ServiceType.THAI,
    image: 'https://picsum.photos/id/106/800/600'
  },
  {
    id: 's2',
    title: 'Aroma Oil Massage',
    description: 'Gentle massage using aromatic essential oils to promote relaxation and rejuvenate the skin.',
    price60: 400,
    price90: 600,
    type: ServiceType.OIL,
    image: 'https://picsum.photos/id/65/800/600'
  },
  {
    id: 's3',
    title: 'Deep Tissue Sports',
    description: 'Focuses on realigning deeper layers of muscles and connective tissue. Great for chronic aches.',
    price60: 500,
    price90: 750,
    type: ServiceType.DEEP_TISSUE,
    image: 'https://picsum.photos/id/338/800/600'
  },
  {
    id: 's4',
    title: 'Aloe Vera After Sun',
    description: 'Cooling treatment for sun-damaged skin. Essential after a long day at Haad Rin beach.',
    price60: 400,
    price90: 600,
    type: ServiceType.ALOE_VERA,
    image: 'https://picsum.photos/id/360/800/600'
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
    locationBase: 'Thong Sala'
  },
  {
    id: 't2',
    name: 'Ms. Noi',
    image: 'https://picsum.photos/id/331/300/300',
    skills: [ServiceType.THAI, ServiceType.OIL, ServiceType.DEEP_TISSUE, ServiceType.ALOE_VERA],
    bio: 'All-rounder with strong hands for deep tissue and a gentle touch for oil massage.',
    rating: 4.8,
    available: true,
    locationBase: 'Srithanu'
  },
  {
    id: 't3',
    name: 'Ms. Lek',
    image: 'https://picsum.photos/id/342/300/300',
    skills: [ServiceType.OIL, ServiceType.ALOE_VERA],
    bio: 'Expert in aromatherapy and skin care treatments.',
    rating: 4.7,
    available: false, // Currently offline
    locationBase: 'Haad Rin'
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
    customerName: 'Sarah Smith',
    customerPhone: '+49 151 444 555',
    location: 'Baan Tai Villas',
    status: 'pending'
  }
];
