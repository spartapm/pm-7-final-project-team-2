import { NextResponse } from "next/server";
import { dispatchDuePushes, sendPush, subscriptionsFor, type PushPayload } from "@/lib/pushServer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    scheduled?: boolean;
    ignoreHour?: boolean;
    accountId?: string;
    title?: string;
    body?: string;
    url?: string;
    tripId?: string;
  } | null;

  if (body?.scheduled) {
    const result = await dispatchDuePushes({ ignoreHour: body.ignoreHour !== false });
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  }

  const title = body?.title?.trim();
  const text = body?.body?.trim();
  if (!body || !title || !text) {
    return NextResponse.json({ ok: false, message: "제목과 내용을 입력하세요" }, { status: 400 });
  }

  const subRes = await subscriptionsFor(body.accountId?.trim() || undefined);
  if (subRes.status === "missing-table") {
    return NextResponse.json({ ok: false, message: "push_subscriptions 테이블이 없습니다" }, { status: 500 });
  }
  if (subRes.status === "off") {
    return NextResponse.json({ ok: false, message: "Supabase가 없습니다" }, { status: 500 });
  }
  if (!subRes.rows.length) {
    return NextResponse.json({ ok: false, message: "보낼 구독이 없습니다", sent: 0 });
  }

  const url = body.tripId ? `/trips/${body.tripId}` : body.url?.trim() || "/trips";
  const payload: PushPayload = { title, body: text, url, tripId: body.tripId };
  let sent = 0;
  let lastError = "";
  for (const sub of subRes.rows) {
    const res = await sendPush(sub, payload);
    if (res.ok) sent += 1;
    else if (!res.gone) lastError = res.error;
  }
  return NextResponse.json({
    ok: sent > 0,
    sent,
    message: sent > 0 ? `${sent}건 발송` : lastError || "발송 실패",
  });
}
