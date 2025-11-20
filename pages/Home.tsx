
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import { SERVICES } from '../constants';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img 
          src="https://picsum.photos/id/28/1600/900" 
          alt="Relaxing ocean view" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4">
          <h1 className="font-serif text-5xl md:text-7xl text-white font-bold mb-6 drop-shadow-lg">
            Phangan Serenity
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-xl mb-8 font-light">
            Massage, Spa & Beauty treatments delivered to your villa or hotel.
          </p>
          <Link 
            to="/booking" 
            className="bg-brand-teal hover:bg-brand-dark text-white px-8 py-3 rounded-full font-medium transition-all transform hover:scale-105 flex items-center gap-2"
          >
            Book an Appointment
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Featured Services */}
      <div className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-bold text-brand-dark mb-2">Our Menu</h2>
          <p className="text-gray-500">Curated for your relaxation and beauty</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.slice(0, 4).map(service => (
            <div key={service.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
              <div className="h-48 overflow-hidden relative">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" />
                {service.category === 'Nails' && (
                    <div className="absolute top-2 right-2 bg-pink-100 text-pink-600 text-xs font-bold px-2 py-1 rounded">
                        Nails
                    </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-serif font-bold text-lg mb-2 text-gray-800">{service.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{service.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-brand-teal font-bold">{service.price60} THB</span>
                  <Link to={`/booking?service=${service.id}`} className="text-xs uppercase tracking-wider font-semibold text-gray-400 hover:text-brand-teal">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
            <Link to="/booking" className="inline-flex items-center gap-2 text-brand-dark font-medium hover:underline">
                See all Beauty & Massage treatments <ArrowRight size={16} />
            </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-brand-light/30 py-20">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <img src="https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=800&q=80" alt="Nail Salon Setup" className="rounded-lg shadow-xl" />
          </div>
          <div className="flex-1 space-y-6">
            <h2 className="font-serif text-3xl font-bold text-brand-dark">Mobile Spa Experience</h2>
            <p className="text-gray-600 leading-relaxed">
              We bring the full spa experience to you. Whether you need a deep tissue massage after training, or a luxury manicure before a night out at Full Moon Party. 
              Our equipment is portable, professional, and hygienic.
            </p>
            <div className="flex gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-gold mb-1">15+</div>
                <div className="text-xs uppercase tracking-wider text-gray-500">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-gold mb-1">5k+</div>
                <div className="text-xs uppercase tracking-wider text-gray-500">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
