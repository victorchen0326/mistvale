export type ClassId = "warrior" | "mage" | "ranger";

export type Screen =
  | "title"
  | "create"
  | "world"
  | "dialogue"
  | "battle"
  | "ending"
  | "defeat";

export type Panel =
  | null
  | "inventory"
  | "skills"
  | "party"
  | "shop"
  | "map"
  | "smith"
  | "board"
  | "system";

export type BattleMenu = "main" | "skills" | "items" | "target";

export interface Stats {
  hp: number;
  mp: number;
  atk: number;
  mag: number;
  def: number;
  spd: number;
}

export type SkillKind =
  | "damage"
  | "magic"
  | "heal"
  | "aoe"
  | "aoe-magic"
  | "buff"
  | "debuff"
  | "utility";

export type StatusKey =
  | "stun"
  | "poison"
  | "atkUp"
  | "defUp"
  | "spdDown"
  | "evade"
  | "tameBoost";

export interface SkillDef {
  id: string;
  name: string;
  desc: string;
  mp: number;
  kind: SkillKind;
  power: number;
  hits?: number;
  status?: StatusKey;
  statusTurns?: number;
  target: "enemy" | "allEnemies" | "self" | "ally";
  learnLevel?: number;
}

export interface ClassDef {
  id: ClassId;
  name: string;
  title: string;
  blurb: string;
  portrait: string;
  base: Stats;
  growth: Stats;
  skills: string[];
  weaponType: "sword" | "staff" | "bow";
}

export interface MonsterDef {
  id: string;
  name: string;
  portrait: string;
  blurb: string;
  stats: Stats;
  skills: string[];
  xp: number;
  gold: number;
  canTame: boolean;
  tameRate: number;
  drops: { itemId: string; chance: number }[];
  isBoss?: boolean;
  fixedLevel?: number;
}

export interface ItemDef {
  id: string;
  name: string;
  desc: string;
  kind: "consumable" | "weapon" | "armor" | "key";
  price: number;
  sell: number;
  healHp?: number;
  healMp?: number;
  curePoison?: boolean;
  tameBonus?: number;
  slot?: "weapon" | "armor";
  weaponType?: "sword" | "staff" | "bow";
  stats?: Partial<Stats>;
}

export interface LocationDef {
  id: string;
  name: string;
  blurb: string;
  scene: string;
  connected: string[];
  lockedUntil?: string;
}

export interface DialogueLine {
  speaker: string;
  portrait?: string;
  text: string;
}

export interface DialogueDef {
  id: string;
  lines: DialogueLine[];
  effects?: StoryEffect[];
}

export type StoryEffect =
  | { type: "flag"; flag: string }
  | { type: "item"; itemId: string; qty?: number }
  | { type: "battle"; encounter: string }
  | { type: "unlock"; locationId: string }
  | { type: "ending" };

export interface InventoryEntry {
  itemId: string;
  qty: number;
}

export type QuestKind = "hunt" | "tame" | "deliver" | "visit";
export type QuestStatus = "accepted" | "ready" | "done";

export interface QuestDef {
  id: string;
  title: string;
  poster: string;
  desc: string;
  hint: string;
  reward: number;
  kind: QuestKind;
  targetId: string;
  count: number;
  locationId?: string;
  requireLevel?: number;
  requireCrystals?: boolean;
  requireNest?: boolean;
  consumeOnTurnIn?: boolean;
}

export interface QuestLogEntry {
  id: string;
  status: QuestStatus;
  progress: number;
}

export interface PetState {
  id: string;
  monsterId: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  active: boolean;
}

export interface HeroState {
  name: string;
  classId: ClassId;
  level: number;
  xp: number;
  hp: number;
  mp: number;
  weaponId: string | null;
  armorId: string | null;
  weaponPlus: number;
  armorPlus: number;
}

export interface StatusMap {
  stun: number;
  poison: number;
  atkUp: number;
  defUp: number;
  spdDown: number;
  evade: number;
  tameBoost: number;
  defending: boolean;
}

export interface Combatant {
  id: string;
  side: "ally" | "enemy";
  kind: "hero" | "pet" | "monster";
  name: string;
  portrait: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  mag: number;
  def: number;
  spd: number;
  skills: string[];
  status: StatusMap;
  monsterId?: string;
  canTame?: boolean;
  tameRate?: number;
  isBoss?: boolean;
  level?: number;
  legendStrike?: boolean;
}

export type PendingAction =
  | { type: "attack" }
  | { type: "skill"; skillId: string }
  | { type: "item"; itemId: string }
  | { type: "tame" };

export type FxKind =
  | "slash"
  | "whirl"
  | "arrow"
  | "pierce"
  | "bite"
  | "claw"
  | "bash"
  | "goo"
  | "bolt"
  | "fire"
  | "ice"
  | "thunder"
  | "shadow"
  | "breath"
  | "howl"
  | "heal"
  | "buff"
  | "defend"
  | "tame"
  | "impact";

export interface FxPop {
  targetId: string;
  text: string;
  crit?: boolean;
  miss?: boolean;
}

export interface BattleFx {
  id: string;
  kind: FxKind;
  actorId: string;
  targetIds: string[];
  hit: boolean;
  crit?: boolean;
  pops: FxPop[];
}

export interface BattleState {
  locationId: string;
  encounterId: string;
  combatants: Combatant[];
  order: string[];
  turnIndex: number;
  round: number;
  log: string[];
  menu: BattleMenu;
  pending: PendingAction | null;
  phase: "input" | "resolve" | "victory" | "defeat";
  lootGold: number;
  lootXp: number;
  lootItems: InventoryEntry[];
  tamed?: { monsterId: string; name: string };
  worldLevel: number;
  fx?: BattleFx | null;
}

export interface DialogueState {
  id: string;
  index: number;
  lines?: DialogueLine[];
  effects?: StoryEffect[];
}

export interface RegionHunt {
  clueStartAt: number;
  nextEventAt: number;
  clues: number;
  nestFound: boolean;
  bossDefeated: boolean;
  nestDueAt: number | null;
}

export interface GameSave {
  version: number;
  screen: Screen;
  panel: Panel;
  locationId: string;
  hero: HeroState | null;
  gold: number;
  inventory: InventoryEntry[];
  pets: PetState[];
  flags: Record<string, boolean>;
  exploreCount: Record<string, number>;
  hunts: Record<string, RegionHunt>;
  quests: Record<string, QuestLogEntry>;
  dialogue: DialogueState | null;
  battle: BattleState | null;
  toast: string | null;
}
