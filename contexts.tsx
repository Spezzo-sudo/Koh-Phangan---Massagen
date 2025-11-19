
import React, { createContext, useContext, useState, useEffect, ReactNode, PropsWithChildren } from 'react';
import { User, Language, Booking, CreateBookingInput } from './types';
import { translations } from './translations';
import { MOCK_BOOKINGS } from './constants';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (role: 'customer' | 'therapist') => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: 'customer' | 'therapist') => {
    // Simulating a login response
    if (role === 'customer') {
      setUser({
        id: 'c1',
        role: 'customer',
        name: 'Max Mustermann',
        email: 'max@example.com'
      });
    } else {
      setUser({
        id: 't1', // Simulating we are Ms. Ang (id: t1 in constants)
        role: 'therapist',
        name: 'Ms. Ang',
        email: 'ang@phanganserenity.com'
      });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// --- Language Context ---
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: PropsWithChildren<{}>) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Fallback to key if not found
      }
    }
    
    return value as string;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      <div dir={dir}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// --- Data Context (The "Database" Simulation) ---
interface DataContextType {
  bookings: Booking[];
  addBooking: (booking: CreateBookingInput) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: PropsWithChildren<{}>) {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  const addBooking = (input: CreateBookingInput) => {
    const newBooking: Booking = {
      ...input,
      id: `b${Date.now()}`, // Generate a random ID
      status: 'pending'
    };
    setBookings(prev => [newBooking, ...prev]);
  };

  const updateBookingStatus = (id: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  return (
    <DataContext.Provider value={{ bookings, addBooking, updateBookingStatus }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
