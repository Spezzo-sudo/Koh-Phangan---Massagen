
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, Calendar, User as UserIcon, MapPin, LogIn, LogOut, Globe } from 'lucide-react';
import Home from './pages/Home';
import BookingPage from './pages/BookingPage';
import TherapistsPage from './pages/TherapistsPage';
import ShopPage from './pages/ShopPage';
import LoginPage from './pages/LoginPage';
import TherapistDashboard from './pages/TherapistDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import { AuthProvider, LanguageProvider, DataProvider, useAuth, useLanguage } from './contexts';
import { Language } from './types';

const Navbar = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const isActive = (path: string) => location.pathname === path ? 'text-brand-teal' : 'text-gray-500 hover:text-brand-teal';

  const languages: {code: Language, label: string}[] = [
    { code: 'en', label: '🇺🇸' },
    { code: 'de', label: '🇩🇪' },
    { code: 'th', label: '🇹🇭' },
    { code: 'fr', label: '🇫🇷' },
    { code: 'es', label: '🇪🇸' },
    { code: 'zh', label: '🇨🇳' },
    { code: 'hi', label: '🇮🇳' },
    { code: 'ar', label: '🇸🇦' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 py-3 px-6 flex justify-between items-center z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0 transition-all">
      <Link to="/" className="hidden md:block font-serif text-2xl font-bold text-brand-teal">
        Phangan Serenity
      </Link>
      
      <div className="flex w-full md:w-auto justify-between gap-6 md:gap-8">
        <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/')}`}>
          <Menu size={20} />
          <span className="text-xs font-medium">{t('nav.home')}</span>
        </Link>
        <Link to="/booking" className={`flex flex-col items-center gap-1 ${isActive('/booking')}`}>
          <Calendar size={20} />
          <span className="text-xs font-medium">{t('nav.book')}</span>
        </Link>
        <Link to="/therapists" className={`flex flex-col items-center gap-1 ${isActive('/therapists')}`}>
          <UserIcon size={20} />
          <span className="text-xs font-medium">{t('nav.team')}</span>
        </Link>
        <Link to="/shop" className={`flex flex-col items-center gap-1 ${isActive('/shop')}`}>
          <ShoppingBag size={20} />
          <span className="text-xs font-medium">{t('nav.shop')}</span>
        </Link>
        
        {isAuthenticated ? (
          <button onClick={logout} className="flex flex-col items-center gap-1 text-gray-500 hover:text-brand-gold">
            <LogOut size={20} />
            <span className="text-xs font-medium">Logout</span>
          </button>
        ) : (
          <Link to="/login" className={`flex flex-col items-center gap-1 ${isActive('/login')}`}>
            <LogIn size={20} />
            <span className="text-xs font-medium">{t('nav.login')}</span>
          </Link>
        )}
      </div>

      <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
        
        {/* Language Switcher */}
        <div className="relative group">
            <button className="flex items-center gap-1 hover:text-brand-teal">
                <Globe size={16} />
                <span className="uppercase">{language}</span>
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden hidden group-hover:block">
                {languages.map(lang => (
                    <button 
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className="w-full text-left px-4 py-2 hover:bg-brand-light flex justify-between"
                    >
                        <span>{lang.code.toUpperCase()}</span>
                        <span>{lang.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {isAuthenticated && user ? (
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-teal text-white rounded-full flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                </div>
                <Link to={user.role === 'customer' ? '/customer/dashboard' : '/therapist/dashboard'} className="hover:underline">
                    {user.name}
                </Link>
             </div>
        ) : (
            <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Mobile Service</span>
            </div>
        )}
      </div>
    </nav>
  );
};

const Footer = () => {
    const { t } = useLanguage();
    return (
        <footer className="bg-brand-dark text-brand-light py-12 pb-24 md:pb-12">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
                <h3 className="font-serif text-2xl font-bold mb-4">Phangan Serenity</h3>
                <p className="opacity-80 text-sm leading-relaxed">
                {t('footer.about')}
                </p>
            </div>
            <div>
                <h4 className="font-bold mb-4 uppercase tracking-wider text-xs">{t('footer.contact')}</h4>
                <p className="opacity-80 text-sm">Mobile Service (Island-wide)</p>
                <p className="opacity-80 text-sm">Koh Phangan, Surat Thani 84280</p>
                <p className="opacity-80 text-sm mt-2">+66 81 234 5678</p>
            </div>
            <div>
                <h4 className="font-bold mb-4 uppercase tracking-wider text-xs">Service Hours</h4>
                <p className="opacity-80 text-sm">Daily: 10:00 AM - 10:00 PM</p>
                <p className="opacity-80 text-sm mt-4 text-brand-gold font-medium">Book Online 24/7</p>
            </div>
            </div>
        </footer>
    );
};

export default function App() {
  return (
    <AuthProvider>
        <LanguageProvider>
            <DataProvider>
                <HashRouter>
                    <div className="min-h-screen flex flex-col font-sans">
                        <Navbar />
                        <main className="flex-grow md:pt-16 pb-20 md:pb-0">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/booking" element={<BookingPage />} />
                            <Route path="/therapists" element={<TherapistsPage />} />
                            <Route path="/shop" element={<ShopPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/therapist/dashboard" element={<TherapistDashboard />} />
                            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                        </Routes>
                        </main>
                        <Footer />
                    </div>
                </HashRouter>
            </DataProvider>
        </LanguageProvider>
    </AuthProvider>
  );
}
