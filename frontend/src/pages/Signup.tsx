import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, HeartPulse, User, AlertCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';

export const Signup: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyNotificationEmail, setEmergencyNotificationEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName || !email || !emergencyNotificationEmail || !password) {
      setError('Please fill in all required fields, including Emergency Notification Email.');
      return;
    }
    if (!emergencyNotificationEmail.includes('@') || !emergencyNotificationEmail.includes('.')) {
      setError('Please provide a valid Emergency Notification Email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreed) {
      setError('Please agree to the privacy policy & academic demonstration terms.');
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        emergency_notification_email: emergencyNotificationEmail,
        password
      });
      success('Account created successfully! Your emergency profile is ready.');
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-warm flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-soft-lg border border-beige-pale overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        {/* Left Column: Brand Mood & Privacy Notice */}
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

          {/* Value Prop */}
          <div className="relative z-10 space-y-4 my-auto py-8 text-left">
            <span className="text-[11px] uppercase tracking-wider text-blush font-semibold block">
              Peace of Mind
            </span>
            <h3 className="font-serif text-2xl font-bold leading-snug">
              Create an Emergency Profile in 2 Minutes.
            </h3>
            <div className="space-y-3 pt-2 text-xs text-white/80">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blush shrink-0 mt-0.5" />
                <span>You choose exactly what details appear when scanned.</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blush shrink-0 mt-0.5" />
                <span>Instant QR generation with downloadable wallet cards.</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 text-[10px] text-white/50 text-left">
            Essential Medical Information. One Scan Away.
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center text-left">
          <div className="space-y-2 mb-6">
            <h2 className="font-serif text-3xl font-bold text-burgundy-deep">Create Your Account</h2>
            <p className="text-xs text-text-muted">
              Register yourself or an elderly family member to get started.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-medical-red flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Ananya"
                icon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sen"
                required
              />
            </div>

            <Input
              label="Account / Login Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ananya.sen@example.com"
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="space-y-1">
              <Input
                label="Emergency Notification Email *"
                type="email"
                value={emergencyNotificationEmail}
                onChange={(e) => setEmergencyNotificationEmail(e.target.value)}
                placeholder="e.g. caregiver@example.com (or personal safety email)"
                icon={<ShieldAlert className="w-4 h-4 text-burgundy" />}
                required
              />
              <p className="text-[11px] text-text-muted leading-tight">
                Mandatory. Instant alerts will be sent here when your emergency QR is scanned (can belong to you, a family member, or caregiver).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark/80">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark/80">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-white border border-beige-pale rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-light focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15 transition-all"
                required
              />
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-text-muted">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="rounded text-burgundy focus:ring-burgundy mt-0.5"
                  required
                />
                <span className="leading-tight">
                  I agree to the privacy policy, understand that this is for emergency medical information access, and consent to academic demonstration terms.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-sm mt-3"
              loading={loading}
            >
              Create Medical Profile
            </Button>
          </form>

          <p className="text-xs text-text-muted text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-burgundy font-semibold hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

