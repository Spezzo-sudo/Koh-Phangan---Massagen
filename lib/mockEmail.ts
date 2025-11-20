import { Booking, Therapist, Service } from '../types';
import { SERVICES, THERAPISTS } from '../constants';

/**
 * MOCK EMAIL SERVICE
 * ------------------
 * This file simulates an email provider (like SendGrid or Resend).
 * In the current Prototype phase, it simply logs the email content to the browser console.
 * 
 * TODO: Replace this with a real API call in Phase 4 (See TODO_NEXT.md)
 */

export const sendBookingNotifications = async (booking: Booking) => {
  console.group('📧 MOCK EMAIL SERVICE TRIGGERED');
  console.log('Simulating network delay for email delivery...');
  
  // Simulate network latency (500ms)
  await new Promise(resolve => setTimeout(resolve, 500));

  const service = SERVICES.find(s => s.id === booking.serviceId);
  const therapist = THERAPISTS.find(t => t.id === booking.therapistId);

  if (!service || !therapist) {
    console.error('Could not find service or therapist details for email generation.');
    console.groupEnd();
    return;
  }

  // 1. Email to Customer
  const customerEmailContent = `
  ----------------------------------------------------
  TO: ${booking.customerEmail || 'customer@example.com'}
  SUBJECT: Booking Confirmed: ${service.title} with ${therapist.name}
  ----------------------------------------------------
  Dear ${booking.customerName},

  Your appointment is confirmed!

  Service:  ${service.title} (${booking.duration} mins)
  Date:     ${new Date(booking.date).toLocaleDateString()}
  Time:     ${booking.time}
  Location: ${booking.location}
  
  Therapist: ${therapist.name}
  Total:     ${booking.totalPrice} THB (Cash on Arrival)

  Please ensure you are at the location 10 minutes prior.
  Need to cancel? Please contact us 5 hours in advance.

  See you soon,
  Phangan Serenity Team
  ----------------------------------------------------
  `;

  // 2. Email to Therapist
  const therapistEmailContent = `
  ----------------------------------------------------
  TO: ${therapist.name.replace(' ', '.').toLowerCase()}@phanganserenity.com
  SUBJECT: 🔔 NEW JOB: ${booking.date.split('T')[0]} @ ${booking.time}
  ----------------------------------------------------
  Hello ${therapist.name},

  You have a new confirmed booking.

  Customer: ${booking.customerName}
  Phone:    ${booking.customerPhone}
  Service:  ${service.title}
  Addons:   ${booking.addons.join(', ') || 'None'}
  
  LOCATION: ${booking.location}
  GPS:      ${booking.coordinates ? `${booking.coordinates.lat}, ${booking.coordinates.lng}` : 'N/A'}
  Notes:    ${booking.notes || 'None'}

  Price to Collect: ${booking.totalPrice} THB

  Please mark yourself as 'On Way' when you leave.
  ----------------------------------------------------
  `;

  console.log('%c [Mock Email] Sent to Customer:', 'color: green; font-weight: bold;', customerEmailContent);
  console.log('%c [Mock Email] Sent to Therapist:', 'color: blue; font-weight: bold;', therapistEmailContent);
  console.groupEnd();

  return true;
};