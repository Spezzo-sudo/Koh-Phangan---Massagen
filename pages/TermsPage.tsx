
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
                Appointments can be cancelled free of charge up to <strong>3 hours</strong> before the scheduled time. 
                Cancellations made within 3 hours may be subject to a fee of 50% of the booking value on your next visit.
            </p>

            <h3>2. Payment</h3>
            <p>
                Currently, we only accept <strong>Cash on Arrival</strong>. Please ensure you have the correct amount ready. 
                Tips for therapists are appreciated but not mandatory.
            </p>

            <h3>3. Service Area</h3>
            <p>
                We cover most areas of Koh Phangan. However, some remote locations (e.g. Bottle Beach by road) may incur an additional travel surcharge. 
                We will inform you of this before confirming the booking.
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
