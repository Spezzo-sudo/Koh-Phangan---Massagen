
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts';
import { MessageCircle, X, Phone } from 'lucide-react';

export default function LegalFooter() {
  const { t } = useLanguage();
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowCookieBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShowCookieBanner(false);
  };

  return (
    <>
      {/* Footer Links */}
      <div className="bg-brand-dark border-t border-white/10 py-6 text-center text-xs text-brand-light/50">
        <div className="flex justify-center gap-6 mb-4">
            <Link to="/privacy" className="hover:text-white transition-colors">{t('legal.privacy')}</Link>
            <Link to="/terms" className="hover:text-white transition-colors">{t('legal.terms')}</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Phangan Serenity. All rights reserved. Koh Phangan, Surat Thani.</p>
      </div>

      {/* Floating Communication Buttons */}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-3">
          {/* WhatsApp (For Tourists) */}
          <a 
            href="https://wa.me/66812345678" 
            target="_blank" 
            rel="noreferrer"
            className="bg-[#25D366] text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center gap-2 justify-center"
            title="Chat on WhatsApp"
          >
            <Phone size={24} fill="white" />
            <span className="font-bold hidden md:inline">{t('legal.whatsapp')}</span>
          </a>

          {/* LINE (For Locals/Expats) */}
          <a 
            href="https://line.me/ti/p/~phangan_serenity" 
            target="_blank" 
            rel="noreferrer"
            className="bg-[#00B900] text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center gap-2 justify-center"
            title="Chat on LINE"
          >
            <MessageCircle size={24} fill="white" />
            <span className="font-bold hidden md:inline">{t('legal.chat')}</span>
          </a>
      </div>

      {/* Cookie Consent Banner (PDPA) */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-[60] animate-slide-up flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 text-center md:text-left max-w-4xl">
                {t('legal.cookieNotice')}
            </div>
            <button 
                onClick={acceptCookies}
                className="bg-brand-dark text-white px-6 py-2 rounded-lg font-medium text-sm whitespace-nowrap hover:bg-brand-teal transition-colors"
            >
                {t('legal.accept')}
            </button>
        </div>
      )}
    </>
  );
}
