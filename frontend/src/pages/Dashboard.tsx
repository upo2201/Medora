import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  QrCode,
  Eye,
  History,
  ShieldAlert,
  ArrowRight,
  Smartphone,
  Printer,
  Sparkles,
  Calendar
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { MedicalProfile, QRToken, AccessLog } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [qrToken, setQrToken] = useState<QRToken | null>(null);
  const [recentLogs, setRecentLogs] = useState<AccessLog[]>([]);
  const [totalScans, setTotalScans] = useState<number>(0);
  const [thisMonthScans, setThisMonthScans] = useState<number>(0);
  const [revokedCount, setRevokedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [profData, qrData, logsData] = await Promise.all([
          api.getProfile(),
          api.getCurrentQR(),
          api.getAccessLogs(1, 5)
        ]);

        setProfile(profData.profile);
        setQrToken(profData.qr || qrData.qr);
        setTotalScans(profData.stats.total_scans);
        setThisMonthScans(qrData.stats.this_month_scans);
        setRevokedCount(qrData.stats.revoked_count);
        setRecentLogs(logsData.logs);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'there';

  return (
    <DashboardLayout>
      <div className="space-y-8 text-left">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-burgundy-deep tracking-tight">
              Hello, {firstName}! 👋
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Keep your medical information updated and stay prepared for emergencies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="cream"
              size="sm"
              onClick={() => navigate('/access-logs')}
              icon={<History className="w-4 h-4 text-burgundy" />}
            >
              Access Logs
            </Button>
            <Button
              variant="cream"
              size="sm"
              onClick={() => navigate('/profile')}
              icon={<User className="w-4 h-4 text-burgundy" />}
            >
              Edit Profile
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/qr')}
              icon={<QrCode className="w-4 h-4" />}
            >
              My QR Code
            </Button>
          </div>
        </div>

        {/* Top 2 Primary Cards: Profile Snapshot & QR Snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Medical Profile Summary */}
          <Card variant="white" className="p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blush text-burgundy-deep font-serif font-bold text-xl flex items-center justify-center shadow-soft">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-dark">
                    {profile?.full_name || 'Loading Profile...'}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {profile?.age ? `Age: ${profile.age} years` : 'Age: Not set'}
                    {profile?.blood_group ? ` • Blood Group: ${profile.blood_group}` : ''}
                  </p>
                </div>
              </div>
              <Button
                variant="cream"
                size="sm"
                onClick={() => navigate('/profile')}
              >
                Edit
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t border-beige-pale/60 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-text-muted block">Emergency Contact</span>
                <span className="font-semibold text-text-dark truncate block mt-0.5">
                  {profile?.emergency_contact_name
                    ? `${profile.emergency_contact_name} (${profile.emergency_contact_relationship || 'Contact'})`
                    : 'Not configured'}
                </span>
              </div>
              <div>
                <span className="text-text-muted block">Primary Conditions</span>
                <span className="font-semibold text-text-dark truncate block mt-0.5">
                  {profile?.medical_conditions && profile.medical_conditions.length > 0
                    ? profile.medical_conditions.join(', ')
                    : 'None listed'}
                </span>
              </div>
            </div>
          </Card>

          {/* Card 2: QR Status & Quick Actions */}
          <Card variant="white" className="p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Emergency Access
                </span>
                <h3 className="font-serif text-xl font-bold text-text-dark mt-1">
                  Your Medical QR Code
                </h3>
              </div>
              {qrToken?.status === 'active' ? (
                <Badge variant="active">Active</Badge>
              ) : qrToken?.status === 'revoked' ? (
                <Badge variant="revoked">Revoked</Badge>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-beige-pale text-text-muted text-[10px] font-bold border border-beige-subtle">
                  Not Generated
                </span>
              )}
            </div>

            <p className="text-xs text-text-muted mt-2">
              {qrToken?.created_at
                ? `Last generated on ${new Date(qrToken.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : 'No emergency QR code generated yet'}
            </p>

            <div className="mt-6 pt-4 border-t border-beige-pale/60 flex items-center justify-between">
              <span className="text-xs text-text-muted">
                {qrToken?.last_accessed_at
                  ? `Last scan: ${new Date(qrToken.last_accessed_at).toLocaleDateString()}`
                  : qrToken?.status === 'active'
                  ? 'No scans recorded yet'
                  : 'Scan monitoring inactive'}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/qr')}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {qrToken?.status === 'active' ? 'View QR' : 'Generate QR'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Real Backend Statistics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-beige-pale flex items-center gap-4 shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-blush flex items-center justify-center text-burgundy shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-text-dark">{totalScans}</p>
              <p className="text-xs text-text-muted font-medium">Total Scans All-Time</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-beige-pale flex items-center gap-4 shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-status-success shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-text-dark">{thisMonthScans}</p>
              <p className="text-xs text-text-muted font-medium">Scans This Month</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-beige-pale flex items-center gap-4 shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-medical-red shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-text-dark">{revokedCount}</p>
              <p className="text-xs text-text-muted font-medium">Revoked Codes</p>
            </div>
          </div>
        </div>

        {/* Preparation Banner */}
        <div className="bg-gradient-to-r from-burgundy-deep to-burgundy text-white rounded-3xl p-8 relative overflow-hidden shadow-soft-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blush text-[11px] font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preparedness Recommendation</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">
              Be Prepared, Always.
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Keep your Medora QR saved as your phone's lock-screen wallpaper, and carry a printed wallet card or attach a phone-back sticker for situations when your phone battery runs out.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="cream"
              size="md"
              onClick={() => navigate('/qr')}
              icon={<Smartphone className="w-4 h-4 text-burgundy" />}
            >
              Get Wallpaper
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/qr')}
              icon={<Printer className="w-4 h-4 text-burgundy" />}
            >
              Print Card
            </Button>
          </div>
        </div>

        {/* Recent Access Activity */}
        <Card variant="white" className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-beige-pale/60">
            <div>
              <h3 className="font-serif text-lg font-bold text-burgundy-deep">
                Recent Access Activity
              </h3>
              <p className="text-xs text-text-muted">
                Every scan is recorded for transparency and peace of mind.
              </p>
            </div>
            <Button
              variant="cream"
              size="sm"
              onClick={() => navigate('/access-logs')}
              icon={<History className="w-4 h-4" />}
            >
              View All Logs
            </Button>
          </div>

          <div className="mt-4">
            {recentLogs.length === 0 ? (
              <div className="py-8 text-center text-text-muted text-xs">
                No emergency access scans have been recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-beige-pale/40">
                {recentLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-beige-pale/60 flex items-center justify-center text-text-dark font-medium">
                        <Smartphone className="w-4 h-4 text-burgundy" />
                      </div>
                      <div>
                        <p className="font-semibold text-text-dark">{log.device_type}</p>
                        <p className="text-[11px] text-text-muted">{log.browser} • {new Date(log.accessed_at).toLocaleString()}</p>
                      </div>
                    </div>
                    {log.access_status === 'success' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-status-success font-semibold text-[10px]">
                        Scan Viewed
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-medical-red font-semibold text-[10px]">
                        Deactivated Attempt
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

