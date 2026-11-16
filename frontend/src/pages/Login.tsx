import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, HeartPulse, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both your email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('ananya.sen@example.com');
    setPassword('DemoPassword123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-cream-warm flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-soft-lg border border-beige-pale overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Column: Visual / Brand Mood */}
        <div className="md:col-span-5 bg-burgundy-deep text-white p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-burgundy/40 blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-blush/20 blur-3xl" />

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-burgundy flex items-center justify-center text-white">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg block text-white leading-tight">
                Medora
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-blush block">
                Emergency Medical ID
              </span>
            </div>
          </Link>

          {/* Testimonial / Editorial Quote */}
          <div className="relative z-10 space-y-4 my-auto py-8">
            <span className="text-[11px] uppercase tracking-wider text-blush font-semibold block">
              Independent & Safe
            </span>
            <p className="font-serif text-2xl font-bold leading-snug">
              "Essential medical details. Exactly when care matters most."
            </p>
            <p className="text-xs text-white/70 leading-relaxed">
              Log in to manage your medical profile, review visibility settings, and generate updated emergency QR codes.
            </p>
          </div>

          {/* Demo Shortcut Pill */}
          <div className="relative z-10 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-blush transition-colors border border-white/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-blush" />
              <span>Fill Demo Account (Ananya Sen)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Clean Form */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center text-left">
          <div className="space-y-2 mb-8">
            <h2 className="font-serif text-3xl font-bold text-burgundy-deep">Welcome Back</h2>
            <p className="text-xs text-text-muted">
              Log in to manage your medical profile and emergency QR code.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-medical-red flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ananya.sen@example.com"
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark/80">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white border border-beige-pale rounded-xl px-4 py-2.5 pl-10 pr-10 text-sm text-text-dark placeholder:text-text-light focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15 transition-all"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-dark transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-text-muted">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-burgundy focus:ring-burgundy"
                />
                <span>Remember me</span>
              </label>
              <span className="text-burgundy hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-sm mt-2"
              loading={loading}
            >
              Log In
            </Button>
          </form>

          <p className="text-xs text-text-muted text-center mt-8">
            Don't have an emergency profile yet?{' '}
            <Link to="/signup" className="text-burgundy font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

