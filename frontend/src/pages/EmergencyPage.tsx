import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HeartPulse,
  PhoneCall,
  AlertCircle,
  Pill,
  Heart,
  Droplets,
  User,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Stethoscope,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import { EmergencyPublicData, Language } from '../types';
import { translations } from '../utils/translations';
import { Badge } from '../components/ui/Badge';

export const EmergencyPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<EmergencyPublicData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentLang, setCurrentLang] = useState<Language>('en');

  const t = translations[currentLang];

  useEffect(() => {
    if (!token) return;

    api.getEmergencyProfile(token)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setData({
          status: 'invalid',
          message: 'Unable to communicate with emergency service. Please try scanning again.'
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // Loading state (ultra-fast minimal spinner)
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-warm flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-burgundy flex items-center justify-center text-white shadow-soft-lg animate-pulse mb-4">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-xl font-bold text-burgundy-deep">
          Retrieving Emergency Information...
        </h2>
        <p className="text-xs text-text-muted mt-1">Connecting to verified secure server</p>
      </div>
    );
  }

  // Revoked State
  if (data?.status === 'revoked') {
    return (
      <div className="min-h-screen bg-cream-warm flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-soft-lg space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-medical-red mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-medical-red">
              {t.revokedTitle}
            </h2>
            <p className="text-xs text-text-dark/80 leading-relaxed">
              {t.revokedMessage}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-beige-pale text-xs font-semibold text-text-dark hover:bg-beige-subtle transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.backToHome}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Invalid Token State
  if (data?.status === 'invalid' || !data) {
    return (
      <div className="min-h-screen bg-cream-warm flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-beige-pale shadow-soft-lg space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-beige-pale flex items-center justify-center text-burgundy mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-text-dark">
              {t.invalidTitle}
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              {data?.message || t.invalidMessage}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-beige-pale text-xs font-semibold text-text-dark hover:bg-beige-subtle transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.backToHome}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active Emergency Medical Profile Display
  const ecPhone = data.emergency_contact?.phone || '';

  return (
    <div className="min-h-screen bg-cream-warm text-text-dark flex flex-col antialiased">
      {/* Top Banner with Brand & Language Toggle */}
      <header className="sticky top-0 z-30 bg-burgundy-deep text-white px-6 py-4 shadow-soft">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-burgundy flex items-center justify-center text-white">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-bold text-sm block leading-tight">
                Medora
              </span>
              <span className="text-[9px] uppercase tracking-wider text-blush block">
                Emergency Response
              </span>
            </div>
          </div>

          {/* Multilingual Selector: English, বাংলা, हिन्दी */}
          <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
            {(['en', 'bn', 'hi'] as Language[]).map((lng) => {
              const labels: Record<Language, string> = {
                en: 'EN',
                bn: 'বাংলা',
                hi: 'हिंदी'
              };
              return (
                <button
                  key={lng}
                  onClick={() => setCurrentLang(lng)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    currentLang === lng
                      ? 'bg-white text-burgundy-deep shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {labels[lng]}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Emergency Headline Notice */}
      <div className="bg-burgundy text-white py-3 px-6 text-center border-b border-burgundy-dark/40">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 text-xs">
          <div className="w-4 h-4 rounded-full bg-medical-red flex items-center justify-center text-white text-[10px] font-black shrink-0">
            !
          </div>
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            {t.emergencyHeader}
          </span>
          <span className="hidden sm:inline text-white/70">• {t.emergencyNotice}</span>
        </div>
      </div>

      {/* Main Medical Content Canvas */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-5 text-left">
        {/* Patient Identity & Top Call Action */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-beige-pale space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blush text-burgundy-deep font-serif font-bold text-2xl flex items-center justify-center shadow-soft shrink-0">
                {data.full_name ? data.full_name.charAt(0).toUpperCase() : 'P'}
              </div>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-burgundy-deep">
                  {data.full_name || 'Patient'}
                </h1>
                <p className="text-xs text-text-muted mt-0.5">
                  {data.age !== undefined && `${t.age}: ${data.age} ${t.yearsOld}`}
                  {data.blood_group && ` • ${t.bloodGroup}: `}
                  {data.blood_group && (
                    <strong className="text-burgundy font-bold text-sm">{data.blood_group}</strong>
                  )}
                </p>
              </div>
            </div>

            {/* Blood group indicator badge */}
            {data.blood_group && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-medical-red shrink-0 self-start sm:self-center">
                <Droplets className="w-4 h-4 text-medical-red fill-medical-red" />
                <span className="font-bold text-sm">{data.blood_group}</span>
              </div>
            )}
          </div>

          {/* Prominent Emergency Call Button */}
          {data.emergency_contact && ecPhone && (
            <div className="pt-2">
              <a
                href={`tel:${ecPhone.replace(/\s+/g, '')}`}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-medical-red hover:bg-medical-dark text-white font-bold text-base shadow-soft-lg active:scale-[0.99] transition-all"
              >
                <PhoneCall className="w-5 h-5 animate-bounce" />
                <span>
                  {t.callEmergencyContact}: {data.emergency_contact.name} ({data.emergency_contact.relationship})
                </span>
              </a>
              <p className="text-center text-[11px] text-text-muted mt-2">
                Tap to dial registered emergency contact directly: <span className="font-mono font-semibold text-text-dark">{ecPhone}</span>
              </p>
            </div>
          )}
        </div>

        {/* Section: Known Allergies (Crucial Alert) */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-beige-pale space-y-3">
          <div className="flex items-center gap-2.5 text-medical-red border-b border-beige-pale/60 pb-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h3 className="font-serif text-lg font-bold">{t.allergies}</h3>
          </div>

          {data.no_known_allergies ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-status-success font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.noKnownAllergies}</span>
            </div>
          ) : data.allergies && data.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2.5 pt-1">
              {data.allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-full bg-rose-50 border border-rose-200 text-medical-red text-xs font-bold"
                >
                  {allergy}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic py-1">
              {t.allergiesNotProvided}
            </p>
          )}
        </div>

        {/* Section: Current Medications */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-beige-pale space-y-3">
          <div className="flex items-center gap-2.5 text-burgundy-deep border-b border-beige-pale/60 pb-3">
            <Pill className="w-5 h-5 shrink-0" />
            <h3 className="font-serif text-lg font-bold">{t.medications}</h3>
          </div>

          {data.current_medications && data.current_medications.length > 0 ? (
            <div className="divide-y divide-beige-pale/60">
              {data.current_medications.map((med, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-text-dark text-sm">{med.name}</p>
                    <p className="text-text-muted mt-0.5">
                      {t.dosage}: <strong className="text-text-dark">{med.dosage}</strong>
                      {med.frequency && ` • ${t.frequency}: ${med.frequency}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic py-1">
              {t.medicationsNotProvided}
            </p>
          )}
        </div>

        {/* Section: Medical Conditions */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-beige-pale space-y-3">
          <div className="flex items-center gap-2.5 text-burgundy-deep border-b border-beige-pale/60 pb-3">
            <Heart className="w-5 h-5 shrink-0" />
            <h3 className="font-serif text-lg font-bold">{t.conditions}</h3>
          </div>

          {data.medical_conditions && data.medical_conditions.length > 0 ? (
            <div className="flex flex-wrap gap-2.5 pt-1">
              {data.medical_conditions.map((cond, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1.5 rounded-full bg-cream-warm border border-beige-pale text-xs font-semibold text-text-dark"
                >
                  {cond}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic py-1">
              {t.conditionsNotProvided}
            </p>
          )}
        </div>

        {/* Section: Doctor Details (If approved for visibility) */}
        {data.doctor_name && (
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-beige-pale space-y-3">
            <div className="flex items-center gap-2.5 text-burgundy-deep border-b border-beige-pale/60 pb-3">
              <Stethoscope className="w-5 h-5 shrink-0" />
              <h3 className="font-serif text-lg font-bold">{t.doctorDetails}</h3>
            </div>
            <div className="text-xs text-text-dark space-y-1">
              <p className="font-bold text-sm">{data.doctor_name}</p>
              {data.doctor_contact && (
                <a
                  href={`tel:${data.doctor_contact.replace(/\s+/g, '')}`}
                  className="text-burgundy hover:underline font-mono inline-block font-semibold"
                >
                  {data.doctor_contact}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Access audit pill & Disclaimer */}
        <div className="p-4 rounded-2xl bg-beige-pale/50 border border-beige-pale text-center text-xs text-text-muted space-y-1">
          <p className="font-medium text-text-dark">
            ✓ {t.privacyDisclaimer}
          </p>
          <p className="text-[10px] text-text-muted">
            {t.scanAccessedAt}: {data.scan_timestamp ? new Date(data.scan_timestamp).toLocaleString() : 'Now'}
          </p>
          <p className="text-[10px] text-burgundy/80 font-medium pt-1">
            {t.demonstrationNotice}
          </p>
        </div>
      </main>
    </div>
  );
};

