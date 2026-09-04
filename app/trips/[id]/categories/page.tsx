"use client";

import { useParams } from "next/navigation";
import { AddCategory } from "@/components/AddCategory";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <AddCategory tripId={id} />;
}
