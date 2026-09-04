"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { trips, hydrated } = useStore();
  useEffect(() => {
    if (!hydrated) return;
    router.replace(trips.length ? "/trips" : "/onboarding");
  }, [hydrated, trips.length, router]);
  return <div className="shell" />;
}
