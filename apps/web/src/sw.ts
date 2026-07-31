interface Window {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
}

interface SwEvent extends Event {
  waitUntil(promise: Promise<unknown>): void;
}

interface SwScope {
  skipWaiting(): void;
  clients: {
    claim(): Promise<unknown>;
  };
  caches: {
    keys(): Promise<string[]>;
    delete(key: string): Promise<boolean>;
  };
  addEventListener(type: string, listener: (event: SwEvent) => void): void;
}

const manifest = self.__WB_MANIFEST;

const sw = self as unknown as SwScope;

sw.addEventListener("install", () => {
  sw.skipWaiting();
});

sw.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await sw.clients.claim();
      const keys = await sw.caches.keys();
      await Promise.all(keys.map((key) => sw.caches.delete(key)));
    })()
  );
});
