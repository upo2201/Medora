import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HeartPulse,
  PhoneCall,
  AlertCircle,
  Pill,
  Heart,
  Droplets,
  ShieldCheck,
  ShieldAlert,
  Stethoscope,
  ArrowLeft,
  Languages
} from 'lucide-react';
import { api } from '../services/api';
import { EmergencyPublicData, Language } from '../types';
import { translations, translateClinical } from '../utils/translations';

export const EmergencyPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<EmergencyPublicData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentLang, setCurrentLang] = useState<Language>('en');

  useEffect(() => {
    if (!token) return;

    api.getEmergencyProfile(token)
      .then((res) => {
        setData(res);
      })
      .catch(() => {
        setData({
          status: 'invalid',
          message: 'Unable to communicate with emergency service. Please try scanning again.'
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // Primary language translations
  const pT = translations[currentLang]?.emergency || translations.en.emergency;
  const pCommon = translations[currentLang]?.common || translations.en.common;

  // Secondary language determination:
  // If user has set an emergency_second_language (e.g. 'bn' or 'hi')
  // When currentLang === 'en', secondary language is patient's chosen second language.
  // When currentLang !== 'en', secondary language is English ('en') so English is always preserved!
  const patientSecondLang: Language | null =
    data?.emergency_second_language === 'bn' || data?.emergency_second_language === 'hi'
      ? data.emergency_second_language
      : null;

  const secLang: Language | null =
    currentLang === 'en'
      ? patientSecondLang
      : 'en';

  const sT = secLang ? translations[secLang]?.emergency : null;

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
              {pT.revokedTitle}
            </h2>
            {sT && sT.revokedTitle !== pT.revokedTitle && (
              <p className="text-sm font-medium text-medical-red/80">{sT.revokedTitle}</p>
            )}
            <p className="text-xs text-text-dark/80 leading-relaxed pt-1">
              {pT.revokedMessage}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-beige-pale text-xs font-semibold text-text-dark hover:bg-beige-subtle transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{pT.backToHome}</span>
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
              {pT.invalidTitle}
            </h2>
            {sT && sT.invalidTitle !== pT.invalidTitle && (
              <p className="text-sm font-medium text-text-muted">{sT.invalidTitle}</p>
            )}
            <p className="text-xs text-text-muted leading-relaxed pt-1">
              {data?.message || pT.invalidMessage}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-beige-pale text-xs font-semibold text-text-dark hover:bg-beige-subtle transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{pT.backToHome}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active Emergency Medical Profile Display
  const ecPhone = data.emergency_contact?.phone || '';
  const clinicalTargetLang = secLang && secLang !== 'en' ? secLang : (currentLang !== 'en' ? currentLang : undefined);

  // Helper for emergency contact relationship translation
  const ecRelationshipSec = data.emergency_contact?.relationship
    ? translateClinical(data.emergency_contact.relationship, clinicalTargetLang)
    : null;

  return (
    <div className="min-h-screen bg-cream-warm text-text-dark flex flex-col antialiased">
      {/* Top Banner with Brand & Responder Language Toggle */}
      <header className="sticky top-0 z-30 bg-burgundy-deep text-white px-4 sm:px-6 py-3.5 shadow-soft">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-burgundy flex items-center justify-center text-white shrink-0">
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
          <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl">
            <Languages className="w-3.5 h-3.5 text-white/70 ml-1 hidden xs:block" />
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
      <div className="bg-burgundy text-white py-3 px-4 sm:px-6 text-center border-b border-burgundy-dark/40">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-medical-red flex items-center justify-center text-white text-[10px] font-black shrink-0">
              !
            </div>
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              {pT.emergencyHeader}
            </span>
            {sT && sT.emergencyHeader !== pT.emergencyHeader && (
              <span className="text-white/80 text-[10px]">
                / {sT.emergencyHeader}
              </span>
            )}
          </div>
          <span className="hidden sm:inline text-white/60">•</span>
          <span className="text-white/80 text-[11px] text-center">
            {pT.emergencyNotice}
          </span>
          {patientSecondLang && (
            <span className="text-[10px] font-medium bg-white/15 px-2 py-0.5 rounded-full text-blush hidden md:inline-block">
              Bilingual Profile
            </span>
          )}
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
                {/* Secondary Script Full Name if configured */}
                {data.full_name_secondary && (
                  <p className="text-base font-semibold text-burgundy mt-0.5">
                    {data.full_name_secondary}
                  </p>
                )}
                <div className="text-xs text-text-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  {data.age !== undefined && (
                    <span>
                      {pT.age}: <strong className="text-text-dark">{data.age}</strong> {pT.yearsOld}
                      {sT && sT.age !== pT.age && (
                        <span className="text-[10px] text-text-muted ml-1">({sT.age})</span>
                      )}
                    </span>
                  )}
                  {data.blood_group && <span>•</span>}
                  {data.blood_group && (
                    <span>
                      {pT.bloodGroup}:{' '}
                      <strong className="text-burgundy font-bold text-sm">{data.blood_group}</strong>
                      {sT && sT.bloodGroup !== pT.bloodGroup && (
                        <span className="text-[10px] text-text-muted ml-1">({sT.bloodGroup})</span>
                      )}
                    </span>
                  )}
                </div>
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
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-medical-red hover:bg-medical-dark text-white font-bold text-base shadow-soft-lg active:scale-[0.99] transition-all text-center"
              >
                <PhoneCall className="w-5 h-5 animate-bounce shrink-0" />
                <span>
                  {pT.callEmergencyContact}: {data.emergency_contact.name}
                  {data.emergency_contact.relationship && (
                    <span className="font-normal opacity-95">
                      {' '}({data.emergency_contact.relationship}
                      {ecRelationshipSec ? ` / ${ecRelationshipSec}` : ''})
                    </span>
                  )}
                </span>
              </a>
              <div className="text-center text-[11px] text-text-muted mt-2 space-y-0.5">
                <p>
                  {data.emergency_contact.name_secondary && (
                    <strong className="text-text-dark font-medium mr-1.5">
                      {data.emergency_contact.name_secondary} •
                    </strong>
                  )}
                  Direct Dial: <span className="font-mono font-semibold text-text-dark">{ecPhone}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section: Known Allergies (Crucial Alert) */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-beige-pale space-y-3">
          <div className="flex items-center justify-between border-b border-beige-pale/60 pb-3">
            <div className="flex items-center gap-2.5 text-medical-red">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <h3 className="font-serif text-lg font-bold leading-tight">{pT.allergies}</h3>
                {sT && sT.allergies !== pT.allergies && (
                  <p className="text-xs text-text-muted font-sans font-medium">{sT.allergies}</p>
                )}
              </div>
            </div>
          </div>

          {data.no_known_allergies ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-status-success font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <div>
                <span>{pT.noKnownAllergies}</span>
                {sT && sT.noKnownAllergies !== pT.noKnownAllergies && (
                  <span className="text-[11px] font-normal opacity-80 ml-1.5">({sT.noKnownAllergies})</span>
                )}
              </div>
            </div>
          ) : data.allergies && data.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2.5 pt-1">
              {data.allergies.map((allergy, i) => {
                const secTerm = translateClinical(allergy, clinicalTargetLang);
                return (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-full bg-rose-50 border border-rose-200 text-medical-red text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <span>{allergy}</span>
                    {secTerm && (
                      <span className="text-[11px] font-medium text-rose-700/80">({secTerm})</span>
                    )}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic py-1">
              {pT.allergiesNotProvided}
            </p>
          )}
        </div>

        {/* Section: Current Medications */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-beige-pale space-y-3">
          <div className="flex items-center justify-between border-b border-beige-pale/60 pb-3">
            <div className="flex items-center gap-2.5 text-burgundy-deep">
              <Pill className="w-5 h-5 shrink-0" />
              <div>
                <h3 className="font-serif text-lg font-bold leading-tight">{pT.medications}</h3>
                {sT && sT.medications !== pT.medications && (
                  <p className="text-xs text-text-muted font-sans font-medium">{sT.medications}</p>
                )}
              </div>
            </div>
          </div>

          {data.current_medications && data.current_medications.length > 0 ? (
            <div className="divide-y divide-beige-pale/60">
              {data.current_medications.map((med, i) => {
                const secFreq = med.frequency ? translateClinical(med.frequency, clinicalTargetLang) : null;
                return (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-text-dark text-sm">{med.name}</p>
                      <p className="text-text-muted mt-0.5">
                        {pT.dosage}: <strong className="text-text-dark">{med.dosage}</strong>
                        {med.frequency && (
                          <span>
                            {' '}• {pT.frequency}: <span className="text-text-dark">{med.frequency}</span>
                            {secFreq && <span className="text-text-muted text-[11px] ml-1">({secFreq})</span>}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic py-1">
              {pT.medicationsNotProvided}
            </p>
          )}
        </div>

        {/* Section: Medical Conditions */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-beige-pale space-y-3">
          <div className="flex items-center justify-between border-b border-beige-pale/60 pb-3">
            <div className="flex items-center gap-2.5 text-burgundy-deep">
              <Heart className="w-5 h-5 shrink-0" />
              <div>
                <h3 className="font-serif text-lg font-bold leading-tight">{pT.conditions}</h3>
                {sT && sT.conditions !== pT.conditions && (
                  <p className="text-xs text-text-muted font-sans font-medium">{sT.conditions}</p>
                )}
              </div>
            </div>
          </div>

          {data.medical_conditions && data.medical_conditions.length > 0 ? (
            <div className="flex flex-wrap gap-2.5 pt-1">
              {data.medical_conditions.map((cond, i) => {
                const secTerm = translateClinical(cond, clinicalTargetLang);
                return (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 rounded-full bg-cream-warm border border-beige-pale text-xs font-semibold text-text-dark inline-flex items-center gap-1.5"
                  >
                    <span>{cond}</span>
                    {secTerm && (
                      <span className="text-[11px] text-burgundy/80 font-normal">({secTerm})</span>
                    )}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic py-1">
              {pT.conditionsNotProvided}
            </p>
          )}
        </div>

        {/* Section: Doctor Details (If approved for visibility) */}
        {data.doctor_name && (
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-beige-pale space-y-3">
            <div className="flex items-center justify-between border-b border-beige-pale/60 pb-3">
              <div className="flex items-center gap-2.5 text-burgundy-deep">
                <Stethoscope className="w-5 h-5 shrink-0" />
                <div>
                  <h3 className="font-serif text-lg font-bold leading-tight">{pT.doctorDetails}</h3>
                  {sT && sT.doctorDetails !== pT.doctorDetails && (
                    <p className="text-xs text-text-muted font-sans font-medium">{sT.doctorDetails}</p>
                  )}
                </div>
              </div>
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
        <div className="p-4 rounded-2xl bg-beige-pale/50 border border-beige-pale text-center text-xs text-text-muted space-y-1.5">
          <p className="font-medium text-text-dark">
            ✓ {pT.privacyDisclaimer}
          </p>
          {sT && sT.privacyDisclaimer !== pT.privacyDisclaimer && (
            <p className="text-[11px] text-text-muted">
              {sT.privacyDisclaimer}
            </p>
          )}
          <p className="text-[10px] text-text-muted pt-1">
            {pT.scanAccessedAt}: {data.scan_timestamp ? new Date(data.scan_timestamp).toLocaleString() : 'Now'}
          </p>
          <p className="text-[10px] text-burgundy/80 font-medium">
            {pT.demonstrationNotice}
          </p>
        </div>
      </main>
    </div>
  );
};
