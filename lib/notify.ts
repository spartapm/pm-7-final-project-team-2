const ASK_KEY = "chaeggyeo:pushAsked";

export function isIosWeb() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function urlBase64ToUint8Array(base64: string) {
  const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

async function vapidPublicKey() {
  const fromEnv = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (fromEnv) return fromEnv;
  const res = await fetch("/api/push/vapid", { cache: "no-store" });
  const json = (await res.json()) as { publicKey?: string };
  return json.publicKey || "";
}

let subLock: Promise<void> | null = null;

function onTripHome() {
  if (typeof window === "undefined") return false;
  if (window.location.pathname !== "/trips") return false;
  if (document.querySelector(".gen-seq")) return false;
  return document.visibilityState === "visible";
}

function waitUntilTripHome(minMs = 400, maxMs = 8000) {
  const start = Date.now();
  return new Promise<boolean>((resolve) => {
    const tick = () => {
      const elapsed = Date.now() - start;
      if (onTripHome() && elapsed >= minMs) {
        resolve(true);
        return;
      }
      if (elapsed >= maxMs) {
        resolve(onTripHome());
        return;
      }
      window.setTimeout(tick, 80);
    };
    tick();
  });
}

export async function ensurePushSubscription(accountId: string) {
  if (typeof window === "undefined") return;
  if (!accountId || accountId === "pending") return;
  if (isIosWeb()) return;
  if (window.location.pathname.startsWith("/onboarding")) return;
  if (subLock) return subLock;
  subLock = subscribePush(accountId).finally(() => {
    subLock = null;
  });
  return subLock;
}

async function subscribePush(accountId: string) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const publicKey = await vapidPublicKey();
  if (!publicKey) return;

  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }
  const json = sub.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accountId,
      endpoint: json.endpoint,
      keys: json.keys,
      userAgent: navigator.userAgent,
    }),
  });
}

export async function askPushOnHome(accountId: string) {
  if (typeof window === "undefined") return;
  if (isIosWeb()) return;
  if (!("Notification" in window)) return;
  const ready = await waitUntilTripHome();
  if (!ready || !onTripHome()) return;
  if (Notification.permission === "default") {
    try {
      if (localStorage.getItem(ASK_KEY) !== "1") {
        localStorage.setItem(ASK_KEY, "1");
        const { track } = await import("./analytics");
        const result = await Notification.requestPermission();
        track("push_permission_result", { result });
      }
    } catch {
      /* ignore */
    }
  }
  if (Notification.permission === "granted") {
    try {
      await ensurePushSubscription(accountId);
    } catch {
      /* ignore */
    }
  }
}
