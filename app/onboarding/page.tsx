"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Onboarding } from "@/components/Onboarding";

function Inner() {
  const params = useSearchParams();
  const step = Number(params.get("step") ?? "1");
  const n = step === 2 || step === 3 ? step : 1;
  return <Onboarding step={n as 1 | 2 | 3} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="shell" />}>
      <Inner />
    </Suspense>
  );
}
