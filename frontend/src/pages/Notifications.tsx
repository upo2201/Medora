import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  AlertCircle,
  Calendar,
  Sparkles,
  Mail
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';

export const Notifications: React.FC = () => {
  const { success, error: toastError } = useToast();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [sendingTest, setSendingTest] = useState<boolean>(false);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (err: any) {
      toastError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      const res = await api.sendTestEmail();
      if (res.success) {
        success(`${t.notifications.testAlertSent}: ${res.recipient}!`);
        fetchNotifs();
      } else {
        toastError(res.detail || 'Email delivery failed');
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to dispatch test alert email');
    } finally {
      setSendingTest(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      success('All notifications marked as read.');
      fetchNotifs();
    } catch (err: any) {
      toastError(err.message || 'Failed to update notifications');
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifs();
    } catch (err) {}
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-beige-pale/60">
          <div>
            <h1 className="font-serif text-3xl font-bold text-burgundy-deep tracking-tight">
              {t.notifications.pageTitle}
            </h1>
            <p className="text-xs text-text-muted mt-1">
              {t.notifications.pageSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSendTest}
              loading={sendingTest}
              icon={<Mail className="w-4 h-4 text-burgundy" />}
            >
              {t.notifications.sendTestAlert}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="cream"
                size="sm"
                onClick={handleMarkAllRead}
                icon={<CheckCheck className="w-4 h-4 text-burgundy" />}
              >
                Mark All as Read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <Card variant="white" className="p-6">
          {loading ? (
            <div className="py-12 text-center text-text-muted text-xs">
              {t.common.loading}...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-xs space-y-2">
              <Bell className="w-8 h-8 mx-auto text-text-muted/40" />
              <p className="font-semibold text-text-dark">{t.notifications.noNotifications}</p>
              <p>{t.notifications.allCaughtUp}</p>
            </div>
          ) : (
            <div className="divide-y divide-beige-pale/60 space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && handleMarkSingleRead(notif.id)}
                  className={`p-4 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    notif.is_read ? 'bg-white hover:bg-cream-warm/30' : 'bg-cream-warm/80 border border-blush shadow-soft-sm'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-blush text-burgundy flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-burgundy-deep">
                          QR Access Event
                        </span>
                        <Badge variant="neutral" className="text-[10px] py-0.5 px-2">
                          {notif.notification_type}
                        </Badge>
                        {(() => {
                          const status = notif.delivery_status;
                          if (status === 'DELIVERED' || status === 'SENT') {
                            return <Badge variant="active" className="text-[10px] py-0.5 px-2">Sent / Accepted</Badge>;
                          }
                          if (status === 'PENDING') {
                            return <Badge variant="neutral" className="text-[10px] py-0.5 px-2">Pending</Badge>;
                          }
                          if (status === 'PROVIDER_NOT_CONFIGURED') {
                            return <Badge variant="revoked" className="text-[10px] py-0.5 px-2">Provider Not Configured</Badge>;
                          }
                          if (status === 'FAILED') {
                            return <Badge variant="revoked" className="text-[10px] py-0.5 px-2">Failed</Badge>;
                          }
                          if (status === 'UNVERIFIED_EMAIL') {
                            return <Badge variant="neutral" className="text-[10px] py-0.5 px-2">Awaiting Verification</Badge>;
                          }
                          return <Badge variant="neutral" className="text-[10px] py-0.5 px-2">{status}</Badge>;
                        })()}
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-medical-red" />
                        )}
                      </div>
                      <p className="text-xs text-text-dark leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.error_message && (
                        <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-medical-red font-mono">
                          Diagnostic: {notif.error_message}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-text-muted pt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(notif.created_at).toLocaleString()}</span>
                        <span>• {t.notifications.alertRecipient}: {notif.recipient}</span>
                      </div>
                    </div>
                  </div>

                  {!notif.is_read && (
                    <Button
                      variant="cream"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkSingleRead(notif.id);
                      }}
                      className="shrink-0 text-xs"
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};
