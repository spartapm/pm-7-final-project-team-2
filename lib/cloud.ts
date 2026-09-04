import type { Trip } from "./types";
import { getSupabase, isMissingTable } from "./supabase";

export type CloudAccount = {
  id: string;
  trips: Trip[];
  personalItems: { id: string; name: string }[];
};

export type CloudStatus = "ok" | "missing-table" | "error" | "off";

export async function pullAccount(accountId: string): Promise<{
  status: CloudStatus;
  data?: CloudAccount;
  message?: string;
}> {
  const sb = getSupabase();
  if (!sb) return { status: "off" };

  const accountRes = await sb.from("accounts").select("id, personal_items").eq("id", accountId).maybeSingle();
  if (accountRes.error) {
    if (isMissingTable(accountRes.error)) return { status: "missing-table" };
    return { status: "error", message: accountRes.error.message };
  }

  const tripRes = await sb.from("trips").select("id, payload").eq("account_id", accountId);
  if (tripRes.error) {
    if (isMissingTable(tripRes.error)) return { status: "missing-table" };
    return { status: "error", message: tripRes.error.message };
  }

  const trips = (tripRes.data ?? [])
    .map((row) => row.payload as Trip)
    .filter((t) => t && typeof t.id === "string");

  return {
    status: "ok",
    data: {
      id: accountId,
      trips,
      personalItems: (accountRes.data?.personal_items as { id: string; name: string }[]) ?? [],
    },
  };
}

export async function pushAccount(input: CloudAccount): Promise<CloudStatus> {
  const sb = getSupabase();
  if (!sb) return "off";

  const accountRes = await sb.from("accounts").upsert({
    id: input.id,
    personal_items: input.personalItems,
    updated_at: new Date().toISOString(),
  });
  if (accountRes.error) {
    if (isMissingTable(accountRes.error)) return "missing-table";
    console.warn("[supabase] accounts upsert", accountRes.error.message);
    return "error";
  }

  const remote = await sb.from("trips").select("id").eq("account_id", input.id);
  if (remote.error) {
    if (isMissingTable(remote.error)) return "missing-table";
    return "error";
  }

  const keep = new Set(input.trips.map((t) => t.id));
  const stale = (remote.data ?? []).map((r) => r.id as string).filter((id) => !keep.has(id));
  if (stale.length) {
    await sb.from("trips").delete().in("id", stale);
  }

  if (input.trips.length) {
    const tripRes = await sb.from("trips").upsert(
      input.trips.map((trip) => ({
        id: trip.id,
        account_id: input.id,
        payload: trip,
        updated_at: new Date().toISOString(),
      }))
    );
    if (tripRes.error) {
      if (isMissingTable(tripRes.error)) return "missing-table";
      console.warn("[supabase] trips upsert", tripRes.error.message);
      return "error";
    }
  }

  return "ok";
}
