import { MedicalProfile, EmergencyVisibility, QRToken, AccessLog, NotificationItem, EmergencyPublicData, User } from '../types';

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    const clean = envUrl.trim().replace(/\/$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('medora_api_base_url');
    if (custom) {
      const clean = custom.trim().replace(/\/$/, '');
      return clean.endsWith('/api') ? clean : `${clean}/api`;
    }
    if (window.location && window.location.origin) {
      return `${window.location.origin}/api`;
    }
  }
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('medora_token');
    return {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  // --- Auth ---
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Invalid credentials');
    }
    const data = await res.json();
    localStorage.setItem('medora_token', data.token);
    return data;
  }

  async register(params: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    emergency_notification_email: string;
  }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Failed to create account');
    }
    const data = await res.json();
    localStorage.setItem('medora_token', data.token);
    return data;
  }

  async verifyEmergencyEmail(_params?: { code?: string; token?: string }): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Email verification is not required in simplified mode.' };
  }

  async sendVerificationCode(_email?: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Email verification is not required.' };
  }

  async resendVerificationEmail(_email?: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Email verification is not required.' };
  }

  async getEmailProviderStatus(): Promise<{ configured: boolean; provider: string; name: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/dev/email-provider-status`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (!res.ok) return { configured: false, provider: 'none', name: 'Unconfigured' };
      return res.json();
    } catch {
      return { configured: false, provider: 'none', name: 'Unconfigured' };
    }
  }

  async getMe(): Promise<{ user: User; profile_id: string | null }> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  }

  async updatePassword(current_password: string, new_password: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/auth/update-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ current_password, new_password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update password');
    }
  }

  async deleteAccount(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/auth/delete-account`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete account');
    localStorage.removeItem('medora_token');
  }

  logout() {
    localStorage.removeItem('medora_token');
  }

  // --- Profile ---
  async getProfile(): Promise<{
    profile: MedicalProfile;
    visibility: EmergencyVisibility;
    qr: QRToken | null;
    stats: { total_scans: number };
  }> {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  }

  async updateProfile(profile: Partial<MedicalProfile>): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profile)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save profile');
    }
  }

  async updateVisibility(visibility: EmergencyVisibility): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/profile/visibility`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(visibility)
    });
    if (!res.ok) throw new Error('Failed to update visibility preferences');
  }

  // --- QR ---
  async getCurrentQR(baseUrl?: string): Promise<{
    has_active_qr: boolean;
    qr: QRToken | null;
    patient_name: string;
    configured_base_url: string;
    stats: { total_scans: number; revoked_count: number; this_month_scans: number };
  }> {
    const query = baseUrl ? `?base_url=${encodeURIComponent(baseUrl)}` : '';
    const res = await fetch(`${API_BASE_URL}/qr/current${query}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load QR state');
    return res.json();
  }

  async generateQR(baseUrl?: string): Promise<{ token: QRToken; message: string }> {
    const res = await fetch(`${API_BASE_URL}/qr/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ base_url: baseUrl || undefined })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.error || 'Failed to generate QR code');
    }
    return res.json();
  }

  async revokeQR(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/qr/revoke`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to revoke QR');
    return res.json();
  }

  getDownloadQRUrl(token: string, baseUrl?: string): string {
    const extra = baseUrl ? `&base_url=${encodeURIComponent(baseUrl)}` : '';
    return `${API_BASE_URL}/qr/download?token=${encodeURIComponent(token)}${extra}`;
  }

  getDownloadCardUrl(token: string, name: string, baseUrl?: string): string {
    const extra = baseUrl ? `&base_url=${encodeURIComponent(baseUrl)}` : '';
    return `${API_BASE_URL}/qr/download-card?token=${encodeURIComponent(token)}&name=${encodeURIComponent(name)}${extra}`;
  }

  getDownloadWallpaperUrl(token: string, name: string, baseUrl?: string): string {
    const extra = baseUrl ? `&base_url=${encodeURIComponent(baseUrl)}` : '';
    return `${API_BASE_URL}/qr/download-wallpaper?token=${encodeURIComponent(token)}&name=${encodeURIComponent(name)}${extra}`;
  }

  // --- Public Emergency Scan ---
  async getEmergencyProfile(token: string): Promise<EmergencyPublicData> {
    const res = await fetch(`${API_BASE_URL}/emergency/${encodeURIComponent(token)}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        status: data.status || 'invalid',
        message: data.message || 'Unable to load emergency medical profile'
      };
    }
    return data;
  }

  // --- Public Testing / ngrok Tunnel Status ---
  async getTunnelStatus(): Promise<{
    public_testing_mode: boolean;
    status: 'connected' | 'disconnected';
    tunnel_url: string | null;
    service: string;
    updated_at?: number;
    target_port: number;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/dev/tunnel-status`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (!res.ok) return { public_testing_mode: false, status: 'disconnected', tunnel_url: null, service: 'ngrok', target_port: 5173 };
      return res.json();
    } catch {
      return { public_testing_mode: false, status: 'disconnected', tunnel_url: null, service: 'ngrok', target_port: 5173 };
    }
  }

  async refreshQRForTunnel(baseUrl: string): Promise<{ token: QRToken; message: string }> {
    const res = await fetch(`${API_BASE_URL}/dev/refresh-qr-url`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ base_url: baseUrl })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to refresh QR URL' }));
      throw new Error(err.error || 'Failed to refresh QR URL');
    }
    return res.json();
  }

  // --- Access Logs ---
  async getAccessLogs(page = 1, limit = 20): Promise<{
    logs: AccessLog[];
    pagination: { total: number; page: number; limit: number; total_pages: number };
    device_breakdown: { device_type: string; count: number }[];
  }> {
    const res = await fetch(`${API_BASE_URL}/access-logs?page=${page}&limit=${limit}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch access logs');
    return res.json();
  }

  // --- Notifications ---
  async getNotifications(): Promise<{
    notifications: NotificationItem[];
    unread_count: number;
  }> {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  }

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'POST',
      headers: this.getHeaders()
    });
  }

  async markAllNotificationsRead(): Promise<void> {
    await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'POST',
      headers: this.getHeaders()
    });
  }

  // --- Email Delivery & Testing ---
  async sendTestEmail(recipient?: string): Promise<{
    success: boolean;
    recipient: string;
    mode: string;
    status: string;
    message: string;
    detail?: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/notifications/test-email`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ recipient: recipient || undefined })
    });
    const data = await res.json().catch(() => ({ success: false, message: 'Server communication error' }));
    if (!res.ok && !data.message) {
      throw new Error(data.error || 'Failed to dispatch test alert email');
    }
    return data;
  }
}

export const api = new ApiService();
