import { useEffect, useLayoutEffect, useState } from "react";
import { isRangedKind, poseFor } from "@/game/fx";
import type { BattleFx, Combatant, FxKind } from "@/game/types";
import { cn } from "@/lib/utils";
import { Portrait, StatBar } from "./chrome";

type Pt = { x: number; y: number };

function queryPoint(root: HTMLElement, id: string, muzzle: boolean): Pt | null {
  const sel = muzzle ? `[data-fx-muzzle="${id}"]` : `[data-cid="${id}"]`;
  const el = root.querySelector(sel) as HTMLElement | null;
  if (!el) return muzzle ? queryPoint(root, id, false) : null;
  const a = root.getBoundingClientRect();
  const b = el.getBoundingClientRect();
  return { x: b.left - a.left + b.width / 2, y: b.top - a.top + b.height / 2 };
}

function OverlaySvg({ kind, miss }: { kind: FxKind; miss?: boolean }) {
  if (kind === "slash" || kind === "pierce" || kind === "bash") {
    return (
      <svg viewBox="0 0 100 100" className="fx-overlay-svg" aria-hidden>
        <path className={cn("fx-slash-glow", miss && "fx-miss")} d="M6 4 C 34 28, 66 62, 96 98" />
        <path className={cn("fx-slash-core", miss && "fx-miss")} d="M8 6 C 36 30, 66 64, 94 96" />
        <path className={cn("fx-slash-core fx-slash-path-b", miss && "fx-miss")} d="M20 0 C 46 24, 72 56, 100 90" />
      </svg>
    );
  }
  if (kind === "whirl") {
    return (
      <>
        <span className="fx-whirl-wind" />
        <svg viewBox="0 0 100 100" className="fx-overlay-svg" aria-hidden>
          <ellipse className="fx-whirl-ring" cx="50" cy="52" rx="36" ry="18" />
          <ellipse className="fx-whirl-ring fx-whirl-ring-b" cx="50" cy="48" rx="24" ry="11" />
          <path className="fx-whirl-cut" d="M16 42 C 32 18, 68 14, 88 40" />
          <path className="fx-whirl-cut fx-whirl-cut-b" d="M84 58 C 68 84, 32 86, 14 60" />
        </svg>
      </>
    );
  }
  if (kind === "bite") {
    return (
      <svg viewBox="0 0 100 100" className="fx-overlay-svg" aria-hidden>
        <path className="fx-bite-jaw fx-bite-top" d="M14 22 L50 46 L86 22" />
        <path className="fx-bite-jaw fx-bite-bot" d="M14 82 L50 56 L86 82" />
        <path className="fx-bite-tooth fx-bite-top" d="M32 30 L38 42 L44 30" />
        <path className="fx-bite-tooth fx-bite-bot" d="M56 74 L62 62 L68 74" />
      </svg>
    );
  }
  if (kind === "claw") {
    return (
      <svg viewBox="0 0 100 100" className="fx-overlay-svg" aria-hidden>
        <path className="fx-slash-glow" d="M18 10 L34 92" />
        <path className="fx-slash-core" d="M22 12 L36 90" />
        <path className="fx-slash-core fx-slash-path-b" d="M48 6 L58 94" />
        <path className="fx-slash-core" d="M76 10 L70 90" />
      </svg>
    );
  }
  if (kind === "goo") return <span className="fx-goo-burst" />;
  if (kind === "fire") return <span className="fx-burst fx-burst-fire" />;
  if (kind === "ice") return <span className="fx-burst fx-burst-ice" />;
  if (kind === "thunder") return <span className="fx-burst fx-burst-thunder" />;
  if (kind === "shadow" || kind === "bolt") return <span className="fx-burst fx-burst-bolt" />;
  if (kind === "breath") return <span className="fx-burst fx-burst-breath" />;
  if (kind === "heal" || kind === "buff") return <span className="fx-burst fx-burst-heal" />;
  if (kind === "howl") return <span className="fx-burst fx-burst-howl" />;
  if (kind === "arrow" || kind === "impact" || kind === "tame") {
    return <span className="fx-impact-spark" />;
  }
  return null;
}

function ActorOverlay({ kind, side }: { kind: FxKind; side: "ally" | "enemy" }) {
  if (kind === "slash" || kind === "whirl" || kind === "bash" || kind === "pierce") {
    return (
      <svg viewBox="0 0 100 100" className="fx-overlay-svg" aria-hidden>
        <path className={cn("fx-blade", side === "enemy" && "fx-blade-rev")} d="M22 8 L90 92" />
        <path className={cn("fx-blade fx-blade-thin", side === "enemy" && "fx-blade-rev")} d="M28 2 L96 84" />
      </svg>
    );
  }
  if (kind === "arrow") return <span className="fx-bow-glow" />;
  if (kind === "bite" || kind === "claw") return <span className="fx-lunge-flash" />;
  if (kind === "fire" || kind === "ice" || kind === "thunder" || kind === "bolt" || kind === "shadow") {
    return <span className="fx-cast-glow" />;
  }
  return null;
}

export function BattleFxLayer({
  stageRef,
  fx,
}: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  fx: BattleFx | null | undefined;
}) {
  const [shots, setShots] = useState<{ id: string; from: Pt; to: Pt; kind: FxKind }[]>([]);

  useLayoutEffect(() => {
    const root = stageRef.current;
    if (!root || !fx || !isRangedKind(fx.kind)) {
      setShots([]);
      return;
    }
    const from = queryPoint(root, fx.actorId, true);
    if (!from) return;
    const next = fx.targetIds
      .map((id) => {
        const to = queryPoint(root, id, false);
        return to ? { id: `${fx.id}-${id}`, from, to, kind: fx.kind } : null;
      })
      .filter((x): x is { id: string; from: Pt; to: Pt; kind: FxKind } => Boolean(x));
    setShots(next);
  }, [fx, stageRef]);

  if (!fx) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" data-fx-layer={fx.kind}>
      {shots.map((s) => {
        const dx = s.to.x - s.from.x;
        const dy = s.to.y - s.from.y;
        const len = Math.max(8, Math.hypot(dx, dy));
        const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <span
            key={s.id}
            className="fx-shot-wrap"
            data-fx-shot={s.kind}
            style={{
              left: s.from.x,
              top: s.from.y,
              width: len,
              transform: `rotate(${ang}deg)`,
              ["--travel" as string]: `${Math.max(12, len - 28)}px`,
            }}
          >
            <span className={cn("fx-shot-trail", `fx-shot-trail-${s.kind}`)} />
            <span className={cn("fx-shot", `fx-shot-${s.kind}`)} />
          </span>
        );
      })}
    </div>
  );
}

export function CombatCard({
  c,
  fx,
  side,
  disabled,
  selected,
  active,
  compact,
  onClick,
}: {
  c: Combatant;
  fx?: BattleFx | null;
  side: "ally" | "enemy";
  disabled?: boolean;
  selected?: boolean;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
}) {
  const isActor = fx?.actorId === c.id;
  const isTarget = fx?.targetIds.includes(c.id) ?? false;
  const pose = isActor ? poseFor(fx!.kind) : null;
  const hit = isTarget && fx?.hit && !fx.pops.filter((p) => p.targetId === c.id).every((p) => p.miss);
  const miss = isTarget && fx?.pops.some((p) => p.targetId === c.id && p.miss);
  const pops = fx?.pops.filter((p) => p.targetId === c.id) ?? [];
  const showImpact = isTarget && fx && !["heal", "buff", "defend", "howl", "tame"].includes(fx.kind);
  const ranged = Boolean(fx && isRangedKind(fx.kind));
  const popDelay = ranged ? 340 : 170;
  const involved = isActor || isTarget;

  return (
    <button
      type="button"
      data-cid={c.id}
      data-fx-role={isActor ? "actor" : isTarget ? "target" : undefined}
      data-fx-kind={involved ? fx!.kind : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative rounded-lg border border-border bg-surface/80",
        compact ? "flex min-w-0 flex-1 items-end gap-2 p-2" : "w-28 sm:w-36",
        selected && "ring-1 ring-accent",
        active && "ring-1 ring-accent",
        fx?.crit && isTarget && "fx-crit-flash",
        isActor && "z-10",
      )}
    >
      <div
        key={involved ? fx!.id : "rest"}
        className={cn(
          "relative",
          compact && "shrink-0",
          isActor && pose && `fx-pose fx-pose-${pose} fx-from-${side}`,
          hit && "fx-pose-hit",
          miss && "fx-pose-dodge",
          ranged && "fx-late",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden",
            compact ? "h-20 w-16 shrink-0 rounded-md sm:h-24 sm:w-20" : "h-24 w-full sm:h-32",
            c.hp <= 0 && "opacity-45 grayscale",
          )}
        >
          <Portrait src={c.portrait} alt={c.name} className="size-full" />
          <span
            data-fx-muzzle={c.id}
            className="pointer-events-none absolute size-px"
            style={{
              left: side === "ally" ? "74%" : "26%",
              top: side === "ally" ? "40%" : "58%",
            }}
          />
          {isActor && fx ? <ActorOverlay kind={fx.kind} side={side} /> : null}
          {showImpact ? (
            <div
              key={`${fx!.id}-ov`}
              className={cn("pointer-events-none absolute inset-0", ranged ? "fx-ov-ranged" : "fx-ov-melee")}
            >
              <OverlaySvg kind={fx!.kind} miss={miss && !hit} />
            </div>
          ) : null}
          {isActor && fx?.kind === "defend" ? <span className="fx-shield" /> : null}
        </div>
        {pops.map((p, i) => (
          <span
            key={`${fx?.id}-${i}`}
            className={cn(
              "fx-pop",
              p.miss ? "text-muted" : p.text.startsWith("+") ? "text-mp" : "text-hp",
              p.crit && "fx-pop-crit",
            )}
            style={{ animationDelay: `${popDelay + i * 70}ms` }}
          >
            {p.text}
          </span>
        ))}
      </div>
      {compact ? (
        <div className="min-w-0 flex-1 pb-0.5">
          <p className="truncate text-xs">
            {c.name}
            <span className="ml-2 tabular-nums text-muted">
              {Math.max(0, c.hp)}/{c.maxHp}
            </span>
          </p>
          <StatBar value={c.hp} max={c.maxHp} tone="hp" />
          <div className="mt-1">
            <StatBar value={c.mp} max={c.maxMp} tone="mp" />
          </div>
        </div>
      ) : (
        <div className="space-y-1 p-2">
          <p className="truncate text-xs">
            {c.name}
            {c.level ? <span className="ml-1 text-faint">Lv.{c.level}</span> : null}
          </p>
          <p className="text-xs tabular-nums text-muted">
            {Math.max(0, c.hp)}/{c.maxHp}
          </p>
          <StatBar value={c.hp} max={c.maxHp} tone="hp" />
        </div>
      )}
    </button>
  );
}

export function useFxShake(fx: BattleFx | null | undefined) {
  const [on, setOn] = useState(false);
  const id = fx?.id;
  const crit = Boolean(fx?.crit || fx?.kind === "whirl" || fx?.kind === "breath");
  useEffect(() => {
    if (!id || !fx?.hit) {
      setOn(false);
      return;
    }
    const wait = fx && isRangedKind(fx.kind) ? 320 : 140;
    const t0 = window.setTimeout(() => setOn(crit), wait);
    const t1 = window.setTimeout(() => setOn(false), wait + 380);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
    };
  }, [id, crit, fx]);
  return on;
}
