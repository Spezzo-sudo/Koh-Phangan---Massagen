
import React, { createContext, useContext, useState, useEffect, ReactNode, PropsWithChildren } from 'react';
import { User, Language, Booking, CreateBookingInput, CartItem, Product } from './types';
import { translations } from './translations';
import { MOCK_BOOKINGS } from './constants';
import { supabase } from './lib/supabase';

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

  // SUPABASE PREPARATION:
  // useEffect(() => {
  //   supabase?.auth.getSession().then(({ data: { session } }) => {
  //      if (session) setUser(transformSupabaseUser(session.user));
  //   });
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  //      setUser(session ? transformSupabaseUser(session.user) : null);
  //   });
  //   return () => subscription.unsubscribe();
  // }, []);

  const login = (role: 'customer' | 'therapist') => {
    // SUPABASE TODO: supabase.auth.signInWithPassword(...)
    
    // Mock Logic:
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
    // SUPABASE TODO: supabase.auth.signOut()
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
  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: PropsWithChildren<{}>) {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [cart, setCart] = useState<CartItem[]>([]);

  // SUPABASE TODO: Fetch bookings on mount
  /*
  useEffect(() => {
    if (!supabase) return;
    const fetchBookings = async () => {
        const { data } = await supabase.from('bookings').select('*');
        if (data) setBookings(data);
    };
    fetchBookings();
    
    // Realtime subscription
    const subscription = supabase
        .channel('public:bookings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
            // handle insert/update/delete
            console.log('Realtime update:', payload);
        })
        .subscribe();
        
    return () => { supabase.removeChannel(subscription); }
  }, []);
  */

  const addBooking = async (input: CreateBookingInput) => {
    // SUPABASE TODO: 
    // const { data, error } = await supabase.from('bookings').insert([{ ...input, status: 'pending' }]).select();

    // Mock Logic:
    const newBooking: Booking = {
      ...input,
      id: `b${Date.now()}`, // Generate a random ID
      status: 'pending'
    };
    setBookings(prev => [newBooking, ...prev]);
  };

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    // SUPABASE TODO:
    // await supabase.from('bookings').update({ status }).eq('id', id);

    // Mock Logic:
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  // Cart Logic (Local Only usually, unless syncing across devices)
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <DataContext.Provider value={{ 
      bookings, 
      addBooking, 
      updateBookingStatus,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartTotal
    }}>
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
