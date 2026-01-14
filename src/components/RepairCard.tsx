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
    <div className="
      group relative overflow-hidden rounded-2xl
      border border-gray-200/50 dark:border-gray-700/50
      bg-white dark:bg-gray-900/80 backdrop-blur-sm
      shadow-lg shadow-black/5 dark:shadow-black/30
      transition-all duration-300 ease-out
      hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]
    ">
      {/* Gradiens overlay */}
      <div
        className={`
          absolute inset-0 opacity-0 group-hover:opacity-100
          transition-opacity duration-500
          bg-linear-to-br ${status.color} opacity-10
        `}
      ></div>

     <div className="relative flex flex-col flex-1 p-6">
  {/* HEADER */}
  <div>
    <h3 className="
      text-lg font-semibold tracking-tight
      text-gray-900 dark:text-gray-100
      leading-snug
    ">
      {repair.description}
    </h3>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Ügyfél:{' '}
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {repair.vehicle?.customer?.name ?? 'Nincs'}
          </span>
        </p>

    <div className="mt-2 inline-flex items-center gap-2
      rounded-lg
      bg-gray-100/70 dark:bg-gray-800/60
      px-3 py-1.5
      text-sm text-gray-600 dark:text-gray-300
    ">
      <span className="font-medium">
        {repair.vehicle?.make}
      </span>
      <span className="text-gray-400">•</span>
      <span>
        {repair.vehicle?.model}
      </span>
        <span className="text-gray-400">•</span>
      <span>
        {repair.vehicle?.license_plate ?? 'Nincs rendszám'}
      </span>
    </div>
  </div>

  {/* SPACER */}
  <div className="flex-1" />

  {/* DIVIDER */}
  <div className="
    my-4 h-px w-full
    bg-linear-to-r from-transparent
    via-gray-200/70 dark:via-gray-700/70
    to-transparent
  " />

  {/* FOOTER – STATUS */}
<div className=" grid grid-cols-3 gap-2 justify-center">
    {Object.entries(statusConfig).map(([value, cfg]) => {
      const Icon = cfg.icon;
      const isActive = repair.status === value;

      return (
        <button
          key={value}
          onClick={() => onStatusChange(value)}
          className={`
            group/status relative w-11 h-11 rounded-full
            flex items-center justify-center
            transition-all duration-300 ease-out

            ${isActive
              ? `
                bg-linear-to-br ${cfg.color}
                text-white/90
                ring-1 ${cfg.ring}
                ring-offset-1 ring-offset-white/60
                dark:ring-offset-gray-900/60
                shadow-sm
              `
              : `
                bg-gray-100/80 dark:bg-gray-800/60
                hover:bg-gray-200/80 dark:hover:bg-gray-700/60
                hover:scale-105
              `
            }
          `}
        >
          <Icon size={20} />

          <span className="
            absolute bottom-full mb-2 px-3 py-1 text-xs
            bg-gray-700 text-white rounded
            opacity-0 group-hover/status:opacity-100
            transition
            pointer-events-none
          ">
            {cfg.label}
          </span>
        </button>
      );
    })}
  </div>
</div>

    </div>
  );
}
