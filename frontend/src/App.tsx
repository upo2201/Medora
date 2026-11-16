import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { QRManagement } from './pages/QRManagement';
import { AccessLogs } from './pages/AccessLogs';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { EmergencyPage } from './pages/EmergencyPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-warm flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-burgundy border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-text-muted font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Landing & Auth Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<Navigate to="/profile" replace />} />

            {/* Public Emergency Scan Route (ZERO LOGIN REQUIRED) */}
            <Route path="/emergency/:token" element={<EmergencyPage />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/qr"
              element={
                <ProtectedRoute>
                  <QRManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/access-logs"
              element={
                <ProtectedRoute>
                  <AccessLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
