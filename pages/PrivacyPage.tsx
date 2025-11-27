
import React from 'react';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-brand-teal mx-auto mb-4" />
            <h1 className="font-serif text-3xl font-bold text-brand-dark">Privacy Policy (PDPA)</h1>
            <p className="text-gray-500">Effective Date: March 2024</p>
        </div>

        <div className="prose prose-stone mx-auto">
            <h3>1. Introduction</h3>
            <p>
                Phangan Serenity ("we", "us") respects your privacy. This policy outlines how we collect and process your personal data in compliance with Thailand's Personal Data Protection Act (PDPA).
            </p>

            <h3>2. Data We Collect</h3>
            <ul>
                <li><strong>Identity Data:</strong> Name, Phone Number (for booking confirmation).</li>
                <li><strong>Location Data:</strong> GPS coordinates and Hotel/Villa names. This is collected solely for the purpose of dispatching therapists to your location.</li>
                <li><strong>Health Data:</strong> Information about allergies or injuries provided in booking notes. This is classified as sensitive data under PDPA and is treated with strict confidentiality.</li>
            </ul>

            <h3>3. How We Use Data</h3>
            <p>We use your data to:</p>
            <ul>
                <li>Process appointments and dispatch staff.</li>
                <li>Send booking confirmations via SMS or LINE.</li>
                <li>Ensure safety for both clients and therapists.</li>
            </ul>

            <h3>4. Data Storage</h3>
            <p>
                Your data is stored securely. We do not sell your data to third parties. 
                Therapists only receive your location and name for the duration of the appointment.
            </p>

            <h3>5. Your Rights</h3>
            <p>
                Under the PDPA, you have the right to access, correct, or delete your personal data. 
                To exercise these rights, contact us via LINE or email.
            </p>
        </div>
    </div>
  );
}
