/** Prefix public URLs with Vite's base (GitHub Pages is served under /mistvale/). */
export function assetUrl(path: string): string {
  if (!path || /^(https?:|data:|blob:)/i.test(path)) return path;
  const base = import.meta.env.BASE_URL || "/";
  const trimmed = path.replace(/^\/+/, "");
  if (base === "/") return `/${trimmed}`;
  return `${base}${trimmed}`;
}
