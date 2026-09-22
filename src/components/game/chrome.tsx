import { useEffect } from "react";
import { Backpack, Map as MapIcon, Save, Swords, Users } from "lucide-react";
import { CLASSES, ITEMS, LOCATIONS, hasCrystals, xpToNext } from "@/game/data";
import { deriveHeroStats } from "@/game/combat";
import { cn } from "@/lib/utils";
import { assetUrl } from "@/lib/asset";
import { heroPortrait, useGame } from "@/game/store";
import type { Panel } from "@/game/types";

export function GButton({
  children,
  onClick,
  variant = "ghost",
  disabled,
  className,
  wide,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "subtle" | "danger";
  disabled?: boolean;
  className?: string;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-opacity duration-75",
        "active:opacity-80 disabled:pointer-events-none disabled:opacity-40",
        wide && "w-full",
        variant === "primary" && "bg-accent text-accent-fg",
        variant === "ghost" && "border border-border bg-raised text-fg",
        variant === "subtle" && "text-muted hover:bg-raised hover:text-fg",
        variant === "danger" && "border border-border text-hp",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function StatBar({
  value,
  max,
  tone,
  label,
}: {
  value: number;
  max: number;
  tone: "hp" | "mp" | "xp";
  label?: string;
}) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="min-w-0">
      {label ? (
        <div className="mb-1 flex justify-between text-xs text-muted tabular-nums">
          <span>{label}</span>
          <span>
            {Math.max(0, Math.floor(value))}/{Math.floor(max)}
          </span>
        </div>
      ) : null}
      <div className="stat-bar">
        <div
          className={cn(
            "stat-bar-fill",
            tone === "hp" && "stat-bar-hp",
            tone === "mp" && "stat-bar-mp",
            tone === "xp" && "stat-bar-xp",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Portrait({
  src,
  alt,
  className,
  dim,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  dim?: boolean;
  priority?: boolean;
}) {
  return (
    <img
      src={assetUrl(src)}
      alt={alt}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      draggable={false}
      onError={(e) => {
        const el = e.currentTarget;
        el.onerror = null;
        el.removeAttribute("src");
        el.classList.add("bg-raised");
      }}
      className={cn("object-cover object-top", dim && "opacity-45 grayscale", className)}
    />
  );
}

export function SceneImage({ src, priority }: { src: string; priority?: boolean }) {
  return (
    <img
      src={assetUrl(src)}
      alt=""
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "low"}
      draggable={false}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.removeAttribute("src");
      }}
      className="absolute inset-0 size-full object-cover"
    />
  );
}

export function StatusBar() {
  const hero = useGame((s) => s.hero);
  const gold = useGame((s) => s.gold);
  const flags = useGame((s) => s.flags);
  const locationId = useGame((s) => s.locationId);
  const panel = useGame((s) => s.panel);
  const setPanel = useGame((s) => s.setPanel);
  if (!hero) return null;
  const stats = deriveHeroStats(hero);
  const cls = CLASSES[hero.classId] ?? CLASSES.warrior;
  const crystals = [flags.crystalForest, flags.crystalCave, flags.crystalShrine];

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface/90 px-3 py-2">
      <Portrait
        src={heroPortrait(hero)}
        alt={hero.name}
        priority
        className="size-11 rounded-md"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium">
            {hero.name}
            <span className="ml-2 text-xs text-muted">
              {cls.name} · Lv.{hero.level}
            </span>
          </p>
          <p className="shrink-0 text-xs tabular-nums text-muted">
            {labelLocation(locationId)} · {gold} 金
          </p>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs tabular-nums text-muted">
          <span>
            {hero.hp}/{stats.hp}
          </span>
          <span>
            {hero.mp}/{stats.mp}
          </span>
          <span className="ml-auto flex items-center gap-1">
            {crystals.map((on, i) => (
              <span
                key={i}
                className={cn("size-1.5 rounded-full", on ? "bg-accent" : "bg-border")}
              />
            ))}
          </span>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <StatBar value={hero.hp} max={stats.hp} tone="hp" />
          <StatBar value={hero.mp} max={stats.mp} tone="mp" />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPanel(panel === "system" ? null : "system")}
        className={cn(
          "flex size-11 shrink-0 flex-col items-center justify-center rounded-md text-xs",
          panel === "system" ? "text-accent" : "text-muted",
        )}
        aria-label="存檔"
      >
        <Save className="size-4" strokeWidth={1.75} />
        存檔
      </button>
    </header>
  );
}

function labelLocation(id: string) {
  return LOCATIONS[id]?.name ?? id;
}

export function Dock() {
  const panel = useGame((s) => s.panel);
  const setPanel = useGame((s) => s.setPanel);
  const items: { id: Panel; label: string; icon: typeof MapIcon }[] = [
    { id: "map", label: "地圖", icon: MapIcon },
    { id: "inventory", label: "背包", icon: Backpack },
    { id: "skills", label: "技能", icon: Swords },
    { id: "party", label: "隊伍", icon: Users },
  ];
  return (
    <nav className="grid shrink-0 grid-cols-4 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)]">
      {items.map((it) => {
        const Icon = it.icon;
        const active = panel === it.id;
        return (
          <button
            key={String(it.id)}
            type="button"
            onClick={() => setPanel(active ? null : it.id)}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 text-xs",
              active ? "text-accent" : "text-muted",
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} />
            {it.label}
          </button>
        );
      })}
    </nav>
  );
}

export function Toast() {
  const toast = useGame((s) => s.toast);
  const setToast = useGame((s) => s.setToast);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast, setToast]);
  if (!toast) return null;
  return (
    <button
      type="button"
      onClick={() => setToast(null)}
      className="game-panel absolute left-1/2 top-16 z-30 w-[min(92%,22rem)] -translate-x-1/2 rounded-lg px-4 py-3 text-center text-sm"
    >
      {toast}
    </button>
  );
}

export function ItemLine({ itemId, qty }: { itemId: string; qty?: number }) {
  const item = ITEMS[itemId];
  if (!item) return null;
  return (
    <div className="min-w-0">
      <p className="truncate text-sm">
        {item.name}
        {qty != null ? <span className="ml-2 text-muted tabular-nums">×{qty}</span> : null}
      </p>
      <p className="truncate text-xs text-muted">{item.desc}</p>
    </div>
  );
}

export function CrystalStrip() {
  const flags = useGame((s) => s.flags);
  const ready = hasCrystals(flags);
  return (
    <p className="text-xs text-muted">
      霧晶 {ready ? "已齊" : `${[flags.crystalForest, flags.crystalCave, flags.crystalShrine].filter(Boolean).length}/3`}
    </p>
  );
}

export function XpLine() {
  const hero = useGame((s) => s.hero);
  if (!hero) return null;
  const need = xpToNext(hero.level);
  return <StatBar value={hero.xp} max={need} tone="xp" label="經驗" />;
}
