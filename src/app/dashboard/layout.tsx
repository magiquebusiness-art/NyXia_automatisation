'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('nyxia-token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    // Verify session with backend
    const verifySession = async () => {
      try {
        const t = localStorage.getItem('nyxia-token');
        const res = await fetch('/api/auth/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: t }),
        });
        const data = await res.json();
        if (!data.valid) {
          localStorage.removeItem('nyxia-token');
          localStorage.removeItem('nyxia-user');
          window.location.href = '/login';
        }
      } catch {
        // Network error — keep local session for now
      }
    };
    verifySession();
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="nx-main-content">
        {/* Mobile top bar with hamburger */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-[rgba(123,92,255,0.08)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="nx-mobile-menu-btn p-2 rounded-lg bg-transparent border-none text-[var(--nx-t2)] cursor-pointer hover:bg-[rgba(123,92,255,0.08)] transition-colors"
            aria-label="Ouvrir le menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
