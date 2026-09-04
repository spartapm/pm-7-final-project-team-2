"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { addCategoryToTrip, unusedPresetNames } from "./ChecklistView";
import { IconPlus, PhoneShell } from "./icons";
import { InputDialog, Toast, TopBar } from "./ui";

export function AddCategory({ tripId }: { tripId: string }) {
  const router = useRouter();
  const { trips, updateTrip } = useStore();
  const trip = trips.find((t) => t.id === tripId);
  const [dialog, setDialog] = useState(false);
  const [name, setName] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const unused = useMemo(() => (trip ? unusedPresetNames(trip) : []), [trip]);
  const dup = Boolean(trip && name.trim() && trip.categories.some((c) => c.name === name.trim()));
  const invalid = !name.trim() || name.length > 30 || dup;

  if (!trip) {
    return (
      <PhoneShell>
        <TopBar close={() => router.push("/trips")} title="카테고리 추가" />
        <div className="empty">일정을 찾을 수 없어요.</div>
      </PhoneShell>
    );
  }

  const add = (label: string) => {
    updateTrip(trip.id, (t) => addCategoryToTrip(t, label));
    router.push(`/trips/${trip.id}`);
  };

  return (
    <PhoneShell>
      <TopBar close={() => router.push(`/trips/${trip.id}`)} title="카테고리 추가" />
      <div className="shell-scroll">
        <div style={{ padding: "16px 32px 0" }}>
          <button
            className="t-button"
            style={{ color: "var(--primary)", background: "none", border: "none", padding: 0 }}
            onClick={() => setDialog(true)}
          >
            직접 입력
          </button>
        </div>
        <div style={{ height: 12 }} />
        {unused.map((label) => (
          <button key={label} className="listrow" onClick={() => add(label)}>
            <span className="lab">{label}</span>
            <span className="hit">
              <IconPlus />
            </span>
          </button>
        ))}
      </div>
      {dialog ? (
        <InputDialog
          value={name}
          onChange={(v) => {
            setName(v);
            if (v.length > 30) setToast("최대 30자까지 입력할 수 있어요");
          }}
          confirmDisabled={invalid}
          onCancel={() => setDialog(false)}
          onConfirm={() => add(name.trim())}
        />
      ) : null}
      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </PhoneShell>
  );
}
