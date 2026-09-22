import { assetUrl } from "@/lib/asset";

const seen = new Set<string>();

export function preloadArt(...urls: Array<string | null | undefined>) {
  if (typeof window === "undefined") return;
  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const img = new Image();
    img.decoding = "async";
    img.src = assetUrl(url);
  }
}

export const BOOT_ART = ["/art/village.jpg"];

export const CLASS_ART = [
  "/art/warrior.jpg",
  "/art/mage.jpg",
  "/art/ranger.jpg",
  "/art/elder.jpg",
];
