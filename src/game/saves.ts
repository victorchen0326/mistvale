import { SAVE_VERSION } from "./data";
import type { BattleState, ClassId, GameSave } from "./types";

export const SLOT_COUNT = 3;
export const RESUME_KEY = "mistvale-resume-v1";
export const SLOTS_KEY = "mistvale-slots-v1";

export interface SavePreview {
  name: string;
  classId: ClassId;
  level: number;
  locationId: string;
  gold: number;
  savedAt: number;
}

export interface SaveFile {
  preview: SavePreview;
  data: GameSave;
}

const pending = new Map<string, string>();
let writeTimer: ReturnType<typeof setTimeout> | null = null;
let flushBound = false;

function canUseStorage() {
  return typeof window !== "undefined";
}

function bindFlushOnce() {
  if (flushBound || !canUseStorage()) return;
  flushBound = true;
  const flush = () => flushPendingWrites();
  window.addEventListener("pagehide", flush);
  window.addEventListener("beforeunload", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}

export function flushPendingWrites() {
  if (writeTimer != null) {
    clearTimeout(writeTimer);
    writeTimer = null;
  }
  if (!canUseStorage()) return;
  for (const [key, value] of pending) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* quota / private mode */
    }
  }
  pending.clear();
}

function scheduleWrite(key: string, value: string) {
  pending.set(key, value);
  bindFlushOnce();
  if (writeTimer != null) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    flushPendingWrites();
  }, 280);
}

function readJson<T>(key: string): T | null {
  if (!canUseStorage()) return null;
  try {
    const raw = pending.get(key) ?? window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown, immediate = false) {
  if (!canUseStorage()) return;
  try {
    const raw = JSON.stringify(value);
    if (immediate) {
      pending.delete(key);
      window.localStorage.setItem(key, raw);
      return;
    }
    scheduleWrite(key, raw);
  } catch {
    /* quota / circular */
  }
}

export function slimBattle(battle: BattleState | null | undefined): BattleState | null {
  if (!battle?.combatants?.length) return null;
  return {
    ...battle,
    fx: null,
    pending: null,
    menu: "main",
    log: Array.isArray(battle.log) ? battle.log.slice(-12) : [],
  };
}

export function captureSave(s: GameSave): GameSave {
  let screen = s.screen;
  if (screen === "title" || screen === "create") {
    screen = s.battle?.combatants?.length ? "battle" : s.dialogue ? "dialogue" : "world";
  }
  return {
    version: SAVE_VERSION,
    screen,
    panel: null,
    locationId: s.locationId || "village",
    hero: s.hero,
    gold: s.gold,
    inventory: s.inventory ?? [],
    pets: s.pets ?? [],
    flags: s.flags ?? {},
    exploreCount: s.exploreCount ?? {},
    hunts: s.hunts ?? {},
    quests: s.quests ?? {},
    dialogue: s.dialogue,
    battle: slimBattle(s.battle),
    toast: null,
  };
}

export function toSaveFile(s: GameSave): SaveFile | null {
  if (!s.hero) return null;
  return {
    preview: {
      name: s.hero.name,
      classId: s.hero.classId,
      level: s.hero.level,
      locationId: s.locationId,
      gold: s.gold,
      savedAt: Date.now(),
    },
    data: captureSave(s),
  };
}

export function readResume(): SaveFile | null {
  return readJson<SaveFile>(RESUME_KEY);
}

export function writeResume(s: GameSave, immediate = false) {
  const file = toSaveFile(s);
  if (!file) return;
  writeJson(RESUME_KEY, file, immediate);
}

export function readSlots(): (SaveFile | null)[] {
  const stored = readJson<(SaveFile | null)[]>(SLOTS_KEY);
  const slots: (SaveFile | null)[] = Array.from({ length: SLOT_COUNT }, () => null);
  if (!stored) return slots;
  for (let i = 0; i < SLOT_COUNT; i += 1) slots[i] = stored[i] ?? null;
  return slots;
}

export function writeSlot(index: number, s: GameSave) {
  if (index < 0 || index >= SLOT_COUNT) return;
  const file = toSaveFile(s);
  if (!file) return;
  const slots = readSlots();
  slots[index] = file;
  writeJson(SLOTS_KEY, slots, true);
}

export function readSlot(index: number): SaveFile | null {
  return readSlots()[index] ?? null;
}

export function hasContinueSave(liveHero: boolean): boolean {
  if (readResume()?.data.hero) return true;
  if (liveHero) return true;
  return readSlots().some((s) => s?.data.hero);
}

export function gamePersistStorage() {
  if (!canUseStorage()) {
    return {
      getItem: () => null as string | null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  bindFlushOnce();
  return {
    getItem: (name: string) => pending.get(name) ?? window.localStorage.getItem(name),
    setItem: (name: string, value: string) => {
      scheduleWrite(name, value);
    },
    removeItem: (name: string) => {
      pending.delete(name);
      window.localStorage.removeItem(name);
    },
  };
}
