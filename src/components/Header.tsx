'use client';

import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';

interface HeaderProps {
  user: User | null;
  onSignOut: () => Promise<void>;
}

export function Header({ user, onSignOut }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
      <h1 className="text-4xl font-bold text-black">Műhely Dashboard</h1>
      
      <div className="flex items-center gap-6">
            <ModeToggle />
        {user ? (
          <>
            <span className="text-lg text-black">
              Bejelentkezve: <strong>{user.email}</strong>
            </span>
            <Button 
            
              onClick={onSignOut}
              className="gap-2"
            >
          
              <LogOut className="h-4 w-4" />
              Kijelentkezés
            </Button>
          </>
        ) : (
          <span className="text-lg text-black">Nincs bejelentkezve</span>
        )}
     
      </div>
    </div>
  );
}