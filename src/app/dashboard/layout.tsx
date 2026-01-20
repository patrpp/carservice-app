'use client';

import { Header } from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p>Betöltés...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background text-foreground">
        <p>Nincs bejelentkezve felhasználó.</p>
        <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg">
          Vissza a bejelentkezéshez
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-8">
        <Header user={user} onSignOut={handleSignOut} />
        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}