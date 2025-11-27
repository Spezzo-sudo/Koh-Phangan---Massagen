
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Sparkles, Users, Heart, Hand } from 'lucide-react';
import { useServices } from '../lib/queries';
import { useSEO } from '../hooks/useSEO';
import SEOStructuredData from '../components/SEOStructuredData';
import { getServiceImage } from '../lib/utils';

export default function Home() {
  useSEO({
    title: "Mobile Massage, Nails & Beauty - Koh Phangan",
    description: "The #1 Mobile Spa on Koh Phangan. We offer Thai Massage, Gel Nails, Bridal Makeup, and Full Moon Party styling at your villa.",
    image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1600&q=80"
  });

  const { data: SERVICES = [] } = useServices();

  // Filter to show specific categories in different sections
  const massageServices = useMemo(() =>
    SERVICES.filter(s => s.category === 'Massage').slice(0, 2),
    [SERVICES]
  );
  const beautyServices = useMemo(() =>
    SERVICES.filter(s => s.category === 'Nails' || s.category === 'Packages').slice(0, 2),
    [SERVICES]
  );

  return (
    <div>
      <SEOStructuredData />

      {/* Hero Section */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/10 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1600&q=80"
          alt="Stunning Koh Phangan Bay with Turquoise Water and Palms"
          className="absolute inset-0 w-full h-full object-cover"
          width="1600"
          height="900"
          // Eager loading for Hero image (LCP optimization)
          loading="eager"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4 animate-fade-in">
          <h1 className="font-serif text-5xl md:text-7xl text-white font-bold mb-6 drop-shadow-lg">
            Phangan Serenity
          </h1>
          <p className="text-white/95 text-lg md:text-2xl max-w-xl mb-10 font-light leading-relaxed drop-shadow-md bg-black/10 backdrop-blur-[2px] rounded-xl p-4">
            Mobile Massage & Beauty Spa<br />
            <span className="text-base opacity-90 font-medium">Massage • Nails • Full Moon Styling</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/booking"
              className="bg-brand-teal hover:bg-brand-dark text-white px-8 py-4 rounded-full font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm bg-opacity-90"
              aria-label="Book a treatment"
            >
              Book Treatment <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              to="/shop"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/60 px-8 py-4 rounded-full font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Shop Products
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Categories */}
      <div className="bg-brand-sand py-8 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex justify-center gap-4 md:gap-12 overflow-x-auto no-scrollbar py-2">
          <Link to="/booking?category=Massage" className="flex flex-col items-center gap-2 group min-w-[80px]" aria-label="Browse Massage Services">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-colors">
              <Users size={32} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Massage</span>
          </Link>
          <Link to="/booking?category=Nails" className="flex flex-col items-center gap-2 group min-w-[80px]" aria-label="Browse Nail Services">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
              <Hand size={32} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Nails</span>
          </Link>
          <Link to="/booking?category=Packages" className="flex flex-col items-center gap-2 group min-w-[80px]" aria-label="Browse Packages">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Sparkles size={32} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Packages</span>
          </Link>
        </div>
      </div>

      {/* SECTION 1: MASSAGE */}
      <div className="py-16 px-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-brand-dark mb-2">Popular Massages</h2>
            <p className="text-gray-500">Traditional techniques for deep relaxation</p>
          </div>
          <Link to="/booking" className="text-brand-teal font-medium hover:underline hidden md:block">View Full Menu</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {massageServices.map(service => (
            <div key={service.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col sm:flex-row h-auto sm:h-48">
              <div className="sm:w-48 h-48 relative shrink-0">
                <img
                  src={getServiceImage(service)}
                  alt={service.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width="200"
                  height="200"
                />
              </div>
              <div className="p-5 flex flex-col justify-center flex-1">
                <h3 className="font-serif font-bold text-xl mb-2 text-gray-800">{service.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{service.description}</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-brand-teal font-bold">{service.price60} THB</span>
                  <Link
                    to={`/booking?service=${service.id}`}
                    className="bg-gray-100 hover:bg-brand-teal hover:text-white px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-colors"
                    aria-label={`Book ${service.title}`}
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: BEAUTY LOUNGE (Explicit Section so Nails aren't lost) */}
      <div className="bg-gradient-to-b from-pink-50 to-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-pink-100 text-pink-600 rounded-full mb-4">
              <Sparkles size={24} aria-hidden="true" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-gray-800 mb-2">Nails & Beauty Lounge</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Professional Manicure, Pedicure and Gel treatments brought to your location.
              Our specialized beauty team carries a full portable salon kit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beautyServices.map(service => (
              <div key={service.id} className="bg-white rounded-xl shadow-lg shadow-pink-100/50 hover:shadow-xl transition-all overflow-hidden border border-pink-100 group">
                <div className="h-60 overflow-hidden relative">
                  <img
                    src={getServiceImage(service)}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                    loading="lazy"
                  />
                  {service.category === 'Packages' && (
                    <div className="absolute top-0 left-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10">
                      Signature Package
                    </div>
                  )}
                  {service.staffRequired && service.staffRequired > 1 && (
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur text-purple-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                      <Users size={12} /> 2 Specialists
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-serif font-bold text-lg mb-2 text-gray-800">{service.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-600 font-bold">{service.price60} THB</span>
                    <Link
                      to={`/booking?service=${service.id}`}
                      className="text-xs uppercase tracking-wider font-semibold text-gray-400 hover:text-pink-600 flex items-center gap-1"
                      aria-label={`Select ${service.title}`}
                    >
                      Select <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/therapists" className="inline-block border-b border-pink-400 text-pink-600 pb-1 font-medium hover:text-pink-800">
              Meet our Beauty Team
            </Link>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-brand-dark text-white py-20">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <img
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80"
              alt="Professional mobile spa setup"
              className="rounded-lg shadow-2xl border-4 border-white/10"
              loading="lazy"
            />
          </div>
          <div className="flex-1 space-y-6">
            <h2 className="font-serif text-3xl font-bold">Mobile Spa Experience</h2>
            <p className="text-brand-light/80 leading-relaxed">
              We bring the full spa experience to you. Whether you need a deep tissue massage after training, or a luxury manicure before a night out at Full Moon Party.
              Our equipment is portable, professional, and hygienic.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <Heart className="text-brand-gold mb-2" aria-hidden="true" />
                <div className="font-bold">Verified Pros</div>
                <div className="text-xs text-white/60">All therapists are vetted</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <Users className="text-brand-gold mb-2" aria-hidden="true" />
                <div className="font-bold">Bridal Teams</div>
                <div className="text-xs text-white/60">We handle groups & events</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

