import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Plus,
  Trash2,
  User,
  HeartPulse,
  Pill,
  Phone,
  AlertCircle,
  Eye,
  Mail,
  Languages,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { MedicalProfile, EmergencyVisibility, MedicationItem, Language } from '../types';

export const Profile: React.FC = () => {
  const { success, error: toastError } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'basic' | 'conditions' | 'allergies' | 'medications' | 'contact' | 'visibility'>('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [fullNameSecondary, setFullNameSecondary] = useState('');
  const [preferredLang, setPreferredLang] = useState<Language>('en');
  const [emergencySecondLang, setEmergencySecondLang] = useState<'none' | Language>('none');
  const [age, setAge] = useState<string>('');
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [noKnownAllergies, setNoKnownAllergies] = useState(false);
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFreq, setNewMedFreq] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorContact, setDoctorContact] = useState('');
  const [ecName, setEcName] = useState('');
  const [ecNameSecondary, setEcNameSecondary] = useState('');
  const [ecRel, setEcRel] = useState('');
  const [ecPhone, setEcPhone] = useState('');
  const [ecEmail, setEcEmail] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // Visibility State
  const [visibility, setVisibility] = useState<EmergencyVisibility>({
    show_name: true,
    show_age: true,
    show_blood_group: true,
    show_allergies: true,
    show_medications: true,
    show_conditions: true,
    show_doctor_details: false,
    show_emergency_contact: true,
  });

  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.getProfile();
      const p = data.profile;
      setFullName(p.full_name || '');
      setFullNameSecondary(p.full_name_secondary || '');
      setPreferredLang((p.preferred_language as Language) || 'en');
      setEmergencySecondLang((p.emergency_second_language as Language) || 'none');
      setAge(p.age !== null ? String(p.age) : '');
      setBloodGroup(p.blood_group || '');
      setConditions(p.medical_conditions || []);
      setAllergies(p.allergies || []);
      setNoKnownAllergies(p.no_known_allergies || false);
      setMedications(p.current_medications || []);
      setDoctorName(p.doctor_name || '');
      setDoctorContact(p.doctor_contact || '');
      setEcName(p.emergency_contact_name || '');
      setEcNameSecondary(p.emergency_contact_name_secondary || '');
      setEcRel(p.emergency_contact_relationship || '');
      setEcPhone(p.emergency_contact_phone || '');
      setEcEmail(p.emergency_notification_email || p.emergency_contact_email || '');
      if (data.visibility) {
        setVisibility(data.visibility);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to load medical profile');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toastError('Please enter your full name');
      return;
    }
    if (!ecPhone.trim()) {
      toastError('Please provide an emergency contact phone number');
      return;
    }

    setSaving(true);
    try {
      await api.updateProfile({
        full_name: fullName.trim(),
        full_name_secondary: fullNameSecondary.trim() || null,
        preferred_language: preferredLang,
        emergency_second_language: emergencySecondLang === 'none' ? null : emergencySecondLang,
        age: age ? parseInt(age, 10) : null,
        blood_group: bloodGroup || null,
        medical_conditions: conditions,
        allergies: noKnownAllergies ? [] : allergies,
        no_known_allergies: noKnownAllergies,
        current_medications: medications,
        doctor_name: doctorName.trim() || null,
        doctor_contact: doctorContact.trim() || null,
        emergency_contact_name: ecName.trim(),
        emergency_contact_name_secondary: ecNameSecondary.trim() || null,
        emergency_contact_relationship: ecRel.trim(),
        emergency_contact_phone: ecPhone.trim(),
        emergency_contact_email: ecEmail.trim() || null,
        emergency_notification_email: ecEmail.trim() || null,
      });

      await api.updateVisibility(visibility);

      // Synchronize language context if preferred language was modified
      if (preferredLang !== language) {
        setLanguage(preferredLang);
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      success(t.profile.saveSuccess);
      fetchProfile();
    } catch (err: any) {
      toastError(err.message || 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!ecEmail.trim()) {
      toastError('Please enter an emergency alert email address first.');
      return;
    }
    setSendingTestEmail(true);
    try {
      const res = await api.sendTestEmail(ecEmail.trim());
      if (res.success) {
        success(`Test alert email dispatched to ${res.recipient}!`);
      } else {
        toastError(res.detail || 'Email delivery failed.');
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to dispatch test alert email');
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Condition Handlers
  const addCondition = () => {
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const removeCondition = (idx: number) => {
    setConditions(conditions.filter((_, i) => i !== idx));
  };

  // Allergy Handlers
  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
      setNoKnownAllergies(false);
    }
  };

  const removeAllergy = (idx: number) => {
    setAllergies(allergies.filter((_, i) => i !== idx));
  };

  // Medication Handlers
  const addMedication = () => {
    if (newMedName.trim()) {
      setMedications([
        ...medications,
        {
          name: newMedName.trim(),
          dosage: newMedDosage.trim() || 'Unspecified dosage',
          frequency: newMedFreq.trim() || undefined
        }
      ]);
      setNewMedName('');
      setNewMedDosage('');
      setNewMedFreq('');
    }
  };

  const removeMedication = (idx: number) => {
    setMedications(medications.filter((_, i) => i !== idx));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-text-muted text-sm font-medium">
          {t.common.loading}...
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'basic', label: t.profile.tabBasic, icon: User },
    { id: 'conditions', label: t.profile.tabConditions, icon: HeartPulse },
    { id: 'allergies', label: t.profile.tabAllergies, icon: AlertCircle },
    { id: 'medications', label: t.profile.tabMedications, icon: Pill },
    { id: 'contact', label: t.profile.tabContact, icon: Phone },
    { id: 'visibility', label: t.profile.tabVisibility, icon: Eye },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 text-left">
        {/* Header with Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-beige-pale/60">
          <div>
            <h1 className="font-serif text-3xl font-bold text-burgundy-deep tracking-tight">
              {t.profile.pageTitle}
            </h1>
            <p className="text-xs text-text-muted mt-1">
              {t.profile.pageSubtitle}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            loading={saving}
            icon={<Save className="w-4 h-4" />}
          >
            {t.profile.saveChanges}
          </Button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-burgundy text-white shadow-soft'
                    : 'bg-white text-text-dark border border-beige-pale hover:bg-beige-pale/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* --- SECTION 1: BASIC INFORMATION & LANGUAGE PREFERENCES --- */}
        {activeTab === 'basic' && (
          <Card variant="white" className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-beige-pale/60 pb-3">
              <h3 className="font-serif text-xl font-bold text-text-dark">{t.profile.tabBasic}</h3>
              <p className="text-xs text-text-muted">Personal identity, scripts, and language settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name (English) *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ananya Sen"
                required
              />

              <Input
                label="Full Name in Secondary Script (বাংলা / हिंदी / Regional)"
                value={fullNameSecondary}
                onChange={(e) => setFullNameSecondary(e.target.value)}
                placeholder="e.g. অনন্যা সেন or अनन्या सेन"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark/80">
                  {t.common.preferredLanguage}
                </label>
                <select
                  value={preferredLang}
                  onChange={(e) => setPreferredLang(e.target.value as Language)}
                  className="w-full bg-white border border-beige-pale rounded-xl px-4 py-2.5 text-sm text-text-dark focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15"
                >
                  <option value="en">English (Default)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark/80">
                  {t.common.emergencySecondLanguage}
                </label>
                <select
                  value={emergencySecondLang}
                  onChange={(e) => setEmergencySecondLang(e.target.value as 'none' | Language)}
                  className="w-full bg-white border border-beige-pale rounded-xl px-4 py-2.5 text-sm text-text-dark focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15"
                >
                  <option value="none">{t.common.secondLanguageNone}</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
                <p className="text-[11px] text-text-muted">
                  {t.common.secondLanguageNotice}
                </p>
              </div>

              <Input
                label={t.profile.age}
                type="number"
                min="0"
                max="130"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 72"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark/80">
                  {t.profile.bloodGroup}
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-white border border-beige-pale rounded-xl px-4 py-2.5 text-sm text-text-dark focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15"
                >
                  <option value="">{t.profile.selectBloodGroup}</option>
                  <option value="A+">A+ (A Positive)</option>
                  <option value="A-">A- (A Negative)</option>
                  <option value="B+">B+ (B Positive)</option>
                  <option value="B-">B- (B Negative)</option>
                  <option value="AB+">AB+ (AB Positive)</option>
                  <option value="AB-">AB- (AB Negative)</option>
                  <option value="O+">O+ (O Positive)</option>
                  <option value="O-">O- (O Negative)</option>
                  <option value="Unknown">Unknown / Not tested</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* --- SECTION 2: MEDICAL CONDITIONS --- */}
        {activeTab === 'conditions' && (
          <Card variant="white" className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-beige-pale/60 pb-3">
              <h3 className="font-serif text-xl font-bold text-text-dark">{t.profile.conditionsTitle}</h3>
              <p className="text-xs text-text-muted">
                {t.profile.conditionsSubtitle}
              </p>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                placeholder={t.profile.addConditionPlaceholder}
                className="flex-1 bg-white border border-beige-pale rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-light focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15"
              />
              <Button variant="secondary" onClick={addCondition} icon={<Plus className="w-4 h-4" />}>
                {t.profile.addConditionButton}
              </Button>
            </div>

            <div className="space-y-2">
              {conditions.length === 0 ? (
                <p className="text-xs text-text-muted italic py-4">{t.profile.noConditionsAdded}</p>
              ) : (
                <div className="flex flex-wrap gap-2.5 pt-2">
                  {conditions.map((cond, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-warm border border-beige-pale text-xs font-semibold text-text-dark shadow-soft-sm"
                    >
                      <span>{cond}</span>
                      <button
                        onClick={() => removeCondition(idx)}
                        className="text-text-muted hover:text-medical-red transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* --- SECTION 3: ALLERGIES --- */}
        {activeTab === 'allergies' && (
          <Card variant="white" className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-beige-pale/60 pb-3">
              <h3 className="font-serif text-xl font-bold text-text-dark">{t.profile.allergiesTitle}</h3>
              <p className="text-xs text-text-muted">
                {t.profile.allergiesSubtitle}
              </p>
            </div>

            {/* Explicit "No Known Allergies" toggle */}
            <div className="p-4 rounded-xl bg-beige-pale/40 border border-beige-subtle flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-text-dark">{t.profile.noKnownAllergiesCheckbox}</span>
                <p className="text-[11px] text-text-muted">
                  Confirm explicitly that the individual has no known allergies.
                </p>
              </div>
              <input
                type="checkbox"
                checked={noKnownAllergies}
                onChange={(e) => {
                  setNoKnownAllergies(e.target.checked);
                  if (e.target.checked) setAllergies([]);
                }}
                className="w-5 h-5 rounded text-burgundy focus:ring-burgundy cursor-pointer"
              />
            </div>

            {!noKnownAllergies && (
              <>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                    placeholder={t.profile.addAllergyPlaceholder}
                    className="flex-1 bg-white border border-beige-pale rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-light focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15"
                  />
                  <Button variant="secondary" onClick={addAllergy} icon={<Plus className="w-4 h-4" />}>
                    {t.profile.addAllergyButton}
                  </Button>
                </div>

                <div className="space-y-2">
                  {allergies.length === 0 ? (
                    <p className="text-xs text-text-muted italic py-2">
                      No allergies added yet. (If confirmed none, check 'No Known Allergies' above).
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {allergies.map((allg, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-medical-red"
                        >
                          <span>{allg}</span>
                          <button
                            onClick={() => removeAllergy(idx)}
                            className="text-text-muted hover:text-medical-red transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>
        )}

        {/* --- SECTION 4: MEDICATIONS & PHYSICIAN --- */}
        {activeTab === 'medications' && (
          <Card variant="white" className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-beige-pale/60 pb-3">
              <h3 className="font-serif text-xl font-bold text-text-dark">{t.profile.medicationsTitle}</h3>
              <p className="text-xs text-text-muted">
                {t.profile.medicationsSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                placeholder={t.profile.medName}
                className="bg-white border border-beige-pale rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-light focus:outline-none focus:border-burgundy"
              />
              <input
                type="text"
                value={newMedDosage}
                onChange={(e) => setNewMedDosage(e.target.value)}
                placeholder={t.profile.medDosage}
                className="bg-white border border-beige-pale rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-light focus:outline-none focus:border-burgundy"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMedFreq}
                  onChange={(e) => setNewMedFreq(e.target.value)}
                  placeholder={t.profile.medFrequency}
                  className="flex-1 bg-white border border-beige-pale rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-light focus:outline-none focus:border-burgundy"
                />
                <Button variant="secondary" onClick={addMedication} icon={<Plus className="w-4 h-4" />}>
                  {t.profile.addMedication}
                </Button>
              </div>
            </div>

            {/* List of medications */}
            <div className="space-y-2 pt-2">
              {medications.length === 0 ? (
                <p className="text-xs text-text-muted italic py-4">{t.profile.noMedicationsAdded}</p>
              ) : (
                <div className="divide-y divide-beige-pale/60 border border-beige-pale rounded-2xl overflow-hidden bg-cream-warm/40">
                  {medications.map((med, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-text-dark text-sm">{med.name}</p>
                        <p className="text-text-muted mt-0.5">
                          {t.profile.medDosage}: <span className="font-semibold text-text-dark">{med.dosage}</span>
                          {med.frequency && ` • ${t.profile.medFrequency}: ${med.frequency}`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeMedication(idx)}
                        className="text-text-muted hover:text-medical-red p-1.5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-beige-pale/60 space-y-4">
              <h4 className="font-serif text-base font-bold text-burgundy-deep">
                {t.profile.doctorDetails}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t.profile.doctorName}
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. R. Chatterjee"
                />
                <Input
                  label={t.profile.doctorContact}
                  value={doctorContact}
                  onChange={(e) => setDoctorContact(e.target.value)}
                  placeholder="e.g. +91 98765 12345"
                />
              </div>
            </div>
          </Card>
        )}

        {/* --- SECTION 5: EMERGENCY CONTACT --- */}
        {activeTab === 'contact' && (
          <Card variant="white" className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-beige-pale/60 pb-3">
              <h3 className="font-serif text-xl font-bold text-text-dark">{t.profile.emergencyContactTitle}</h3>
              <p className="text-xs text-text-muted">
                The primary person to be dialed immediately when somebody scans your emergency QR code.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label={`${t.profile.contactName} (English) *`}
                value={ecName}
                onChange={(e) => setEcName(e.target.value)}
                placeholder="e.g. Ritu Sen"
                required
              />

              <Input
                label="Contact Name in Secondary Script (বাংলা / हिंदी)"
                value={ecNameSecondary}
                onChange={(e) => setEcNameSecondary(e.target.value)}
                placeholder="e.g. রিতু সেন or रितु सेन"
              />

              <Input
                label={`${t.profile.contactRelationship} *`}
                value={ecRel}
                onChange={(e) => setEcRel(e.target.value)}
                placeholder="e.g. Daughter, Spouse, Son"
                required
              />

              <Input
                label={`${t.profile.contactPhone} *`}
                value={ecPhone}
                onChange={(e) => setEcPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                required
              />
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-medical-red flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Instant 1-Tap Dialing</p>
                <p className="mt-0.5 text-medical-dark leading-relaxed">
                  During an emergency scan, a large call button will link directly to this phone number (<span className="font-mono font-bold">tel:</span> protocol) so emergency responders can connect immediately.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-beige-pale/60 space-y-4">
              <div>
                <h4 className="font-serif text-base font-bold text-burgundy-deep flex items-center gap-2">
                  <Mail className="w-4 h-4 text-burgundy" />
                  Emergency Notification Email
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  Instant safety alerts are dispatched here when your emergency QR is scanned. Specific medical diagnoses, medications, and allergies are never included.
                </p>
              </div>

              {/* Email Address Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-dark">
                  Emergency Alert Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={ecEmail}
                    onChange={(e) => setEcEmail(e.target.value)}
                    placeholder="e.g. caregiver@example.com"
                    className="w-full bg-white border border-beige-pale rounded-xl px-3.5 py-2.5 text-xs text-text-dark placeholder:text-text-muted/60 focus:outline-none focus:border-burgundy"
                  />
                </div>
                <p className="text-[11px] text-text-muted">
                  Separate from your account login email. Belongs to you, a family member, or a primary caregiver. Saves automatically when you click "{t.profile.saveChanges}".
                </p>
              </div>

              {/* Send Test Alert Button */}
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSendTestEmail}
                  loading={sendingTestEmail}
                  icon={<Mail className="w-4 h-4 text-burgundy" />}
                >
                  Send Test Alert Email
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* --- SECTION 6: VISIBILITY PRIVACY SETTINGS --- */}
        {activeTab === 'visibility' && (
          <Card variant="white" className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-beige-pale/60 pb-3">
              <h3 className="font-serif text-xl font-bold text-text-dark">{t.profile.visibilityTitle}</h3>
              <p className="text-xs text-text-muted">
                {t.profile.visibilitySubtitle}
              </p>
            </div>

            <div className="space-y-4">
              {[
                { key: 'show_name', label: t.profile.showName, desc: 'Allows first responders to confirm who they are treating.' },
                { key: 'show_age', label: t.profile.showAge, desc: 'Provides clinical age context for emergency dosages.' },
                { key: 'show_blood_group', label: t.profile.showBloodGroup, desc: 'Vital for rapid transfusion and trauma response.' },
                { key: 'show_allergies', label: t.profile.showAllergies, desc: 'Critical to prevent fatal medication errors.' },
                { key: 'show_medications', label: t.profile.showMedications, desc: 'Informs doctors of potential drug interactions.' },
                { key: 'show_conditions', label: t.profile.showConditions, desc: 'Highlights preexisting heart conditions, diabetes, etc.' },
                { key: 'show_emergency_contact', label: t.profile.showContact, desc: 'Allows the scanner to place an immediate call.' },
                { key: 'show_doctor_details', label: t.profile.showDoctor, desc: 'Optional: displays your primary doctor contact.' },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-4 rounded-xl bg-cream-warm/60 border border-beige-pale flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-xs font-bold text-text-dark block">{item.label}</span>
                    <span className="text-[11px] text-text-muted block">{item.desc}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={(visibility as any)[item.key]}
                      onChange={(e) => setVisibility({ ...visibility, [item.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-beige-pale peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
