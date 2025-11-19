import React from 'react';
import { THERAPISTS } from '../constants';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TherapistsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="font-serif text-4xl font-bold text-brand-dark mb-4">Meet Our Team</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our therapists are the heart of Phangan Serenity. Each has unique skills and specialties, 
          but all share a dedication to the art of healing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {THERAPISTS.map(therapist => (
          <div key={therapist.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="h-64 overflow-hidden relative">
              <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/10 transition-colors z-10"></div>
              <img 
                src={therapist.image} 
                alt={therapist.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-serif text-2xl font-bold text-gray-800">{therapist.name}</h2>
                <div className="flex items-center bg-brand-sand px-2 py-1 rounded text-brand-gold font-bold text-sm">
                  <Star size={14} fill="currentColor" className="mr-1" />
                  {therapist.rating}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 min-h-[3rem]">{therapist.bio}</p>
              
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {therapist.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-brand-light text-brand-dark text-xs rounded font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <Link 
                to={`/booking`}
                className="block w-full text-center bg-brand-teal text-white py-3 rounded-lg font-medium hover:bg-brand-dark transition-colors"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}