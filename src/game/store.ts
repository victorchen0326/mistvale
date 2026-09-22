import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  CLASSES,
  DIALOGUES,
  ENCOUNTERS,
  ITEMS,
  LEVEL_CAP,
  LOCATIONS,
  MONSTERS,
  PET_CAP,
  QUESTS,
  SAVE_KEY,
  SAVE_VERSION,
  SHOP_ITEMS,
  SKILLS,
  STARTER_WEAPON,
  ACTIVE_QUEST_CAP,
  AREA_HUNTS,
  CLUE_NEED,
  LEGEND_WEAPONS,
  applyQuestTargets,
  canForgeLegend,
  countItem,
  freshHunt,
  hasCrystals,
  huntByBoss,
  isQuestListed,
  isQuestReady,
  isShopUnlocked,
  legendQuestAvailable,
  pickWeighted,
  resolveHuntExplore,
  shopNotesOnFlag,
  shopUnlockNotes,
  skillsLearnedAt,
  xpToNext,
} from "./data";
import {
  alliesNeedTarget,
  createBattle,
  currentActor,
  deriveHeroStats,
  derivePetStats,
  endActorTurn,
  performAttack,
  performDefend,
  performItem,
  performSkill,
  performTame,
  runAutoTurn,
  uid,
} from "./combat";
import type {
  BattleState,
  ClassId,
  Combatant,
  DialogueLine,
  GameSave,
  HeroState,
  InventoryEntry,
  Panel,
  PendingAction,
  PetState,
  QuestLogEntry,
  Screen,
  StoryEffect,
} from "./types";
import { captureSave, flushPendingWrites, gamePersistStorage, readResume, readSlot, slimBattle, writeResume, writeSlot } from "./saves";

function addItem(inv: InventoryEntry[], itemId: string, qty = 1): InventoryEntry[] {
  const next = inv.map((e) => ({ ...e }));
  const found = next.find((e) => e.itemId === itemId);
  if (found) found.qty += qty;
  else next.push({ itemId, qty });
  return next.filter((e) => e.qty > 0);
}

function takeItem(inv: InventoryEntry[], itemId: string, qty = 1): InventoryEntry[] | null {
  const found = inv.find((e) => e.itemId === itemId);
  if (!found || found.qty < qty) return null;
  return inv
    .map((e) => (e.itemId === itemId ? { ...e, qty: e.qty - qty } : e))
    .filter((e) => e.qty > 0);
}

function freshHero(name: string, classId: ClassId): HeroState {
  const hero: HeroState = {
    name: name.trim() || "旅人",
    classId,
    level: 1,
    xp: 0,
    hp: 1,
    mp: 1,
    weaponId: STARTER_WEAPON[classId],
    armorId: "cloth",
    weaponPlus: 0,
    armorPlus: 0,
  };
  const s = deriveHeroStats(hero);
  hero.hp = s.hp;
  hero.mp = s.mp;
  return hero;
}

function grantXp(hero: HeroState, xp: number): { hero: HeroState; notes: string[] } {
  const notes: string[] = [];
  const next = { ...hero, xp: hero.xp + xp };
  while (next.level < LEVEL_CAP && next.xp >= xpToNext(next.level)) {
    const before = deriveHeroStats(next);
    next.xp -= xpToNext(next.level);
    next.level += 1;
    const after = deriveHeroStats(next);
    next.hp = Math.min(after.hp, next.hp + (after.hp - before.hp) + 8);
    next.mp = after.mp;
    notes.push(`${next.name} 升到了 ${next.level} 級！`);
    const learned = skillsLearnedAt(next.classId, next.level - 1, next.level);
    for (const id of learned) {
      const sk = SKILLS[id];
      if (sk) notes.push(`學會了「${sk.name}」。`);
    }
    if (next.level === 40) {
      notes.push("四十級了。商店不再進新武器。");
    }
  }
  return { hero: next, notes };
}

function writeBackFromBattle(hero: HeroState, pets: PetState[], battle: BattleState) {
  const hc = battle.combatants.find((c) => c.kind === "hero");
  const nextHero = { ...hero };
  if (hc) {
    nextHero.hp = hc.hp;
    nextHero.mp = hc.mp;
  }
  const nextPets = pets.map((p) => {
    const c = battle.combatants.find((x) => x.id === p.id);
    if (!c) return p;
    return { ...p, hp: c.hp, maxHp: c.maxHp };
  });
  return { hero: nextHero, pets: nextPets };
}

function defaultSave(): GameSave {
  return {
    version: SAVE_VERSION,
    screen: "title",
    panel: null,
    locationId: "village",
    hero: null,
    gold: 50,
    inventory: [
      { itemId: "potion", qty: 3 },
      { itemId: "ether", qty: 2 },
    ],
    pets: [],
    flags: {},
    exploreCount: {},
    hunts: {},
    quests: {},
    dialogue: null,
    battle: null,
    toast: null,
  };
}

interface GameApi extends GameSave {
  hydrated: boolean;
  slotsTick: number;
  setHydrated: () => void;
  setPanel: (panel: Panel) => void;
  setToast: (toast: string | null) => void;
  setBattleMenu: (menu: BattleState["menu"]) => void;
  newGame: () => void;
  createHero: (name: string, classId: ClassId) => void;
  startDialogue: (id: string) => void;
  advanceDialogue: () => void;
  travel: (locationId: string) => void;
  explore: () => void;
  inspectLake: () => void;
  talkElder: () => void;
  restInn: () => void;
  buy: (itemId: string) => void;
  sell: (itemId: string) => void;
  useItem: (itemId: string) => void;
  equip: (itemId: string) => void;
  smithUpgrade: (slot: "weapon" | "armor") => void;
  setActivePet: (petId: string) => void;
  releasePet: (petId: string) => void;
  renamePet: (petId: string, name: string) => void;
  chooseBattle: (pending: PendingAction) => void;
  pickTarget: (targetId: string) => void;
  battleDefend: () => void;
  cancelBattleMenu: () => void;
  finishBattle: () => void;
  continueAfterDefeat: () => void;
  runAutos: () => void;
  acceptQuest: (questId: string) => void;
  turnInQuest: (questId: string) => void;
  forgeLegend: () => void;
  continueGame: () => void;
  goTitle: () => void;
  saveToSlot: (index: number) => void;
  loadFromSlot: (index: number) => void;
  enterNest: () => void;
}

function startDlg(id: string): Pick<GameSave, "screen" | "dialogue" | "panel"> {
  return { screen: "dialogue", dialogue: { id, index: 0 }, panel: null };
}

function startInline(
  id: string,
  lines: DialogueLine[],
  effects?: StoryEffect[],
): Pick<GameSave, "screen" | "dialogue" | "panel"> {
  return { screen: "dialogue", dialogue: { id, index: 0, lines, effects }, panel: null };
}

function snapshotPatch(data: GameSave, toast: string): Partial<GameApi> {
  const battle = sanitizeBattle(data.battle);
  let screen: Screen = data.screen;
  if (!data.hero) screen = "title";
  else if (screen === "title" || screen === "create") screen = "world";
  else if (screen === "battle" && !battle) screen = "world";
  else if (screen === "dialogue") {
    const d = data.dialogue;
    const ok = Boolean(d && ((d.lines && d.lines.length) || DIALOGUES[d.id]));
    if (!ok) screen = "world";
  }
  return {
    version: SAVE_VERSION,
    screen,
    panel: null,
    locationId: data.locationId || "village",
    hero: data.hero,
    gold: data.gold ?? 0,
    inventory: data.inventory ?? [],
    pets: data.pets ?? [],
    flags: {
      ...(data.flags ?? {}),
      ...(data.hunts?.altar?.nestFound ? { dragonNestFound: true } : {}),
    },
    exploreCount: data.exploreCount ?? {},
    hunts: data.hunts ?? {},
    quests: data.quests ?? {},
    dialogue: screen === "dialogue" ? data.dialogue : null,
    battle: screen === "battle" ? battle : null,
    toast,
    hydrated: true,
  };
}

function sanitizeBattle(battle: BattleState | null | undefined): BattleState | null {
  if (!battle?.combatants?.length) return null;
  const combatants = battle.combatants.map((c) => ({
    ...c,
    name: c.name || "？",
    portrait: c.portrait || "/art/slime.jpg",
    side: c.side === "enemy" ? ("enemy" as const) : ("ally" as const),
    kind: c.kind === "pet" || c.kind === "monster" ? c.kind : ("hero" as const),
    skills: Array.isArray(c.skills) ? c.skills : [],
    hp: Number(c.hp) || 0,
    maxHp: Math.max(1, Number(c.maxHp) || 1),
    mp: Number(c.mp) || 0,
    maxMp: Math.max(0, Number(c.maxMp) || 0),
    atk: Number(c.atk) || 1,
    mag: Number(c.mag) || 0,
    def: Number(c.def) || 0,
    spd: Number(c.spd) || 1,
    status: {
      stun: Number(c.status?.stun) || 0,
      poison: Number(c.status?.poison) || 0,
      atkUp: Number(c.status?.atkUp) || 0,
      defUp: Number(c.status?.defUp) || 0,
      spdDown: Number(c.status?.spdDown) || 0,
      evade: Number(c.status?.evade) || 0,
      tameBoost: Number(c.status?.tameBoost) || 0,
      defending: Boolean(c.status?.defending),
    },
  }));
  return {
    ...battle,
    combatants,
    order: Array.isArray(battle.order) ? battle.order : [],
    log: Array.isArray(battle.log) ? battle.log : [],
    menu: battle.menu ?? "main",
    pending: battle.pending ?? null,
    phase: battle.phase === "victory" || battle.phase === "defeat" || battle.phase === "resolve" ? battle.phase : "input",
    turnIndex: Number(battle.turnIndex) || 0,
    round: Number(battle.round) || 1,
    lootGold: Number(battle.lootGold) || 0,
    lootXp: Number(battle.lootXp) || 0,
    lootItems: Array.isArray(battle.lootItems) ? battle.lootItems : [],
    worldLevel: Number(battle.worldLevel) || 1,
    fx: null,
  };
}

function remember(s: GameSave) {
  try {
    if (s.hero) writeResume(s, true);
  } catch {
    /* quota / private mode */
  }
}

function cloneBattle(battle: BattleState): BattleState {
  try {
    return structuredClone(battle);
  } catch {
    return JSON.parse(JSON.stringify(battle)) as BattleState;
  }
}

function applyEffects(state: GameSave, id: string, effects?: StoryEffect[]): Partial<GameSave> {
  const list = effects ?? DIALOGUES[id]?.effects;
  if (!list?.length) return {};
  const patch: Partial<GameSave> = {};
  let flags = { ...state.flags };
  let inventory = state.inventory;
  let toast = state.toast;
  for (const fx of list) {
    if (fx.type === "flag") {
      flags = { ...flags, [fx.flag]: true };
      const notes = shopNotesOnFlag(state.hero?.level ?? 1, fx.flag);
      if (notes[0]) toast = notes[0];
      if (
        !hasCrystals(state.flags) &&
        hasCrystals(flags) &&
        (state.hero?.level ?? 1) >= 40
      ) {
        toast = toast ? `${toast} 公佈欄出現了新的委託。` : "公佈欄出現了新的委託。";
      }
    }
    if (fx.type === "item") {
      inventory = addItem(inventory, fx.itemId, fx.qty ?? 1);
      toast = `獲得 ${ITEMS[fx.itemId]?.name ?? fx.itemId}`;
    }
    if (fx.type === "ending") {
      flags = { ...flags, dragonDefeated: true };
      patch.screen = "ending";
    }
    if (fx.type === "battle") {
      patch.flags = flags;
      patch.inventory = inventory;
      patch.toast = toast;
      return { ...patch, ...beginBattle(state, fx.encounter, [fx.encounter], flags) };
    }
  }
  patch.flags = flags;
  patch.inventory = inventory;
  patch.toast = toast;
  return patch;
}

function beginBattle(
  state: GameSave,
  encounterId: string,
  enemyIds: string[],
  flags = state.flags,
): Partial<GameSave> {
  if (!state.hero) return {};
  const pet = state.pets.find((p) => p.active && p.hp > 0);
  const battle = createBattle(state.locationId, encounterId, enemyIds, state.hero, pet);
  return {
    screen: "battle",
    panel: null,
    battle,
    flags,
    dialogue: null,
  };
}

export const useGame = create<GameApi>()(
  persist(
    (set, get) => ({
      ...defaultSave(),
      hydrated: false,
      slotsTick: 0,
      setHydrated: () => set({ hydrated: true }),
      setPanel: (panel) => set({ panel, toast: null }),
      setToast: (toast) => set({ toast }),
      setBattleMenu: (menu) => {
        const battle = get().battle;
        if (!battle) return;
        set({ battle: { ...battle, menu, pending: menu === "main" ? null : battle.pending } });
      },
      newGame: () => set({ ...defaultSave(), hydrated: true, screen: "create", panel: null, toast: null }),
      createHero: (name, classId) => {
        const hero = freshHero(name, classId);
        set({
          hero,
          screen: "dialogue",
          dialogue: { id: "intro", index: 0 },
          locationId: "village",
          panel: null,
          gold: 50,
          inventory: [
            { itemId: "potion", qty: 3 },
            { itemId: "ether", qty: 2 },
            { itemId: STARTER_WEAPON[classId], qty: 1 },
            { itemId: "cloth", qty: 1 },
          ],
          pets: [],
          flags: {},
          exploreCount: {},
          hunts: {},
          quests: {},
          battle: null,
          toast: null,
          hydrated: true,
        });
        remember(get());
      },
      startDialogue: (id) => set(startDlg(id)),
      advanceDialogue: () => {
        const s = get();
        if (!s.dialogue) return;
        const def = DIALOGUES[s.dialogue.id];
        const lines = s.dialogue.lines ?? def?.lines;
        if (!lines?.length) {
          set({ screen: "world", dialogue: null });
          remember(get());
          return;
        }
        if (s.dialogue.index + 1 < lines.length) {
          set({ dialogue: { ...s.dialogue, index: s.dialogue.index + 1 } });
          return;
        }
        const patch = applyEffects(s, s.dialogue.id, s.dialogue.effects);
        if (patch.screen === "battle" || patch.screen === "ending") {
          set({ ...patch, dialogue: patch.screen === "battle" ? null : s.dialogue });
          remember(get());
          return;
        }
        set({
          screen: "world",
          dialogue: null,
          flags: patch.flags ?? s.flags,
          inventory: patch.inventory ?? s.inventory,
          toast: patch.toast ?? null,
        });
        remember(get());
      },
      travel: (locationId) => {
        const s = get();
        const loc = LOCATIONS[locationId];
        if (!loc) return;
        if (loc.lockedUntil === "crystals" && !hasCrystals(s.flags)) {
          set(startDlg("altar_locked"));
          return;
        }
        const next: Partial<GameSave> = { locationId, panel: null, screen: "world" };
        if (locationId === "forest" && !s.flags.forestIntro) {
          set({ ...next, ...startDlg("forest_intro") });
          remember(get());
          return;
        }
        if (locationId === "cave" && !s.flags.caveIntro) {
          set({ ...next, ...startDlg("cave_intro") });
          remember(get());
          return;
        }
        if (locationId === "shrine" && !s.flags.shrineIntro) {
          set({ ...next, ...startDlg("shrine_intro") });
          remember(get());
          return;
        }
        if (locationId === "lake" && !s.flags.lakeIntro) {
          set({ ...next, ...startDlg("lake_intro") });
          remember(get());
          return;
        }
        if (locationId === "altar") {
          if (s.flags.dragonDefeated) {
            set({ ...next, ...startDlg("ending") });
            remember(get());
            return;
          }
          if (!s.flags.altarIntro) {
            set({ ...next, ...startDlg("altar_intro") });
            remember(get());
            return;
          }
        }
        set(next);
        remember(get());
      },
      explore: () => {
        const s = get();
        if (!s.hero) return;
        const loc = s.locationId;
        const count = (s.exploreCount[loc] ?? 0) + 1;
        const exploreCount = { ...s.exploreCount, [loc]: count };
        let hunts = { ...(s.hunts ?? {}) };

        const huntDef = AREA_HUNTS[loc];
        if (huntDef && !s.flags[huntDef.crystalFlag]) {
          const prev = hunts[loc] ?? freshHunt();
          const { hunt, event } = resolveHuntExplore(prev, count);
          hunts = { ...hunts, [loc]: hunt };
          if (event.type === "clue") {
            const n = event.index + 1;
            const text = huntDef.clues[event.index] ?? "地上留下無法辨認的痕跡。";
            set({
              exploreCount,
              hunts,
              toast: `發現線索 ${n}/${CLUE_NEED}`,
              ...startInline(`clue:${loc}:${event.index}`, [
                { speaker: "旁白", text: `線索 ${n}／${CLUE_NEED}` },
                { speaker: "旁白", text },
              ]),
            });
            remember(get());
            return;
          }
          if (event.type === "nest") {
            const flags =
              loc === "altar" ? { ...s.flags, dragonNestFound: true } : s.flags;
            let toast = `找到${huntDef.bossName}的巢穴了。`;
            if (legendQuestAvailable(s.hero.level, flags)) {
              toast = `${toast} 公佈欄出現了新的委託。`;
            }
            set({
              exploreCount,
              hunts,
              flags,
              toast,
              ...startInline(`nest:${loc}`, [{ speaker: "旁白", text: huntDef.nestFoundText }]),
            });
            remember(get());
            return;
          }
        }

        const table = ENCOUNTERS[loc];
        if (!table) {
          set({ exploreCount, hunts, toast: "這裡暫時平靜。" });
          return;
        }
        const row = pickWeighted(table);
        set({ exploreCount, hunts, ...beginBattle(s, loc, row.enemies) });
        remember(get());
      },
      inspectLake: () => {
        const s = get();
        if (!s.hero) return;
        const atAltar = s.locationId === "altar";
        const atLake = s.locationId === "lake";
        if (!atAltar && !atLake) return;
        const q = s.quests?.lake_bough;
        if (!q || q.status === "done") {
          set({ toast: atLake ? "湖心只剩漿漿。" : "先到公佈欄接下長老的委託。" });
          return;
        }
        if (s.flags.tookBough || countItem(s.inventory, "holy_bough") > 0) {
          set({ toast: "湖心只剩漿漿。靈枝已經在你手上。" });
          return;
        }
        if (atAltar) {
          if (!s.flags.lakeIntro) {
            set({ locationId: "lake", ...startDlg("lake_intro") });
            return;
          }
          set({ locationId: "lake", screen: "world", panel: null });
          return;
        }
        set(startDlg("lake_bough_found"));
      },
      enterNest: () => {
        const s = get();
        const def = AREA_HUNTS[s.locationId];
        const hunt = s.hunts?.[s.locationId];
        if (!def || !hunt?.nestFound || hunt.bossDefeated) return;
        set(
          startInline(`nest-enter:${s.locationId}`, def.nestEnter, [
            { type: "battle", encounter: def.bossId },
          ]),
        );
      },
      talkElder: () => {
        const s = get();
        if (s.flags.canForgeLegend && !s.flags.legendForged) {
          set(startDlg("elder_bough"));
          return;
        }
        if (hasCrystals(s.flags) && !s.flags.altarUnlocked) {
          set(startDlg("elder_ready"));
          return;
        }
        set(startDlg("elder_hub"));
      },
      restInn: () => {
        const s = get();
        if (!s.hero) return;
        if (s.gold < 15) {
          set({ toast: "金幣不足。住宿需要 15 金。" });
          return;
        }
        const stats = deriveHeroStats(s.hero);
        set({
          gold: s.gold - 15,
          hero: { ...s.hero, hp: stats.hp, mp: stats.mp },
          pets: s.pets.map((p) => {
            const st = derivePetStats(p);
            return { ...p, hp: st.hp, maxHp: st.hp };
          }),
          toast: "一夜無夢。生命與魔力已恢復。",
          panel: null,
        });
      },
      buy: (itemId) => {
        const s = get();
        const item = ITEMS[itemId];
        if (!item || !SHOP_ITEMS.includes(itemId)) return;
        if (!s.hero || !isShopUnlocked(itemId, s.hero.level, s.flags)) {
          set({ toast: "這件貨還沒進店。" });
          return;
        }
        if (s.gold < item.price) {
          set({ toast: "金幣不足。" });
          return;
        }
        set({
          gold: s.gold - item.price,
          inventory: addItem(s.inventory, itemId, 1),
          toast: `買下 ${item.name}`,
        });
      },
      sell: (itemId) => {
        const s = get();
        const item = ITEMS[itemId];
        if (!item || item.kind === "key" || item.sell <= 0) return;
        if (s.hero?.weaponId === itemId || s.hero?.armorId === itemId) {
          set({ toast: "已裝備的物品無法出售。" });
          return;
        }
        const inv = takeItem(s.inventory, itemId, 1);
        if (!inv) return;
        set({ gold: s.gold + item.sell, inventory: inv, toast: `售出 ${item.name}` });
      },
      useItem: (itemId) => {
        const s = get();
        const item = ITEMS[itemId];
        if (!item || !s.hero || item.kind !== "consumable") return;
        if (s.screen === "battle") return;
        const inv = takeItem(s.inventory, itemId, 1);
        if (!inv) return;
        const hero = { ...s.hero };
        const stats = deriveHeroStats(hero);
        if (item.healHp) hero.hp = Math.min(stats.hp, hero.hp + item.healHp);
        if (item.healMp) hero.mp = Math.min(stats.mp, hero.mp + item.healMp);
        set({ hero, inventory: inv, toast: `使用了 ${item.name}` });
      },
      equip: (itemId) => {
        const s = get();
        const item = ITEMS[itemId];
        if (!s.hero || !item || (item.kind !== "weapon" && item.kind !== "armor")) return;
        if (item.weaponType && item.weaponType !== CLASSES[s.hero.classId].weaponType) {
          set({ toast: "這個武器不適合你的職業。" });
          return;
        }
        const hero = { ...s.hero };
        if (item.slot === "weapon") hero.weaponId = itemId;
        if (item.slot === "armor") hero.armorId = itemId;
        const stats = deriveHeroStats(hero);
        hero.hp = Math.min(stats.hp, hero.hp);
        hero.mp = Math.min(stats.mp, hero.mp);
        set({ hero, toast: `裝備了 ${item.name}`, panel: "inventory" });
      },
      smithUpgrade: (slot) => {
        const s = get();
        if (!s.hero) return;
        const plus = slot === "weapon" ? s.hero.weaponPlus : s.hero.armorPlus;
        if (plus >= 5) {
          set({ toast: "已強化至上限。" });
          return;
        }
        const cost = 40 * (plus + 1);
        if (s.gold < cost) {
          set({ toast: `強化需要 ${cost} 金。` });
          return;
        }
        const hero = { ...s.hero };
        if (slot === "weapon") hero.weaponPlus += 1;
        else hero.armorPlus += 1;
        set({
          hero,
          gold: s.gold - cost,
          toast: slot === "weapon" ? `武器強化至 +${hero.weaponPlus}` : `防具強化至 +${hero.armorPlus}`,
        });
      },
      setActivePet: (petId) => {
        set({
          pets: get().pets.map((p) => ({ ...p, active: p.id === petId })),
          toast: "出戰同伴已更換。",
          panel: "party",
        });
      },
      releasePet: (petId) => {
        const pets = get().pets.filter((p) => p.id !== petId);
        if (pets.length && !pets.some((p) => p.active)) pets[0].active = true;
        set({ pets, toast: "同伴已回到霧中。", panel: "party" });
      },
      renamePet: (petId, name) => {
        set({
          pets: get().pets.map((p) => (p.id === petId ? { ...p, name: name.trim() || p.name } : p)),
        });
      },
      chooseBattle: (pending) => {
        const s = get();
        if (!s.battle || s.battle.phase !== "input") return;
        const actor = currentActor(s.battle);
        if (!actor || actor.kind !== "hero") return;
        const skill = pending.type === "skill" ? SKILLS[pending.skillId] : undefined;
        if (pending.type === "skill" && !skill) return;
        if (pending.type === "skill" && (skill?.learnLevel ?? 1) > (s.hero?.level ?? 1)) return;
        const need = alliesNeedTarget(pending, skill);
        if (need === "none") {
          const battle = cloneBattle(s.battle);
          const a = currentActor(battle);
          if (!a) return;
          if (pending.type === "skill" && skill) performSkill(battle, a, skill, a);
          set({ battle: endActorTurn(battle) });
          return;
        }
        const pool = s.battle.combatants.filter(
          (c) => c.hp > 0 && c.side === (need === "enemy" ? "enemy" : "ally"),
        );
        if (pool.length === 1) {
          const battle = cloneBattle(s.battle);
          battle.pending = pending;
          applyPending(battle, pool[0].id, s);
          set({ battle });
          return;
        }
        set({ battle: { ...s.battle, pending, menu: "target" } });
      },
      pickTarget: (targetId) => {
        const s = get();
        if (!s.battle || !s.battle.pending) return;
        const battle = cloneBattle(s.battle);
        applyPending(battle, targetId, s);
        set({ battle });
      },
      battleDefend: () => {
        const s = get();
        if (!s.battle) return;
        const battle = cloneBattle(s.battle);
        const actor = currentActor(battle);
        if (!actor || actor.kind !== "hero") return;
        performDefend(battle, actor);
        set({ battle: endActorTurn(battle) });
      },
      cancelBattleMenu: () => {
        const s = get();
        if (!s.battle) return;
        set({ battle: { ...s.battle, menu: "main", pending: null } });
      },
      finishBattle: () => {
        const s = get();
        if (!s.battle || !s.hero) return;
        const battle = s.battle;
        let { hero, pets } = writeBackFromBattle(s.hero, s.pets, battle);
        let inventory = s.inventory;
        let gold = s.gold;
        let flags = { ...s.flags };
        let quests = { ...(s.quests ?? {}) };
        let hunts = { ...(s.hunts ?? {}) };
        let toast: string | null = null;
        let dialogue = s.dialogue;
        let screen: Screen = "world";

        if (battle.phase === "victory") {
          const fallenIds = battle.combatants
            .filter((c) => c.side === "enemy" && c.monsterId)
            .map((c) => c.monsterId as string);
          const hunt = applyQuestTargets(quests, "hunt", fallenIds);
          quests = hunt.quests;
          if (battle.tamed) {
            const tame = applyQuestTargets(quests, "tame", [battle.tamed.monsterId]);
            quests = tame.quests;
            hunt.notes.push(...tame.notes);
          }
          if (hunt.notes.length) toast = hunt.notes[0];

          if (battle.tamed) {
            const m = MONSTERS[battle.tamed.monsterId];
            const stats = derivePetStats({
              id: "tmp",
              monsterId: m.id,
              name: m.name,
              level: Math.max(1, hero.level),
              hp: 1,
              maxHp: 1,
              active: false,
            });
            const pet: PetState = {
              id: uid("pet"),
              monsterId: m.id,
              name: m.name,
              level: Math.max(1, hero.level),
              hp: stats.hp,
              maxHp: stats.hp,
              active: pets.length === 0,
            };
            if (pets.length >= PET_CAP) {
              toast = `${m.name} 想加入，但隊伍已滿。請先在隊伍中釋放一位同伴。`;
            } else {
              pets = [...pets, pet];
              toast = `${m.name} 成為了同伴。`;
            }
          } else {
            gold += battle.lootGold;
            for (const it of battle.lootItems) inventory = addItem(inventory, it.itemId, it.qty);
            const gained = grantXp(hero, battle.lootXp);
            hero = gained.hero;
            const shopNotes = shopUnlockNotes(s.hero.level, hero.level, flags);
            const extra =
              legendQuestAvailable(hero.level, flags) && !legendQuestAvailable(s.hero.level, flags)
                ? ["公佈欄出現了新的委託。"]
                : [];
            toast =
              [...gained.notes, ...shopNotes, ...extra][0] ??
              `獲得 ${battle.lootXp} 經驗、${battle.lootGold} 金`;
            pets = pets.map((p) => {
              const nextLv = Math.min(LEVEL_CAP, Math.max(p.level, hero.level));
              const st = derivePetStats({ ...p, level: nextLv });
              return { ...p, level: nextLv, maxHp: st.hp, hp: Math.min(st.hp, p.hp + 6) };
            });
          }
          if (hunt.notes.length) {
            toast = toast ? `${toast} ${hunt.notes[0]}` : hunt.notes[0];
          }

          const area = huntByBoss(battle.encounterId);
          if (area) {
            hunts = {
              ...hunts,
              [area.locationId]: {
                ...(hunts[area.locationId] ?? freshHunt()),
                nestFound: true,
                bossDefeated: true,
                clues: CLUE_NEED,
              },
            };
            if (battle.encounterId === "darkmage") flags = { ...flags, shrineBoss: true };
            if (area.bossId === "dragon" || battle.encounterId === "dragon") {
              flags = { ...flags, dragonDefeated: true, dragonNestFound: true };
              set({
                hero,
                pets,
                inventory,
                gold,
                flags,
                quests,
                hunts,
                battle: null,
                toast,
                ...startDlg("ending"),
              });
              remember(get());
              return;
            }
            set({
              hero,
              pets,
              inventory,
              gold,
              flags,
              quests,
              hunts,
              battle: null,
              toast,
              ...startDlg(area.crystalDialogue ?? "forest_crystal"),
            });
            remember(get());
            return;
          }
        }

        set({
          hero,
          pets,
          inventory,
          gold,
          flags,
          quests,
          hunts,
          battle: null,
          toast,
          dialogue,
          screen,
          panel: null,
        });
        remember(get());
      },
      continueAfterDefeat: () => {
        const s = get();
        if (!s.hero) return;
        const stats = deriveHeroStats(s.hero);
        set({
          screen: "world",
          locationId: "village",
          panel: null,
          battle: null,
          gold: Math.floor(s.gold * 0.7),
          hero: { ...s.hero, hp: Math.max(1, Math.floor(stats.hp * 0.5)), mp: Math.floor(stats.mp * 0.5) },
          toast: "村民把你抬回旅店。失去了部分金幣。",
        });
      },
      runAutos: () => {
        const s = get();
        if (!s.battle) return;
        if (s.battle.phase !== "input") return;
        const actor = currentActor(s.battle);
        if (!actor || actor.kind === "hero") return;
        const battle = cloneBattle(s.battle);
        set({ battle: runAutoTurn(battle) });
      },
      acceptQuest: (questId) => {
        const s = get();
        const def = QUESTS[questId];
        if (!def) return;
        if (s.hero && !isQuestListed(def, s.hero.level, s.flags)) {
          set({ toast: "這張委託還沒出現。" });
          return;
        }
        if (s.quests?.[questId]) {
          set({ toast: "這張委託你已經接過了。" });
          return;
        }
        const log = s.quests ?? {};
        const active = Object.values(log).filter((q) => q.status !== "done").length;
        if (questId !== "lake_bough" && active >= ACTIVE_QUEST_CAP) {
          set({ toast: `同時最多接 ${ACTIVE_QUEST_CAP} 件委託。先去回報手上的。` });
          return;
        }
        const entry: QuestLogEntry = { id: questId, status: "accepted", progress: 0 };
        const ready = isQuestReady(def, entry, s.inventory, s.pets);
        const flags = questId === "lake_bough" ? { ...s.flags, lakeUnlocked: true } : s.flags;
        set({
          flags,
          quests: {
            ...log,
            [questId]: { ...entry, status: ready ? "ready" : "accepted", progress: ready ? def.count : 0 },
          },
          toast:
            questId === "lake_bough"
              ? "接下「清輝湖的樹枝」。到暮光祭壇走向清輝湖。"
              : ready
                ? `接下「${def.title}」。條件已滿足，可以回報。`
                : `接下「${def.title}」。`,
        });
      },
      turnInQuest: (questId) => {
        const s = get();
        const def = QUESTS[questId];
        const entry = s.quests?.[questId];
        if (!def || !entry || entry.status === "done") return;
        if (!isQuestReady(def, entry, s.inventory, s.pets)) {
          set({ toast: "還沒達成條件。" });
          return;
        }
        let inventory = s.inventory;
        const consume = def.kind === "deliver" && def.consumeOnTurnIn !== false;
        if (consume) {
          const taken = takeItem(inventory, def.targetId, def.count);
          if (!taken) {
            set({ toast: "繳交的物品不足。" });
            return;
          }
          inventory = taken;
        }
        const patch = {
          inventory,
          gold: s.gold + def.reward,
          quests: {
            ...(s.quests ?? {}),
            [questId]: { ...entry, status: "done" as const, progress: def.count },
          },
          toast: `回報「${def.title}」，獲得 ${def.reward} 金。`,
        };
        if (questId === "lake_bough") {
          set({ ...patch, ...startDlg("elder_bough") });
          remember(get());
          return;
        }
        set(patch);
      },
      forgeLegend: () => {
        const s = get();
        if (!s.hero) return;
        if (s.flags.legendForged) {
          set({ toast: "傳說武器已經鑄成。" });
          return;
        }
        if (!canForgeLegend(s.hero, s.flags, s.inventory)) {
          set({ toast: "需要 40 級、找到龍巢、三枚霧晶與清輝靈枝。" });
          return;
        }
        let inventory = s.inventory;
        for (const id of ["crystal_forest", "crystal_cave", "crystal_shrine", "holy_bough"]) {
          const next = takeItem(inventory, id, 1);
          if (!next) {
            set({ toast: "材料不足。" });
            return;
          }
          inventory = next;
        }
        const weaponId = LEGEND_WEAPONS[s.hero.classId];
        inventory = addItem(inventory, weaponId, 1);
        const hero = { ...s.hero, weaponId };
        const stats = deriveHeroStats(hero);
        hero.hp = Math.min(stats.hp, hero.hp);
        hero.mp = Math.min(stats.mp, hero.mp);
        set({
          hero,
          inventory,
          flags: { ...s.flags, legendForged: true },
          toast: `鑄成了${ITEMS[weaponId]?.name}。`,
          ...startDlg("legend_forged"),
        });
        remember(get());
      },
      continueGame: () => {
        const resume = readResume();
        const s = get();
        const file = resume?.data.hero ? resume.data : s.hero ? captureSave(s) : null;
        if (!file?.hero) {
          set({ toast: "沒有可繼續的冒險。", hydrated: true });
          return;
        }
        set(snapshotPatch(file, "已回到上次的進度。"));
      },
      goTitle: () => {
        const s = get();
        if (s.hero && s.screen !== "title" && s.screen !== "create") {
          remember(s);
        }
        set({ screen: "title", panel: null, toast: null, hydrated: true });
      },
      saveToSlot: (index) => {
        const s = get();
        const snap = s.hero ? captureSave(s) : readResume()?.data;
        if (!snap?.hero) {
          set({ toast: "還沒有冒險可以存。" });
          return;
        }
        writeSlot(index, snap);
        writeResume(snap, true);
        flushPendingWrites();
        set({
          slotsTick: s.slotsTick + 1,
          toast: `已寫入檔案 ${index + 1}。`,
        });
      },
      loadFromSlot: (index) => {
        const file = readSlot(index);
        if (!file?.data.hero) {
          set({ toast: "這個檔案是空的。" });
          return;
        }
        writeResume(file.data);
        set({
          ...snapshotPatch(file.data, `已讀取檔案 ${index + 1}。`),
          slotsTick: get().slotsTick + 1,
        });
      },
    }),
    {
      name: SAVE_KEY,
      version: SAVE_VERSION,
      skipHydration: true,
      migrate: (persisted) => {
        const s = persisted as GameSave;
        return {
          ...s,
          quests: s.quests ?? {},
          hunts: s.hunts ?? {},
          version: SAVE_VERSION,
        };
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameSave>;
        return {
          ...current,
          ...p,
          quests: p.quests ?? current.quests ?? {},
          hunts: p.hunts ?? current.hunts ?? {},
          hydrated: current.hydrated,
        };
      },
      partialize: (s) => ({
        version: s.version,
        screen: s.screen,
        panel: null as typeof s.panel,
        locationId: s.locationId,
        hero: s.hero,
        gold: s.gold,
        inventory: s.inventory,
        pets: s.pets,
        flags: s.flags,
        exploreCount: s.exploreCount,
        hunts: s.hunts,
        quests: s.quests,
        dialogue: s.dialogue,
        battle: slimBattle(s.battle),
        toast: null as string | null,
      }),
      storage: createJSONStorage(() => gamePersistStorage()),
    },
  ),
);

function applyPending(battle: BattleState, targetId: string, save: GameSave) {
  const actor = currentActor(battle);
  const pending = battle.pending;
  if (!actor || !pending) return;
  const target = battle.combatants.find((c) => c.id === targetId);
  if (!target) {
    battle.menu = "main";
    battle.pending = null;
    return;
  }
  if (pending.type === "attack") performAttack(battle, actor, target);
  if (pending.type === "skill") {
    const skill = SKILLS[pending.skillId];
    if (skill) performSkill(battle, actor, skill, target);
  }
  if (pending.type === "item") {
    const ok = performItem(battle, actor, pending.itemId, target);
    if (ok) {
      const inv = takeItem(save.inventory, pending.itemId, 1);
      if (inv) useGame.setState({ inventory: inv });
    }
  }
  if (pending.type === "tame") {
    const isRanger = save.hero?.classId === "ranger";
    performTame(battle, actor, target, Boolean(isRanger));
  }
  const next = endActorTurn(battle);
  Object.assign(battle, next);
}

export function heroPortrait(hero: HeroState | null): string {
  if (!hero) return "/art/warrior.jpg";
  return CLASSES[hero.classId]?.portrait ?? "/art/warrior.jpg";
}

export function livingOf(battle: BattleState, side: Combatant["side"]) {
  return battle.combatants.filter((c) => c.hp > 0 && c.side === side);
}
