import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from './supabase';
import { Service, StaffMember, Therapist, Booking, Order } from '../types';

/**
 * Fetch all services from Supabase
 * Caches for 5 minutes to reduce DB queries
 */
export const useServices = (): UseQueryResult<Service[], Error> => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');

      const { data, error } = await supabase
        .from('services')
        .select('*');

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2, // Retry failed requests twice
    enabled: !!supabase, // Only run if supabase is configured
  });
};

/**
 * Fetch all staff members from Supabase profiles table
 * Filters for role = 'staff'
 * By default, only returns verified staff (unless includeUnverified is true)
 * Maps database columns to TypeScript interface
 * 
 * @param options - Optional configuration
 * @param options.includeUnverified - If true, return all staff (for admin use)
 */
export const useStaff = (options: { includeUnverified?: boolean } = {}): UseQueryResult<StaffMember[], Error> => {
  return useQuery({
    queryKey: ['staff', options.includeUnverified],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');

      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'staff');

      // Filter for verified staff only (unless explicitly requested to include unverified)
      if (!options.includeUnverified) {
        query = query.eq('is_verified', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Map database columns to TypeScript interface
      const mappedData = (data || []).map((staff: any) => ({
        id: staff.id,
        name: staff.full_name || '',
        full_name: staff.full_name || '',  // Keep both for compatibility
        image: staff.avatar_url || '',
        avatar_url: staff.avatar_url || '',  // Keep both for compatibility
        skills: staff.skills || [],
        bio: staff.bio || '',
        rating: staff.rating || 5,
        available: staff.available ?? true,
        locationBase: staff.location_base || 'Koh Phangan',
        verified: staff.is_verified ?? false,
        reviewCount: staff.review_count || 0,
        blockedSlots: staff.blocked_slots || [],
      })) as StaffMember[];

      return mappedData;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    enabled: !!supabase,
  });
};

// Keep old name as alias for backwards compatibility
export const useTherapists = useStaff;

/**
 * Fetch bookings from Supabase
 * Optionally filters by user ID (customer OR staff)
 *
 * @param userId - Optional user ID to filter bookings for this user
 * @returns Query result with bookings data
 */
export const useBookings = (
  userId?: string
): UseQueryResult<Booking[], Error> => {
  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');

      let query = supabase.from('bookings').select('*');

      // Filter by user ID if provided
      // User can be either customer OR staff for a booking
      if (userId) {
        query = query.or(`customer_id.eq.${userId},staff_id.eq.${userId}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Map DB fields to Booking interface
      return (data || []).map((b: any) => ({
        id: b.id,
        serviceId: b.service_id,
        staffId: b.therapist_id,
        customerId: b.customer_id,
        date: b.scheduled_date,
        time: b.scheduled_time,
        duration: b.duration,
        addons: [], // DB doesn't seem to return this yet, default to empty
        totalPrice: b.total_price,
        customerName: 'Unknown', // This would need a join with profiles, defaulting for now
        customerPhone: '',
        location: b.location_text || 'Koh Phangan',
        status: b.status,
        notes: b.notes
      })) as Booking[];
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes (more frequent updates)
    retry: 2,
    enabled: !!supabase,
  });
};

/**
 * Check if a staff member has availability at a specific time slot
 * Queries Supabase directly (not state-based)
 *
 * @param staffId - ID of the staff member
 * @param dateStr - Date in YYYY-MM-DD format
 * @param time - Time in HH:MM format
 * @param duration - Duration in minutes
 * @returns true if available, false if slot is booked
 */
export const checkAvailability = async (
  staffId: string,
  dateStr: string,
  time: string,
  duration: number
): Promise<boolean> => {
  if (!supabase) throw new Error('Supabase not configured');

  try {
    // Get next day for date range query
    const nextDay = new Date(new Date(dateStr).getTime() + 86400000)
      .toISOString()
      .split('T')[0];

    // Query all bookings for this staff member on this date
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('staff_id', staffId)
      .gte('scheduled_date', dateStr)
      .lt('scheduled_date', nextDay)
      .in('status', ['pending', 'confirmed', 'in_progress']);

    if (error) throw error;

    // Parse requested time slot
    const timeStart = parseInt(time.split(':')[0]);
    const timeEnd = timeStart + duration / 60;

    // Check if any existing booking overlaps with requested time
    const isAvailable = !bookings?.some((booking) => {
      const bookingStart = parseInt(booking.scheduled_time.split(':')[0]);
      const bookingEnd = bookingStart + booking.duration / 60;

      // Overlaps if: bookingStart < requestEnd AND requestStart < bookingEnd
      return bookingStart < timeEnd && timeStart < bookingEnd;
    });

    return isAvailable;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};

/**
 * Fetch all products from Supabase
 * Caches for 10 minutes
 */
export const useProducts = (): UseQueryResult<any[], Error> => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 2,
    enabled: !!supabase,
  });
};

/**
 * Fetch all orders (Admin only)
 * Includes order items and product details
 */
export const useOrders = (): UseQueryResult<Order[], Error> => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items (
            *,
            product:products (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    enabled: !!supabase,
  });
};
