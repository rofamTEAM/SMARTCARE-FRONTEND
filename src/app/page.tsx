'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { ChunkErrorBoundary } from '@/components/ChunkErrorBoundary';
import { AuthPage } from '@/components/AuthPage';
import { MainApp } from '@/components/MainApp';
import type { UserProfile } from '@/services/auth.service';

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
  const [user, setUser] = useState<UserProfile | null>(null);
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

  const handleLogin = (loggedInUser: UserProfile) => {
    if (loggedInUser?.role) loggedInUser.role = loggedInUser.role.toLowerCase();
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) return <AppLoader />;

  return (
    <ChunkErrorBoundary>
      {user
        ? <MainApp user={user} onLogout={handleLogout} />
        : <AuthPage onLogin={handleLogin} />}
    </ChunkErrorBoundary>
  );
}
