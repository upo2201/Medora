import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { LanguageSelector } from '../ui/LanguageSelector';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full bg-cream-warm/90 backdrop-blur-md border-b border-beige-pale/80 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-burgundy flex items-center justify-center text-white shadow-soft transition-transform group-hover:scale-105">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif font-bold text-xl text-burgundy-deep tracking-tight block leading-tight">
              {t.common.appName}
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted block">
              {t.common.appTagline}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-dark/80">
          <a href="#how-it-works" className="hover:text-burgundy transition-colors">{t.home.navHowItWorks}</a>
          <a href="#for-caregivers" className="hover:text-burgundy transition-colors">{t.home.navForCaregivers}</a>
          <a href="#faq" className="hover:text-burgundy transition-colors">{t.home.navFaq}</a>
        </nav>

        {/* Language Selector and Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSelector variant="pills" />

          {user ? (
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              {t.common.dashboard}
            </Button>
          ) : (
            <div className="flex items-center gap-2.5">
              <Button variant="cream" onClick={() => navigate('/login')}>
                {t.common.login}
              </Button>
              <Button variant="primary" onClick={() => navigate('/signup')}>
                {t.common.signup}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSelector variant="dropdown" />
          <button
            className="p-2 rounded-xl text-text-dark hover:bg-beige-pale/60"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cream-warm border-b border-beige-pale px-6 py-6 space-y-4">
          <nav className="flex flex-col gap-3 text-base font-medium text-text-dark">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-burgundy transition-colors"
            >
              {t.home.navHowItWorks}
            </a>
            <a
              href="#for-caregivers"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-burgundy transition-colors"
            >
              {t.home.navForCaregivers}
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-burgundy transition-colors"
            >
              {t.home.navFaq}
            </a>
          </nav>

          <div className="pt-4 border-t border-beige-pale flex flex-col gap-2.5">
            {user ? (
              <Button variant="primary" className="w-full" onClick={() => navigate('/dashboard')}>
                {t.common.dashboard}
              </Button>
            ) : (
              <>
                <Button variant="cream" className="w-full" onClick={() => navigate('/login')}>
                  {t.common.login}
                </Button>
                <Button variant="primary" className="w-full" onClick={() => navigate('/signup')}>
                  {t.common.signup}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
