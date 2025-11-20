import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from './supabase';
import { Service, Therapist, Booking } from '../types';

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
 * Fetch all therapists from Supabase profiles table
 * Filters for role = 'therapist'
 */
export const useTherapists = (): UseQueryResult<Therapist[], Error> => {
  return useQuery({
    queryKey: ['therapists'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'therapist');

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    enabled: !!supabase,
  });
};

/**
 * Fetch bookings from Supabase
 * Optionally filters by user ID (customer OR therapist)
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
      // User can be either customer OR therapist for a booking
      if (userId) {
        query = query.or(`customer_id.eq.${userId},therapist_id.eq.${userId}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes (more frequent updates)
    retry: 2,
    enabled: !!supabase,
  });
};

/**
 * Check if a therapist has availability at a specific time slot
 * Queries Supabase directly (not state-based)
 *
 * @param therapistId - ID of the therapist
 * @param dateStr - Date in YYYY-MM-DD format
 * @param time - Time in HH:MM format
 * @param duration - Duration in minutes
 * @returns true if available, false if slot is booked
 */
export const checkAvailability = async (
  therapistId: string,
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

    // Query all bookings for this therapist on this date
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('therapist_id', therapistId)
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
