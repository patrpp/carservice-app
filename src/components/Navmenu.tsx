'use client';

import { Home, Wrench, Users, Car } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const menuItems = [
  { label: 'Kezdőlap', icon: Home, href: '/dashboard' },
  { label: 'Javítások', icon: Wrench, href: '/dashboard/repairs' },
  { label: 'Ügyfelek',    icon: Users, href: '/dashboard/customers' },
  { label: 'Autók',       icon: Car,    href: '/dashboard/vehicles' },
];

export function AnimatedMenuGroup() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={`
        flex items-center gap-3 md:gap-5 p-3 md:p-4
        justify-start
        bg-transparent
        rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-800/50
        backdrop-blur-[2px]
        max-w-fit mx-auto
      `}
    >
      {menuItems.map((item, index) => (
<Link
  key={item.label}
  href={item.href}
  onMouseEnter={() => setHoveredIndex(index)}
  onMouseLeave={() => setHoveredIndex(null)}
  className={`
    group relative
    flex items-center justify-start
    h-10 w-10 md:h-11 md:w-11
    rounded-full overflow-hidden
    bg-neutral-900/80 dark:bg-neutral-800/90 text-white
    shadow-[0_3px_10px_rgba(0,0,0,0.25)]
    transition-all duration-300 ease-out
    hover:w-30 hover:rounded-3xl                 
    hover:shadow-lg hover:shadow-black/30
    ${hoveredIndex === index ? 'scale-110' : 'scale-100'}
  `}
>
  <div 
    className={`
      absolute inset-0 flex items-center justify-center
      transition-all duration-300
      group-hover:justify-start group-hover:pl-2.5   
    `}
  >
    <item.icon
      className={`
        h-5 w-5 md:h-6 md:w-6 transition-all duration-300
        group-hover:scale-90
        group-hover:text-white
        group-hover:drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]
      `}
    />
  </div>

  <span
    className={`
      whitespace-nowrap text-xs md:text-sm font-semibold tracking-wide
      text-white drop-shadow-md
      opacity-0 w-0 ml-auto
      transition-all duration-300 delay-75
      group-hover:opacity-100
      group-hover:w-auto
      group-hover:pl-2.5 group-hover:pr-4            
    `}
  >
    {item.label}
  </span>
</Link>
      ))}
      </div>
              );
}   