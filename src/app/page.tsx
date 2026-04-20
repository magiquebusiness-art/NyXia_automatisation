'use client';

import { useEffect, useCallback } from 'react';
import { useNyxiaStore } from '@/lib/nyxia-store';
import LoginPage from '@/components/nyxia/LoginPage';
import DashboardPage from '@/components/nyxia/DashboardPage';
import SuperAdminPage from '@/components/nyxia/SuperAdminPage';

export default function Home() {
  const {
    currentView,
    setCurrentView,
    isAuthenticated,
    setAuth,
    clearAuth,
    hydrate,
    loginError,
    setLoginError,
    loginLoading,
    setLoginLoading,
    token,
  } = useNyxiaStore();

  // Hydrate from localStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Verify session with backend on mount (if token exists)
  useEffect(() => {
    if (!token) return;
    const verifySession = async () => {
      try {
        const res = await fetch('/api/auth/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!data.valid) {
          clearAuth();
        } else if (data.user) {
          // Update user data from server
          setAuth(data.user, token);
        }
      } catch {
        // Network error - keep local session for now
      }
    };
    verifySession();
  }, []); // Only on mount

  // Handle login
  const handleLogin = useCallback(
    async (email: string, password: string, firstname: string) => {
      setLoginLoading(true);
      setLoginError(null);

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: firstname }),
        });

        const data = await res.json();

        if (data.success && data.token) {
          setAuth(data.user, data.token);
        } else {
          setLoginError(data.error || 'Identifiants incorrects.');
        }
      } catch {
        setLoginError('Erreur de connexion. Vérifie ton réseau.');
      } finally {
        setLoginLoading(false);
      }
    },
    [setAuth, setLoginError, setLoginLoading],
  );

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    } catch {
      // Continue logout even if API fails
    }
    clearAuth();
  }, [token, clearAuth]);

  // Handle opening SuperAdmin
  const handleOpenSuperAdmin = useCallback(() => {
    setCurrentView('superadmin');
  }, [setCurrentView]);

  // Handle going back to Dashboard from SuperAdmin
  const handleBackToDashboard = useCallback(() => {
    setCurrentView('dashboard');
  }, [setCurrentView]);

  // Render the appropriate view
  if (currentView === 'login' || !isAuthenticated) {
    return (
      <LoginPage
        onLogin={handleLogin}
        isLoading={loginLoading}
        error={loginError}
      />
    );
  }

  if (currentView === 'superadmin') {
    return <SuperAdminPage onBack={handleBackToDashboard} />;
  }

  return (
    <DashboardPage
      onLogout={handleLogout}
      onOpenSuperAdmin={handleOpenSuperAdmin}
    />
  );
}
