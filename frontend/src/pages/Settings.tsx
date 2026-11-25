import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Trash2,
  AlertTriangle,
  Languages,
  Check
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/ui/Toast';
import { api } from '../services/api';
import { Language } from '../types';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) {
      toastError(t.auth.passwordLengthError);
      return;
    }
    if (newPw !== confirmNewPw) {
      toastError(t.auth.passwordMismatchError);
      return;
    }

    setPwLoading(true);
    try {
      await api.updatePassword(currentPw, newPw);
      success('Your password has been updated successfully!');
      setCurrentPw('');
      setNewPw('');
      setConfirmNewPw('');
    } catch (err: any) {
      toastError(err.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLanguageChange = async (newLang: Language) => {
    setLanguage(newLang);
    try {
      await api.updateProfile({ preferred_language: newLang });
      success(newLang === 'bn' ? 'ভাষা সফলভাবে পরিবর্তিত হয়েছে' : newLang === 'hi' ? 'भाषा सफलतापूर्वक बदल दी गई है' : 'Language updated successfully');
    } catch (err) {
      // Local state already updated
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.deleteAccount();
      logout();
      navigate('/');
    } catch (err: any) {
      toastError(err.message || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 text-left max-w-4xl">
        {/* Header */}
        <div className="pb-4 border-b border-beige-pale/60">
          <h1 className="font-serif text-3xl font-bold text-burgundy-deep tracking-tight">
            {t.settings.pageTitle}
          </h1>
          <p className="text-xs text-text-muted mt-1">
            {t.settings.pageSubtitle}
          </p>
        </div>

        {/* Section 1: Account Profile Info */}
        <Card variant="white" className="p-6 sm:p-8 space-y-4">
          <div className="border-b border-beige-pale/60 pb-3">
            <h3 className="font-serif text-xl font-bold text-text-dark">{t.settings.accountDetails}</h3>
            <p className="text-xs text-text-muted">Registered account identification.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-cream-warm border border-beige-pale">
              <span className="text-text-muted block text-[11px] font-semibold uppercase tracking-wider">{t.settings.accountName}</span>
              <p className="font-bold text-text-dark text-sm mt-1">{user?.full_name}</p>
            </div>
            <div className="p-4 rounded-xl bg-cream-warm border border-beige-pale">
              <span className="text-text-muted block text-[11px] font-semibold uppercase tracking-wider">{t.settings.accountEmail}</span>
              <p className="font-bold text-text-dark text-sm mt-1">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Section 2: Language & Regional Preferences */}
        <Card variant="white" className="p-6 sm:p-8 space-y-4">
          <div className="border-b border-beige-pale/60 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-text-dark">{t.settings.languagePreferences}</h3>
              <p className="text-xs text-text-muted">{t.settings.languagePreferencesSubtitle}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blush flex items-center justify-center text-burgundy">
              <Languages className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark/80">
              {t.common.preferredLanguage}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { code: 'en' as Language, title: 'English', desc: 'Default Interface Language' },
                { code: 'bn' as Language, title: 'বাংলা (Bengali)', desc: 'বাংলা ইন্টারফেস ও মেডিকেল পরিভাষা' },
                { code: 'hi' as Language, title: 'हिंदी (Hindi)', desc: 'हिंदी इंटरफेस एवं मेडिकल शब्दावली' },
              ].map((langItem) => {
                const isSelected = language === langItem.code;
                return (
                  <button
                    key={langItem.code}
                    type="button"
                    onClick={() => handleLanguageChange(langItem.code)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-burgundy bg-burgundy/5 ring-2 ring-burgundy/20'
                        : 'border-beige-pale hover:border-beige-subtle bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-burgundy-deep">{langItem.title}</span>
                      {isSelected && <Check className="w-4 h-4 text-burgundy" />}
                    </div>
                    <p className="text-[11px] text-text-muted mt-1">{langItem.desc}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-text-muted pt-1">
              Language changes are saved immediately across your current session and device.
            </p>
          </div>
        </Card>

        {/* Section 3: Update Password */}
        <Card variant="white" className="p-6 sm:p-8 space-y-4">
          <div className="border-b border-beige-pale/60 pb-3">
            <h3 className="font-serif text-xl font-bold text-text-dark">{t.settings.changePassword}</h3>
            <p className="text-xs text-text-muted">Ensure your account remains secure.</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <Input
              label={t.settings.currentPassword}
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Enter current password"
              required
            />
            <Input
              label={t.settings.newPassword}
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
            <Input
              label={t.settings.confirmNewPassword}
              type="password"
              value={confirmNewPw}
              onChange={(e) => setConfirmNewPw(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={pwLoading}
              icon={<Lock className="w-4 h-4" />}
            >
              {t.settings.updatePasswordButton}
            </Button>
          </form>
        </Card>

        {/* Section 4: Danger Zone */}
        <Card variant="white" className="p-6 sm:p-8 space-y-4 border-rose-200">
          <div className="border-b border-rose-100 pb-3">
            <h3 className="font-serif text-xl font-bold text-medical-red">{t.settings.dangerZone}</h3>
            <p className="text-xs text-text-muted">{t.settings.dangerZoneSubtitle}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <div>
              <p className="text-xs font-bold text-medical-dark">{t.settings.confirmDeleteTitle}</p>
              <p className="text-[11px] text-medical-red mt-0.5 leading-relaxed">
                {t.settings.confirmDeleteMessage}
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              icon={<Trash2 className="w-4 h-4" />}
              className="shrink-0"
            >
              {t.settings.deleteAccountButton}
            </Button>
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title={t.settings.confirmDeleteTitle}
          description="This action cannot be undone."
        >
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-medical-red space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Immediate Cascade Revocation</span>
              </div>
              <p className="leading-relaxed text-medical-dark">
                {t.settings.confirmDeleteMessage}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="cream"
                onClick={() => setDeleteModalOpen(false)}
              >
                {t.common.cancel}
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                loading={deleteLoading}
              >
                Yes, Delete Everything
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
