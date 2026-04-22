'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { authService } from '@/services/auth.service';
import { clearTokens } from '@/utils/api';
import type { AuthUser } from '@/services/auth.service';

const AuthPage = dynamic(
  () => import('@/components/AuthPage').then(m => ({ default: m.AuthPage })),
  {
    ssr: false,
    loading: () => <AppLoader />,
  }
);

const MainApp = dynamic(
  () => import('@/components/MainApp').then(m => ({ default: m.MainApp })),
  {
    ssr: false,
    loading: () => <AppLoader />,
  }
);

function AppLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading SmartCare...</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authService.getCurrentUser().then(data => {
      if (cancelled) return;
      if (data?.role) data.role = data.role.toLowerCase();
      setUser(data);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const handleLogin = (loggedInUser: AuthUser) => {
    if (loggedInUser?.role) loggedInUser.role = loggedInUser.role.toLowerCase();
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) return <AppLoader />;

  return user
    ? <MainApp user={user} onLogout={handleLogout} />
    : <AuthPage onLogin={handleLogin} />;
}
