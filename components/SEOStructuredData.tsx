import React from 'react';

// This injects JSON-LD data into the head for Google Rich Results
// It tells Google: "We are a Beauty Salon / Massage Service on Koh Phangan"
export default function SEOStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "name": "Phangan Serenity",
    "image": "https://picsum.photos/id/28/1600/900",
    "description": "Premium Mobile Massage, Manicure, and Full Moon Party Makeup services delivered to your Villa or Hotel on Koh Phangan.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Mobile Service",
      "addressLocality": "Koh Phangan",
      "addressRegion": "Surat Thani",
      "postalCode": "84280",
      "addressCountry": "TH"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 9.7319,
      "longitude": 100.0136
    },
    "url": "https://phanganserenity.com",
    "telephone": "+66812345678",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "10:00",
        "closes": "22:00"
      }
    ],
    "priceRange": "$$",
    "makesOffer": [
        {
            "@type": "Offer",
            "itemOffered": {
                "@type": "Service",
                "name": "Traditional Thai Massage"
            }
        },
        {
            "@type": "Offer",
            "itemOffered": {
                "@type": "Service",
                "name": "Oil Massage & Aromatherapy"
            }
        },
        {
            "@type": "Offer",
            "itemOffered": {
                "@type": "Service",
                "name": "Gel Nails & Manicure"
            }
        },
        {
            "@type": "Offer",
            "itemOffered": {
                "@type": "Service",
                "name": "Full Moon Party Neon Makeup"
            }
        },
        {
            "@type": "Offer",
            "itemOffered": {
                "@type": "Service",
                "name": "Bridal Hair & Makeup"
            }
        }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}