import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, Calendar, User, MapPin } from 'lucide-react';
import Home from './pages/Home';
import BookingPage from './pages/BookingPage';
import TherapistsPage from './pages/TherapistsPage';
import ShopPage from './pages/ShopPage';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? 'text-brand-teal' : 'text-gray-500 hover:text-brand-teal';

  return (
    <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 py-3 px-6 flex justify-between items-center z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <Link to="/" className="hidden md:block font-serif text-2xl font-bold text-brand-teal">
        Phangan Serenity
      </Link>
      
      <div className="flex w-full md:w-auto justify-between gap-6 md:gap-8">
        <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/')}`}>
          <Menu size={20} />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link to="/booking" className={`flex flex-col items-center gap-1 ${isActive('/booking')}`}>
          <Calendar size={20} />
          <span className="text-xs font-medium">Book</span>
        </Link>
        <Link to="/therapists" className={`flex flex-col items-center gap-1 ${isActive('/therapists')}`}>
          <User size={20} />
          <span className="text-xs font-medium">Team</span>
        </Link>
        <Link to="/shop" className={`flex flex-col items-center gap-1 ${isActive('/shop')}`}>
          <ShoppingBag size={20} />
          <span className="text-xs font-medium">Shop</span>
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
        <MapPin size={16} />
        <span>Thong Sala, Koh Phangan</span>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-brand-dark text-brand-light py-12 pb-24 md:pb-12">
    <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="font-serif text-2xl font-bold mb-4">Phangan Serenity</h3>
        <p className="opacity-80 text-sm leading-relaxed">
          Your sanctuary of relaxation in the heart of Koh Phangan. 
          Experience authentic Thai massage and natural healing therapies.
        </p>
      </div>
      <div>
        <h4 className="font-bold mb-4 uppercase tracking-wider text-xs">Contact</h4>
        <p className="opacity-80 text-sm">123 Beach Road, Thong Sala</p>
        <p className="opacity-80 text-sm">Koh Phangan, Surat Thani 84280</p>
        <p className="opacity-80 text-sm mt-2">+66 81 234 5678</p>
      </div>
      <div>
        <h4 className="font-bold mb-4 uppercase tracking-wider text-xs">Opening Hours</h4>
        <p className="opacity-80 text-sm">Daily: 10:00 AM - 10:00 PM</p>
        <p className="opacity-80 text-sm mt-4 text-brand-gold font-medium">Walk-ins Welcome</p>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow md:pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/therapists" element={<TherapistsPage />} />
            <Route path="/shop" element={<ShopPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}