export function registerPwa() {
  if (typeof window === "undefined") return;
  if (!import.meta.env.PROD) return;
  if (!("serviceWorker" in navigator)) return;
  const swUrl = `${import.meta.env.BASE_URL}sw.js`;
  void navigator.serviceWorker
    .register(swUrl, { scope: import.meta.env.BASE_URL })
    .catch(() => undefined);
}
