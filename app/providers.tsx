"use client";

import { CloudBanner } from "@/components/CloudBanner";
import { ReminderListener } from "@/components/ReminderListener";
import { StoreProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ReminderListener />
      <CloudBanner />
      {children}
    </StoreProvider>
  );
}
