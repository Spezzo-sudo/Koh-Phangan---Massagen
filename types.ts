export enum ServiceType {
  THAI = 'Thai Massage',
  OIL = 'Oil Massage',
  DEEP_TISSUE = 'Deep Tissue',
  FOOT = 'Foot Reflexology',
  ALOE_VERA = 'Aloe Vera Sunburn'
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price60: number; // Price in THB
  price90: number;
  type: ServiceType;
  image: string;
}

export interface Therapist {
  id: string;
  name: string;
  image: string;
  skills: ServiceType[];
  bio: string;
  rating: number;
  available: boolean; // Simplified availability for MVP
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  therapistId: string;
  date: string;
  time: string;
  duration: 60 | 90;
  customerName: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'completed';
}