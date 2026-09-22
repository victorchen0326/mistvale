#!/usr/bin/env node
/**
 * Copy the GitHub Pages static output into dist-pages/ and ensure PWA files
 * plus Grok branding tags are present in the prerendered HTML.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { grokExtensionsHeadTags } from "./grok-pwa-shared.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dest = join(root, "dist-pages");

function findPublicDir() {
  const candidates = [
    join(root, "dist", "client"),
    join(root, ".output", "public"),
    join(root, "dist"),
    join(root, ".vercel", "output", "static"),
  ];
  for (const dir of candidates) {
    if (!existsSync(dir)) continue;
    const names = readdirSync(dir);
    if (names.includes("index.html") || names.includes("_shell.html") || names.includes("assets")) {
      return dir;
    }
  }
  return "";
}

function injectBranding(html) {
  if (html.includes("/grok-app-builder/extensions.js")) return html;
  const tags = grokExtensionsHeadTags().join("");
  if (html.includes("</head>")) return html.replace("</head>", `${tags}</head>`);
  if (html.includes("</body>")) return html.replace("</body>", `${tags}</body>`);
  return html + tags;
}

const src = findPublicDir();
if (!src) {
  console.error("[package-pages] no static output found");
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });

writeFileSync(join(dest, ".nojekyll"), "");

const shellPath = join(dest, "index.html");
const spaShell = join(dest, "_shell.html");
if (!existsSync(shellPath) && existsSync(spaShell)) {
  cpSync(spaShell, shellPath);
}

if (!existsSync(shellPath)) {
  console.error("[package-pages] index.html missing in", src);
  process.exit(1);
}

const html = injectBranding(readFileSync(shellPath, "utf8"));
writeFileSync(shellPath, html);
writeFileSync(join(dest, "404.html"), html);

console.log("[package-pages] wrote", dest, "from", src);
