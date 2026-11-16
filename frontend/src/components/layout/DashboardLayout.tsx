import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User as UserIcon } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getNotifications()
      .then((data) => setUnreadCount(data.unread_count))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-cream-warm flex text-text-dark">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar unreadNotifications={unreadCount} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-text-dark/40 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar unreadNotifications={unreadCount} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-beige-pale/80 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-text-dark hover:bg-beige-pale/60"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Emergency Information Management
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2.5 rounded-full text-text-dark hover:bg-beige-pale/60 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-medical-red ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Profile avatar button */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-beige-pale/60 hover:bg-beige-pale transition-colors text-xs font-semibold text-burgundy-deep"
            >
              <div className="w-7 h-7 rounded-full bg-burgundy text-white flex items-center justify-center text-xs font-bold">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline">{user?.full_name?.split(' ')[0] || 'Profile'}</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

