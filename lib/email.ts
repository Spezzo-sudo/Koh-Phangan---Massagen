import { supabase } from './supabase';
import { Booking, Order } from '../types';

interface EmailPayload {
    type: 'booking_confirmation' | 'order_confirmation';
    data: any;
}

/**
 * Triggers the send-email Edge Function.
 * This keeps the API key secure on the server side.
 */
async function sendEmail(payload: EmailPayload) {
    try {
        const { data, error } = await supabase.functions.invoke('send-email', {
            body: payload,
        });

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Failed to send email:', err);
        // We don't want to block the UI if email fails, so just log it
        return null;
    }
}

export async function sendBookingConfirmation(booking: Booking) {
    return sendEmail({
        type: 'booking_confirmation',
        data: booking
    });
}

export async function sendOrderConfirmation(order: Order) {
    return sendEmail({
        type: 'order_confirmation',
        data: order
    });
}
