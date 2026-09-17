import { NextResponse } from "next/server";
import { getSupabase, isMissingTable } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    accountId?: string;
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
    userAgent?: string;
  } | null;

  const accountId = body?.accountId?.trim();
  const endpoint = body?.endpoint?.trim();
  const p256dh = body?.keys?.p256dh?.trim();
  const auth = body?.keys?.auth?.trim();
  if (!accountId || !endpoint || !p256dh || !auth) {
    return NextResponse.json({ ok: false, message: "구독 정보가 부족합니다" }, { status: 400 });
  }

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, message: "Supabase가 없습니다" }, { status: 500 });

  const res = await sb.from("push_subscriptions").upsert({
    endpoint,
    account_id: accountId,
    p256dh,
    auth,
    user_agent: body?.userAgent ?? null,
    updated_at: new Date().toISOString(),
  });
  if (res.error) {
    if (isMissingTable(res.error)) {
      return NextResponse.json({ ok: false, status: "missing-table" }, { status: 500 });
    }
    return NextResponse.json({ ok: false, message: res.error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
