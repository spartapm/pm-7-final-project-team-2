export function track(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const payload = { event: name, ...params };
  const w = window as Window & { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push(payload);
}
