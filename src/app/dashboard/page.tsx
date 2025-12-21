// src/app/dashboard/page.tsx
'use client';  // ← FONTOS: client component

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Betöltés...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-8">
        <p>Nincs bejelentkezve felhasználó.</p>
        <Link href="/" className="px-6 py-3 bg-blue-600">
          Vissza a bejelentkezéshez
        </Link>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50">  
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-black">Műhely Dashboard</h1>
        <div className="flex items-center gap-4">
          <p className="text-lg text-black">
            Bejelentkezve: <strong>{user.email}</strong>
          </p>
          <button
            onClick={signOut}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Kijelentkezés
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <p className="text-2xl font-semibold text-black mb-4">
          feladatok
        </p>
      </div>
    </div>
  </div>
);
}