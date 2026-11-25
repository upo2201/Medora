import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, HeartPulse, AlertCircle, ShieldAlert, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/ui/Toast';
import { Language } from '../types';

export const Signup: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyNotificationEmail, setEmergencyNotificationEmail] = useState('');
  const [preferredLang, setPreferredLang] = useState<Language>(language || 'en');
  const [secondLang, setSecondLang] = useState<string>('none');
  const [fullNameSecondary, setFullNameSecondary] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handlePreferredLangChange = (lng: Language) => {
    setPreferredLang(lng);
    setLanguage(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName || !email || !emergencyNotificationEmail || !password) {
      setError(t.auth.requiredFieldsError);
      return;
    }
    if (!emergencyNotificationEmail.includes('@') || !emergencyNotificationEmail.includes('.')) {
      setError(t.auth.invalidEmergencyEmailError);
      return;
    }
    if (password.length < 6) {
      setError(t.auth.passwordLengthError);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatchError);
      return;
    }
    if (!agreed) {
      setError(t.auth.agreeTermsError);
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        emergency_notification_email: emergencyNotificationEmail,
        password,
        preferred_language: preferredLang,
        emergency_second_language: secondLang === 'none' ? null : secondLang,
        full_name_secondary: fullNameSecondary.trim() || null
      });
      success(t.auth.signupSuccess);
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
                {t.common.appName}
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-blush block">
                {t.common.appTagline}
              </span>
            </div>
          </Link>

          {/* Value Prop */}
          <div className="relative z-10 space-y-4 my-auto py-8 text-left">
            <span className="text-[11px] uppercase tracking-wider text-blush font-semibold block">
              {t.auth.peaceOfMindTitle}
            </span>
            <h3 className="font-serif text-2xl font-bold leading-snug">
              {t.auth.peaceOfMindText}
            </h3>
            <div className="space-y-3 pt-2 text-xs text-white/80">
              <div className="flex items-start gap-2">
                <span className="text-blush font-bold">•</span>
                <span>{t.common.emergencySecondLanguage}: English + {secondLang === 'bn' ? 'বাংলা' : secondLang === 'hi' ? 'हिंदी' : 'None'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blush font-bold">•</span>
                <span>{t.auth.emergencyNotificationEmailHelp}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-white/60">
            ISI Autumn Internship 2026 • Medora Medical Safety
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center text-left">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-burgundy-deep tracking-tight">
                {t.auth.signupTitle}
              </h2>
              <p className="text-xs text-text-muted mt-1">
                {t.auth.signupSubtitle}
              </p>
            </div>
            {/* Quick Language Selector */}
            <LanguageSelector variant="pills" />
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-medical-red flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t.auth.firstName}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Ananya"
                required
              />
              <Input
                label={t.auth.lastName}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sen"
                required
              />
            </div>

            <Input
              label={t.auth.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ananya.sen@example.com"
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="space-y-1">
              <Input
                label={`${t.auth.emergencyNotificationEmail} *`}
                type="email"
                value={emergencyNotificationEmail}
                onChange={(e) => setEmergencyNotificationEmail(e.target.value)}
                placeholder="e.g. caregiver@example.com"
                icon={<ShieldAlert className="w-4 h-4 text-burgundy" />}
                required
              />
              <p className="text-[11px] text-text-muted leading-tight">
                {t.auth.emergencyNotificationEmailHelp}
              </p>
            </div>

            {/* Language Preferences Section in Signup */}
            <div className="p-4 rounded-2xl bg-cream-warm border border-beige-pale space-y-3">
              <div className="flex items-center gap-2 text-burgundy-deep font-semibold text-xs border-b border-beige-pale/60 pb-2">
                <Globe className="w-4 h-4 text-burgundy" />
                <span>{t.settings.languagePreferences}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-dark/80 mb-1">
                    {t.common.preferredLanguage}
                  </label>
                  <select
                    value={preferredLang}
                    onChange={(e) => handlePreferredLangChange(e.target.value as Language)}
                    className="w-full bg-white border border-beige-pale rounded-xl px-3 py-2 text-xs font-semibold text-text-dark focus:outline-none focus:border-burgundy"
                  >
                    <option value="en">English (Default)</option>
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-dark/80 mb-1">
                    {t.common.emergencySecondLanguage}
                  </label>
                  <select
                    value={secondLang}
                    onChange={(e) => setSecondLang(e.target.value)}
                    className="w-full bg-white border border-beige-pale rounded-xl px-3 py-2 text-xs font-semibold text-text-dark focus:outline-none focus:border-burgundy"
                  >
                    <option value="none">{t.common.secondLanguageNone}</option>
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>
                </div>
              </div>

              {secondLang !== 'none' && (
                <div className="pt-1">
                  <Input
                    label={t.auth.fullNameSecondary}
                    value={fullNameSecondary}
                    onChange={(e) => setFullNameSecondary(e.target.value)}
                    placeholder={secondLang === 'bn' ? 'যেমন: অনন্যা সেন' : 'जैसे: अनन्या सेन'}
                  />
                  <p className="text-[10px] text-text-muted mt-1">
                    {t.common.secondLanguageNotice}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark/80">
                {t.auth.password}
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
                {t.auth.confirmPassword}
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
                  {t.auth.agreeTerms}
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-sm mt-3"
              loading={loading}
            >
              {t.common.signup}
            </Button>
          </form>

          <p className="text-xs text-text-muted text-center mt-6">
            {t.auth.alreadyHaveAccount}{' '}
            <Link to="/login" className="text-burgundy font-semibold hover:underline">
              {t.common.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
