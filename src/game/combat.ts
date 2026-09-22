import { CLASSES, ITEMS, MONSTERS, SKILLS, emptyStatus, enemyScaleLevel, isLegendWeapon, learnedClassSkills, petGrowth, scaleMonsterStats, scaleReward, scaledStats } from "./data";
import { pushFx, skillFxKind, strikeKind } from "./fx";
import type {
  BattleState,
  Combatant,
  HeroState,
  InventoryEntry,
  PetState,
  SkillDef,
  Stats,
  StatusMap,
  FxPop,
} from "./types";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function roll(min = 0, max = 1) {
  return min + Math.random() * (max - min);
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

export function deriveHeroStats(hero: HeroState): Stats {
  const cls = CLASSES[hero.classId] ?? CLASSES.warrior;
  const base = scaledStats(cls.base, cls.growth, hero.level);
  const weapon = hero.weaponId ? ITEMS[hero.weaponId] : undefined;
  const armor = hero.armorId ? ITEMS[hero.armorId] : undefined;
  const w = weapon?.stats ?? {};
  const a = armor?.stats ?? {};
  return {
    hp: base.hp + (w.hp ?? 0) + (a.hp ?? 0),
    mp: base.mp + (w.mp ?? 0) + (a.mp ?? 0),
    atk: base.atk + (w.atk ?? 0) + (a.atk ?? 0) + hero.weaponPlus * 2,
    mag: base.mag + (w.mag ?? 0) + (a.mag ?? 0),
    def: base.def + (w.def ?? 0) + (a.def ?? 0) + hero.armorPlus * 2,
    spd: base.spd + (w.spd ?? 0) + (a.spd ?? 0),
  };
}

export function derivePetStats(pet: PetState): Stats {
  const m = MONSTERS[pet.monsterId];
  if (!m) return { hp: 24, mp: 0, atk: 5, mag: 2, def: 3, spd: 5 };
  return scaledStats(m.stats, petGrowth(), pet.level);
}

function atkMul(s: StatusMap) {
  return (s.atkUp > 0 ? 1.4 : 1) * (s.defending ? 0.6 : 1);
}
function defMul(s: StatusMap) {
  return (s.defUp > 0 ? 1.35 : 1) * (s.defending ? 1.7 : 1);
}
function spdNow(c: Combatant) {
  return c.spd * (c.status.spdDown > 0 ? 0.6 : 1);
}

export function hitChance(attacker: Combatant, defender: Combatant): number {
  const evade = defender.status.evade > 0 ? 0.35 : 0;
  return clamp(0.9 + (spdNow(attacker) - spdNow(defender)) * 0.008 - evade, 0.35, 0.97);
}

export function calcDamage(
  attacker: Combatant,
  defender: Combatant,
  power: number,
  magic: boolean,
): { dmg: number; crit: boolean } {
  const off = (magic ? attacker.mag : attacker.atk) * atkMul(attacker.status);
  const def = defender.def * defMul(defender.status);
  const raw = off * power - def * 0.42;
  const variance = 0.88 + roll() * 0.24;
  const crit = Math.random() < 0.08 + spdNow(attacker) * 0.002;
  const dmg = Math.max(1, Math.floor(raw * variance * (crit ? 1.5 : 1)));
  return { dmg, crit };
}

export function healAmount(caster: Combatant, power: number): number {
  return Math.max(8, Math.floor(22 + caster.mag * power * 4));
}

function applyStatus(target: Combatant, skill: SkillDef) {
  if (!skill.status || !skill.statusTurns) return;
  target.status[skill.status] = Math.max(target.status[skill.status], skill.statusTurns);
}

function living(battle: BattleState, side?: Combatant["side"]): Combatant[] {
  return battle.combatants.filter((c) => c.hp > 0 && (!side || c.side === side));
}

export function rebuildOrder(battle: BattleState): string[] {
  return living(battle)
    .slice()
    .sort((a, b) => spdNow(b) - spdNow(a))
    .map((c) => c.id);
}

export function currentActor(battle: BattleState): Combatant | undefined {
  const id = battle.order[battle.turnIndex];
  return battle.combatants.find((c) => c.id === id);
}

function pushLog(battle: BattleState, line: string) {
  battle.log = [...battle.log.slice(-18), line];
}

function tickStatuses(actor: Combatant, battle: BattleState) {
  if (!actor.status) {
    actor.status = {
      stun: 0,
      poison: 0,
      atkUp: 0,
      defUp: 0,
      spdDown: 0,
      evade: 0,
      tameBoost: 0,
      defending: false,
    };
  }
  actor.status.defending = false;
  if (actor.status.poison > 0 && actor.hp > 0) {
    const tick = Math.max(2, Math.floor(actor.maxHp * 0.06));
    actor.hp = Math.max(0, actor.hp - tick);
    pushLog(battle, `${actor.name} 受到毒素侵蝕，損失 ${tick} 點生命。`);
    actor.status.poison -= 1;
  }
  (["stun", "atkUp", "defUp", "spdDown", "evade", "tameBoost"] as const).forEach((k) => {
    if (actor.status[k] > 0) actor.status[k] -= 1;
  });
}

export function makeHeroCombatant(hero: HeroState): Combatant {
  const s = deriveHeroStats(hero);
  const cls = CLASSES[hero.classId] ?? CLASSES.warrior;
  return {
    id: "hero",
    side: "ally",
    kind: "hero",
    name: hero.name,
    portrait: cls.portrait,
    hp: clamp(hero.hp, 0, s.hp),
    maxHp: s.hp,
    mp: clamp(hero.mp, 0, s.mp),
    maxMp: s.mp,
    atk: s.atk,
    mag: s.mag,
    def: s.def,
    spd: s.spd,
    skills: learnedClassSkills(hero.classId, hero.level),
    status: emptyStatus(),
    level: hero.level,
    legendStrike: isLegendWeapon(hero.weaponId),
  };
}

export function makePetCombatant(pet: PetState): Combatant | null {
  if (!pet.active || pet.hp <= 0) return null;
  const m = MONSTERS[pet.monsterId];
  if (!m) return null;
  const s = derivePetStats(pet);
  return {
    id: pet.id,
    side: "ally",
    kind: "pet",
    name: pet.name,
    portrait: m.portrait,
    hp: clamp(pet.hp, 0, s.hp),
    maxHp: s.hp,
    mp: s.mp,
    maxMp: s.mp,
    atk: s.atk,
    mag: s.mag,
    def: s.def,
    spd: s.spd,
    skills: m.skills,
    status: emptyStatus(),
    monsterId: pet.monsterId,
    level: pet.level,
  };
}

export function makeMonsterCombatant(monsterId: string, index: number, heroLevel = 1): Combatant {
  const m = MONSTERS[monsterId] ?? MONSTERS.slime;
  const level = enemyScaleLevel(m.id, heroLevel);
  const s = scaleMonsterStats(m.stats, level);
  return {
    id: `e-${monsterId}-${index}`,
    side: "enemy",
    kind: "monster",
    name: m.name,
    portrait: m.portrait,
    hp: s.hp,
    maxHp: s.hp,
    mp: s.mp,
    maxMp: s.mp,
    atk: s.atk,
    mag: s.mag,
    def: s.def,
    spd: s.spd,
    skills: m.skills,
    status: emptyStatus(),
    monsterId,
    canTame: m.canTame,
    tameRate: m.tameRate,
    isBoss: m.isBoss,
    level,
  };
}

export function createBattle(
  locationId: string,
  encounterId: string,
  enemyIds: string[],
  hero: HeroState,
  pet: PetState | undefined,
): BattleState {
  const combatants: Combatant[] = [makeHeroCombatant(hero)];
  const pc = pet ? makePetCombatant(pet) : null;
  if (pc) combatants.push(pc);
  enemyIds.forEach((id, i) => combatants.push(makeMonsterCombatant(id, i, hero.level)));
  const foes = combatants.filter((c) => c.side === "enemy");
  const lvLabel = foes.length
    ? foes.every((c) => c.level === foes[0].level)
      ? `敵方 Lv.${foes[0].level ?? hero.level}。`
      : "敵方出現。"
    : "";
  const battle: BattleState = {
    locationId,
    encounterId,
    combatants,
    order: [],
    turnIndex: 0,
    round: 1,
    log: [`戰鬥開始。${lvLabel}`],
    menu: "main",
    pending: null,
    phase: "input",
    lootGold: 0,
    lootXp: 0,
    lootItems: [],
    worldLevel: hero.level,
    fx: null,
  };
  battle.order = rebuildOrder(battle);
  battle.turnIndex = 0;
  return prepareTurn(battle);
}

function checkEnd(battle: BattleState): BattleState {
  const allies = living(battle, "ally");
  const enemies = living(battle, "enemy");
  const hero = battle.combatants.find((c) => c.kind === "hero");
  if (!hero || hero.hp <= 0) {
    battle.phase = "defeat";
    pushLog(battle, "你倒下了……");
    return battle;
  }
  if (enemies.length === 0) {
    battle.phase = "victory";
    if (!battle.tamed) {
      const fallen = battle.combatants.filter((c) => c.side === "enemy");
      let gold = 0;
      let xp = 0;
      const items: InventoryEntry[] = [];
      for (const f of fallen) {
        if (!f.monsterId) continue;
        const m = MONSTERS[f.monsterId];
        if (!m) continue;
        const lv = enemyScaleLevel(m.id, battle.worldLevel || 1);
        gold += scaleReward(m.gold, lv) + Math.floor(roll() * 4);
        xp += scaleReward(m.xp, lv);
        for (const d of m.drops) {
          if (Math.random() < d.chance) {
            const exist = items.find((i) => i.itemId === d.itemId);
            if (exist) exist.qty += 1;
            else items.push({ itemId: d.itemId, qty: 1 });
          }
        }
      }
      battle.lootGold = gold;
      battle.lootXp = xp;
      battle.lootItems = items;
      pushLog(battle, `勝利。獲得 ${xp} 經驗、${gold} 金幣。`);
    } else {
      pushLog(battle, `${battle.tamed.name} 被你馴服，加入了隊伍。`);
    }
    return battle;
  }
  if (allies.length === 0) {
    battle.phase = "defeat";
    return battle;
  }
  return battle;
}

export function prepareTurn(battle: BattleState): BattleState {
  if (battle.phase === "victory" || battle.phase === "defeat") return battle;
  if (battle.order.length === 0) {
    battle.order = rebuildOrder(battle);
    battle.turnIndex = 0;
    battle.round += 1;
  }
  let guard = 0;
  while (guard++ < 12) {
    if (battle.turnIndex >= battle.order.length) {
      battle.order = rebuildOrder(battle);
      battle.turnIndex = 0;
      battle.round += 1;
    }
    const actor = currentActor(battle);
    if (!actor || actor.hp <= 0) {
      battle.turnIndex += 1;
      continue;
    }
    tickStatuses(actor, battle);
    if (actor.hp <= 0) {
      pushLog(battle, `${actor.name} 倒下了。`);
      const ended = checkEnd(battle);
      if (ended.phase !== "input") return ended;
      battle.turnIndex += 1;
      continue;
    }
    if (actor.status.stun > 0) {
      pushLog(battle, `${actor.name} 還在暈眩，無法行動。`);
      battle.turnIndex += 1;
      continue;
    }
    battle.menu = "main";
    battle.pending = null;
    battle.phase = "input";
    return battle;
  }
  return battle;
}

function spendMp(actor: Combatant, skill: SkillDef): boolean {
  if (actor.mp < skill.mp) return false;
  actor.mp -= skill.mp;
  return true;
}

function defaultEnemyTarget(battle: BattleState, actor: Combatant): Combatant | undefined {
  const foes = living(battle, actor.side === "ally" ? "enemy" : "ally");
  if (foes.length === 0) return undefined;
  return foes.slice().sort((a, b) => a.hp - b.hp)[0];
}

function dealHits(
  battle: BattleState,
  actor: Combatant,
  target: Combatant,
  skill: SkillDef | null,
  magic: boolean,
  power: number,
  hits: number,
): FxPop[] {
  const pops: FxPop[] = [];
  for (let i = 0; i < hits; i++) {
    if (target.hp <= 0) break;
    const vsDragon = target.monsterId === "dragon";
    if (vsDragon && !actor.legendStrike) {
      if (Math.random() < 0.5) {
        pushLog(battle, `${actor.name} 的攻擊被迷霧結界偏折，沒有擊中。`);
        pops.push({ targetId: target.id, text: "偏折", miss: true });
        continue;
      }
    } else if (Math.random() > hitChance(actor, target)) {
      pushLog(battle, `${actor.name} 的攻擊被 ${target.name} 閃過。`);
      pops.push({ targetId: target.id, text: "未中", miss: true });
      continue;
    }
    const hit = calcDamage(actor, target, power, magic);
    let dmg = hit.dmg;
    let extra = hit.crit ? "暴擊！" : "";
    if (vsDragon && actor.legendStrike) {
      extra = `${extra}傳說武器驅散迷霧。`;
      if (Math.random() < 0.5) {
        dmg *= 2;
        extra = `${extra}結界被撕開，傷害加倍！`;
      }
    } else if (vsDragon) {
      dmg = Math.max(1, Math.floor(dmg / 3));
      extra = `${extra}結界削弱了傷害。`;
    }
    target.hp = Math.max(0, target.hp - dmg);
    const skillName = skill ? `使用${skill.name}，` : "";
    pushLog(battle, `${actor.name} ${skillName}對 ${target.name} 造成 ${dmg} 傷害。${extra}`);
    pops.push({ targetId: target.id, text: `-${dmg}`, crit: hit.crit });
    if (skill?.id === "drain" && dmg > 0) {
      const healed = Math.floor(dmg * 0.4);
      actor.hp = Math.min(actor.maxHp, actor.hp + healed);
      pushLog(battle, `${actor.name} 吸取了 ${healed} 點生命。`);
      pops.push({ targetId: actor.id, text: `+${healed}` });
    }
    if (target.hp <= 0) pushLog(battle, `${target.name} 倒下了。`);
  }
  if (skill) applyStatus(target, skill);
  return pops;
}

export function performAttack(battle: BattleState, actor: Combatant, target: Combatant) {
  const pops = dealHits(battle, actor, target, null, false, 1, 1);
  pushFx(battle, strikeKind(actor), actor, [target.id], pops);
}

export function performSkill(
  battle: BattleState,
  actor: Combatant,
  skill: SkillDef,
  target: Combatant | undefined,
) {
  if (!spendMp(actor, skill)) {
    pushLog(battle, `${actor.name} 魔力不足，無法施放 ${skill.name}。`);
    return;
  }
  const magic = skill.kind === "magic" || skill.kind === "aoe-magic";
  const kind = skillFxKind(skill, actor);
  if (skill.kind === "heal") {
    const dest =
      target && target.side === actor.side && target.hp > 0
        ? target
        : actor;
    const amt = healAmount(actor, skill.power || 0.5);
    dest.hp = Math.min(dest.maxHp, dest.hp + amt);
    pushLog(battle, `${actor.name} 施放 ${skill.name}，${dest.name} 恢復 ${amt} 點生命。`);
    pushFx(battle, "heal", actor, [dest.id], [{ targetId: dest.id, text: `+${amt}` }]);
    return;
  }
  if (skill.kind === "buff" || skill.kind === "utility") {
    applyStatus(actor, skill);
    pushLog(battle, `${actor.name} 施放 ${skill.name}。`);
    pushFx(battle, kind, actor, [actor.id], [{ targetId: actor.id, text: skill.name }]);
    return;
  }
  if (skill.kind === "aoe" || skill.kind === "aoe-magic") {
    const foes = living(battle, actor.side === "ally" ? "enemy" : "ally");
    pushLog(battle, `${actor.name} 施放 ${skill.name}！`);
    const pops = foes.flatMap((f) => dealHits(battle, actor, f, skill, magic, skill.power, 1));
    pushFx(battle, kind, actor, foes.map((f) => f.id), pops);
    return;
  }
  if (!target) {
    pushLog(battle, `${actor.name} 找不到目標。`);
    return;
  }
  const hits = skill.hits ?? 1;
  const pops = dealHits(battle, actor, target, skill, magic, skill.power, hits);
  pushFx(battle, kind, actor, [target.id], pops);
}

export function performItem(
  battle: BattleState,
  actor: Combatant,
  itemId: string,
  target: Combatant,
): boolean {
  const item = ITEMS[itemId];
  if (!item || item.kind !== "consumable") return false;
  if (item.healHp) {
    const amt = item.healHp;
    target.hp = Math.min(target.maxHp, target.hp + amt);
    pushLog(battle, `${actor.name} 使用 ${item.name}，${target.name} 恢復 ${amt} 點生命。`);
    pushFx(battle, "heal", actor, [target.id], [{ targetId: target.id, text: `+${amt}` }]);
  }
  if (item.healMp) {
    const amt = item.healMp;
    target.mp = Math.min(target.maxMp, target.mp + amt);
    pushLog(battle, `${actor.name} 使用 ${item.name}，${target.name} 恢復 ${amt} 點魔力。`);
  }
  if (item.curePoison) {
    target.status.poison = 0;
    pushLog(battle, `${item.name} 驅散了毒素。`);
  }
  if (item.tameBonus) {
    actor.status.tameBoost = Math.max(actor.status.tameBoost, 1);
    pushLog(battle, `${actor.name} 吹響馴獸笛，空氣裡多了一絲安撫。`);
  }
  return true;
}

export function performTame(
  battle: BattleState,
  actor: Combatant,
  target: Combatant,
  isRanger: boolean,
): boolean {
  if (!target.canTame || !target.monsterId) {
    pushLog(battle, `${target.name} 無法被馴服。`);
    return false;
  }
  const ratio = target.hp / target.maxHp;
  if (ratio > 0.5) {
    pushLog(battle, `${target.name} 還太清醒，馴服失敗。再削弱一些。`);
    return false;
  }
  const rate = target.tameRate ?? 0.3;
  const boost = actor.status.tameBoost > 0 ? 1.55 : 1;
  const ranger = isRanger ? 1.55 : 1;
  const chance = clamp(rate * (1.05 - ratio) * boost * ranger, 0.08, 0.88);
  if (Math.random() < chance) {
    battle.tamed = { monsterId: target.monsterId, name: target.name };
    target.hp = 0;
    pushLog(battle, `馴服成功！${target.name} 低下頭，願意跟隨你。`);
    pushFx(battle, "tame", actor, [target.id], [{ targetId: target.id, text: "馴服" }]);
    return true;
  }
  pushLog(battle, `${target.name} 掙扎著拒絕了。再試一次。`);
  pushFx(battle, "tame", actor, [target.id], [{ targetId: target.id, text: "失敗", miss: true }]);
  return false;
}

export function performDefend(battle: BattleState, actor: Combatant) {
  actor.status.defending = true;
  pushLog(battle, `${actor.name} 採取防禦。`);
  pushFx(battle, "defend", actor, [actor.id], [{ targetId: actor.id, text: "防禦" }]);
}

export function endActorTurn(battle: BattleState): BattleState {
  const ended = checkEnd(battle);
  if (ended.phase !== "input") return ended;
  battle.turnIndex += 1;
  return prepareTurn(battle);
}

export function chooseEnemyAction(
  battle: BattleState,
  actor: Combatant,
): { skillId?: string; target: Combatant } | null {
  const target = defaultEnemyTarget(battle, actor);
  if (!target) return null;
  const usable = (actor.skills ?? [])
    .map((id) => SKILLS[id])
    .filter((s) => s && actor.mp >= s.mp);
  if (actor.hp / actor.maxHp < 0.32) {
    const heal = usable.find((s) => s.kind === "heal");
    if (heal) return { skillId: heal.id, target: actor };
  }
  if (usable.length && Math.random() < 0.55) {
    const aoe = usable.find((s) => s.kind === "aoe" || s.kind === "aoe-magic");
    if (aoe && living(battle, "ally").length > 1 && Math.random() < 0.5) {
      return { skillId: aoe.id, target };
    }
    const pick = usable[Math.floor(Math.random() * usable.length)];
    return { skillId: pick.id, target };
  }
  return { target };
}

export function runAutoTurn(battle: BattleState): BattleState {
  const actor = currentActor(battle);
  if (!actor || battle.phase === "victory" || battle.phase === "defeat") return battle;
  if (actor.kind === "hero") return battle;
  const choice = chooseEnemyAction(battle, actor);
  if (!choice) return endActorTurn(battle);
  if (choice.skillId) {
    const skill = SKILLS[choice.skillId];
    if (skill) performSkill(battle, actor, skill, choice.target);
    else performAttack(battle, actor, choice.target);
  } else {
    performAttack(battle, actor, choice.target);
  }
  return endActorTurn(battle);
}

export function alliesNeedTarget(
  pending: BattleState["pending"],
  skill?: SkillDef,
): "enemy" | "ally" | "none" {
  if (!pending) return "none";
  if (pending.type === "attack" || pending.type === "tame") return "enemy";
  if (pending.type === "skill" && skill) {
    if (skill.target === "self" || skill.target === "allEnemies") return "none";
    if (skill.target === "ally") return "ally";
    return "enemy";
  }
  if (pending.type === "item") return "ally";
  return "none";
}
