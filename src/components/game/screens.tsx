import { useEffect, useRef, useState } from "react";
import { AREA_HUNTS, CLASSES, CLUE_NEED, DEFAULT_NAME, DIALOGUES, ITEMS, LOCATIONS, QUESTS, SKILLS, canForgeLegend, isQuestReady, learnedClassSkills } from "@/game/data";
import { currentActor } from "@/game/combat";
import { CLASS_ART, preloadArt } from "@/game/art";
import { cn } from "@/lib/utils";
import { useGame } from "@/game/store";
import { hasContinueSave, readResume } from "@/game/saves";
import type { ClassId } from "@/game/types";
import { GButton, Portrait, SceneImage, StatBar } from "./chrome";
import { BattleFxLayer, CombatCard, useFxShake } from "./BattleFx";

export function TitleScreen() {
  const hero = useGame((s) => s.hero);
  const slotsTick = useGame((s) => s.slotsTick);
  const hydrated = useGame((s) => s.hydrated);
  const newGame = useGame((s) => s.newGame);
  const continueGame = useGame((s) => s.continueGame);
  const setPanel = useGame((s) => s.setPanel);
  const locationId = useGame((s) => s.locationId);
  const [confirmNew, setConfirmNew] = useState(false);
  const resume = readResume();
  const canContinue = hydrated && hasContinueSave(Boolean(hero));
  const preview = resume?.preview ?? (hero
    ? { name: hero.name, classId: hero.classId, level: hero.level, locationId }
    : null);
  void slotsTick;
  const className = preview ? CLASSES[preview.classId]?.name : undefined;

  return (
    <div className="relative flex min-h-dvh flex-col justify-end overflow-hidden">
      <SceneImage src="/art/title.jpg" priority />
      <div className="scene-veil absolute inset-0" />
      <div className="relative z-10 flex flex-col items-start gap-5 px-6 pb-16 pt-10 sm:px-12">
        <p className="font-display text-sm tracking-[0.35em] text-accent">MISTVALE</p>
        <h1 className="font-display text-5xl font-semibold leading-none sm:text-6xl">霧谷傳說</h1>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          山谷被霧吞了三個月。取回三枚霧晶，馳服願意跟隨的生靈，把裂縫重新封上。
        </p>
        <div className="flex w-full max-w-sm flex-col gap-2">
          <GButton variant={canContinue ? "primary" : "ghost"} wide onClick={continueGame} disabled={!hydrated || !canContinue}>
            {hydrated ? "繼續冒險" : "讀取中…"}
          </GButton>
          {preview && canContinue ? (
            <p className="px-1 text-xs text-muted">
              {preview.name}　{className ?? ""} Lv.{preview.level}
              {preview.locationId ? `　${LOCATIONS[preview.locationId]?.name ?? ""}` : ""}
            </p>
          ) : (
            <p className="px-1 text-xs text-muted">
              {hydrated ? "尚無進度。開始一段新的冒險吧。" : "正在讀取本機存檔。"}
            </p>
          )}
          {confirmNew ? (
            <div className="space-y-2 rounded-lg border border-border bg-surface/90 p-3">
              <p className="text-sm leading-relaxed text-muted">
                未寫入分檔的進度會被覆蓋。已存的檔案不會消失。
              </p>
              <div className="flex gap-2">
                <GButton variant="primary" wide onClick={newGame}>
                  確定開新檔
                </GButton>
                <GButton wide onClick={() => setConfirmNew(false)}>
                  取消
                </GButton>
              </div>
            </div>
          ) : (
            <GButton
              variant={canContinue ? "ghost" : "primary"}
              wide
              disabled={!hydrated}
              onClick={() => (canContinue ? setConfirmNew(true) : newGame())}
            >
              新的冒險
            </GButton>
          )}
          <GButton wide disabled={!hydrated} onClick={() => setPanel("system")}>
            讀取分檔
          </GButton>
        </div>
      </div>
    </div>
  );
}

export function CreateScreen() {
  const createHero = useGame((s) => s.createHero);
  const goTitle = useGame((s) => s.goTitle);
  const [classId, setClassId] = useState<ClassId>("warrior");
  const [name, setName] = useState(DEFAULT_NAME.warrior);
  const cls = CLASSES[classId];

  useEffect(() => {
    preloadArt(...CLASS_ART);
  }, []);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col overflow-y-auto px-4 py-6">
      <p className="font-display text-sm tracking-[0.3em] text-accent">CHOOSE</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">選擇職業</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">戰士守線、法師破局、遊俠最容易與野獸締結。</p>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        {(Object.keys(CLASSES) as ClassId[]).map((id) => {
          const c = CLASSES[id];
          const on = id === classId;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setClassId(id);
                setName(DEFAULT_NAME[id]);
              }}
              className={cn(
                "overflow-hidden rounded-xl border text-left",
                on ? "border-accent" : "border-border",
              )}
            >
              <Portrait src={c.portrait} alt={c.name} className="h-28 w-full sm:h-44" />
              <span className="block bg-surface px-2 py-2 sm:px-3 sm:py-3">
                <span className="block text-sm font-medium">{c.name}</span>
                <span className="mt-1 hidden text-xs leading-relaxed text-muted sm:block">{c.blurb}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-muted sm:hidden">{cls.blurb}</p>
      <label className="mt-6 block text-sm text-muted">
        名字
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 8))}
          className="mt-2 min-h-11 w-full rounded-md border border-border bg-raised px-3 text-fg outline-none focus:border-accent"
        />
      </label>
      <div className="mt-4 rounded-lg border border-border bg-surface p-4 text-sm">
        <p className="text-muted">{cls.title} · 初始技能（其餘每 5 級覺醒）</p>
        <p className="mt-2">{learnedClassSkills(classId, 1).map((id) => SKILLS[id]?.name).filter(Boolean).join("　")}</p>
        <p className="mt-2 text-xs text-faint">
          {cls.skills
            .map((id) => SKILLS[id])
            .filter((sk) => sk && (sk.learnLevel ?? 1) > 1)
            .slice(0, 3)
            .map((sk) => `${sk!.learnLevel} 級 ${sk!.name}`)
            .join("　")}
          …
        </p>
      </div>
      <GButton className="mt-6" variant="primary" wide onClick={() => createHero(name, classId)}>
        踏入霧中
      </GButton>
      <GButton className="mt-2 mb-10" wide onClick={goTitle}>
        返回標題
      </GButton>
    </div>
  );
}

export function DialogueScreen() {
  const dialogue = useGame((s) => s.dialogue);
  const advance = useGame((s) => s.advanceDialogue);
  const loc = useGame((s) => s.locationId);
  const scene = LOCATIONS[loc]?.scene ?? "/art/title.jpg";
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance]);
  if (!dialogue) return null;
  const def = DIALOGUES[dialogue.id];
  const lines = dialogue.lines ?? def?.lines;
  const line = lines?.[dialogue.index];
  if (!line) return null;
  return (
    <button
      type="button"
      onClick={advance}
      className="relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden text-left"
    >
      <SceneImage src={scene} />
      <div className="scene-veil absolute inset-0" />
      {line.portrait ? (
        <Portrait
          src={line.portrait}
          alt={line.speaker}
          className="absolute bottom-36 right-0 h-[58%] max-h-[28rem] w-auto max-w-[46%] object-contain sm:right-8"
        />
      ) : null}
      <div className="game-panel relative z-10 mx-3 mb-4 rounded-xl p-4 sm:mx-8 sm:p-5">
        <p className="text-xs tracking-widest text-accent">{line.speaker}</p>
        <p className="mt-2 text-base leading-relaxed">{line.text}</p>
        <p className="mt-3 text-xs text-faint">點擊或空白鍵繼續</p>
      </div>
    </button>
  );
}

export function WorldScreen() {
  const locationId = useGame((s) => s.locationId);
  const loc = LOCATIONS[locationId] ?? LOCATIONS.village;
  const explore = useGame((s) => s.explore);
  const inspectLake = useGame((s) => s.inspectLake);
  const enterNest = useGame((s) => s.enterNest);
  const talkElder = useGame((s) => s.talkElder);
  const forgeLegend = useGame((s) => s.forgeLegend);
  const restInn = useGame((s) => s.restInn);
  const setPanel = useGame((s) => s.setPanel);
  const travel = useGame((s) => s.travel);
  const quests = useGame((s) => s.quests) ?? {};
  const inventory = useGame((s) => s.inventory);
  const pets = useGame((s) => s.pets);
  const exploreCount = useGame((s) => s.exploreCount) ?? {};
  const hunts = useGame((s) => s.hunts) ?? {};
  const hero = useGame((s) => s.hero);
  const flags = useGame((s) => s.flags);

  useEffect(() => {
    preloadArt(loc.scene, ...(loc.connected ?? []).map((id) => LOCATIONS[id]?.scene));
  }, [loc]);

  const village = locationId === "village";
  const huntDef = AREA_HUNTS[locationId];
  const hunt = hunts[locationId];
  const trips = exploreCount[locationId] ?? 0;
  const forgeReady = canForgeLegend(hero, flags, inventory);
  const lakeQuest = quests.lake_bough;
  const lakeAccepted = lakeQuest && lakeQuest.status !== "done";
  const haveBough = flags.tookBough || inventory.some((e) => e.itemId === "holy_bough");
  const activeHere = Object.values(quests).filter((q) => {
    if (q.status === "done") return false;
    const def = QUESTS[q.id];
    return def && (!def.locationId || def.locationId === locationId);
  });
  const readyCount = Object.values(quests).filter((q) => {
    const def = QUESTS[q.id];
    return def ? isQuestReady(def, q, inventory, pets) : false;
  }).length;

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <SceneImage src={loc.scene} priority />
      <div className="scene-veil absolute inset-0" />
      <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-6">
        <div className="game-panel max-w-xl rounded-xl p-4">
          <h2 className="font-display text-2xl font-semibold">{loc.name}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{loc.blurb}</p>
          {huntDef ? (
            <p className="mt-2 text-xs text-muted">
              {hunt?.bossDefeated
                ? `${huntDef.bossName}已被擊敗。${huntDef.clearedText ?? "關鍵道具已取得。"}`
                : hunt?.nestFound
                  ? `已發現${huntDef.bossName}的巢穴。探險 ${trips} 回。${locationId === "altar" ? "　固定 50 級" : ""}`
                  : hunt && hunt.clues > 0
                    ? `探險 ${trips} 回　線索 ${hunt.clues}/${CLUE_NEED}`
                    : `探險 ${trips} 回　尚未發現明確痕跡`}
              {hero && !hunt?.bossDefeated ? `　魔物 Lv.${hero.level}` : ""}
            </p>
          ) : locationId === "lake" ? (
            <p className="mt-2 text-xs text-muted">
              {haveBough ? "湖心空了。靈枝已取走。" : "湖心竪著一件發白的物體。"}
            </p>
          ) : null}
          {activeHere.length > 0 ? (
            <ul className="mt-3 space-y-1 text-xs text-muted">
              {activeHere.map((q) => {
                const def = QUESTS[q.id];
                const ready = isQuestReady(def, q, inventory, pets);
                return (
                  <li key={q.id}>
                    {ready ? "可回報" : "進行中"}　{def.title}
                    {def.kind === "hunt" ? `　${q.progress}/${def.count}` : ""}
                  </li>
                );
              })}
            </ul>
          ) : null}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {village ? (
              <>
                <GButton onClick={talkElder}>與長老交談</GButton>
                <GButton onClick={restInn}>旅店歇息</GButton>
                <GButton onClick={() => setPanel("shop")}>雜貨鋪</GButton>
                <GButton onClick={() => setPanel("smith")}>鐵匠</GButton>
                <GButton onClick={() => setPanel("board")}>
                  公佈欄{readyCount ? `　${readyCount}` : ""}
                </GButton>
                <GButton variant="primary" onClick={() => setPanel("map")}>
                  出發
                </GButton>
                {forgeReady ? (
                  <GButton className="col-span-2" variant="primary" onClick={forgeLegend}>
                    請長老鑄造傳說武器
                  </GButton>
                ) : null}
              </>
            ) : locationId === "lake" ? (
              <>
                <GButton variant="primary" onClick={inspectLake}>
                  走向湖心
                </GButton>
                <GButton onClick={() => travel("altar")}>返回祭壇</GButton>
              </>
            ) : (
              <>
                <GButton variant="primary" onClick={explore}>
                  探索
                </GButton>
                <GButton onClick={() => travel("village")}>返回村子</GButton>
                {locationId === "altar" && lakeAccepted && !haveBough ? (
                  <GButton className="col-span-2" onClick={inspectLake}>
                    走向清輝湖
                  </GButton>
                ) : null}
                {huntDef && hunt?.nestFound && !hunt.bossDefeated ? (
                  <GButton className="col-span-2" variant="primary" onClick={enterNest}>
                    潛入巢穴
                  </GButton>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BattleScreen() {
  const battle = useGame((s) => s.battle);
  const hero = useGame((s) => s.hero);
  const inventory = useGame((s) => s.inventory);
  const pets = useGame((s) => s.pets);
  const chooseBattle = useGame((s) => s.chooseBattle);
  const pickTarget = useGame((s) => s.pickTarget);
  const battleDefend = useGame((s) => s.battleDefend);
  const cancelBattleMenu = useGame((s) => s.cancelBattleMenu);
  const setBattleMenu = useGame((s) => s.setBattleMenu);
  const finishBattle = useGame((s) => s.finishBattle);
  const continueAfterDefeat = useGame((s) => s.continueAfterDefeat);
  const runAutos = useGame((s) => s.runAutos);
  const loc = LOCATIONS[battle?.locationId ?? "forest"] ?? LOCATIONS.forest;
  const stageRef = useRef<HTMLDivElement>(null);
  const shake = useFxShake(battle?.fx);

  useEffect(() => {
    if (!battle) return;
    preloadArt(loc.scene, ...battle.combatants.map((c) => c.portrait));
  }, [battle, loc.scene]);

  useEffect(() => {
    if (!battle) return;
    if (battle.phase !== "input") return;
    const actor = currentActor(battle);
    if (actor && actor.kind !== "hero") {
      const t = window.setTimeout(() => runAutos(), 700);
      return () => window.clearTimeout(t);
    }
  }, [battle, runAutos]);

  if (!battle || !hero) return null;
  const actor = currentActor(battle);
  const heroTurn = battle.phase === "input" && actor?.kind === "hero";
  const enemies = battle.combatants.filter((c) => c.side === "enemy");
  const allies = battle.combatants.filter((c) => c.side === "ally");
  const pending = battle.pending;
  const pendingSkill = pending?.type === "skill" ? SKILLS[pending.skillId] : undefined;
  const needEnemy =
    pending != null &&
    (pending.type === "attack" ||
      pending.type === "tame" ||
      (pending.type === "skill" && pendingSkill?.target === "enemy"));
  const needAlly =
    pending != null &&
    (pending.type === "item" || (pending.type === "skill" && pendingSkill?.target === "ally"));
  const canTame =
    heroTurn &&
    pets.length < 3 &&
    enemies.some((e) => e.hp > 0 && e.canTame);
  const consumables = inventory.filter((e) => ITEMS[e.itemId]?.kind === "consumable");

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <SceneImage src={loc.scene} />
      <div className="absolute inset-0 bg-bg/55" />
      <div
        ref={stageRef}
        className={cn("relative z-10 flex min-h-0 flex-1 flex-col p-3 sm:p-4", shake && "fx-stage-shake")}
      >
        <BattleFxLayer stageRef={stageRef} fx={battle.fx} />
        <div className="flex justify-center gap-3">
          {enemies.map((c) => (
            <CombatCard
              key={c.id}
              c={c}
              fx={battle.fx}
              side="enemy"
              disabled={battle.menu !== "target" || c.hp <= 0 || !needEnemy}
              selected={battle.menu === "target" && c.hp > 0 && needEnemy}
              onClick={() => pickTarget(c.id)}
            />
          ))}
        </div>

        <div className="game-panel mt-3 h-24 shrink-0 overflow-y-auto rounded-lg px-3 py-2 text-xs leading-relaxed text-muted sm:h-28">
          {battle.log.slice(-8).map((line, i) => (
            <p key={`${i}-${line}`} className="py-0.5">
              {line}
            </p>
          ))}
        </div>

        <div className="mt-3 flex shrink-0 items-end justify-between gap-3">
          {allies.map((c) => (
            <CombatCard
              key={c.id}
              c={c}
              fx={battle.fx}
              side="ally"
              compact
              disabled={battle.menu !== "target" || c.hp <= 0 || !needAlly}
              selected={battle.menu === "target" && needAlly}
              active={actor?.id === c.id}
              onClick={() => pickTarget(c.id)}
            />
          ))}
        </div>

        <div className="mt-3 shrink-0 pb-2">
          {battle.phase === "victory" ? (
            <div className="game-panel rounded-xl p-4">
              <p className="font-display text-xl">勝利</p>
              {battle.tamed ? (
                <p className="mt-2 text-sm text-muted">{battle.tamed.name} 願意跟隨你。</p>
              ) : (
                <p className="mt-2 text-sm text-muted">
                  經驗 {battle.lootXp}　金幣 {battle.lootGold}
                  {battle.lootItems.length
                    ? `　${battle.lootItems.map((i) => ITEMS[i.itemId]?.name).join("、")}`
                    : ""}
                </p>
              )}
              <GButton className="mt-4" variant="primary" wide onClick={finishBattle}>
                繼續
              </GButton>
            </div>
          ) : battle.phase === "defeat" ? (
            <div className="game-panel rounded-xl p-4">
              <p className="font-display text-xl">戰敗</p>
              <p className="mt-2 text-sm text-muted">霧把你送回村子。金幣會少一些，人還在就好。</p>
              <GButton className="mt-4" variant="primary" wide onClick={continueAfterDefeat}>
                回到霧谷村
              </GButton>
            </div>
          ) : !heroTurn ? (
            <p className="px-1 text-xs text-muted">{actor ? `${actor.name} 的回合` : "……"}</p>
          ) : battle.menu === "skills" ? (
            <div className="grid grid-cols-2 gap-2">
              {learnedClassSkills(hero.classId, hero.level).map((id) => {
                const sk = SKILLS[id];
                if (!sk) return null;
                const hc = battle.combatants.find((c) => c.kind === "hero");
                return (
                  <GButton
                    key={id}
                    disabled={!hc || hc.mp < sk.mp}
                    onClick={() => chooseBattle({ type: "skill", skillId: id })}
                  >
                    {sk.name}
                    <span className="text-xs text-mp">{sk.mp}</span>
                  </GButton>
                );
              })}
              <GButton className="col-span-2" variant="subtle" onClick={cancelBattleMenu}>
                返回
              </GButton>
            </div>
          ) : battle.menu === "items" ? (
            <div className="grid grid-cols-2 gap-2">
              {consumables.length === 0 ? (
                <p className="col-span-2 text-sm text-muted">沒有可用道具。</p>
              ) : (
                consumables.map((e) => (
                  <GButton key={e.itemId} onClick={() => chooseBattle({ type: "item", itemId: e.itemId })}>
                    {ITEMS[e.itemId].name}
                    <span className="text-xs text-muted">×{e.qty}</span>
                  </GButton>
                ))
              )}
              <GButton className="col-span-2" variant="subtle" onClick={cancelBattleMenu}>
                返回
              </GButton>
            </div>
          ) : battle.menu === "target" ? (
            <p className="text-sm text-muted">
              選擇目標
              <GButton className="ml-3" variant="subtle" onClick={cancelBattleMenu}>
                取消
              </GButton>
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              <GButton variant="primary" onClick={() => chooseBattle({ type: "attack" })}>
                攻擊
              </GButton>
              <GButton onClick={() => setBattleMenu("skills")}>技能</GButton>
              <GButton onClick={() => setBattleMenu("items")}>道具</GButton>
              <GButton onClick={battleDefend}>防禦</GButton>
              <GButton disabled={!canTame} onClick={() => chooseBattle({ type: "tame" })}>
                馳服
              </GButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function EndingScreen() {
  const hero = useGame((s) => s.hero);
  const newGame = useGame((s) => s.newGame);
  const goTitle = useGame((s) => s.goTitle);
  const setPanel = useGame((s) => s.setPanel);
  return (
    <div className="relative flex min-h-dvh flex-col justify-end">
      <SceneImage src="/art/title.jpg" />
      <div className="scene-veil absolute inset-0" />
      <div className="relative z-10 px-6 pb-16 sm:px-12">
        <p className="font-display text-sm tracking-[0.35em] text-accent">CLEAR</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">晨光回來了</h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">
          {hero?.name ?? "旅人"} 把裂縫重新封上。霧谷的燈比以前更亮。這只是原型的終點——山谷裡還有更深的路。
        </p>
        <div className="mt-6 flex max-w-xs flex-col gap-2">
          <GButton variant="primary" wide onClick={newGame}>
            再走一次
          </GButton>
          <GButton wide onClick={() => setPanel("system")}>
            存檔
          </GButton>
          <GButton wide onClick={goTitle}>
            回標題
          </GButton>
        </div>
      </div>
    </div>
  );
}
