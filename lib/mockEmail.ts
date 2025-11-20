import { Booking } from '../types';

/**
 * REAL EMAIL SERVICE (Resend)
 * ----------------------------
 * Uses Resend.com API for production-grade email delivery
 *
 * Setup:
 * 1. Create account at resend.com
 * 2. Get API key from settings
 * 3. Add to .env: VITE_RESEND_API_KEY=your-key
 * 4. Add from: email to .env: VITE_EMAIL_FROM=noreply@yourdomain.com
 */

// Helper to send emails via Resend API
const sendEmailViaResend = async (to: string, subject: string, html: string) => {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  const fromEmail = import.meta.env.VITE_EMAIL_FROM || 'noreply@phanganserenity.com';

  // If no API key, fall back to console logging (development)
  if (!apiKey) {
    console.warn('⚠️ VITE_RESEND_API_KEY not configured. Logging email instead:');
    console.log(`To: ${to}\nSubject: ${subject}\n\n${html}`);
    return { success: false, reason: 'No API key configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API Error:', error);
      return { success: false, reason: error.message };
    }

    const result = await response.json();
    console.log('✅ Email sent via Resend:', result.id);
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, reason: String(error) };
  }
};

// HTML Email Template for Customer
const customerEmailTemplate = (booking: Booking, service: any, therapist: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0d9488; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .booking-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #0d9488; }
    .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
    .btn { display: inline-block; background: #0d9488; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Your Booking is Confirmed!</h1>
    </div>

    <div class="content">
      <p>Hello ${booking.customerName},</p>

      <p>Your appointment with Phangan Serenity is confirmed. Here are the details:</p>

      <div class="booking-details">
        <p><strong>Service:</strong> ${service?.title || 'N/A'}</p>
        <p><strong>Therapist:</strong> ${therapist?.name || 'N/A'}</p>
        <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        <p><strong>Duration:</strong> ${booking.duration} minutes</p>
        <p><strong>Location:</strong> ${booking.location}</p>
        <p><strong>Total Price:</strong> ฿${booking.totalPrice} (Cash on Arrival)</p>
      </div>

      <p>✓ Please be at the location <strong>10 minutes early</strong></p>
      <p>✓ Cancellations are free up to 5 hours before the appointment</p>

      <p>Questions? Contact us on WhatsApp or LINE.</p>

      <p>See you soon!<br>
      <strong>Phangan Serenity Team</strong></p>
    </div>

    <div class="footer">
      <p>© 2024 Phangan Serenity. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// HTML Email Template for Therapist
const therapistEmailTemplate = (booking: Booking, service: any, therapist: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .job-alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
    .details { background: white; padding: 15px; margin: 15px 0; }
    .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New Booking Assignment!</h1>
    </div>

    <div class="content">
      <p>Hello ${therapist?.name || 'Therapist'},</p>

      <div class="job-alert">
        <strong>📅 ${new Date(booking.date).toLocaleDateString()} at ${booking.time}</strong>
      </div>

      <div class="details">
        <p><strong>Customer:</strong> ${booking.customerName}</p>
        <p><strong>Phone:</strong> ${booking.customerPhone}</p>
        <p><strong>Service:</strong> ${service?.title || 'N/A'} (${booking.duration} min)</p>
        <p><strong>Location:</strong> ${booking.location}</p>
        ${booking.coordinates ? `<p><strong>GPS:</strong> ${booking.coordinates.lat.toFixed(6)}, ${booking.coordinates.lng.toFixed(6)}</p>` : ''}
        ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
        <p><strong>Price to Collect:</strong> ฿${booking.totalPrice}</p>
      </div>

      <p>Please mark yourself as "On Way" once you leave for the appointment.</p>

      <p>Thank you!</p>
    </div>

    <div class="footer">
      <p>© 2024 Phangan Serenity. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendBookingNotifications = async (
  booking: Booking,
  service?: any,
  therapist?: any
) => {
  console.log('📧 Sending booking notifications...');

  // If service/therapist not provided, we can't look them up anymore
  // (they're now in Supabase, not constants)
  if (!service || !therapist) {
    console.warn('⚠️ Service or therapist details not provided for email. Skipping email notifications.');
    return false;
  }

  try {
    // Send to customer
    const customerResult = await sendEmailViaResend(
      booking.customerEmail || 'customer@example.com',
      `Booking Confirmed: ${service.title} with ${therapist.name}`,
      customerEmailTemplate(booking, service, therapist)
    );

    // Send to therapist
    const therapistEmail = `${therapist.name.replace(/\s+/g, '.').toLowerCase()}@phanganserenity.com`;
    const therapistResult = await sendEmailViaResend(
      therapistEmail,
      `🔔 NEW JOB: ${new Date(booking.date).toLocaleDateString()} @ ${booking.time}`,
      therapistEmailTemplate(booking, service, therapist)
    );

    console.log('✅ Booking notifications sent', { customerResult, therapistResult });
    return customerResult.success && therapistResult.success;
  } catch (error) {
    console.error('Failed to send notifications:', error);
    return false;
  }
};