"use client";

import { useParams } from "next/navigation";
import { ChecklistView } from "@/components/ChecklistView";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <ChecklistView tripId={id} />;
}
