import React, { useState, useEffect } from 'react';
import {
  History,
  Smartphone,
  Monitor,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { AccessLog } from '../types';

export const AccessLogs: React.FC = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [deviceBreakdown, setDeviceBreakdown] = useState<{ device_type: string; count: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLogs = async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await api.getAccessLogs(pageNum, 15);
      setLogs(data.logs);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.total_pages);
      setDeviceBreakdown(data.device_breakdown);
    } catch (err) {
      console.error('Failed to fetch access logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('ios') || device.toLowerCase().includes('android')) {
      return <Smartphone className="w-4 h-4 text-burgundy" />;
    }
    return <Monitor className="w-4 h-4 text-burgundy" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-beige-pale/60">
          <div>
            <h1 className="font-serif text-3xl font-bold text-burgundy-deep tracking-tight">
              Access History & Logs
            </h1>
            <p className="text-xs text-text-muted mt-1">
              A transparent, privacy-conscious audit trail of every time your emergency QR was scanned.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-cream-warm border border-beige-pale text-text-dark">
              Total Scans: <strong className="text-burgundy">{total}</strong>
            </span>
          </div>
        </div>

        {/* Device Category Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {deviceBreakdown.length === 0 ? (
            <div className="col-span-4 p-4 rounded-xl bg-white border border-beige-pale text-xs text-text-muted">
              No scan activity recorded yet.
            </div>
          ) : (
            deviceBreakdown.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-3.5 rounded-xl border border-beige-pale flex items-center justify-between shadow-soft-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blush flex items-center justify-center">
                    {getDeviceIcon(item.device_type)}
                  </div>
                  <span className="text-xs font-semibold text-text-dark truncate">
                    {item.device_type}
                  </span>
                </div>
                <span className="text-sm font-serif font-bold text-burgundy">
                  {item.count}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Table Card */}
        <Card variant="white" className="overflow-hidden shadow-soft-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-warm/70 border-b border-beige-pale text-text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6 font-bold">Date & Time</th>
                  <th className="py-3.5 px-6 font-bold">Device Category</th>
                  <th className="py-3.5 px-6 font-bold">Browser</th>
                  <th className="py-3.5 px-6 font-bold">Access Status</th>
                  <th className="py-3.5 px-6 font-bold">Notification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-pale/60 text-text-dark">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-muted">
                      Loading access logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-muted">
                      No emergency access scans have been logged yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-cream-warm/30 transition-colors">
                      <td className="py-4 px-6 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-burgundy/70" />
                          <span>{new Date(log.accessed_at).toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(log.device_type)}
                          <span className="font-semibold">{log.device_type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-text-muted whitespace-nowrap">
                        {log.browser}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {log.access_status === 'success' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-status-success font-semibold text-[10px] border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Emergency Viewed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-medical-red font-semibold text-[10px] border border-rose-200">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Revoked Attempt</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                          <span className="w-1.5 h-1.5 rounded-full bg-burgundy" />
                          <span>Simulated Alert</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-beige-pale flex items-center justify-between text-xs">
            <span className="text-text-muted">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="cream"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <Button
                variant="cream"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        {/* Privacy Assurance Card */}
        <div className="p-4 rounded-2xl bg-white border border-beige-pale flex items-start gap-3 text-xs text-text-muted">
          <Info className="w-4 h-4 text-burgundy shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-text-dark">Privacy-Conscious Logging:</strong> In accordance with our security principles, raw IP addresses and precise GPS locations are never collected or stored. Scans record only the general device operating category to keep you informed of access events without violating the scanner's privacy.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

