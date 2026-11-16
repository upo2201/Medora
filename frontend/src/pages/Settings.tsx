import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();
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
      toastError('New password must be at least 6 characters.');
      return;
    }
    if (newPw !== confirmNewPw) {
      toastError('New passwords do not match.');
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
            Account Settings
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage your credentials, privacy settings, and emergency preferences.
          </p>
        </div>

        {/* Section 1: Account Profile Info */}
        <Card variant="white" className="p-6 sm:p-8 space-y-4">
          <div className="border-b border-beige-pale/60 pb-3">
            <h3 className="font-serif text-xl font-bold text-text-dark">Account Details</h3>
            <p className="text-xs text-text-muted">Registered account identification.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-cream-warm border border-beige-pale">
              <span className="text-text-muted block text-[11px] font-semibold uppercase tracking-wider">Account Name</span>
              <p className="font-bold text-text-dark text-sm mt-1">{user?.full_name}</p>
            </div>
            <div className="p-4 rounded-xl bg-cream-warm border border-beige-pale">
              <span className="text-text-muted block text-[11px] font-semibold uppercase tracking-wider">Email Address</span>
              <p className="font-bold text-text-dark text-sm mt-1">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Section 2: Update Password */}
        <Card variant="white" className="p-6 sm:p-8 space-y-4">
          <div className="border-b border-beige-pale/60 pb-3">
            <h3 className="font-serif text-xl font-bold text-text-dark">Change Password</h3>
            <p className="text-xs text-text-muted">Ensure your account remains secure.</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Enter current password"
              required
            />
            <Input
              label="New Password"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
            <Input
              label="Confirm New Password"
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
              Update Password
            </Button>
          </form>
        </Card>

        {/* Section 3: Danger Zone */}
        <Card variant="white" className="p-6 sm:p-8 space-y-4 border-rose-200">
          <div className="border-b border-rose-100 pb-3">
            <h3 className="font-serif text-xl font-bold text-medical-red">Danger Zone</h3>
            <p className="text-xs text-text-muted">Permanent account and QR deactivation.</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <div>
              <p className="text-xs font-bold text-medical-dark">Delete Account & Revoke All QR Codes</p>
              <p className="text-[11px] text-medical-red mt-0.5 leading-relaxed">
                Permanently deletes your medical profile, removes access logs, and renders all physical QR cards completely inactive.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              icon={<Trash2 className="w-4 h-4" />}
              className="shrink-0"
            >
              Delete Account
            </Button>
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Permanently Delete Account?"
          description="This action cannot be undone."
        >
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-medical-red space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Immediate Cascade Revocation</span>
              </div>
              <p className="leading-relaxed text-medical-dark">
                Deleting your account will immediately revoke all active QR tokens. Any physical wallet cards or lock screen wallpapers will cease to function.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="cream"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
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

