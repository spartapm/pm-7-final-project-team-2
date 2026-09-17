"use client";

import { CatalogLoader } from "@/components/CatalogLoader";
import { CloudBanner } from "@/components/CloudBanner";
import { PushSubscriber } from "@/components/PushSubscriber";
import { StoreProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <CatalogLoader />
      <PushSubscriber />
      <CloudBanner />
      {children}
    </StoreProvider>
  );
}
