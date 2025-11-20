
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-brand-sand/30">
      <div className="bg-white p-8 rounded-full shadow-sm mb-6 animate-bounce-slow">
        <MapPin size={64} className="text-brand-gold" />
      </div>
      
      <h1 className="font-serif text-6xl font-bold text-brand-dark mb-2">404</h1>
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Page Not Found</h2>
      
      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
        Oops! It seems you've wandered off the path. 
        We can't find the page you're looking for, but we can help you find relaxation.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <Link 
          to="/" 
          className="flex items-center justify-center gap-2 bg-brand-teal text-white px-6 py-3 rounded-full font-medium hover:bg-brand-dark transition-colors shadow-lg shadow-brand-teal/20"
        >
          <Home size={18} /> Back Home
        </Link>
        <Link 
          to="/booking" 
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors"
        >
          <Search size={18} /> Book Service
        </Link>
      </div>
    </div>
  );
}
