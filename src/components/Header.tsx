'use client';

import { User } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedMenuGroup } from './Navmenu';
import ThemeSwitch from './ThemeSwitch';
import Image from 'next/image';

interface HeaderProps {
  user: User | null;
  onSignOut: () => Promise<void>;
}

export function Header({ user, onSignOut }: HeaderProps) {
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <header className="
      sticky top-0 z-50 w-full border-b border-border/50
      bg-background/95 backdrop-blur-xl shadow-sm
      transition-all duration-300
    ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">

        <div className="flex items-center gap-4 md:gap-6">
          <h1 className="
            hidden lg:block text-xl font-bold tracking-tight
            bg-linear-to-r from-primary to-primary/80
            bg-clip-text text-transparent
          ">
            Műhely Dashboard
          </h1>

          <ThemeSwitch />
        </div>
        <div className="flex items-center gap-4 md:gap-6 flex-1 justify-end">
          <div className="flex items-center gap-2 md:gap-6 text-sm md:text-base">
            <AnimatedMenuGroup />
          </div>

          {user ? (
            <div className="flex items-center gap-3 md:gap-4">
              <div className="
                relative group cursor-default
              ">
                {avatarUrl ? (
                  <div className="
                    relative h-8 w-8 md:h-9 md:w-9 rounded-full overflow-hidden
                    border-2 border-background ring-2 ring-primary/30
                    transition-all duration-300 hover:ring-primary/60 hover:scale-110 hover:shadow-md
                  ">
                    <Image
                      src={avatarUrl}
                      alt="Profilkép"
                      fill
                      sizes="(max-width: 768px) 32px, 36px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                      priority={false}
                    />
                  </div>
                ) : (
                  <div className="
                    h-8 w-8 md:h-9 md:w-9 rounded-full bg-primary/20 flex items-center justify-center
                    text-primary font-medium text-base md:text-lg
                    ring-2 ring-primary/30 transition-all duration-300
                    hover:ring-primary/60 hover:scale-110 hover:shadow-md
                  ">
                    {user.email?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>

              <button
                onClick={onSignOut}
                className={cn(
               
                )}
                title="Kijelentkezés"
              >
                <LogOut  />
              </button>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground hidden md:block">
              Nincs bejelentkezve
            </span>
          )}
        </div>
      </div>
    </header>
  );
}