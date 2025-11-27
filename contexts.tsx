import React, { createContext, useContext, useState, useEffect, ReactNode, PropsWithChildren } from 'react';
import { User, Language, Booking, CreateBookingInput, CartItem, Product, DataContextType, Expense, Therapist } from './types';
import { translations } from './translations';
import { TIME_SLOTS } from './constants';
import { supabase } from './lib/supabase';
import { sendBookingConfirmation, sendOrderConfirmation } from './lib/email';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: { fullName: string; role: string }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // SUPABASE: Initialize auth state on mount
  useEffect(() => {
    if (!supabase) {
      setIsLoadingAuth(false);
      return;
    }

    const fetchUserProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.warn('⚠️ Profile not found for user:', userId, error.message);
          return null;
        }
        return data || null;
      } catch (err) {
        console.error('❌ Error fetching profile:', err);
        return null;
      }
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);

        // Set user even if profile doesn't exist yet (trigger might still be creating it)
        setUser({
          id: session.user.id,
          role: (profile?.role || 'customer') as any,
          name: profile?.full_name || session.user.email || 'User',
          email: session.user.email || '',
          avatar_url: profile?.avatar_url
        });
      }
      setIsLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id).then((profile) => {
          // Always set user, even if profile is null
          setUser({
            id: session.user.id,
            role: (profile?.role || 'customer') as any,
            name: profile?.full_name || session.user.email || 'User',
            email: session.user.email || '',
            avatar_url: profile?.avatar_url
          });
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (data.user) {
      setUser({
        id: data.user.id,
        role: (data.user.user_metadata?.role || 'customer') as any,
        name: data.user.user_metadata?.full_name || data.user.email || 'User',
        email: data.user.email || '',
        avatar_url: data.user.user_metadata?.avatar_url
      });
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: { fullName: string; role: string }
  ) => {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.fullName,
          role: metadata.role
        }
      }
    });

    if (error) throw error;

    // ✅ NOTE: Profile is now created automatically by the database trigger
    // No need to manually insert it here - the trigger on auth.users handles it
    console.log('✅ User signed up:', data.user?.email, '- Profile will be created by trigger');
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout, isAuthenticated: !!user, isLoading: isLoadingAuth }}>
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

  // SEO FIX: Dynamisch das HTML lang Attribut ändern
  useEffect(() => {
    document.documentElement.lang = language;
    // Bei Arabisch auch die Richtung ändern
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Safe fallback for [object Object] errors
        return typeof value === 'string' ? value : key;
      }
    }

    // Double check to prevent rendering objects
    if (typeof value === 'object') return key;

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
const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: PropsWithChildren<{}>) {
  // ⚠️ NOTE: These are now fetched from Supabase via React Query hooks
  // - bookings: use useBookings() hook from lib/queries.ts
  // - therapists: use useTherapists() hook from lib/queries.ts
  // - expenses: not yet implemented in Phase 1
  // This context is kept for mutations only (addBooking, updateBookingStatus, etc.)

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Hardening: Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper for simulated network delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Check if a staff member is available at a specific time slot
   * Accounts for: 
   * 1. Existing Bookings (including duration overlaps)
   * 2. Manually blocked slots
   * 3. Global availability
   */
  const checkAvailability = (staffId: string, dateStr: string, time: string, duration: number): boolean => {
    const staff = therapists.find(t => t.id === staffId);
    if (!staff || !staff.available) return false;

    const targetDate = new Date(dateStr).toDateString();

    // 1. Check Manual Blocks
    // blockedSlots format: "YYYY-MM-DD HH:mm"
    const dateTimeString = `${new Date(dateStr).toISOString().split('T')[0]} ${time}`;
    if (staff.blockedSlots?.some(slot => slot === dateTimeString)) {
      return false;
    }

    // 2. Check Bookings
    const relevantBookings = bookings.filter(b =>
      b.staffId === staffId &&
      new Date(b.date).toDateString() === targetDate &&
      (b.status === 'confirmed' || b.status === 'pending' || b.status === 'in_progress')
    );

    const targetTimeVal = parseInt(time.split(':')[0]);

    for (const booking of relevantBookings) {
      const bookingTimeVal = parseInt(booking.time.split(':')[0]);
      const bookingDurationHours = booking.duration / 60; // 1 or 1.5
      const targetDurationHours = duration / 60;

      // Check overlap
      // Event A starts before Event B ends AND Event B starts before Event A ends
      const bookingEnd = bookingTimeVal + bookingDurationHours;
      const targetEnd = targetTimeVal + targetDurationHours;

      if (bookingTimeVal < targetEnd && targetTimeVal < bookingEnd) {
        return false; // Overlap detected
      }
    }

    return true;
  };

  const toggleTherapistBlock = (staffId: string, dateStr: string, time: string) => {
    setTherapists(prev => prev.map(t => {
      if (t.id !== staffId) return t;

      const dateTimeString = `${new Date(dateStr).toISOString().split('T')[0]} ${time}`;
      const currentBlocks = t.blockedSlots || [];

      if (currentBlocks.includes(dateTimeString)) {
        // Unblock
        return { ...t, blockedSlots: currentBlocks.filter(s => s !== dateTimeString) };
      } else {
        // Block
        return { ...t, blockedSlots: [...currentBlocks, dateTimeString] };
      }
    }));
  };

  const updateTherapist = async (id: string, updates: Partial<Therapist>) => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to save to Supabase first
      if (supabase) {
        // Map TypeScript types to Supabase column names
        const dbUpdates: any = {};
        if ('verified' in updates) {
          dbUpdates.is_verified = updates.verified;
        }
        if ('available' in updates) {
          dbUpdates.available = updates.available;
        }
        if ('name' in updates) {
          dbUpdates.full_name = updates.name;
        }
        if ('bio' in updates) {
          dbUpdates.bio = updates.bio;
        }
        if ('skills' in updates) {
          dbUpdates.skills = updates.skills;
        }
        if ('image' in updates) {
          dbUpdates.avatar_url = updates.image;
        }

        const { error: dbError } = await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', id);

        if (dbError) throw dbError;
        console.log("Therapist updated in Supabase:", id, dbUpdates);
      } else {
        // Fallback for when Supabase is not configured
        await delay(500);
      }

      // Update local state
      setTherapists(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (e: any) {
      setError("Failed to update therapist.");
      console.error("Update therapist error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const addBooking = async (input: CreateBookingInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // CRITICAL: Verify Supabase is configured
      if (!supabase) {
        throw new Error('Supabase not configured. Cannot create booking.');
      }

      // CRITICAL: Double-Check Availability before saving
      const isAvailable = checkAvailability(input.staffId, input.date, input.time, input.duration);
      if (!isAvailable) {
        throw new Error("Slot no longer available. Please choose another time.");
      }

      // ✅ ONLY save to Supabase (no fallback to mock)
      const { data, error: dbError } = await supabase
        .from('bookings')
        .insert([{
          customer_id: input.customerId || input.customerName, // Use ID if available
          staff_id: input.staffId,
          service_id: input.serviceId,
          scheduled_date: input.date,
          scheduled_time: input.time,
          duration: input.duration,
          status: 'pending',
          location_text: input.location,
          gps_lat: input.coordinates?.lat || null,
          gps_lng: input.coordinates?.lng || null,
          total_price: input.totalPrice,
          notes: input.notes || null,
          addons: input.addons || [],
          payment_method: input.payment_method || 'cash',
          payment_status: input.payment_status || 'pending'
        }])
        .select();

      // ❌ No fallback: throw error if DB save fails
      if (dbError) throw dbError;

      const newBooking = data?.[0];
      if (!newBooking) {
        throw new Error('Booking created but response was empty');
      }

      // ✅ Update local state with database response
      setBookings(prev => [newBooking as any, ...prev]);

      // ✅ Send notifications (but catch any errors)
      try {
        console.log("📧 Sending booking confirmation email...", newBooking.id);
        sendBookingConfirmation(newBooking).catch(err => console.warn("Email failed:", err));
      } catch (emailErr) {
        console.warn("Email notification failed (non-critical):", emailErr);
      }

      console.log("✅ Booking saved to Supabase:", newBooking);
      return newBooking;

    } catch (e: any) {
      console.error("Booking Error:", e);
      setError(e.message || "Failed to create booking.");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    setIsLoading(true);
    try {
      // Try Supabase first, fallback to mock
      if (supabase) {
        try {
          const { error: dbError } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', id);

          if (dbError) throw dbError;
          console.log("Booking status updated in Supabase:", id, status);
        } catch (dbErr) {
          console.warn("Supabase update failed, falling back to mock:", dbErr);
        }
      }

      // Update local state
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (e: any) {
      setError("Failed to update status.");
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (input: Omit<Expense, 'id' | 'type'>) => {
    setIsLoading(true);
    try {
      await delay(500);
      const newExpense: Expense = {
        ...input,
        id: `e${Date.now()}`,
        type: 'expense'
      };
      setExpenses(prev => [newExpense, ...prev]);
    } catch (e: any) {
      setError("Failed to add expense.");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Get user for order creation
  const { user } = useAuth();

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

  const createOrder = async (customerDetails: any) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!supabase) throw new Error('Supabase not configured');
      if (cart.length === 0) throw new Error('Cart is empty');

      // 1. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: user?.id, // Can be null for guest
          total_amount: cartTotal,
          status: 'pending',
          payment_method: customerDetails.paymentMethod || 'cash',
          payment_status: customerDetails.paymentMethod === 'card' ? 'paid' : 'pending',
          shipping_address: customerDetails.address,
          contact_email: customerDetails.email,
          contact_phone: customerDetails.phone,
          customer_name: customerDetails.name
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Send Confirmation Email
      console.log("📧 Sending order confirmation email...", orderData.id);
      sendOrderConfirmation(orderData).catch(err => console.warn("Email failed:", err));

      console.log("✅ Order created:", orderData.id);
      clearCart();
      return orderData;

    } catch (e: any) {
      console.error("Order Error:", e);
      setError(e.message || "Failed to create order");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!supabase) throw new Error('Supabase not configured');

      // Call the secure RPC function
      const { data, error: rpcError } = await supabase
        .rpc('cancel_booking', { booking_id: bookingId });

      if (rpcError) throw rpcError;

      // Check the JSON response from our function
      if (data && !data.success) {
        throw new Error(data.message || 'Cancellation failed');
      }

      console.log("✅ Booking cancelled via RPC:", bookingId);

      // Update local state to reflect change immediately
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));

    } catch (e: any) {
      console.error("Cancellation Error:", e);
      setError(e.message || "Failed to cancel booking");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{
      bookings,
      addBooking,
      updateBookingStatus,
      therapists,
      toggleTherapistBlock,
      checkAvailability,
      updateTherapist,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartTotal,
      expenses,
      addExpense,
      createOrder,
      cancelBooking,
      isLoading,
      error
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