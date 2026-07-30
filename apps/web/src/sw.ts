/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

const manifest = self.__WB_MANIFEST;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await clients.claim();
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    })()
  );
});

self.addEventListener("fetch", () => {});
