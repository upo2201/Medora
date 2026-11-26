import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  QrCode,
  Lock,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  HeartHandshake
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../contexts/LanguageContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = t.home.faqs;
  const demoName = language === 'bn' ? 'অনন্যা সেন' : language === 'hi' ? 'अनन्या सेन' : 'Ananya Sen';

  return (
    <div className="min-h-screen bg-cream-warm text-text-dark flex flex-col">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Headline & Value Prop */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blush text-burgundy-deep text-xs font-semibold uppercase tracking-wider">
                <HeartHandshake className="w-4 h-4 text-burgundy" />
                <span>{t.home.heroBadge}</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-dark leading-[1.15]">
                {t.home.heroHeadline1} <br className="hidden sm:inline" />
                <span className="italic font-serif text-burgundy">{t.home.heroHeadlineHighlight}</span>
              </h1>

              <p className="text-lg text-text-muted max-w-xl leading-relaxed">
                {t.home.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => navigate('/signup')}
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  {t.home.createProfileButton}
                </Button>
                <Button
                  size="lg"
                  variant="cream"
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {t.home.seeHowItWorksButton}
                </Button>
              </div>

              {/* 3 Key Benefits */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-beige-pale">
                <div>
                  <div className="flex items-center gap-2 text-burgundy font-semibold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.home.benefitQuickAccessTitle}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">{t.home.benefitQuickAccessDesc}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-burgundy font-semibold text-sm">
                    <Lock className="w-4 h-4" />
                    <span>{t.home.benefitPrivacyFirstTitle}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">{t.home.benefitPrivacyFirstDesc}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-burgundy font-semibold text-sm">
                    <HeartHandshake className="w-4 h-4" />
                    <span>{t.home.benefitSeniorFriendlyTitle}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">{t.home.benefitSeniorFriendlyDesc}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Showcase Mockup */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative mx-auto max-w-md"
              >
                {/* Decorative Burgundy Glow Backdrop */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-burgundy/15 via-blush/40 to-transparent rounded-3xl blur-2xl -z-10" />

                {/* Main Visual Card */}
                <div className="bg-white rounded-3xl p-6 shadow-soft-lg border border-beige-pale relative overflow-hidden">
                  {/* Card Header Tag */}
                  <div className="flex items-center justify-between pb-5 border-b border-beige-pale/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-burgundy flex items-center justify-center text-white text-xs font-bold">
                        +
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-text-dark">{demoName}</h4>
                        <p className="text-[10px] text-text-muted">{t.common.appTagline} • {t.home.mockupAge}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-status-success text-[10px] font-bold border border-emerald-200">
                      {t.home.mockupActiveQr}
                    </span>
                  </div>

                  {/* Centered QR Visual */}
                  <div className="py-6 flex flex-col items-center justify-center bg-cream-warm/50 rounded-2xl my-4 border border-beige-pale/40">
                    <div className="relative p-3 bg-white rounded-2xl shadow-soft border border-beige-pale">
                      <QrCode className="w-36 h-36 text-burgundy" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-9 h-9 rounded-xl bg-white border-2 border-burgundy flex items-center justify-center shadow-soft">
                          <div className="w-4 h-4 text-medical-red font-black text-center text-sm leading-none">+</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-text-dark mt-3">{t.home.mockupScanPrompt}</p>
                    <p className="text-[10px] text-text-muted">{t.home.mockupScanSub}</p>
                  </div>

                  {/* Quick Medical Snapshot Badges */}
                  <div className="space-y-2 pt-1 text-left">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-beige-pale/40 text-xs">
                      <span className="text-text-muted font-medium">{t.home.mockupBloodGroupLabel}</span>
                      <span className="font-bold text-burgundy">{t.home.mockupBloodGroupValue}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-beige-pale/40 text-xs">
                      <span className="text-text-muted font-medium">{t.home.mockupAllergiesLabel}</span>
                      <span className="font-semibold text-text-dark">{t.home.mockupAllergiesValue}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 text-xs border border-rose-100">
                      <span className="text-medical-red font-medium">{t.home.mockupEmergencyContactLabel}</span>
                      <span className="font-bold text-medical-red">{t.home.mockupEmergencyContactValue}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (4-STEP PROCESS) --- */}
      <section id="how-it-works" className="py-20 bg-white border-y border-beige-pale/80">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-burgundy">{t.home.howItWorksBadge}</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-dark">
              {t.home.howItWorksTitle}
            </h2>
            <p className="text-sm text-text-muted">
              {t.home.howItWorksSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-cream-warm/70 border border-beige-pale text-left space-y-3 hover:shadow-soft transition-all">
              <div className="w-12 h-12 rounded-xl bg-burgundy text-white flex items-center justify-center font-serif font-bold text-lg">
                1
              </div>
              <h3 className="font-serif font-bold text-base text-text-dark">{t.home.step1Title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {t.home.step1Desc}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-cream-warm/70 border border-beige-pale text-left space-y-3 hover:shadow-soft transition-all">
              <div className="w-12 h-12 rounded-xl bg-burgundy text-white flex items-center justify-center font-serif font-bold text-lg">
                2
              </div>
              <h3 className="font-serif font-bold text-base text-text-dark">{t.home.step2Title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {t.home.step2Desc}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-cream-warm/70 border border-beige-pale text-left space-y-3 hover:shadow-soft transition-all">
              <div className="w-12 h-12 rounded-xl bg-burgundy text-white flex items-center justify-center font-serif font-bold text-lg">
                3
              </div>
              <h3 className="font-serif font-bold text-base text-text-dark">{t.home.step3Title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {t.home.step3Desc}
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-cream-warm/70 border border-beige-pale text-left space-y-3 hover:shadow-soft transition-all">
              <div className="w-12 h-12 rounded-xl bg-burgundy text-white flex items-center justify-center font-serif font-bold text-lg">
                4
              </div>
              <h3 className="font-serif font-bold text-base text-text-dark">{t.home.step4Title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {t.home.step4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOR CAREGIVERS & SENIORS --- */}
      <section id="for-caregivers" className="py-20 bg-burgundy-deep text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-blush">{t.home.caregiverBadge}</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                {t.home.caregiverTitle}
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                {t.home.caregiverDesc}
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blush shrink-0 mt-0.5" />
                  <span className="text-xs text-white/90">{t.home.caregiverPoint1}</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blush shrink-0 mt-0.5" />
                  <span className="text-xs text-white/90">{t.home.caregiverPoint2}</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blush shrink-0 mt-0.5" />
                  <span className="text-xs text-white/90">{t.home.caregiverPoint3}</span>
                </div>
              </div>
              <div className="pt-4">
                <Button
                  size="lg"
                  variant="cream"
                  onClick={() => navigate('/signup')}
                >
                  {t.home.caregiverGetStarted}
                </Button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md space-y-6 text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blush text-burgundy-deep font-bold flex items-center justify-center font-serif text-lg">
                  AS
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-white">{demoName}</h4>
                  <p className="text-xs text-blush">{t.home.caregiverManaged}</p>
                </div>
              </div>
              <blockquote className="text-sm text-white/90 italic leading-relaxed border-l-2 border-blush pl-4">
                {t.home.caregiverQuote}
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-20 bg-cream-warm">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="font-serif text-3xl font-bold text-text-dark">{t.home.faqTitle}</h2>
            <p className="text-sm text-text-muted">
              {t.home.faqSubtitle}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-beige-pale rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif text-base font-semibold text-text-dark hover:text-burgundy"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-text-muted shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-burgundy' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-text-muted leading-relaxed border-t border-beige-pale/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="mt-auto bg-white border-t border-beige-pale py-12 text-text-muted">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-burgundy flex items-center justify-center text-white text-xs font-bold">
              +
            </div>
            <div>
              <p className="font-serif font-bold text-sm text-burgundy-deep">{t.common.appName}</p>
              <p className="text-[10px] text-text-muted">{t.home.footerTagline}</p>
            </div>
          </div>
          <p className="text-center sm:text-right">
            {t.home.footerDisclaimer}
          </p>
        </div>
      </footer>
    </div>
  );
};
