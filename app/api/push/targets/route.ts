import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { subscriptionsFor } from "@/lib/pushServer";

export const runtime = "nodejs";

export async function GET() {
  const subRes = await subscriptionsFor();
  const sb = getSupabase();
  const trips = sb ? await sb.from("trips").select("id, account_id, payload") : { data: [] as { id: string; account_id: string; payload: { startDate?: string } }[] };

  const tripByAccount = new Map<string, { id: string; startDate?: string }[]>();
  for (const row of trips.data ?? []) {
    const list = tripByAccount.get(row.account_id) ?? [];
    list.push({ id: row.id, startDate: (row.payload as { startDate?: string } | null)?.startDate });
    tripByAccount.set(row.account_id, list);
  }

  const accounts = [...new Set(subRes.rows.map((r) => r.account_id))].map((id) => ({
    id,
    endpoints: subRes.rows.filter((r) => r.account_id === id).length,
    trips: tripByAccount.get(id) ?? [],
  }));

  return NextResponse.json({
    ok: true,
    status: subRes.status,
    configured: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
    subscriptions: subRes.rows.length,
    accounts,
  });
}
