export type EventStatus = 'active' | 'upcoming' | 'invited' | 'expired';

// import type { EventStatus } from "@/types"; // Adjust this import to where EventStatus is defined

export const StatusTypes = new Map<EventStatus, string>(
  [
    ['active', 'bg-teal-100/30 text-blue-900 border-teal-200'],
    ['inactive', 'bg-neutral-300/40 border-neutral-300'],
    ['upcoming', 'bg-green-200/40 text-green-900  border-green-300'],
    [
      'expired',
      'bg-destructive/10 text-red-900 border-destructive/10',
    ],
  ] as [EventStatus, string][]
);

