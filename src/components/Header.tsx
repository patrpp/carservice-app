'use client';

import { User } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils'; // ha van ilyen utility fájlod
import { AnimatedMenuGroup } from './Navmenu';
import ThemeSwitch from './ThemeSwitch';

interface HeaderProps {
  user: User | null;
  onSignOut: () => Promise<void>;
}

export function Header({ user, onSignOut }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-600 p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
 <ThemeSwitch />
</div>
      <h1 className="text-4xl font-bold text-black dark:text-white">Műhely Dashboard</h1>
    
<div className="flex justify-center my-8">
  <AnimatedMenuGroup />
</div>
      <div className="flex items-center gap-6">
  

        {user ? (
          <>
            <span className="text-lg text-black dark:text-gray-200 p-3">
              Bejelentkezve: <strong>{user.email}</strong>
            </span>

            <button
              onClick={onSignOut}
              className={cn(
                'group relative flex items-center justify-center',
                'h-11 w-11 overflow-hidden rounded-full',
                'bg-red-500 text-white shadow-md',
                'transition-all duration-300 ease-in-out',
                'hover:w-40 hover:rounded-3xl',
                'active:translate-x-0.5 active:translate-y-0.5 active:shadow-sm'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center shrink-0',
                  'transition-all duration-300',
                  'group-hover:pl-4'
                )}
              >
                <LogOut className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  'whitespace-nowrap text-sm font-semibold',
                  'opacity-0 w-0 transition-all duration-300',
                  'group-hover:opacity-100 group-hover:w-auto group-hover:pl-3 group-hover:pr-4'
                )}
              >
                Kijelentkezés
              </span>
            </button>
          </>
        ) : (
          <span className="text-lg text-black dark:text-gray-200">Nincs bejelentkezve</span>
        )}
      </div>
    </div>
  );
}