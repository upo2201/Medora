import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  QrCode,
  History,
  Bell,
  Settings,
  LogOut,
  HeartPulse,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  unreadNotifications?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ unreadNotifications = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'My QR Code', path: '/qr', icon: QrCode },
    { label: 'Access Logs', path: '/access-logs', icon: History },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifications },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-burgundy-deep text-white min-h-screen flex flex-col justify-between shrink-0 select-none shadow-soft-lg">
      <div>
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-burgundy-primary flex items-center justify-center text-white shadow-soft">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg tracking-tight block leading-tight text-white">
              Medora
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-blush block">
              Emergency ID
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-burgundy text-white shadow-soft'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="bg-medical-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom User Profile & Logout */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="px-4 py-3 rounded-xl bg-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blush text-burgundy-deep font-bold flex items-center justify-center text-xs">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Patient'}</p>
            <p className="text-[10px] text-white/50 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-medical-red/30 transition-colors"
        >
          <LogOut className="w-4 h-4 text-white/60" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

