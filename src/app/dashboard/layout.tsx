'use client';

import { Header } from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ModeToggle } from '@/components/ui/mode-toggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
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

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8">
        <p>Nincs bejelentkezve felhasználó.</p>
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg">
          Vissza a bejelentkezéshez
        </Link>
        <ModeToggle />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <Header user={user} onSignOut={handleSignOut} />
        <main>{children}</main>
      </div>
    </div>
  );
}