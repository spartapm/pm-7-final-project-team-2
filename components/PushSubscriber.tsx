"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ensurePushSubscription, isIosWeb } from "@/lib/notify";
import { useStore } from "@/lib/store";

export function PushSubscriber() {
  const { accountId, hydrated } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated || !accountId || accountId === "pending") return;
    if (pathname.startsWith("/onboarding")) return;
    void ensurePushSubscription(accountId);
  }, [hydrated, accountId, pathname]);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || isIosWeb()) return;
    const onMessage = (event: MessageEvent) => {
      const url = event.data?.url;
      if (event.data?.type !== "PUSH_NAV" || typeof url !== "string") return;
      try {
        router.push(new URL(url, window.location.origin).pathname);
      } catch {
        router.push("/trips");
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [router]);

  return null;
}
