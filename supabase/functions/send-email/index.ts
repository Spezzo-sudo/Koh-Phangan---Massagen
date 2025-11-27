import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
    type: 'booking_confirmation' | 'order_confirmation';
    data: any;
}

const handler = async (req: Request): Promise<Response> => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { type, data }: EmailPayload = await req.json();

        let subject = "";
        let html = "";
        const to = data.customerEmail || data.email; // Handle both booking and order structures

        if (!to) {
            throw new Error("No recipient email provided");
        }

        if (type === "booking_confirmation") {
            subject = `Booking Confirmed: ${data.date} at ${data.time}`;
            html = `
        <h1>Booking Confirmed!</h1>
        <p>Dear ${data.customerName},</p>
        <p>Your booking has been confirmed.</p>
        <ul>
          <li><strong>Service:</strong> ${data.serviceId} (ID)</li>
          <li><strong>Date:</strong> ${data.date}</li>
          <li><strong>Time:</strong> ${data.time}</li>
          <li><strong>Duration:</strong> ${data.duration} minutes</li>
          <li><strong>Staff:</strong> ${data.staffId} (ID)</li>
          <li><strong>Location:</strong> ${data.location}</li>
          <li><strong>Total Price:</strong> ${data.totalPrice} THB</li>
          <li><strong>Payment Method:</strong> ${data.payment_method}</li>
        </ul>
        <p>Please be ready 15 minutes before your appointment.</p>
        <p>Thank you,<br/>Phangan Serenity</p>
      `;
        } else if (type === "order_confirmation") {
            subject = `Order Confirmed #${data.id.slice(0, 8)}`;
            html = `
        <h1>Order Received!</h1>
        <p>Dear ${data.customer_name},</p>
        <p>Thank you for your order.</p>
        <p><strong>Total:</strong> ${data.total_amount} THB</p>
        <p><strong>Payment Method:</strong> ${data.payment_method}</p>
        <p>We will deliver your items at your next appointment.</p>
        <p>Thank you,<br/>Phangan Serenity</p>
      `;
        } else {
            throw new Error("Invalid email type");
        }

        const emailResponse = await resend.emails.send({
            from: "Phangan Serenity <onboarding@resend.dev>", // Default Resend testing domain
            to: [to],
            subject: subject,
            html: html,
        });

        return new Response(JSON.stringify(emailResponse), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
            },
        });
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }
};

serve(handler);
