'use client';

import { Home, Wrench, Users, Car } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const menuItems = [
  { label: 'Kezdőlap', icon: Home, href: '/dashboard' },
  { label: 'Javítások', icon: Wrench, href: '/dashboard/repairs' },
  { label: 'Ügyfelek', icon: Users, href: '/dashboard/customers' },
  { label: 'Autók', icon: Car, href: '/dashboard/vehicles' },
];

export function AnimatedMenuGroup() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={`
        flex items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5
        p-2 sm:p-3 md:p-4
        bg-background/70 dark:bg-background/70
        rounded-xl border border-border/30
        backdrop-blur-sm
        max-w-fit mx-auto shadow-sm
        transition-all duration-300
      `}
    >
      {menuItems.map((item, index) => (
        <Link
          key={item.label}
          href={item.href}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className={`
            group relative flex items-center justify-center
            h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11
            rounded-full overflow-hidden
            bg-background/90 dark:bg-background/90 text-foreground
            shadow-sm transition-all duration-300 ease-in-out
            hover:w-28 sm:hover:w-32 md:hover:w-36 hover:rounded-3xl
            hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-black/40
            ${hoveredIndex === index ? 'scale-105 md:scale-110' : 'scale-100'}
          `}
        >
          {/* KÜLSŐ GLOW / KERET – hoverkor erősödik, belső shadow eltűnt */}
          <div
  className="
    pointer-events-none absolute inset-0
    rounded-full
    ring-1 ring-primary/20
    opacity-0
    group-hover:opacity-100
    transition-opacity duration-300
  "
/>

          {/* Ikon – mindig középen marad */}
          <div
            className={`
              absolute inset-0 flex items-center justify-center
              transition-all duration-300
              group-hover:justify-start group-hover:pl-2 sm:group-hover:pl-2.5
            `}
          >
            <item.icon
              className={`
                h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300
                text-foreground
                group-hover:scale-90
                group-hover:drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]
              `}
            />
          </div>

          {/* Szöveg – jobbról tolódik be, ikon nem mozdul */}
          <span
            className={`
              whitespace-nowrap text-xs sm:text-sm font-medium tracking-wide
              text-foreground drop-shadow-md
              opacity-0 w-0 ml-auto
              transition-all duration-300 delay-75
              group-hover:opacity-100
              group-hover:w-auto
              group-hover:pl-9 sm:group-hover:pl-10 group-hover:pr-3 sm:group-hover:pr-4
            `}
          >
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}