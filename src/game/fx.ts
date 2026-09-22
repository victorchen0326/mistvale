import type { BattleFx, BattleState, Combatant, FxKind, FxPop, SkillDef } from "./types";

const SKILL_FX: Record<string, FxKind> = {
  heavy_slash: "slash",
  earth_split: "slash",
  peerless: "whirl",
  whirlwind: "whirl",
  shield_bash: "bash",
  bone_slash: "slash",
  stab: "slash",
  double_shot: "arrow",
  triple_shot: "arrow",
  poison_arrow: "arrow",
  pierce: "pierce",
  arrow_rain: "arrow",
  bite: "bite",
  tail: "claw",
  howl: "howl",
  roar: "howl",
  war_cry: "howl",
  rage: "buff",
  beast_heart: "buff",
  iron_wall: "buff",
  ward: "buff",
  smoke_step: "buff",
  tame_art: "tame",
  goo: "goo",
  fireball: "fire",
  meteor: "fire",
  frost: "ice",
  blizzard: "ice",
  thunder: "thunder",
  starfall: "thunder",
  mist_bolt: "bolt",
  shadow: "shadow",
  curse: "shadow",
  screech: "howl",
  drain: "shadow",
  breath: "breath",
  heal: "heal",
  soothe: "heal",
};

export function strikeKind(actor: Combatant): FxKind {
  const skills = actor.skills ?? [];
  if (skills.includes("double_shot") || skills.includes("pierce")) return "arrow";
  if (skills.includes("fireball") || skills.includes("mist_bolt") || skills.includes("shadow")) {
    return "bolt";
  }
  if (actor.monsterId === "wolf" || actor.monsterId === "mistfang") return "bite";
  if (actor.monsterId === "bat" || actor.monsterId === "dragon") return "claw";
  if (actor.monsterId === "slime") return "goo";
  if (actor.monsterId === "sprite") return "bolt";
  return "slash";
}

export function skillFxKind(skill: SkillDef | null | undefined, actor: Combatant): FxKind {
  if (skill && SKILL_FX[skill.id]) return SKILL_FX[skill.id];
  if (skill?.kind === "heal") return "heal";
  if (skill?.kind === "buff" || skill?.kind === "utility") return "buff";
  if (skill?.kind === "aoe" || skill?.kind === "aoe-magic") {
    return skill.kind === "aoe-magic" ? "breath" : "whirl";
  }
  if (skill?.kind === "magic") return "bolt";
  return strikeKind(actor);
}

export type PoseName = "slash" | "whirl" | "lunge" | "draw" | "cast" | "guard" | "howl" | "heal";

export function poseFor(kind: FxKind): PoseName {
  if (kind === "whirl") return "whirl";
  if (kind === "slash" || kind === "bash" || kind === "pierce") return "slash";
  if (kind === "bite" || kind === "claw") return "lunge";
  if (kind === "arrow") return "draw";
  if (kind === "defend") return "guard";
  if (kind === "howl") return "howl";
  if (kind === "heal" || kind === "buff" || kind === "tame") return "heal";
  return "cast";
}

export function isRangedKind(kind: FxKind) {
  return (
    kind === "arrow" ||
    kind === "pierce" ||
    kind === "bolt" ||
    kind === "fire" ||
    kind === "ice" ||
    kind === "shadow" ||
    kind === "thunder" ||
    kind === "goo"
  );
}

export function pushFx(
  battle: BattleState,
  kind: FxKind,
  actor: Combatant,
  targetIds: string[],
  pops: FxPop[],
) {
  const hit = pops.some((p) => !p.miss);
  const crit = pops.some((p) => p.crit);
  const fx: BattleFx = {
    id: `fx-${Math.random().toString(36).slice(2, 9)}`,
    kind,
    actorId: actor.id,
    targetIds: targetIds.length ? targetIds : [actor.id],
    hit,
    crit,
    pops,
  };
  battle.fx = fx;
}
