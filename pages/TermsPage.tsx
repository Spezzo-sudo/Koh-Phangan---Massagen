
import React from 'react';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
            <FileText className="w-16 h-16 text-brand-teal mx-auto mb-4" />
            <h1 className="font-serif text-3xl font-bold text-brand-dark">Terms of Service</h1>
        </div>

        <div className="prose prose-stone mx-auto">
            <h3>1. Booking & Cancellation</h3>
            <p>
                Appointments can be cancelled free of charge up to <strong>5 hours</strong> before the scheduled time. 
            </p>
            <p>
                <strong>No-Show Policy:</strong> Since our therapists travel to your location, if you are not present at the agreed location and time (within 15 minutes), 
                the appointment is considered a "No-Show". <strong>You will be liable for the full 100% payment</strong> of the booked service.
            </p>

            <h3>2. Payment</h3>
            <p>
                Currently, we accept <strong>Cash on Arrival</strong>. Please ensure you have the correct amount ready. 
                We are working on credit card integration for easier payments.
                Failure to pay for a completed service or a no-show fee will result in being blacklisted from our network and potentially reported to local authorities for theft of service.
            </p>

            <h3>3. Service Area & Travel Time</h3>
            <p>
                We require a minimum of <strong>2 hours notice</strong> for same-day bookings to allow for travel time.
                We cover most areas of Koh Phangan. Remote locations (e.g., Bottle Beach by road) may incur an additional travel surcharge.
            </p>

            <h3>4. Code of Conduct</h3>
            <p>
                We provide professional wellness services. Any inappropriate behavior towards our staff will result in immediate termination of the session with full payment due, and you will be blacklisted from future services.
            </p>

            <h3>5. Health Conditions</h3>
            <p>
                Please inform us of any medical conditions, injuries, or pregnancy prior to your session. We reserve the right to refuse service if it is unsafe for you.
            </p>
        </div>
    </div>
  );
}
