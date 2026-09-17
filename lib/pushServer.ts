import webpush from "web-push";
import { getSupabase, isMissingTable } from "./supabase";
import { loadCatalogFromCloud } from "./liveCatalog";
import { cartCount, reminderCopy, scheduledKindNow, type ReminderKind } from "./reminders";
import type { Trip } from "./types";

export type PushSubRow = {
  endpoint: string;
  account_id: string;
  p256dh: string;
  auth: string;
  user_agent?: string | null;
};

export type PushPayload = {
  title: string;
  body: string;
  url: string;
  tripId?: string;
  kind?: ReminderKind;
};

function vapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:chaeggyeo@gmail.com";
  if (!publicKey || !privateKey) return null;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return { publicKey, privateKey, subject };
}

export function pushConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export async function sendPush(sub: PushSubRow, payload: PushPayload) {
  if (!vapid()) return { ok: false as const, gone: false, error: "VAPID 키가 없습니다" };
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload)
    );
    return { ok: true as const, gone: false };
  } catch (e) {
    const status = typeof e === "object" && e && "statusCode" in e ? Number((e as { statusCode?: number }).statusCode) : 0;
    const gone = status === 404 || status === 410;
    if (gone) {
      const sb = getSupabase();
      if (sb) await sb.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
    }
    const message = e instanceof Error ? e.message : "send failed";
    return { ok: false as const, gone, error: message };
  }
}

export async function subscriptionsFor(accountId?: string) {
  const sb = getSupabase();
  if (!sb) return { status: "off" as const, rows: [] as PushSubRow[] };
  let q = sb.from("push_subscriptions").select("endpoint, account_id, p256dh, auth, user_agent");
  if (accountId) q = q.eq("account_id", accountId);
  const res = await q;
  if (res.error) {
    if (isMissingTable(res.error)) return { status: "missing-table" as const, rows: [] as PushSubRow[] };
    return { status: "error" as const, rows: [] as PushSubRow[], message: res.error.message };
  }
  return { status: "ok" as const, rows: (res.data ?? []) as PushSubRow[] };
}

async function markShown(trip: Trip, kind: ReminderKind) {
  const sb = getSupabase();
  if (!sb) return;
  const shown = trip.remindersShown ?? [];
  const remindersShown = shown.includes(kind) ? shown : [...shown, kind];
  const payload: Trip = { ...trip, remindersShown };
  await sb.from("trips").update({ payload, updated_at: new Date().toISOString() }).eq("id", trip.id);
  trip.remindersShown = remindersShown;
}

export async function dispatchDuePushes(opts?: { ignoreHour?: boolean }) {
  if (!pushConfigured()) return { ok: false as const, message: "VAPID 키가 없습니다", sent: 0 };
  await loadCatalogFromCloud();
  const sb = getSupabase();
  if (!sb) return { ok: false as const, message: "Supabase가 없습니다", sent: 0 };

  const [subRes, tripRes] = await Promise.all([
    subscriptionsFor(),
    sb.from("trips").select("id, account_id, payload"),
  ]);
  if (subRes.status === "missing-table") {
    return { ok: false as const, message: "push_subscriptions 테이블이 없습니다. 어드민에서 SQL을 실행하세요.", sent: 0 };
  }
  if (tripRes.error) {
    return { ok: false as const, message: tripRes.error.message, sent: 0 };
  }

  const byAccount = new Map<string, PushSubRow[]>();
  for (const row of subRes.rows) {
    const list = byAccount.get(row.account_id) ?? [];
    list.push(row);
    byAccount.set(row.account_id, list);
  }

  const now = new Date();
  let sent = 0;
  const failures: string[] = [];

  for (const row of tripRes.data ?? []) {
    const trip = row.payload as Trip;
    if (!trip?.id || !Array.isArray(trip.categories)) continue;
    const kind = scheduledKindNow(trip, now, Boolean(opts?.ignoreHour));
    if (!kind) continue;
    const subs = byAccount.get(row.account_id as string) ?? [];
    if (!subs.length) continue;
    const copy = reminderCopy(kind, cartCount(trip));
    const payload: PushPayload = {
      title: copy.title,
      body: copy.body,
      url: `/trips/${trip.id}`,
      tripId: trip.id,
      kind,
    };
    let anyOk = false;
    for (const sub of subs) {
      const res = await sendPush(sub, payload);
      if (res.ok) {
        sent += 1;
        anyOk = true;
      } else if (!res.gone) {
        failures.push(res.error);
      }
    }
    if (anyOk) await markShown(trip, kind);
  }

  return { ok: true as const, sent, failures: failures.slice(0, 5) };
}
