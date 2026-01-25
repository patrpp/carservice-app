'use client';

import {
  Clock,
  Wrench,
  Search,
  Package,
  CheckCircle2,
  Receipt,
} from 'lucide-react';
import { JoinedRepair } from '@/types';

const statusConfig = {
  pending: {
    label: 'Várólista',
    icon: Clock,
    color: 'from-amber-500 to-orange-600',
    ring: 'ring-amber-500/40',
  },
  in_progress: {
    label: 'Folyamatban',
    icon: Wrench,
    color: 'from-blue-500 to-cyan-600',
    ring: 'ring-blue-500/40',
  },
  diagnosed: {
    label: 'Diagnosztizálva',
    icon: Search,
    color: 'from-purple-500 to-pink-600',
    ring: 'ring-purple-500/40',
  },
  waiting_parts: {
    label: 'Alkatrészre vár',
    icon: Package,
    color: 'from-indigo-500 to-violet-600',
    ring: 'ring-indigo-500/40',
  },
  completed: {
    label: 'Kész',
    icon: CheckCircle2,
    color: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-500/40',
  },
  invoiced: {
    label: 'Számlázva',
    icon: Receipt,
    color: 'from-rose-500 to-pink-600',
    ring: 'ring-rose-500/40',
  },
};

interface RepairCardProps {
  repair: JoinedRepair;
  onStatusChange: (newStatus: string) => void;
}

export function RepairCard({ repair, onStatusChange }: RepairCardProps) {
  const status =
    statusConfig[repair.status as keyof typeof statusConfig] ||
    statusConfig.pending;

return (
  <div className="group relative">
    <div
      className={`
        pointer-events-none absolute -inset-1 rounded-2xl
        bg-linear-to-r ${status.color} 
        blur-2xl opacity-25
        transition-all duration-1000
        group-hover:opacity-100
      `}
    />
<div
  className="
    relative px-7 py-6
    rounded-2xl
    bg-(--card) text-(--card-foreground)
    flex flex-col items-center text-center
    transition-all duration-300
    hover:scale-[1.02]
  "
>
<p className="text-l text-(--muted-foreground) mb-2">
  <span className="text-(--foreground) font-medium">
  {repair.description}
  </span>
</p>
<h3
  className={`
    text-xl font-semibold mb-3
    bg-linear-to-r ${status.color}
    bg-clip-text text-transparent
    transition-all duration-300
    group-hover:opacity-90
  `}
>
   {repair.vehicle?.license_plate ?? '–'}
</h3>



<p className="text-sm text-(--muted-foreground) mb-1">
  {repair.vehicle
    ? `${repair.vehicle.make} ${repair.vehicle.model}`
    : 'Nincs hozzárendelt autó'}
</p>

<p className="text-xs text-(--muted-foreground) mb-6">
  Ügyfél:{' '}
  <span className="text-(--foreground) font-medium">
    {repair.vehicle?.customer?.name ?? '–'}
  </span>
</p>


      <div className="flex justify-center gap-2 mt-auto">
        {Object.entries(statusConfig).map(([value, cfg]) => {
          const isActive = repair.status === value;
          const Icon = cfg.icon;

          return (
            <button
              key={value}
              onClick={() => onStatusChange(value)}
              className={`
                group/status relative w-10 h-10 rounded-full
                flex items-center justify-center
                transition-all duration-300
                ${
                  isActive
                    ? `bg-linear-to-br ${cfg.color} text-white ring-2 ring-offset-2 ring-offset-gray-900 ${cfg.ring}`
                    : `bg-gray-800/60 hover:bg-gray-700/80 hover:scale-110`
                }
              `}
            >
              <Icon
                size={18}
                strokeWidth={2.5}
                className={`
                  ${isActive
                    ? 'text-white drop-shadow-md'
                    : 'text-gray-300 group-hover:text-gray-100 transition-colors'}
                `}
              />
            </button>
          );
        })}
      </div>
    </div>
  </div>
);
}