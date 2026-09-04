"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { dueReminders, reminderTitle, uncheckedCount, REMINDER_COPY } from "@/lib/reminders";
import { useStore } from "@/lib/store";

const fired = new Set<string>();

export function ReminderListener() {
  const { trips, updateTrip, hydrated } = useStore();
  const router = useRouter();
  const tripsRef = useRef(trips);
  tripsRef.current = trips;

  useEffect(() => {
    if (!hydrated) return;
    const run = () => {
      for (const trip of tripsRef.current) {
        const due = dueReminders(trip);
        if (!due.length) continue;
        const n = uncheckedCount(trip);
        for (const r of due) {
          const key = `${trip.id}:${r.kind}`;
          if (fired.has(key)) continue;
          fired.add(key);
          const title = reminderTitle(r.kind, n);
          const body = REMINDER_COPY[r.kind].body(n);
          if ("Notification" in window && Notification.permission === "granted") {
            const ntf = new Notification(title, { body });
            ntf.onclick = () => {
              window.focus();
              router.push(`/trips/${trip.id}`);
            };
          }
          updateTrip(trip.id, (t) => ({
            ...t,
            remindersShown: t.remindersShown.includes(r.kind)
              ? t.remindersShown
              : [...t.remindersShown, r.kind],
          }));
        }
      }
    };
    run();
    const id = setInterval(run, 60_000);
    return () => clearInterval(id);
  }, [hydrated, updateTrip, router]);

  return null;
}
