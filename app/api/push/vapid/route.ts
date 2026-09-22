import { NextResponse } from "next/server";

export const runtime = "nodejs";

function normalizeVapidKey(key: string) {
  return key.trim().replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function GET() {
  const raw = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const publicKey = raw ? normalizeVapidKey(raw) : "";
  return NextResponse.json({ publicKey, ok: Boolean(publicKey) });
}
