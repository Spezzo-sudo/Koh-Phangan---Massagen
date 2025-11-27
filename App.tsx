
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, Calendar, User as UserIcon, MapPin, LogIn, LogOut, Globe, Shield, Lock } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LegalFooter from './components/LegalFooter';
import { AuthProvider, LanguageProvider, DataProvider, useAuth, useLanguage, useData } from './contexts';
import { Language } from './types';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// --- LAZY LOADED PAGES (Code Splitting) ---
const Home = lazy(() => import('./pages/Home'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const StaffPage = lazy(() => import('./pages/StaffPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const TherapistDashboard = lazy(() => import('./pages/TherapistDashboard'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage')); // New 404 Page

const Navbar = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { cart } = useData();

  const isActive = (path: string) => location.pathname === path ? 'text-brand-teal' : 'text-gray-500 hover:text-brand-teal';
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const languages: { code: Language, label: string }[] = [
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
    <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 py-3 px-6 flex justify-between items-center z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0 transition-all" role="navigation" aria-label="Main Navigation">
      <Link to="/" className="hidden md:block font-serif text-2xl font-bold text-brand-teal" aria-label="Phangan Serenity Home">
        Phangan Serenity
      </Link>

      <div className="flex w-full md:w-auto justify-between gap-6 md:gap-8">
        <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/')}`} aria-label={t('nav.home')}>
          <Menu size={20} aria-hidden="true" />
          <span className="text-xs font-medium">{t('nav.home')}</span>
        </Link>
        <Link to="/booking" className={`flex flex-col items-center gap-1 ${isActive('/booking')}`} aria-label={t('nav.book')}>
          <Calendar size={20} aria-hidden="true" />
          <span className="text-xs font-medium">{t('nav.book')}</span>
        </Link>
        <Link to="/therapists" className={`flex flex-col items-center gap-1 ${isActive('/therapists')}`} aria-label={t('nav.team')}>
          <UserIcon size={20} aria-hidden="true" />
          <span className="text-xs font-medium">{t('nav.team')}</span>
        </Link>
        <Link to="/shop" className={`relative flex flex-col items-center gap-1 ${isActive('/shop')}`} aria-label={`${t('nav.shop')} ${cartCount > 0 ? `, ${cartCount} items in cart` : ''}`}>
          <ShoppingBag size={20} aria-hidden="true" />
          {cartCount > 0 && (
            <span className="absolute -top-1 right-2 bg-brand-gold text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold animate-pulse" aria-hidden="true">
              {cartCount}
            </span>
          )}
          <span className="text-xs font-medium">{t('nav.shop')}</span>
        </Link>

        {isAuthenticated ? (
          <button onClick={logout} className="flex flex-col items-center gap-1 text-gray-500 hover:text-brand-gold" aria-label="Logout">
            <LogOut size={20} aria-hidden="true" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        ) : (
          <Link to="/login" className={`flex flex-col items-center gap-1 ${isActive('/login')}`} aria-label={t('nav.login')}>
            <LogIn size={20} aria-hidden="true" />
            <span className="text-xs font-medium">{t('nav.login')}</span>
          </Link>
        )}
      </div>

      <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">

        {/* Language Switcher */}
        <div className="relative group">
          <button className="flex items-center gap-1 hover:text-brand-teal" aria-label="Select Language" aria-haspopup="true">
            <Globe size={16} aria-hidden="true" />
            <span className="uppercase">{language}</span>
          </button>
          <div className="absolute right-0 top-full pt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150" role="menu">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="w-full text-left px-4 py-2 hover:bg-brand-light flex justify-between transition-colors"
                role="menuitem"
              >
                <span>{lang.code.toUpperCase()}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 text-white rounded-full flex items-center justify-center font-bold ${user.role === 'admin' ? 'bg-purple-600' : 'bg-brand-teal'}`} aria-hidden="true">
              {user.name.charAt(0)}
            </div>
            <Link to={
              user.role === 'customer' ? '/customer/dashboard' :
                user.role === 'staff' ? '/therapist/dashboard' :
                  '/admin/dashboard'
            } className="hover:underline" aria-label="Go to Dashboard">
              {user.name}
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <MapPin size={16} aria-hidden="true" />
            <span>Mobile Service</span>
          </div>
        )}
      </div>
    </nav>
  );
};

const Footer = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <footer className="bg-brand-dark text-brand-light pt-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
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

      <div className="relative border-t border-white/10">
        <LegalFooter />

        {/* DISCREET ADMIN ACCESS LOCK */}
        <div className="absolute bottom-4 right-4 md:right-10 opacity-30 hover:opacity-100 transition-opacity">
          {user?.role === 'admin' ? (
            <Link to="/admin/dashboard" className="text-brand-gold" title="Go to Admin Dashboard" aria-label="Admin Dashboard">
              <Shield size={16} />
            </Link>
          ) : (
            <Link to="/login" className="text-gray-500 hover:text-white" title="Staff Access" aria-label="Staff Login">
              <Lock size={14} />
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <LanguageProvider>
            <DataProvider>
              <BrowserRouter>
                <div className="min-h-screen flex flex-col font-sans">
                  <Navbar />
                  <main className="flex-grow md:pt-16 pb-20 md:pb-0">
                    <Suspense fallback={<LoadingSpinner fullScreen />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/booking" element={<BookingPage />} />
                        <Route path="/therapists" element={<StaffPage />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/therapist/dashboard" element={
                          <ProtectedRoute allowedRoles={['staff', 'admin']}>
                            <TherapistDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/customer/dashboard" element={
                          <ProtectedRoute allowedRoles={['customer', 'admin']}>
                            <CustomerDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin/dashboard" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        {/* Fallback Route for 404 */}
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                </div>
              </BrowserRouter>
            </DataProvider>
          </LanguageProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
