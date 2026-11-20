import React, { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  Smartphone,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  QrCode,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { api } from '../services/api';
import { QRToken } from '../types';

export const QRManagement: React.FC = () => {
  const { success, error: toastError, info } = useToast();
  const [qrToken, setQrToken] = useState<QRToken | null>(null);
  const [patientName, setPatientName] = useState('Patient');
  const [rawToken, setRawToken] = useState<string>('');
  const [configuredBaseUrl, setConfiguredBaseUrl] = useState<string>('');
  const [customBaseUrl, setCustomBaseUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [wallpaperModalOpen, setWallpaperModalOpen] = useState(false);
  const [tunnelStatus, setTunnelStatus] = useState<{
    public_testing_mode: boolean;
    status: 'connected' | 'disconnected';
    tunnel_url: string | null;
  } | null>(null);

  const fetchQRData = async () => {
    try {
      const [data, tunnel] = await Promise.all([
        api.getCurrentQR(),
        api.getTunnelStatus()
      ]);
      setQrToken(data.qr);
      setPatientName(data.patient_name || 'Patient');
      setTunnelStatus(tunnel);
      if (data.qr && data.qr.status === 'active' && data.qr.raw_token) {
        setRawToken(data.qr.raw_token);
      } else {
        setRawToken('');
      }
      if (tunnel.public_testing_mode && tunnel.tunnel_url) {
        setConfiguredBaseUrl(tunnel.tunnel_url);
      } else if (data.configured_base_url) {
        setConfiguredBaseUrl(data.configured_base_url);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to load QR details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRData();
  }, []);

  const handleGenerateOrRegenerate = async () => {
    setActionLoading(true);
    try {
      const targetBase = customBaseUrl.trim() || undefined;
      const res = await api.generateQR(targetBase);
      setQrToken(res.token);
      if (res.token.raw_token) {
        setRawToken(res.token.raw_token);
      }
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      success('Your unique emergency QR code is generated and active!');
    } catch (err: any) {
      toastError(err.message || 'Failed to generate QR code');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    setActionLoading(true);
    try {
      await api.revokeQR();
      setRevokeModalOpen(false);
      setQrToken(null);
      setRawToken('');
      await fetchQRData();
      success('Your QR code has been revoked. Scanners will no longer see your details.');
    } catch (err: any) {
      toastError(err.message || 'Failed to revoke QR code');
    } finally {
      setActionLoading(false);
    }
  };

  const isQrActive = qrToken?.status === 'active' && Boolean(rawToken);
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const activeTunnel = (tunnelStatus?.public_testing_mode && tunnelStatus?.tunnel_url) ? tunnelStatus.tunnel_url : '';
  const effectiveBaseUrl = customBaseUrl.trim() || activeTunnel || configuredBaseUrl || currentOrigin;
  const emergencyUrl = (activeTunnel && rawToken ? `${activeTunnel}/emergency/${rawToken}` : qrToken?.emergency_url) || (rawToken ? `${effectiveBaseUrl.replace(/\/$/, '')}/emergency/${rawToken}` : '');
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const isTunnelUrlMismatch = Boolean(
    isQrActive &&
    tunnelStatus?.public_testing_mode &&
    tunnelStatus.tunnel_url &&
    qrToken?.emergency_url &&
    !qrToken.emergency_url.startsWith(tunnelStatus.tunnel_url)
  );

  const handleUpdateToCurrentTunnel = async () => {
    if (!tunnelStatus?.tunnel_url) return;
    setActionLoading(true);
    try {
      const res = await api.refreshQRForTunnel(tunnelStatus.tunnel_url);
      setQrToken(res.token);
      success('QR Code updated for current public address!');
    } catch (err: any) {
      toastError(err.message || 'Failed to update QR code URL');
    } finally {
      setActionLoading(false);
    }
  };

  const copyEmergencyLink = () => {
    if (!emergencyUrl) return;
    navigator.clipboard.writeText(emergencyUrl);
    info('Emergency link copied to clipboard!');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-text-muted text-sm font-medium">
          Loading QR code status...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-beige-pale/60">
          <div>
            <h1 className="font-serif text-3xl font-bold text-burgundy-deep tracking-tight">
              Emergency QR Code
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Your unique, cryptographically hashed access link for emergency medical assistance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isQrActive ? (
              <Badge variant="active">Active QR</Badge>
            ) : qrToken?.status === 'revoked' ? (
              <Badge variant="revoked">Deactivated</Badge>
            ) : (
              <span className="px-3 py-1 rounded-full bg-beige-pale text-text-muted text-xs font-semibold border border-beige-subtle">
                Not Generated
              </span>
            )}
          </div>
        </div>

        {/* Clean Empty State when no QR is generated or active */}
        {!isQrActive ? (
          <div className="max-w-2xl mx-auto py-8">
            <Card variant="white" className="p-8 sm:p-12 text-center space-y-6 shadow-soft-lg border border-beige-pale">
              <div className="w-20 h-20 rounded-3xl bg-cream-warm border border-beige-pale flex items-center justify-center text-burgundy mx-auto shadow-soft">
                <QrCode className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-burgundy-deep">
                  No Emergency QR Generated Yet
                </h2>
                <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
                  Generate a unique, cryptographically secure QR code linked to your emergency medical profile. Once created, first responders and bystanders can scan it from any smartphone to view your permitted emergency details.
                </p>
              </div>

              {/* Public Base URL Destination Configuration */}
              <div className="bg-cream-warm/70 p-4 rounded-2xl border border-beige-pale text-left space-y-2 max-w-lg mx-auto">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-text-dark uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-burgundy" />
                    Public Emergency Address
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                    Cross-Device Accessible
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">
                  The QR code encodes a public HTTPS URL so external phone cameras can reach it without hitting localhost.
                </p>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={customBaseUrl || (configuredBaseUrl && !configuredBaseUrl.includes('localhost') ? configuredBaseUrl : currentOrigin)}
                    onChange={(e) => setCustomBaseUrl(e.target.value)}
                    placeholder={currentOrigin || "https://your-app.onrender.com"}
                    className="w-full px-3 py-2 text-xs bg-white border border-beige-pale rounded-xl font-mono text-text-dark focus:outline-none focus:border-burgundy"
                  />
                  {isLocal ? (
                    <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      <strong>Cross-Device Notice:</strong> You are testing on <code>localhost</code>. Smartphone cameras cannot reach <code>localhost</code> on your PC. To test scanning from your phone, enter your computer's local Wi-Fi IP (e.g. <code>http://192.168.1.X:5173</code>) or deployed Render URL above.
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-700 font-medium">
                      ✓ Active production origin detected: <span className="font-mono">{currentOrigin}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto px-10 shadow-soft"
                  onClick={handleGenerateOrRegenerate}
                  loading={actionLoading}
                  icon={<QrCode className="w-5 h-5" />}
                >
                  Generate QR Code
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          /* Active QR State with 2 Columns */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: QR Card Display */}
            <div className="lg:col-span-7 space-y-6">
              <Card variant="white" className="p-8 text-center relative overflow-hidden space-y-6 shadow-soft-lg">
                {/* Header Status */}
                <div className="flex items-center justify-between pb-4 border-b border-beige-pale/60">
                  <div className="text-left">
                    <h3 className="font-serif text-xl font-bold text-text-dark">{patientName}</h3>
                    <p className="text-xs text-text-muted">
                      {qrToken?.created_at
                        ? `Generated on ${new Date(qrToken.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : 'Active emergency profile'}
                    </p>
                  </div>
                  <Badge variant="active">Active</Badge>
                </div>

                {/* Warning: Public URL Changed Since Generation */}
                {isTunnelUrlMismatch && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Public Emergency Link Updated</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      The active public access host has updated since this QR code was generated. Update your QR code to ensure phone scans point to the active link without altering your medical security token.
                    </p>
                    <div className="pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleUpdateToCurrentTunnel}
                        loading={actionLoading}
                        icon={<RefreshCw className="w-3.5 h-3.5" />}
                      >
                        Update QR for Current Public Link
                      </Button>
                    </div>
                  </div>
                )}

                {/* QR Visual */}
                <div className="py-6 flex flex-col items-center justify-center">
                  <div className="relative p-5 bg-white rounded-3xl border-2 border-burgundy/20 shadow-soft-lg">
                    <img
                      src={api.getDownloadQRUrl(rawToken, effectiveBaseUrl)}
                      alt="Emergency Medical QR Code"
                      className="w-56 h-56 object-contain"
                    />
                  </div>
                  <p className="text-xs font-semibold text-text-dark mt-3">
                    Scan with any phone camera
                  </p>
                  <p className="text-[10px] text-text-muted">
                    Direct browser access • Read-only emergency card
                  </p>
                </div>

                {/* Direct Emergency Link Pill */}
                <div className="p-3.5 rounded-2xl bg-cream-warm/70 border border-beige-pale flex items-center justify-between gap-3 text-xs">
                  <div className="truncate text-left">
                    <span className="text-[10px] uppercase font-bold text-text-muted block">
                      Direct Emergency Link
                    </span>
                    <a
                      href={emergencyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-burgundy font-semibold truncate hover:underline flex items-center gap-1.5"
                    >
                      <span className="truncate">/emergency/{rawToken}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </div>
                  <Button
                    variant="cream"
                    size="sm"
                    onClick={copyEmergencyLink}
                    icon={<Copy className="w-3.5 h-3.5" />}
                  >
                    Copy
                  </Button>
                </div>

                {/* Action Buttons Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => window.open(api.getDownloadQRUrl(rawToken, effectiveBaseUrl), '_blank')}
                    icon={<Download className="w-4 h-4" />}
                  >
                    Download QR (PNG)
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => window.open(api.getDownloadCardUrl(rawToken, patientName, effectiveBaseUrl), '_blank')}
                    icon={<Printer className="w-4 h-4 text-burgundy" />}
                  >
                    Print QR Card & Sticker (PDF)
                  </Button>

                  <Button
                    variant="cream"
                    className="w-full"
                    onClick={() => setWallpaperModalOpen(true)}
                    icon={<Smartphone className="w-4 h-4 text-burgundy" />}
                  >
                    Lock-Screen Wallpaper
                  </Button>

                  <Button
                    variant="cream"
                    className="w-full"
                    onClick={handleGenerateOrRegenerate}
                    loading={actionLoading}
                    icon={<RefreshCw className="w-4 h-4" />}
                  >
                    Regenerate QR
                  </Button>
                </div>

                {/* Danger Zone: Revoke Action */}
                <div className="pt-4 border-t border-beige-pale/60">
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    onClick={() => setRevokeModalOpen(true)}
                    icon={<ShieldAlert className="w-4 h-4" />}
                  >
                    Revoke & Deactivate Current QR
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Column: Smartphone Lock-Screen Mockup & Guidelines */}
            <div className="lg:col-span-5 space-y-6">
              <Card variant="white" className="p-6 text-center space-y-6">
                <div className="text-left border-b border-beige-pale/60 pb-3">
                  <h3 className="font-serif text-lg font-bold text-text-dark">Lock-Screen Preview</h3>
                  <p className="text-xs text-text-muted">
                    How your emergency QR appears on a smartphone lock screen.
                  </p>
                </div>

                {/* Realistic Smartphone Frame Mockup with User's QR */}
                <div className="mx-auto w-[240px] h-[480px] bg-text-dark rounded-[42px] p-3 shadow-2xl relative border-4 border-text-muted/40 overflow-hidden flex flex-col justify-between">
                  {/* Dynamic Island / Notch */}
                  <div className="w-20 h-4 bg-black rounded-full mx-auto relative z-20" />

                  {/* Lock Screen Display Content */}
                  <div className="absolute inset-0 bg-gradient-to-b from-burgundy-deep via-burgundy to-burgundy-dark p-6 flex flex-col items-center justify-between text-white text-center">
                    {/* System Clock */}
                    <div className="pt-8 space-y-1">
                      <p className="text-4xl font-light tracking-tight">10:24</p>
                      <p className="text-[10px] text-blush uppercase tracking-widest font-semibold">
                        Emergency Medical ID
                      </p>
                    </div>

                    {/* Centered QR Card Badge */}
                    <div className="w-full bg-white rounded-2xl p-3 shadow-lg text-text-dark space-y-2 border border-blush">
                      <span className="text-[9px] font-bold text-burgundy uppercase tracking-wider block">
                        Medora Emergency
                      </span>
                      <img
                        src={api.getDownloadQRUrl(rawToken, effectiveBaseUrl)}
                        alt="Lock screen QR"
                        className="w-24 h-24 mx-auto object-contain"
                      />
                      <span className="text-[9px] text-text-muted font-medium block">
                        Scan in an Emergency
                      </span>
                    </div>

                    {/* Bottom Indicator */}
                    <div className="w-full flex items-center justify-center pb-2 text-[10px] text-white/50">
                      <span>Emergency Medical Info</span>
                    </div>
                  </div>
                </div>

                {/* Display Guidance & Physical Card Alternative */}
                <div className="text-xs text-text-muted space-y-2 text-left bg-cream-warm/50 p-4 rounded-2xl border border-beige-pale/60">
                  <div className="flex items-center gap-2 text-burgundy font-semibold">
                    <Smartphone className="w-4 h-4" />
                    <span>How to Use Your QR Code:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed pl-1">
                    <li>Download wallpaper or print our Phone-Back Sticker.</li>
                    <li>For lock screens: Save to Photos and set as Lock Screen.</li>
                    <li>For 24/7 access: Attach the printed sticker to the back of your phone or case.</li>
                  </ol>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* --- MODAL 1: REVOCATION CONFIRMATION --- */}
        <Modal
          isOpen={revokeModalOpen}
          onClose={() => setRevokeModalOpen(false)}
          title="Revoke Emergency QR Code?"
          description="This action takes effect immediately."
        >
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-medical-red space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Immediate Access Deactivation</span>
              </div>
              <p className="leading-relaxed text-medical-dark">
                Anyone who scans this physical card, phone sticker, wallpaper, or link in the future will see a 'QR Code Deactivated' notice. No medical information will ever be exposed.
              </p>
            </div>

            <p className="text-xs text-text-muted">
              You can generate a fresh QR code at any time with a single click.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="cream"
                onClick={() => setRevokeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRevoke}
                loading={actionLoading}
              >
                Confirm Revocation
              </Button>
            </div>
          </div>
        </Modal>

        {/* --- MODAL 2: WALLPAPER DOWNLOAD & OLED CAUTION --- */}
        <Modal
          isOpen={wallpaperModalOpen}
          onClose={() => setWallpaperModalOpen(false)}
          title="Download Smartphone Wallpaper"
          description="High-resolution 1080 x 2400 lock-screen wallpaper."
        >
          <div className="space-y-4 text-left">
            <p className="text-xs text-text-muted leading-relaxed">
              Your wallpaper will be rendered in a portrait smartphone aspect ratio with generous top padding for system clock widgets.
            </p>

            {/* Prominent OLED Screen Burn-in Advisory with Physical Sticker Recommendation */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-status-warning space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <Info className="w-4 h-4 shrink-0" />
                <span>OLED Display & Screen Burn-In Caution</span>
              </div>
              <p className="leading-relaxed text-amber-900 text-[11px]">
                On modern OLED and AMOLED screens, displaying static high-contrast graphics constantly (such as in 'Always-On Display' mode) can cause uneven pixel wear or screen burn-in.
              </p>
              <p className="leading-relaxed text-amber-900 text-[11px] font-semibold">
                Safe Alternative: Use this wallpaper on standard lock screens (which turn off when idle), or print our Phone-Back Sticker to attach directly to your phone case for 24/7 visible access without powering the screen.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="cream"
                onClick={() => setWallpaperModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  window.open(api.getDownloadWallpaperUrl(rawToken, patientName, effectiveBaseUrl), '_blank');
                  setWallpaperModalOpen(false);
                }}
                icon={<Download className="w-4 h-4" />}
              >
                Download Wallpaper (PNG)
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
