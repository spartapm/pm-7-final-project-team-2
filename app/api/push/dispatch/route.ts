import { NextResponse } from "next/server";
import { dispatchDuePushes } from "@/lib/pushServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cronAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }
  const result = await dispatchDuePushes();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export async function POST(req: Request) {
  return GET(req);
}
