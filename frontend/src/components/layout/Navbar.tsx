import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
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
              Medora
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted block">
              Emergency Medical ID
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-dark/80">
          <a href="#how-it-works" className="hover:text-burgundy transition-colors">How It Works</a>
          <a href="#for-caregivers" className="hover:text-burgundy transition-colors">For Caregivers</a>
          <a href="#faq" className="hover:text-burgundy transition-colors">FAQ</a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button variant="cream" onClick={() => navigate('/login')}>
                Log In
              </Button>
              <Button variant="primary" onClick={() => navigate('/signup')}>
                Create Profile
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-xl text-text-dark hover:bg-beige-pale/60"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
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
              How It Works
            </a>
            <a
              href="#for-caregivers"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-burgundy transition-colors"
            >
              For Caregivers
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-burgundy transition-colors"
            >
              FAQ
            </a>
          </nav>
          <div className="pt-4 border-t border-beige-pale flex flex-col gap-2.5">
            {user ? (
              <Button variant="primary" className="w-full" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="cream" className="w-full" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button variant="primary" className="w-full" onClick={() => navigate('/signup')}>
                  Create Profile
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
