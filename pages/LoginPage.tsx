
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-brand-sand/30">
      <div className="text-center mb-10">
        <h1 className="font-serif text-4xl font-bold text-brand-dark mb-2">Welcome Back</h1>
        <p className="text-gray-600">Please select how you want to log in</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Customer Login */}
        <button 
          onClick={() => navigate('/customer/dashboard')}
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-teal transition-all group text-left"
        >
          <div className="w-14 h-14 bg-brand-light rounded-full flex items-center justify-center text-brand-teal mb-4 group-hover:scale-110 transition-transform">
            <User size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">I am a Customer</h2>
          <p className="text-sm text-gray-500">View your booking history, re-book massages, and manage your profile.</p>
        </button>

        {/* Therapist Login */}
        <button 
          onClick={() => navigate('/therapist/dashboard')}
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-teal transition-all group text-left"
        >
          <div className="w-14 h-14 bg-brand-dark rounded-full flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
            <Briefcase size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">I am a Therapist</h2>
          <p className="text-sm text-gray-500">Access your schedule, update availability, and manage job requests.</p>
        </button>
      </div>
    </div>
  );
}
