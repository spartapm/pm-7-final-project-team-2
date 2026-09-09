"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLastHome } from "@/lib/lastHome";
import { useStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { trips, hydrated } = useStore();
  useEffect(() => {
    if (!hydrated) return;
    const last = getLastHome();
    if (last === "/trips" && trips.length) {
      router.replace("/trips");
      return;
    }
    if (last?.startsWith("/trips/")) {
      const id = last.slice("/trips/".length);
      if (trips.some((t) => t.id === id)) {
        router.replace(last);
        return;
      }
    }
    router.replace(trips.length ? "/trips" : "/onboarding");
  }, [hydrated, trips, router]);
  return <div className="shell" />;
}
