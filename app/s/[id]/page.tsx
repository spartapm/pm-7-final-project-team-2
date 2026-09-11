"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PhoneShell } from "@/components/icons";
import { Toast, TopBar } from "@/components/ui";
import { pullAccount } from "@/lib/cloud";
import { setLastHome } from "@/lib/lastHome";
import { useStore } from "@/lib/store";
import type { Trip } from "@/lib/types";

const LOAD_ERROR = "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

export default function SharePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { adoptAccount, hydrated } = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!hydrated || !id) return;
    let cancelled = false;
    let done = false;
    const failTimer = window.setTimeout(() => {
      if (cancelled || done) return;
      done = true;
      setToast(LOAD_ERROR);
      setMissing(true);
    }, 5000);

    (async () => {
      const remote = await pullAccount(id);
      if (cancelled || done) return;

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
      setMissing(true);
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(failTimer);
    };
  }, [hydrated, id, adoptAccount, router]);

  if (missing) {
    return (
      <PhoneShell>
        <TopBar back={() => router.push("/trips")} />
        <div className="empty">일정을 찾을 수 없어요.</div>
        {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <div className="empty">일정을 불러오는 중...</div>
      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </PhoneShell>
  );
}
