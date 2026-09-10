"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { pullAccount } from "@/lib/cloud";
import { setLastHome } from "@/lib/lastHome";
import { useStore } from "@/lib/store";
import type { Trip } from "@/lib/types";
import { Toast } from "@/components/ui";

export default function SharePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { adoptAccount, hydrated } = useStore();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || !id) return;
    let cancelled = false;
    let done = false;
    const failTimer = window.setTimeout(() => {
      if (cancelled || done) return;
      setToast("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      window.setTimeout(() => {
        if (!cancelled && !done) router.replace("/onboarding");
      }, 800);
    }, 5000);

    (async () => {
      const remote = await pullAccount(id);
      if (cancelled) return;

      if (remote.status === "ok" && remote.data) {
        done = true;
        window.clearTimeout(failTimer);
        adoptAccount(remote.data);
        setLastHome("/trips");
        router.replace("/trips");
        return;
      }

      const raw =
        localStorage.getItem(`chaeggyeo:share:${id}`) ??
        sessionStorage.getItem(`chaeggyeo:share:${id}`);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as {
            trips: Trip[];
            accountId: string;
            personalItems?: { id: string; name: string }[];
          };
          done = true;
          window.clearTimeout(failTimer);
          adoptAccount({
            id: parsed.accountId,
            trips: parsed.trips,
            personalItems: parsed.personalItems ?? [],
          });
          setLastHome("/trips");
          router.replace("/trips");
          return;
        } catch {
          /* ignore */
        }
      }

      done = true;
      window.clearTimeout(failTimer);
      router.replace("/onboarding");
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(failTimer);
    };
  }, [hydrated, id, adoptAccount, router]);

  return (
    <div className="shell" style={{ padding: 32, color: "var(--text-3)", fontSize: 14 }}>
      일정을 불러오는 중...
      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}
