self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "챙겨요", body: "", url: "/trips" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    try {
      data.body = event.data ? event.data.text() : "";
    } catch {
      /* ignore */
    }
  }
  const url = data.url || (data.tripId ? `/trips/${data.tripId}` : "/trips");
  event.waitUntil(
    self.registration.showNotification(data.title || "챙겨요", {
      body: data.body || "",
      data: { url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/trips", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            await client.navigate(target);
          } else {
            client.postMessage({ type: "PUSH_NAV", url: target });
          }
          return;
        }
      }
      await self.clients.openWindow(target);
    })()
  );
});
