import type {
  ClassDef,
  ClassId,
  DialogueDef,
  DialogueLine,
  ItemDef,
  LocationDef,
  MonsterDef,
  QuestDef,
  QuestLogEntry,
  RegionHunt,
  SkillDef,
  Stats,
} from "./types";

export const SAVE_KEY = "mistvale-save-v1";
export const SAVE_VERSION = 3;
export const LEVEL_CAP = 50;
export const PET_CAP = 3;

export const SKILLS: Record<string, SkillDef> = {
  heavy_slash: {
    id: "heavy_slash",
    name: "重斬",
    desc: "蓄力一擊，造成高額物理傷害。",
    mp: 8,
    kind: "damage",
    power: 1.65,
    target: "enemy",
    learnLevel: 1,
  },
  shield_bash: {
    id: "shield_bash",
    name: "盾擊",
    desc: "以盾猛擊，造成傷害並暈眩一回合。",
    mp: 12,
    kind: "damage",
    power: 0.85,
    status: "stun",
    statusTurns: 1,
    target: "enemy",
    learnLevel: 5,
  },
  rage: {
    id: "rage",
    name: "狂怒",
    desc: "三回合內提升攻擊。",
    mp: 10,
    kind: "buff",
    power: 0,
    status: "atkUp",
    statusTurns: 3,
    target: "self",
    learnLevel: 10,
  },
  whirlwind: {
    id: "whirlwind",
    name: "旋風斬",
    desc: "旋轉揮砍，攻擊所有敵人。",
    mp: 16,
    kind: "aoe",
    power: 1.15,
    target: "allEnemies",
    learnLevel: 15,
  },
  iron_wall: {
    id: "iron_wall",
    name: "鐵壁",
    desc: "三回合內大幅提升防禦。",
    mp: 12,
    kind: "buff",
    power: 0,
    status: "defUp",
    statusTurns: 3,
    target: "self",
    learnLevel: 20,
  },
  earth_split: {
    id: "earth_split",
    name: "裂地斬",
    desc: "把力道砸進地面，對單體造成極高物理傷害。",
    mp: 20,
    kind: "damage",
    power: 2.15,
    target: "enemy",
    learnLevel: 25,
  },
  war_cry: {
    id: "war_cry",
    name: "戰吼",
    desc: "怒吼振奮自身，三回合攻擊上升。",
    mp: 16,
    kind: "buff",
    power: 0,
    status: "atkUp",
    statusTurns: 3,
    target: "self",
    learnLevel: 30,
  },
  peerless: {
    id: "peerless",
    name: "無雙",
    desc: "連斬全場，高額範圍物理傷害。",
    mp: 26,
    kind: "aoe",
    power: 1.45,
    target: "allEnemies",
    learnLevel: 40,
  },
  fireball: {
    id: "fireball",
    name: "火球",
    desc: "擲出熾熱火球。",
    mp: 10,
    kind: "magic",
    power: 1.8,
    target: "enemy",
    learnLevel: 1,
  },
  frost: {
    id: "frost",
    name: "冰封",
    desc: "凍結敵人，造成傷害並降低速度。",
    mp: 12,
    kind: "magic",
    power: 1.15,
    status: "spdDown",
    statusTurns: 2,
    target: "enemy",
    learnLevel: 5,
  },
  heal: {
    id: "heal",
    name: "治癒之光",
    desc: "恢復自己或寵物的生命。",
    mp: 14,
    kind: "heal",
    power: 0.55,
    target: "ally",
    learnLevel: 10,
  },
  thunder: {
    id: "thunder",
    name: "雷擊",
    desc: "降下強雷，高魔力傷害。",
    mp: 18,
    kind: "magic",
    power: 2.2,
    target: "enemy",
    learnLevel: 15,
  },
  ward: {
    id: "ward",
    name: "魔力護盾",
    desc: "凝成咒壁，三回合內提升防禦。",
    mp: 12,
    kind: "buff",
    power: 0,
    status: "defUp",
    statusTurns: 3,
    target: "self",
    learnLevel: 20,
  },
  meteor: {
    id: "meteor",
    name: "隕石",
    desc: "召來墜星，對單體造成極高魔力傷害。",
    mp: 24,
    kind: "magic",
    power: 2.5,
    target: "enemy",
    learnLevel: 25,
  },
  blizzard: {
    id: "blizzard",
    name: "暴風雪",
    desc: "冰霧覆蓋全場。",
    mp: 26,
    kind: "aoe-magic",
    power: 1.35,
    target: "allEnemies",
    learnLevel: 30,
  },
  starfall: {
    id: "starfall",
    name: "星落",
    desc: "月光碎成雨，全場高額魔力傷害。",
    mp: 32,
    kind: "aoe-magic",
    power: 1.7,
    target: "allEnemies",
    learnLevel: 40,
  },
  double_shot: {
    id: "double_shot",
    name: "連射",
    desc: "連續兩箭，每箭傷害較低。",
    mp: 8,
    kind: "damage",
    power: 0.75,
    hits: 2,
    target: "enemy",
    learnLevel: 1,
  },
  poison_arrow: {
    id: "poison_arrow",
    name: "毒箭",
    desc: "附毒一箭，三回合持續流失生命。",
    mp: 10,
    kind: "damage",
    power: 1.05,
    status: "poison",
    statusTurns: 3,
    target: "enemy",
    learnLevel: 5,
  },
  tame_art: {
    id: "tame_art",
    name: "馳獸術",
    desc: "本回合大幅提升下一次馳服機率。",
    mp: 6,
    kind: "utility",
    power: 0,
    status: "tameBoost",
    statusTurns: 2,
    target: "self",
    learnLevel: 10,
  },
  smoke_step: {
    id: "smoke_step",
    name: "煙霧步",
    desc: "隱入霧中，兩回合較易閃避。",
    mp: 12,
    kind: "buff",
    power: 0,
    status: "evade",
    statusTurns: 2,
    target: "self",
    learnLevel: 15,
  },
  triple_shot: {
    id: "triple_shot",
    name: "三連射",
    desc: "三箭連發。",
    mp: 14,
    kind: "damage",
    power: 0.7,
    hits: 3,
    target: "enemy",
    learnLevel: 20,
  },
  pierce: {
    id: "pierce",
    name: "穿透箭",
    desc: "貫穿護甲的一箭，高額單體傷害。",
    mp: 18,
    kind: "damage",
    power: 2.05,
    target: "enemy",
    learnLevel: 25,
  },
  arrow_rain: {
    id: "arrow_rain",
    name: "箭雨",
    desc: "箭矢如雨，攻擊所有敵人。",
    mp: 22,
    kind: "aoe",
    power: 1.25,
    target: "allEnemies",
    learnLevel: 30,
  },
  beast_heart: {
    id: "beast_heart",
    name: "獸王之心",
    desc: "與霧中生靈共搏，三回合內攻擊上升。",
    mp: 16,
    kind: "buff",
    power: 0,
    status: "atkUp",
    statusTurns: 3,
    target: "self",
    learnLevel: 40,
  },
  bite: {
    id: "bite",
    name: "撕咬",
    desc: "銳齒撕扯。",
    mp: 0,
    kind: "damage",
    power: 1.25,
    target: "enemy",
  },
  howl: {
    id: "howl",
    name: "嚎月",
    desc: "振奮己方攻擊。",
    mp: 6,
    kind: "buff",
    power: 0,
    status: "atkUp",
    statusTurns: 2,
    target: "self",
  },
  goo: {
    id: "goo",
    name: "黏液彈",
    desc: "甩出酸黏液。",
    mp: 0,
    kind: "damage",
    power: 1.1,
    target: "enemy",
  },
  stab: {
    id: "stab",
    name: "偷襲",
    desc: "陰險一刺。",
    mp: 0,
    kind: "damage",
    power: 1.2,
    target: "enemy",
  },
  screech: {
    id: "screech",
    name: "尖嘯",
    desc: "刺耳音波。",
    mp: 0,
    kind: "magic",
    power: 1.15,
    target: "enemy",
  },
  drain: {
    id: "drain",
    name: "吸血",
    desc: "吸取少量生命。",
    mp: 8,
    kind: "magic",
    power: 0.9,
    target: "enemy",
  },
  bone_slash: {
    id: "bone_slash",
    name: "骨刃",
    desc: "鏽蝕骨刀橫掃。",
    mp: 0,
    kind: "damage",
    power: 1.3,
    target: "enemy",
  },
  mist_bolt: {
    id: "mist_bolt",
    name: "霧矢",
    desc: "凝霧成矢。",
    mp: 0,
    kind: "magic",
    power: 1.2,
    target: "enemy",
  },
  soothe: {
    id: "soothe",
    name: "撫霧",
    desc: "以霧氣療傷。",
    mp: 10,
    kind: "heal",
    power: 0.4,
    target: "self",
  },
  shadow: {
    id: "shadow",
    name: "暗影彈",
    desc: "無形的黑焰。",
    mp: 0,
    kind: "magic",
    power: 1.4,
    target: "enemy",
  },
  curse: {
    id: "curse",
    name: "咒縛",
    desc: "削弱敵人防禦。",
    mp: 8,
    kind: "debuff",
    power: 0.7,
    status: "spdDown",
    statusTurns: 2,
    target: "enemy",
  },
  breath: {
    id: "breath",
    name: "霧息",
    desc: "噴出腐蝕的銀霧，攻擊全體。",
    mp: 0,
    kind: "aoe-magic",
    power: 1.25,
    target: "allEnemies",
  },
  tail: {
    id: "tail",
    name: "龍尾",
    desc: "巨尾橫掃。",
    mp: 0,
    kind: "damage",
    power: 1.45,
    target: "enemy",
  },
  roar: {
    id: "roar",
    name: "霧吼",
    desc: "震懼全場，降低速度。",
    mp: 0,
    kind: "debuff",
    power: 0.6,
    status: "spdDown",
    statusTurns: 2,
    target: "enemy",
  },
};

export const CLASSES: Record<ClassId, ClassDef> = {
  warrior: {
    id: "warrior",
    name: "戰士",
    title: "鐵衛",
    blurb: "厚甲與重刃。站在最前，替同伴擋下霧中的第一擊。",
    portrait: "/art/warrior.jpg",
    base: { hp: 126, mp: 32, atk: 15, mag: 4, def: 13, spd: 8 },
    growth: { hp: 14, mp: 3, atk: 3, mag: 0, def: 2, spd: 1 },
    skills: ["heavy_slash", "shield_bash", "rage", "whirlwind", "iron_wall", "earth_split", "war_cry", "peerless"],
    weaponType: "sword",
  },
  mage: {
    id: "mage",
    name: "法師",
    title: "霧詠",
    blurb: "以咒文凝結月光。脆弱，但能在遠距撕開戰局。",
    portrait: "/art/mage.jpg",
    base: { hp: 82, mp: 86, atk: 6, mag: 16, def: 6, spd: 9 },
    growth: { hp: 8, mp: 8, atk: 1, mag: 3, def: 1, spd: 1 },
    skills: ["fireball", "frost", "heal", "thunder", "ward", "meteor", "blizzard", "starfall"],
    weaponType: "staff",
  },
  ranger: {
    id: "ranger",
    name: "遊俠",
    title: "林蹤",
    blurb: "弓弦與獸語。在霧裡比誰都清楚方向，也最容易與野獸締結。",
    portrait: "/art/ranger.jpg",
    base: { hp: 98, mp: 52, atk: 12, mag: 8, def: 8, spd: 14 },
    growth: { hp: 10, mp: 5, atk: 2, mag: 1, def: 1, spd: 2 },
    skills: ["double_shot", "poison_arrow", "tame_art", "smoke_step", "triple_shot", "pierce", "arrow_rain", "beast_heart"],
    weaponType: "bow",
  },
};

export const MONSTERS: Record<string, MonsterDef> = {
  slime: {
    id: "slime",
    name: "綠史萊姆",
    portrait: "/art/slime.jpg",
    blurb: "霧谷最常見的黏團。意外地親人，容易馳服。",
    stats: { hp: 32, mp: 8, atk: 8, mag: 4, def: 4, spd: 6 },
    skills: ["goo"],
    xp: 16,
    gold: 8,
    canTame: true,
    tameRate: 0.58,
    drops: [{ itemId: "potion", chance: 0.35 }],
  },
  wolf: {
    id: "wolf",
    name: "霧狼",
    portrait: "/art/wolf.jpg",
    blurb: "銀灰色的林狼。若在月下對視而不逃，便是緣分。",
    stats: { hp: 48, mp: 12, atk: 13, mag: 5, def: 7, spd: 14 },
    skills: ["bite", "howl"],
    xp: 26,
    gold: 14,
    canTame: true,
    tameRate: 0.4,
    drops: [{ itemId: "potion", chance: 0.25 }],
  },
  goblin: {
    id: "goblin",
    name: "哥布林斥候",
    portrait: "/art/goblin.jpg",
    blurb: "拾荒為生的斥候。機靈、多疑，不願被束縛。",
    stats: { hp: 42, mp: 6, atk: 12, mag: 3, def: 6, spd: 11 },
    skills: ["stab"],
    xp: 22,
    gold: 16,
    canTame: false,
    tameRate: 0,
    drops: [
      { itemId: "potion", chance: 0.2 },
      { itemId: "ether", chance: 0.12 },
    ],
  },
  bat: {
    id: "bat",
    name: "洞穴蝙蝠",
    portrait: "/art/bat.jpg",
    blurb: "在岩頂倒掛的聽風者。馳服後能替你探路。",
    stats: { hp: 36, mp: 16, atk: 9, mag: 10, def: 4, spd: 16 },
    skills: ["screech", "drain"],
    xp: 20,
    gold: 10,
    canTame: true,
    tameRate: 0.46,
    drops: [{ itemId: "ether", chance: 0.22 }],
  },
  skeleton: {
    id: "skeleton",
    name: "骸骨衛兵",
    portrait: "/art/skeleton.jpg",
    blurb: "仍守著無人記得的誓言。無法馳服。",
    stats: { hp: 62, mp: 8, atk: 15, mag: 4, def: 11, spd: 7 },
    skills: ["bone_slash"],
    xp: 34,
    gold: 18,
    canTame: false,
    tameRate: 0,
    drops: [{ itemId: "hi_potion", chance: 0.15 }],
  },
  sprite: {
    id: "sprite",
    name: "霧中精靈",
    portrait: "/art/sprite.jpg",
    blurb: "由月光與水氣凝成的靈。願意跟隨溫柔的人。",
    stats: { hp: 50, mp: 28, atk: 7, mag: 14, def: 6, spd: 13 },
    skills: ["mist_bolt", "soothe"],
    xp: 32,
    gold: 20,
    canTame: true,
    tameRate: 0.36,
    drops: [{ itemId: "ether", chance: 0.3 }],
  },
  darkmage: {
    id: "darkmage",
    name: "暗影術士",
    portrait: "/art/darkmage.jpg",
    blurb: "神殿的看守者。霧晶在他袖中發冷。",
    stats: { hp: 155, mp: 70, atk: 12, mag: 20, def: 10, spd: 12 },
    skills: ["shadow", "curse"],
    xp: 90,
    gold: 70,
    canTame: false,
    tameRate: 0,
    isBoss: true,
    drops: [
      { itemId: "hi_potion", chance: 1 },
      { itemId: "mist_staff", chance: 0.4 },
    ],
  },
  mistfang: {
    id: "mistfang",
    name: "霧牙巨狼",
    portrait: "/art/mistfang.jpg",
    blurb: "迷霧森林的巢主。爪痕能把古樹剖開。",
    stats: { hp: 145, mp: 20, atk: 19, mag: 6, def: 11, spd: 16 },
    skills: ["bite", "howl"],
    xp: 88,
    gold: 72,
    canTame: false,
    tameRate: 0,
    isBoss: true,
    drops: [{ itemId: "hi_potion", chance: 1 }],
  },
  boneking: {
    id: "boneking",
    name: "深淵骨王",
    portrait: "/art/boneking.jpg",
    blurb: "洞穴最深處仍在站崗的骸骨之王。",
    stats: { hp: 168, mp: 16, atk: 20, mag: 5, def: 16, spd: 8 },
    skills: ["bone_slash", "roar"],
    xp: 96,
    gold: 78,
    canTame: false,
    tameRate: 0,
    isBoss: true,
    drops: [{ itemId: "hi_potion", chance: 1 }],
  },
  dragon: {
    id: "dragon",
    name: "暮霧巨龍",
    portrait: "/art/dragon.jpg",
    blurb: "封印裂縫中醒來的舊神殘響。霧谷的終點，固定 50 級。",
    stats: { hp: 280, mp: 80, atk: 20, mag: 18, def: 14, spd: 10 },
    skills: ["breath", "tail", "roar"],
    xp: 200,
    gold: 180,
    canTame: false,
    tameRate: 0,
    isBoss: true,
    fixedLevel: 50,
    drops: [{ itemId: "dragon_mail", chance: 1 }],
  },
};

export const ITEMS: Record<string, ItemDef> = {
  potion: {
    id: "potion",
    name: "回復藥",
    desc: "恢復 45 點生命。",
    kind: "consumable",
    price: 20,
    sell: 8,
    healHp: 45,
  },
  hi_potion: {
    id: "hi_potion",
    name: "高級回復藥",
    desc: "恢復 110 點生命。",
    kind: "consumable",
    price: 60,
    sell: 22,
    healHp: 110,
  },
  ether: {
    id: "ether",
    name: "魔力藥",
    desc: "恢復 35 點魔力。",
    kind: "consumable",
    price: 25,
    sell: 10,
    healMp: 35,
  },
  antidote: {
    id: "antidote",
    name: "解毒草",
    desc: "解除中毒。",
    kind: "consumable",
    price: 15,
    sell: 6,
    curePoison: true,
  },
  whistle: {
    id: "whistle",
    name: "馳獸笛",
    desc: "戰鬥中使用，大幅提升本次馳服機率。",
    kind: "consumable",
    price: 80,
    sell: 30,
    tameBonus: 0.28,
  },
  rusty_sword: {
    id: "rusty_sword",
    name: "生鏽短劍",
    desc: "村裡鐵匠的入門貨。攻擊 +3。",
    kind: "weapon",
    price: 0,
    sell: 5,
    slot: "weapon",
    weaponType: "sword",
    stats: { atk: 3 },
  },
  oak_staff: {
    id: "oak_staff",
    name: "橡木杖",
    desc: "還沒被霧浸透的新杖。魔力 +4。",
    kind: "weapon",
    price: 0,
    sell: 5,
    slot: "weapon",
    weaponType: "staff",
    stats: { mag: 4 },
  },
  hunter_bow: {
    id: "hunter_bow",
    name: "獵弓",
    desc: "林務官留下的短弓。攻擊 +3、速度 +1。",
    kind: "weapon",
    price: 0,
    sell: 5,
    slot: "weapon",
    weaponType: "bow",
    stats: { atk: 3, spd: 1 },
  },
  iron_sword: {
    id: "iron_sword",
    name: "精鋼長劍",
    desc: "霧谷鐵匠的驕傲。攻擊 +9。通關迷霧森林且達到 10 級後進貨。",
    kind: "weapon",
    price: 140,
    sell: 50,
    slot: "weapon",
    weaponType: "sword",
    stats: { atk: 9 },
  },
  mist_staff: {
    id: "mist_staff",
    name: "霧晶法杖",
    desc: "杖頭嵌著碎晶。魔力 +11。通關迷霧森林且達到 10 級後進貨。",
    kind: "weapon",
    price: 150,
    sell: 55,
    slot: "weapon",
    weaponType: "staff",
    stats: { mag: 11 },
  },
  wind_bow: {
    id: "wind_bow",
    name: "疾風長弓",
    desc: "弦聲幾乎被風吞掉。攻擊 +7、速度 +3。通關迷霧森林且達到 10 級後進貨。",
    kind: "weapon",
    price: 145,
    sell: 52,
    slot: "weapon",
    weaponType: "bow",
    stats: { atk: 7, spd: 3 },
  },
  cloth: {
    id: "cloth",
    name: "旅人布衣",
    desc: "擋風，擋不了牙。防禦 +2。",
    kind: "armor",
    price: 0,
    sell: 4,
    slot: "armor",
    stats: { def: 2 },
  },
  leather: {
    id: "leather",
    name: "硬皮甲",
    desc: "獵戶的舊貨。防禦 +6。",
    kind: "armor",
    price: 80,
    sell: 28,
    slot: "armor",
    stats: { def: 6 },
  },
  chain: {
    id: "chain",
    name: "鎖子甲",
    desc: "環環相扣。防禦 +11、生命 +12。通關迷霧森林且達到 10 級後進貨。",
    kind: "armor",
    price: 180,
    sell: 70,
    slot: "armor",
    stats: { def: 11, hp: 12 },
  },
  robe: {
    id: "robe",
    name: "霧織法袍",
    desc: "織進月光的線。防禦 +5、魔力 +5、生命 +8。通關迷霧森林且達到 10 級後進貨。",
    kind: "armor",
    price: 160,
    sell: 60,
    slot: "armor",
    stats: { def: 5, mag: 5, hp: 8, mp: 10 },
  },
  dragon_mail: {
    id: "dragon_mail",
    name: "龍鱗甲",
    desc: "仍帶著霧息的鱗。防禦 +16、生命 +24。",
    kind: "armor",
    price: 0,
    sell: 0,
    slot: "armor",
    stats: { def: 16, hp: 24 },
  },
  orichal_sword: {
    id: "orichal_sword",
    name: "奧利哈鋼劍",
    desc: "礦脈深處煉出的刃。攻擊 +16。通關深淵洞穴且達到 20 級後進貨。",
    kind: "weapon",
    price: 360,
    sell: 120,
    slot: "weapon",
    weaponType: "sword",
    stats: { atk: 16 },
  },
  orichal_staff: {
    id: "orichal_staff",
    name: "奧利哈法杖",
    desc: "芯裡灌著礦晶。魔力 +18。通關深淵洞穴且達到 20 級後進貨。",
    kind: "weapon",
    price: 370,
    sell: 125,
    slot: "weapon",
    weaponType: "staff",
    stats: { mag: 18 },
  },
  orichal_bow: {
    id: "orichal_bow",
    name: "奧利哈長弓",
    desc: "金屬弦。攻擊 +13、速度 +4。通關深淵洞穴且達到 20 級後進貨。",
    kind: "weapon",
    price: 355,
    sell: 118,
    slot: "weapon",
    weaponType: "bow",
    stats: { atk: 13, spd: 4 },
  },
  orichal_mail: {
    id: "orichal_mail",
    name: "奧利哈鎧",
    desc: "沉重但可靠。防禦 +16、生命 +20。通關深淵洞穴且達到 20 級後進貨。",
    kind: "armor",
    price: 390,
    sell: 130,
    slot: "armor",
    stats: { def: 16, hp: 20 },
  },
  mithril_sword: {
    id: "mithril_sword",
    name: "密銀長劍",
    desc: "輕得像月光。攻擊 +24。通關廢棄神殿且達到 30 級後進貨。",
    kind: "weapon",
    price: 680,
    sell: 230,
    slot: "weapon",
    weaponType: "sword",
    stats: { atk: 24 },
  },
  mithril_staff: {
    id: "mithril_staff",
    name: "密銀法杖",
    desc: "咒文會自己沿著杖身爬。魔力 +26。通關廢棄神殿且達到 30 級後進貨。",
    kind: "weapon",
    price: 700,
    sell: 235,
    slot: "weapon",
    weaponType: "staff",
    stats: { mag: 26 },
  },
  mithril_bow: {
    id: "mithril_bow",
    name: "密銀長弓",
    desc: "幾乎沒有重量。攻擊 +20、速度 +6。通關廢棄神殿且達到 30 級後進貨。",
    kind: "weapon",
    price: 690,
    sell: 228,
    slot: "weapon",
    weaponType: "bow",
    stats: { atk: 20, spd: 6 },
  },
  mithril_mail: {
    id: "mithril_mail",
    name: "密銀鏈甲",
    desc: "柔韌如織。防禦 +22、生命 +32。通關廢棄神殿且達到 30 級後進貨。",
    kind: "armor",
    price: 720,
    sell: 240,
    slot: "armor",
    stats: { def: 22, hp: 32 },
  },
  holy_bough: {
    id: "holy_bough",
    name: "清輝靈枝",
    desc: "湖心竪著的潔白樹枝。日光與月華滲在木理裡，霧不敢靠近。",
    kind: "key",
    price: 0,
    sell: 0,
  },
  legend_sword: {
    id: "legend_sword",
    name: "黎明神劍",
    desc: "戰士的傳說武器。三枚霧晶與清輝靈枝鑄成。攻擊 +50。可撕開暮霧巨龍的結界。",
    kind: "weapon",
    price: 0,
    sell: 0,
    slot: "weapon",
    weaponType: "sword",
    stats: { atk: 50 },
  },
  legend_staff: {
    id: "legend_staff",
    name: "破曉聖杖",
    desc: "法師的傳說武器。三枚霧晶與清輝靈枝鑄成。魔力 +54。可驅散暮霧巨龍的迷霧。",
    kind: "weapon",
    price: 0,
    sell: 0,
    slot: "weapon",
    weaponType: "staff",
    stats: { mag: 54 },
  },
  legend_bow: {
    id: "legend_bow",
    name: "黃昏光弓",
    desc: "遊俠的傳說武器。三枚霧晶與清輝靈枝鑄成。攻擊 +42、速度 +10。箭矢可貫穿結界。",
    kind: "weapon",
    price: 0,
    sell: 0,
    slot: "weapon",
    weaponType: "bow",
    stats: { atk: 42, spd: 10 },
  },
  crystal_forest: {
    id: "crystal_forest",
    name: "蒼霧晶",
    desc: "從霧牙巨狼巢穴深處取回的封印碎片。",
    kind: "key",
    price: 0,
    sell: 0,
  },
  crystal_cave: {
    id: "crystal_cave",
    name: "深淵晶",
    desc: "深淵骨王王座下，水池倒影裡的第二枚。",
    kind: "key",
    price: 0,
    sell: 0,
  },
  crystal_shrine: {
    id: "crystal_shrine",
    name: "聖殿晶",
    desc: "從暗影術士袖中奪回的第三枚。",
    kind: "key",
    price: 0,
    sell: 0,
  },
};

export const SHOP_ALWAYS = ["potion", "hi_potion", "ether", "antidote", "whistle", "leather"];

export const SHOP_TIERS: {
  level: number;
  flag: string;
  reqLabel: string;
  items: string[];
}[] = [
  {
    level: 10,
    flag: "crystalForest",
    reqLabel: "通關迷霧森林",
    items: ["iron_sword", "mist_staff", "wind_bow", "chain", "robe"],
  },
  {
    level: 20,
    flag: "crystalCave",
    reqLabel: "通關深淵洞穴",
    items: ["orichal_sword", "orichal_staff", "orichal_bow", "orichal_mail"],
  },
  {
    level: 30,
    flag: "crystalShrine",
    reqLabel: "通關廢棄神殿",
    items: ["mithril_sword", "mithril_staff", "mithril_bow", "mithril_mail"],
  },
];

export const SHOP_ITEMS = [
  ...SHOP_ALWAYS,
  ...SHOP_TIERS.flatMap((t) => t.items),
];

export function shopCatalog(level: number, flags: Record<string, boolean>) {
  const rows: { id: string; locked: string | null }[] = SHOP_ALWAYS.map((id) => ({ id, locked: null }));
  for (const tier of SHOP_TIERS) {
    const ok = level >= tier.level && Boolean(flags[tier.flag]);
    const locked = ok ? null : `${tier.level} 級且${tier.reqLabel}`;
    for (const id of tier.items) rows.push({ id, locked });
  }
  return rows;
}

export function isShopUnlocked(itemId: string, level: number, flags: Record<string, boolean>) {
  if (SHOP_ALWAYS.includes(itemId)) return true;
  const tier = SHOP_TIERS.find((t) => t.items.includes(itemId));
  if (!tier) return false;
  return level >= tier.level && Boolean(flags[tier.flag]);
}

export function shopUnlockNotes(prevLevel: number, nextLevel: number, flags: Record<string, boolean>) {
  return SHOP_TIERS.filter(
    (t) => prevLevel < t.level && nextLevel >= t.level && flags[t.flag],
  ).map((t) => `雜貨鋪進了 ${t.level} 級的新貨。`);
}

export const QUESTS: Record<string, QuestDef> = {
  slime_hunt: {
    id: "slime_hunt",
    title: "林間清割",
    poster: "東田農戶",
    desc: "史萊姆爬進了菜圃。請在迷霧森林擊敗三隻綠史萊姆。",
    hint: "迷霧森林探索即可遭遇。",
    reward: 35,
    kind: "hunt",
    targetId: "slime",
    count: 3,
    locationId: "forest",
  },
  wolf_hunt: {
    id: "wolf_hunt",
    title: "狼蹤",
    poster: "守夜人",
    desc: "霧裡傳來嚎聲。請擊敗兩隻霧狼，好讓牧道能走。",
    hint: "迷霧森林。",
    reward: 50,
    kind: "hunt",
    targetId: "wolf",
    count: 2,
    locationId: "forest",
  },
  goblin_hunt: {
    id: "goblin_hunt",
    title: "驅趕斥候",
    poster: "雜貨鋪",
    desc: "哥布林偷走了貨箱。擊敗三隻哥布林斥候。",
    hint: "迷霧森林。",
    reward: 55,
    kind: "hunt",
    targetId: "goblin",
    count: 3,
    locationId: "forest",
  },
  skeleton_hunt: {
    id: "skeleton_hunt",
    title: "洞穴掃蕩",
    poster: "採石工",
    desc: "骸骨衛兵擋在礦道。請擊敗兩隻。",
    hint: "深淵洞穴。",
    reward: 70,
    kind: "hunt",
    targetId: "skeleton",
    count: 2,
    locationId: "cave",
  },
  sprite_hunt: {
    id: "sprite_hunt",
    title: "神殿餘霧",
    poster: "祭司學徒",
    desc: "廢棄神殿裡的霧靈太躁。擊敗兩隻霧中精靈。",
    hint: "廢棄神殿。",
    reward: 75,
    kind: "hunt",
    targetId: "sprite",
    count: 2,
    locationId: "shrine",
  },
  potion_run: {
    id: "potion_run",
    title: "藥草急件",
    poster: "旅店老闆",
    desc: "傷患等著藥。請繳交兩瓶回復藥。",
    hint: "商店可買，戰鬥也有掉落。",
    reward: 40,
    kind: "deliver",
    targetId: "potion",
    count: 2,
  },
  tame_slime: {
    id: "tame_slime",
    title: "黏液同伴",
    poster: "孩子們",
    desc: "想看一隻溫馴的綠史萊姆。請馳服一隻並帶回村子。",
    hint: "把史萊姆打到半血以下再馳服。遊俠較容易成功。",
    reward: 60,
    kind: "tame",
    targetId: "slime",
    count: 1,
    locationId: "forest",
  },
  tame_wolf: {
    id: "tame_wolf",
    title: "月下締約",
    poster: "守夜人",
    desc: "若有霧狼願意跟隨，村子夜間會安全許多。",
    hint: "迷霧森林，半血後馳服。",
    reward: 90,
    kind: "tame",
    targetId: "wolf",
    count: 1,
    locationId: "forest",
  },
  lake_bough: {
    id: "lake_bough",
    title: "清輝湖的樹枝",
    poster: "長老艾爾德",
    desc: "暮光祭壇那塊地裡有一座湖，時常同時被日光與月光照著，霧不敢侵。請到湖心查看竪在水裡的物體，把見聞帶回村子。",
    hint: "在暮光祭壇走向清輝湖，再走到湖心。",
    reward: 120,
    kind: "visit",
    targetId: "holy_bough",
    count: 1,
    locationId: "altar",
    requireLevel: 40,
    requireCrystals: true,
    requireNest: true,
    consumeOnTurnIn: false,
  },
};

export const BOARD_QUEST_IDS = Object.keys(QUESTS);

export const ACTIVE_QUEST_CAP = 3;

export function countItem(inv: { itemId: string; qty: number }[], itemId: string): number {
  return inv.find((e) => e.itemId === itemId)?.qty ?? 0;
}

export function liveQuestProgress(
  def: QuestDef,
  entry: QuestLogEntry | undefined,
  inv: { itemId: string; qty: number }[],
  pets: { monsterId: string }[],
): number {
  if (!entry || entry.status === "done") return entry?.progress ?? 0;
  if (def.kind === "deliver" || def.kind === "visit") return Math.min(def.count, countItem(inv, def.targetId));
  if (def.kind === "tame") {
    const have = pets.filter((p) => p.monsterId === def.targetId).length;
    return Math.min(def.count, Math.max(entry.progress, have));
  }
  return entry.progress;
}

export function isQuestReady(
  def: QuestDef,
  entry: QuestLogEntry | undefined,
  inv: { itemId: string; qty: number }[],
  pets: { monsterId: string }[],
): boolean {
  if (!entry || entry.status === "done") return false;
  if (entry.status === "ready") return true;
  return liveQuestProgress(def, entry, inv, pets) >= def.count;
}

export function applyQuestTargets(
  quests: Record<string, QuestLogEntry>,
  kind: "hunt" | "tame",
  targetIds: string[],
): { quests: Record<string, QuestLogEntry>; notes: string[] } {
  const next: Record<string, QuestLogEntry> = { ...quests };
  const notes: string[] = [];
  for (const id of Object.keys(next)) {
    const entry = next[id];
    const def = QUESTS[id];
    if (!def || def.kind !== kind) continue;
    if (entry.status !== "accepted" && entry.status !== "ready") continue;
    let add = 0;
    for (const t of targetIds) if (t === def.targetId) add += 1;
    if (add === 0) continue;
    const progress = Math.min(def.count, entry.progress + add);
    const ready = progress >= def.count;
    next[id] = {
      ...entry,
      progress,
      status: ready ? "ready" : entry.status,
    };
    if (ready && entry.status !== "ready") notes.push(`「${def.title}」可以回報了。`);
  }
  return { quests: next, notes };
}

export const LOCATIONS: Record<string, LocationDef> = {
  village: {
    id: "village",
    name: "霧谷村",
    blurb: "燈火還亮著。只要村子還在，霧就還沒贏。",
    scene: "/art/village.jpg",
    connected: ["forest", "cave", "shrine", "altar"],
  },
  forest: {
    id: "forest",
    name: "迷霧森林",
    blurb: "松針濕透，視線不過三步。霧晶被某種巨獸守在巢裡。",
    scene: "/art/forest.jpg",
    connected: ["village"],
  },
  cave: {
    id: "cave",
    name: "深淵洞穴",
    blurb: "岩壁滴水。骸骨的腳步在深處回響，霧晶不在淺處。",
    scene: "/art/cave.jpg",
    connected: ["village"],
  },
  shrine: {
    id: "shrine",
    name: "廢棄神殿",
    blurb: "斷柱像被巨手折過。咒文焦痕一路指向某個人的巢。",
    scene: "/art/shrine.jpg",
    connected: ["village"],
  },
  altar: {
    id: "altar",
    name: "暮光祭壇",
    blurb: "裂縫在石頭中央呼吸。暮霧巨龍固定 50 級，尋常兵器會被結界折斷。臺地盡頭有一座不被霧侵的湖。",
    scene: "/art/altar.jpg",
    connected: ["village"],
    lockedUntil: "crystals",
  },
  lake: {
    id: "lake",
    name: "清輝湖",
    blurb: "霧在岸邊停住。湖面同時映著太陽與月亮，中央竪著一根發白的東西。",
    scene: "/art/lake.jpg",
    connected: ["altar"],
  },
};

export const ENCOUNTERS: Record<
  string,
  { weight: number; enemies: string[] }[]
> = {
  forest: [
    { weight: 38, enemies: ["slime"] },
    { weight: 24, enemies: ["wolf"] },
    { weight: 20, enemies: ["goblin"] },
    { weight: 18, enemies: ["slime", "slime"] },
  ],
  cave: [
    { weight: 40, enemies: ["bat"] },
    { weight: 35, enemies: ["skeleton"] },
    { weight: 25, enemies: ["bat", "skeleton"] },
  ],
  shrine: [
    { weight: 55, enemies: ["sprite"] },
    { weight: 45, enemies: ["sprite", "skeleton"] },
  ],
  altar: [
    { weight: 50, enemies: ["sprite"] },
    { weight: 30, enemies: ["skeleton"] },
    { weight: 20, enemies: ["sprite", "skeleton"] },
  ],
};

export function rollInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export interface AreaHuntDef {
  locationId: string;
  bossId: string;
  bossName: string;
  crystalFlag: string;
  crystalDialogue?: string;
  clearedText?: string;
  clues: string[];
  nestFoundText: string;
  nestEnter: DialogueLine[];
}

export const AREA_HUNTS: Record<string, AreaHuntDef> = {
  forest: {
    locationId: "forest",
    bossId: "mistfang",
    bossName: "霧牙巨狼",
    crystalFlag: "crystalForest",
    crystalDialogue: "forest_crystal",
    clues: [
      "泥地裡有比人掌還大的犬科腳印，趾間還掛著未散的霧。",
      "一具鹿屍被巨大牙印撕開，脊骨幾乎咬碎，不像普通霧狼做得來。",
      "古樹幹上有被利爪刨開的深痕，樹汁還是濕的，高度超過人頭。",
      "空氣裡全是潮濕的獸息。林線外有什麼東西在繞圈，步距很長。",
      "遠處傳來低沈的嚎聲，回音把霧震出一圈波紋——那不是一隻尋常的狼。",
    ],
    nestFoundText: "灌木被整片壓平。你循著焦土與爪痕走進谷底——找到霧牙巨狼的巢穴了。",
    nestEnter: [
      {
        speaker: "旁白",
        text: "巢裡的土是熱的。巨大的銀灰色身黨從霧裡站起來，眼睛像兩盎冷月。",
      },
      {
        speaker: "霧牙巨狼",
        portrait: "/art/mistfang.jpg",
        text: "……這片林是我的。霧晶也是。滾出去，或者留下來當骨頭。",
      },
    ],
  },
  cave: {
    locationId: "cave",
    bossId: "boneking",
    bossName: "深淵骨王",
    crystalFlag: "crystalCave",
    crystalDialogue: "cave_crystal",
    clues: [
      "岩壁上刮著整齊的刀痕，不像野獸，像舊兵器一次次試刃。",
      "水滌裡沈著一節發白的指骨，比人類的粗一圈，關節處還有鏽甲殘片。",
      "風裡有腐鏽與乾屍的味道，越往深處越濃，連火把都發青。",
      "地上散落破損的盾片，紋章已被時間吃掉，卻仍圍成一圈崗位。",
      "遠處鎧甲碰撞，節奏慢得不像活人——有什麼東西還在站崗。",
    ],
    nestFoundText: "通道盡頭的石門半開。你聽見王座下的水聲——找到深淵骨王的巢穴了。",
    nestEnter: [
      {
        speaker: "旁白",
        text: "洞穴最深處，一具過高的骸骨坐在浸水的石座上。它站起來時，頭盔磊到了頂岩。",
      },
      {
        speaker: "深淵骨王",
        portrait: "/art/boneking.jpg",
        text: "守晶……至死。死了，也繼續守。",
      },
    ],
  },
  shrine: {
    locationId: "shrine",
    bossId: "darkmage",
    bossName: "暗影術士",
    crystalFlag: "crystalShrine",
    crystalDialogue: "shrine_crystal",
    clues: [
      "石階上燒著一圈咒文焦痕，邊緣還沒涼，像有人剛跪在這裡。",
      "柱影會自己移動。燈後有腳步，卻看不見人。",
      "空氣發苦。舌尖有金屬與藥草混在一起的味道，是術者常用的底料。",
      "牆上的壁畫被挖去五官，只留下黑洞。有人在抹去名字。",
      "耳邊有低語，內容聽不清，卻一直反復喊你的名字——像在試探你是不是活人。",
    ],
    nestFoundText: "內殿的帷幔被抽走。咒陣中央空出一個巢——找到暗影術士的巢穴了。",
    nestEnter: [
      {
        speaker: "暗影術士",
        portrait: "/art/darkmage.jpg",
        text: "你跟著痕跡走到這裡。霧晶不是給活人的。把腳步退回村子，或者留下骨頭。",
      },
    ],
  },
  altar: {
    locationId: "altar",
    bossId: "dragon",
    bossName: "暮霧巨龍",
    crystalFlag: "dragonDefeated",
    clearedText: "結界已散。",
    clues: [
      "石坪被燒成玻璃狀，鞋底還發燻。那不是營火能留下的痕跡。",
      "比人還長的爪痕把祭壇階梯剖開，深可見骨白的巖心。",
      "空氣裡有硫與舊鐵的氣味。霧在裂縫口轉成螺旋，像被什麼吸進去。",
      "一塊巨鱗嵌進岩石，月光下像浸過銀，邊緣還在滴著未乾的熱霧。",
      "遠處傳來比雷還低的呼吸，整座臺地都震出一層塵——它就在裂縫裡。",
    ],
    nestFoundText: "裂縫擴大成巢口。鱗片的弧光在裡面翻動——找到暮霧巨龍的巢穴了。",
    nestEnter: [
      {
        speaker: "旁白",
        text: "三枚霧晶的記憶在巢口共鳴。暮霧裂開。一頭龍從雲裡落下，鱗片像浸透月光的鐵。它身上壓著固定的 50 級威壓，結界把尋常兵器都折成薄霧。",
      },
      {
        speaker: "暮霧巨龍",
        portrait: "/art/dragon.jpg",
        text: "……封我的人已經成為塵土。你憑什麼再走這一遭？",
      },
    ],
  },
};

export const CLUE_NEED = 5;

export function freshHunt(): RegionHunt {
  const clueStartAt = rollInt(20, 30);
  return {
    clueStartAt,
    nextEventAt: clueStartAt,
    clues: 0,
    nestFound: false,
    bossDefeated: false,
    nestDueAt: null,
  };
}

export type HuntExploreEvent = { type: "none" } | { type: "clue"; index: number } | { type: "nest" };

export function resolveHuntExplore(
  hunt: RegionHunt,
  count: number,
): { hunt: RegionHunt; event: HuntExploreEvent } {
  if (hunt.bossDefeated || hunt.nestFound) return { hunt, event: { type: "none" } };
  if (hunt.clues >= CLUE_NEED) {
    const nestDueAt = hunt.nestDueAt ?? count + rollInt(1, 5);
    const next = { ...hunt, nestDueAt };
    if (count >= nestDueAt) {
      return { hunt: { ...next, nestFound: true }, event: { type: "nest" } };
    }
    return { hunt: next, event: { type: "none" } };
  }
  if (count >= hunt.nextEventAt && count >= hunt.clueStartAt) {
    const clues = hunt.clues + 1;
    const next: RegionHunt = {
      ...hunt,
      clues,
      nextEventAt: count + rollInt(5, 10),
      nestDueAt: clues >= CLUE_NEED ? count + rollInt(1, 5) : hunt.nestDueAt,
    };
    return { hunt: next, event: { type: "clue", index: clues - 1 } };
  }
  return { hunt, event: { type: "none" } };
}

export function huntByBoss(bossId: string): AreaHuntDef | undefined {
  return Object.values(AREA_HUNTS).find((h) => h.bossId === bossId);
}

export const DIALOGUES: Record<string, DialogueDef> = {
  intro: {
    id: "intro",
    lines: [
      {
        speaker: "旁白",
        text: "霧谷已經三個月不見日光。山風帶著濕冷，連燈火都像是被什麼東西吞著。",
      },
      {
        speaker: "長老",
        portrait: "/art/elder.jpg",
        text: "你來得正好。我是艾爾德，這裡的長老。封印在暮光祭壇底下的東西，正在醒來。",
      },
      {
        speaker: "長老",
        portrait: "/art/elder.jpg",
        text: "林裡的生物變得狂躁，有些卻又異常親近人類——像是在尋找同伴。",
      },
      {
        speaker: "長老",
        portrait: "/art/elder.jpg",
        text: "我需要你取回三枚霧晶：一枚在迷霧森林，一枚在深淵洞穴，一枚在廢棄神殿。它們被守在巢穴裡——不是路邊就能撿到的。先跟著地上的痕跡走，湊齊線索，才能找到看守者。",
      },
      {
        speaker: "長老",
        portrait: "/art/elder.jpg",
        text: "路上若遇見願意跟隨的生靈，不妨伸出手。霧谷的魔物會與你一同變強——你長一歲，它們也長一歲。技能不是一開始就會，每五級左右會覺醒新的招式。旅店可以歇息，鐵匠能強化裝備。村口公佈欄也貼著委託。雜貨鋪的好貨，要等你通關對應地區、再長到足夠的等級才進店。",
      },
    ],
    effects: [{ type: "flag", flag: "questStarted" }],
  },
  elder_hub: {
    id: "elder_hub",
    lines: [
      {
        speaker: "長老",
        portrait: "/art/elder.jpg",
        text: "霧還沒散。三枚霧晶各有看守。雜貨鋪的精鋼、奧利哈、密銀，分別要通關森林、洞穴、神殿，並且達到 10、20、30 級——密銀之後不再進新武器。祭壇是第四個地區，要像其他地方一樣跟蹤痕跡才能找到龍巢。四十級且發現龍巢後，公佈欄會出現清輝湖的委託。暮霧巨龍固定 50 級，且有結界護身。村子的燈會一直為你留著。",
      },
    ],
  },
  elder_ready: {
    id: "elder_ready",
    lines: [
      {
        speaker: "長老",
        portrait: "/art/elder.jpg",
        text: "三枚霧晶都齊了。祭壇會認你。那裡是第四個地區——跟蹤痕跡、湊齊線索，才能找到暮霧巨龍的巢。它固定 50 級，還會用迷霧結界偏折尋常兵器。等到四十級並且找到龍巢，公佈欄會多一張清輝湖的委託。那座湖就在祭壇臺地盡頭。",
      },
    ],
    effects: [{ type: "flag", flag: "altarUnlocked" }],
  },
  forest_intro: {
    id: "forest_intro",
    lines: [
      {
        speaker: "旁白",
        text: "松針濕透。視線不過三步。遠處有低鳴，分不清是風還是野獸。",
      },
    ],
    effects: [{ type: "flag", flag: "forestIntro" }],
  },
  forest_crystal: {
    id: "forest_crystal",
    lines: [
      {
        speaker: "旁白",
        text: "巢穴最深處，霧牙巨狼倒下的土裡，蒼霧晶從根絡間鬆開。觸手微涼，像一顆還在跳動的心臟。",
      },
    ],
    effects: [
      { type: "flag", flag: "crystalForest" },
      { type: "item", itemId: "crystal_forest" },
    ],
  },
  cave_intro: {
    id: "cave_intro",
    lines: [
      {
        speaker: "旁白",
        text: "岩壁在滴水。越往深處，空氣越像要凝成實體。",
      },
    ],
    effects: [{ type: "flag", flag: "caveIntro" }],
  },
  cave_crystal: {
    id: "cave_crystal",
    lines: [
      {
        speaker: "旁白",
        text: "骨王的石座下，水池倒影裡，第二枚霧晶正慢慢旋轉。你把它撇起，掌心一片清冷。",
      },
    ],
    effects: [
      { type: "flag", flag: "crystalCave" },
      { type: "item", itemId: "crystal_cave" },
    ],
  },
  shrine_intro: {
    id: "shrine_intro",
    lines: [
      {
        speaker: "旁白",
        text: "斷柱像被巨手折過。祭壇中央空著，只剩一圈被燒過的石痕。有人——或某種東西——還在看守。",
      },
    ],
    effects: [{ type: "flag", flag: "shrineIntro" }],
  },
  shrine_boss: {
    id: "shrine_boss",
    lines: [
      {
        speaker: "暗影術士",
        portrait: "/art/darkmage.jpg",
        text: "霧晶不是給活人的。把腳步退回村子，或者留下骨頭。",
      },
    ],
    effects: [{ type: "battle", encounter: "darkmage" }],
  },
  shrine_crystal: {
    id: "shrine_crystal",
    lines: [
      {
        speaker: "旁白",
        text: "術士袖中滾出第三枚聖殿晶。三點冷光在掌心對齊，像要醒來。",
      },
    ],
    effects: [
      { type: "flag", flag: "crystalShrine" },
      { type: "item", itemId: "crystal_shrine" },
    ],
  },
  lake_intro: {
    id: "lake_intro",
    lines: [
      {
        speaker: "旁白",
        text: "霧在岸邊像被一條無形的線擋住。湖面同時映著太陽與月亮，亮得幾乎不像這個谷地。",
      },
    ],
    effects: [{ type: "flag", flag: "lakeIntro" }],
  },
  lake_bough_found: {
    id: "lake_bough_found",
    lines: [
      {
        speaker: "旁白",
        text: "你涉到湖心。水只沒過小腿，卻溫得像剛曬過的布。",
      },
      {
        speaker: "旁白",
        portrait: "/art/bough.jpg",
        text: "中央竪著一根潔白的樹枝，沒有葉子，木理裡走著金與銀的細光。霧在三步外就散開，不敢靠近。",
      },
      {
        speaker: "旁白",
        portrait: "/art/bough.jpg",
        text: "觸手微熱。你把靈枝拔起，湖面只剩一圈慢慢合據的漿漿。",
      },
    ],
    effects: [
      { type: "flag", flag: "tookBough" },
      { type: "item", itemId: "holy_bough" },
    ],
  },
  elder_bough: {
    id: "elder_bough",
    lines: [
      {
        speaker: "長老",
        portrait: "/art/elder.jpg",
        text: "……這根樹枝。我還以為清輝樹早在封印立起那年就枯了。",
      },
      {
        speaker: "長老",
        portrait: "/art/elder.jpg",
        text: "古時封龍的人，不只用三枚霧晶。他們折下一枝不被霧侵的木，把日光與月華鑄進刃裡，才能撕開龍身周的結界。",
      },
      {
        speaker: "長老",
        portrait: "/art/elder.jpg",
        text: "把三枚霧晶和這根清輝靈枝交給我。你已四十級、也找到了龍巢——我可以依你的職業，鑄成黎明神劍、破曉聖杖，或黃昏光弓。沒有它，你仍能與龍一戰——只是尋常兵器會被結界折成三分之一，一半的攻擊還會落空。",
      },
    ],
    effects: [{ type: "flag", flag: "canForgeLegend" }],
  },
  legend_forged: {
    id: "legend_forged",
    lines: [
      {
        speaker: "長老",
        portrait: "/art/elder.jpg",
        text: "晶與枝在爐裡化成一條光。霧在屋簷外退了半步。",
      },
      {
        speaker: "旁白",
        text: "傳說武器落在你掌心，比密銀還輕，卻熱得像剛升起的太陽。",
      },
      {
        speaker: "長老",
        portrait: "/art/elder.jpg",
        text: "巢穴就在裂縫裡。結界遇見這把東西，會自己裂開。去潛入吧。",
      },
    ],
    effects: [{ type: "flag", flag: "legendForged" }],
  },
  altar_intro: {
    id: "altar_intro",
    lines: [
      {
        speaker: "旁白",
        text: "臺地被爪與火犁過。裂縫在祭壇中央呼吸。遠處湖面卻亮著——日光與月光同時落在水上，霧在岸邊停住。",
      },
      {
        speaker: "旁白",
        text: "龍不在眼前。像森林、洞穴與神殿一樣，你得跟著痕跡走，才能找到它的巢。",
      },
    ],
    effects: [{ type: "flag", flag: "altarIntro" }],
  },
  altar_locked: {
    id: "altar_locked",
    lines: [
      {
        speaker: "旁白",
        text: "祭壇拒絕未持齊霧晶的人。裂縫裡有呼吸，但門還沒開。",
      },
    ],
  },
  dragon_intro: {
    id: "dragon_intro",
    lines: [
      {
        speaker: "旁白",
        text: "三枚霧晶嵌入石槽。暮霧裂開。一頭龍從雲裡落下，鱗片像浸透月光的鐵。它身上壓著固定的 50 級威壓，身周結界把尋常兵器折成三分之一，一半的攻擊會落空。",
      },
      {
        speaker: "暮霧巨龍",
        portrait: "/art/dragon.jpg",
        text: "……封我的人已經成為塵土。你憑什麼再走這一遭？",
      },
    ],
    effects: [{ type: "battle", encounter: "dragon" }],
  },
  ending: {
    id: "ending",
    lines: [
      {
        speaker: "旁白",
        text: "龍的身黨化作一場散去的霧。谷地第一次露出真正的晨光。",
      },
      {
        speaker: "長老",
        portrait: "/art/elder.jpg",
        text: "你做到了。霧谷會記得這個名字。去休息吧——燈火還在，而且比以前更亮。",
      },
    ],
    effects: [{ type: "ending" }],
  },
};

export const STARTER_WEAPON: Record<ClassId, string> = {
  warrior: "rusty_sword",
  mage: "oak_staff",
  ranger: "hunter_bow",
};

export const DEFAULT_NAME: Record<ClassId, string> = {
  warrior: "艾登",
  mage: "希薇",
  ranger: "羅安",
};

export function emptyStatus(): {
  stun: number;
  poison: number;
  atkUp: number;
  defUp: number;
  spdDown: number;
  evade: number;
  tameBoost: number;
  defending: boolean;
} {
  return {
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

export function xpToNext(level: number): number {
  return Math.floor(32 * Math.pow(level, 1.42));
}

export const FINAL_BOSS_LEVEL = 50;

export function scaledStats(base: Stats, growth: Stats, level: number): Stats {
  const n = Math.max(0, level - 1);
  return {
    hp: base.hp + growth.hp * n,
    mp: base.mp + growth.mp * n,
    atk: base.atk + growth.atk * n,
    mag: base.mag + growth.mag * n,
    def: base.def + growth.def * n,
    spd: base.spd + growth.spd * n,
  };
}

export function enemyScaleLevel(monsterId: string, heroLevel: number) {
  const fixed = MONSTERS[monsterId]?.fixedLevel;
  if (fixed) return Math.max(1, Math.min(LEVEL_CAP, fixed));
  return Math.max(1, Math.min(LEVEL_CAP, heroLevel));
}

export function scaleMonsterStats(base: Stats, level: number): Stats {
  const n = Math.max(0, level - 1);
  return {
    hp: Math.max(1, Math.round(base.hp * (1 + 0.11 * n))),
    mp: Math.max(0, Math.round(base.mp * (1 + 0.08 * n))),
    atk: Math.max(1, Math.round(base.atk * (1 + 0.1 * n))),
    mag: Math.max(1, Math.round(base.mag * (1 + 0.1 * n))),
    def: Math.max(1, Math.round(base.def * (1 + 0.09 * n))),
    spd: Math.max(1, Math.round(base.spd * (1 + 0.05 * n))),
  };
}

export function scaleReward(base: number, heroLevel: number) {
  return Math.max(0, Math.round(base * (1 + 0.16 * Math.max(0, heroLevel - 1))));
}

export function skillLearnLevel(id: string) {
  return SKILLS[id]?.learnLevel ?? 1;
}

export function learnedClassSkills(classId: ClassId, level: number) {
  const cls = CLASSES[classId] ?? CLASSES.warrior;
  return cls.skills.filter((id) => skillLearnLevel(id) <= level);
}

export function skillsLearnedAt(classId: ClassId, fromLevel: number, toLevel: number) {
  const cls = CLASSES[classId] ?? CLASSES.warrior;
  return cls.skills.filter((id) => {
    const lv = skillLearnLevel(id);
    return lv > fromLevel && lv <= toLevel;
  });
}

export function shopNotesOnFlag(level: number, newFlag: string) {
  return SHOP_TIERS.filter((t) => t.flag === newFlag && level >= t.level).map(
    (t) => `雜貨鋪進了 ${t.level} 級的新貨。`,
  );
}

export function petGrowth(): Stats {
  return { hp: 8, mp: 3, atk: 2, mag: 1, def: 1, spd: 1 };
}

export function hasCrystals(flags: Record<string, boolean>): boolean {
  return Boolean(flags.crystalForest && flags.crystalCave && flags.crystalShrine);
}

export const LEGEND_WEAPONS: Record<ClassId, string> = {
  warrior: "legend_sword",
  mage: "legend_staff",
  ranger: "legend_bow",
};

export const LEGEND_WEAPON_IDS = Object.values(LEGEND_WEAPONS);

export function isLegendWeapon(itemId: string | null | undefined) {
  return Boolean(itemId && LEGEND_WEAPON_IDS.includes(itemId));
}

export function legendQuestAvailable(level: number, flags: Record<string, boolean>) {
  return level >= 40 && hasCrystals(flags) && Boolean(flags.dragonNestFound);
}

export function isQuestListed(
  def: QuestDef,
  level: number,
  flags: Record<string, boolean>,
) {
  if (def.requireLevel && level < def.requireLevel) return false;
  if (def.requireCrystals && !hasCrystals(flags)) return false;
  if (def.requireNest && !flags.dragonNestFound) return false;
  return true;
}

export function locationLocked(loc: { lockedUntil?: string }, flags: Record<string, boolean>) {
  if (loc.lockedUntil === "crystals") return !hasCrystals(flags);
  return false;
}

export function canForgeLegend(
  hero: { classId: ClassId; level: number } | null,
  flags: Record<string, boolean>,
  inv: { itemId: string; qty: number }[],
) {
  if (!hero || hero.level < 40) return false;
  if (!flags.canForgeLegend || flags.legendForged) return false;
  if (!flags.dragonNestFound) return false;
  if (!hasCrystals(flags)) return false;
  if (countItem(inv, "holy_bough") < 1) return false;
  if (countItem(inv, "crystal_forest") < 1) return false;
  if (countItem(inv, "crystal_cave") < 1) return false;
  if (countItem(inv, "crystal_shrine") < 1) return false;
  return true;
}

export function pickWeighted<T extends { weight: number }>(rows: T[]): T {
  const total = rows.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const row of rows) {
    roll -= row.weight;
    if (roll <= 0) return row;
  }
  return rows[rows.length - 1];
}
