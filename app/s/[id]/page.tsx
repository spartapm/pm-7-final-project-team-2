"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { pullAccount } from "@/lib/cloud";
import { useStore } from "@/lib/store";
import type { Trip } from "@/lib/types";

export default function SharePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { adoptAccount, importTrips, hydrated } = useStore();
  const [msg, setMsg] = useState("일정을 불러오는 중...");

  useEffect(() => {
    if (!hydrated || !id) return;
    let cancelled = false;

    (async () => {
      const remote = await pullAccount(id);
      if (cancelled) return;

      if (remote.status === "ok" && remote.data) {
        adoptAccount(remote.data);
        router.replace("/trips");
        return;
      }

      const raw =
        localStorage.getItem(`chaeggyeo:share:${id}`) ??
        sessionStorage.getItem(`chaeggyeo:share:${id}`);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { trips: Trip[]; accountId: string };
          importTrips(parsed.trips, parsed.accountId);
          router.replace("/trips");
          return;
        } catch {
          /* ignore */
        }
      }

      if (remote.status === "missing-table") {
        setMsg("클라우드 테이블이 아직 없습니다. SQL을 한 번 실행해 주세요.");
        return;
      }

      adoptAccount({ id, trips: [], personalItems: [] });
      router.replace("/trips");
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, id, adoptAccount, importTrips, router]);

  return (
    <div className="shell" style={{ padding: 32, color: "var(--text-3)", fontSize: 14 }}>
      {msg}
    </div>
  );
}
