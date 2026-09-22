import { useEffect, useState } from "react";
import {
  BOARD_QUEST_IDS,
  CLASSES,
  ITEMS,
  LOCATIONS,
  MONSTERS,
  QUESTS,
  SKILLS,
  isQuestListed,
  isQuestReady,
  legendQuestAvailable,
  liveQuestProgress,
  locationLocked,
  shopCatalog,
  skillLearnLevel,
} from "@/game/data";
import { deriveHeroStats, derivePetStats } from "@/game/combat";
import { preloadArt } from "@/game/art";
import { useGame } from "@/game/store";
import { SLOT_COUNT, readResume, readSlots } from "@/game/saves";
import { CrystalStrip, GButton, ItemLine, Portrait, StatBar, XpLine } from "./chrome";
import { cn } from "@/lib/utils";

export function Overlay({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-bg/70 p-3 sm:items-center">
      <div className="game-panel flex max-h-[min(88dvh,40rem)] w-full max-w-lg flex-col rounded-xl">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <GButton variant="subtle" onClick={onClose} className="min-h-10 px-3">
            關閉
          </GButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export function InventoryPanel() {
  const inventory = useGame((s) => s.inventory);
  const hero = useGame((s) => s.hero);
  const setPanel = useGame((s) => s.setPanel);
  const useItem = useGame((s) => s.useItem);
  const equip = useGame((s) => s.equip);
  const sell = useGame((s) => s.sell);
  const screen = useGame((s) => s.screen);
  if (!hero) return null;

  return (
    <Overlay title="背包" onClose={() => setPanel(null)}>
      <div className="mb-4 grid gap-2 text-sm text-muted">
        <p>
          武器 {ITEMS[hero.weaponId ?? ""]?.name ?? "無"}
          {hero.weaponPlus ? ` +${hero.weaponPlus}` : ""}
        </p>
        <p>
          防具 {ITEMS[hero.armorId ?? ""]?.name ?? "無"}
          {hero.armorPlus ? ` +${hero.armorPlus}` : ""}
        </p>
      </div>
      <ul className="space-y-2">
        {inventory.length === 0 ? (
          <li className="text-sm text-muted">背包是空的。</li>
        ) : (
          inventory.map((e) => {
            const item = ITEMS[e.itemId];
            if (!item) return null;
            const equipped = hero.weaponId === e.itemId || hero.armorId === e.itemId;
            return (
              <li
                key={e.itemId}
                className="flex items-center gap-3 rounded-lg border border-border bg-raised/60 p-3"
              >
                <ItemLine itemId={e.itemId} qty={e.qty} />
                <div className="ml-auto flex shrink-0 gap-1">
                  {item.kind === "consumable" && screen !== "battle" ? (
                    <GButton className="min-h-10 px-3 text-xs" onClick={() => useItem(e.itemId)}>
                      使用
                    </GButton>
                  ) : null}
                  {item.kind === "weapon" || item.kind === "armor" ? (
                    <GButton
                      className="min-h-10 px-3 text-xs"
                      variant={equipped ? "primary" : "ghost"}
                      onClick={() => equip(e.itemId)}
                      disabled={equipped}
                    >
                      {equipped ? "已裝備" : "裝備"}
                    </GButton>
                  ) : null}
                  {item.kind !== "key" && item.sell > 0 && !equipped && screen === "world" ? (
                    <GButton className="min-h-10 px-3 text-xs" variant="subtle" onClick={() => sell(e.itemId)}>
                      賣
                    </GButton>
                  ) : null}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </Overlay>
  );
}

export function SkillsPanel() {
  const hero = useGame((s) => s.hero);
  const setPanel = useGame((s) => s.setPanel);
  if (!hero) return null;
  const cls = CLASSES[hero.classId] ?? CLASSES.warrior;
  return (
    <Overlay title="技能" onClose={() => setPanel(null)}>
      <p className="mb-4 text-sm text-muted">
        {cls.blurb} 技能每隔 5 級覺醒一招，不是一開始就會全部。
      </p>
      <ul className="space-y-2">
        {cls.skills.map((id) => {
          const sk = SKILLS[id];
          if (!sk) return null;
          const need = skillLearnLevel(id);
          const locked = hero.level < need;
          return (
            <li
              key={id}
              className={cn("rounded-lg border border-border bg-raised/60 p-3", locked && "opacity-50")}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium">{sk.name}</p>
                <p className="text-xs tabular-nums text-mp">{locked ? `${need} 級學會` : `MP ${sk.mp}`}</p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{sk.desc}</p>
            </li>
          );
        })}
      </ul>
    </Overlay>
  );
}

export function PartyPanel() {
  const hero = useGame((s) => s.hero);
  const pets = useGame((s) => s.pets);
  const setPanel = useGame((s) => s.setPanel);
  const setActivePet = useGame((s) => s.setActivePet);
  const releasePet = useGame((s) => s.releasePet);
  if (!hero) return null;
  const stats = deriveHeroStats(hero);
  const cls = CLASSES[hero.classId];

  return (
    <Overlay title="隊伍" onClose={() => setPanel(null)}>
      <div className="mb-4 flex gap-3 rounded-lg border border-border bg-raised/60 p-3">
        <Portrait src={cls.portrait} alt={hero.name} className="h-20 w-16 rounded-md" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {hero.name} · {cls.name} Lv.{hero.level}
          </p>
          <p className="mt-1 text-xs tabular-nums text-muted">
            攻 {stats.atk}　魔 {stats.mag}　防 {stats.def}　速 {stats.spd}
          </p>
          <div className="mt-2 grid gap-2">
            <StatBar value={hero.hp} max={stats.hp} tone="hp" label="生命" />
            <StatBar value={hero.mp} max={stats.mp} tone="mp" label="魔力" />
            <XpLine />
          </div>
        </div>
      </div>
      <h3 className="mb-2 text-sm text-muted">同伴（出戰一位）</h3>
      {pets.length === 0 ? (
        <p className="text-sm text-muted">尚未馴服任何魔物。戰鬥中削弱後可嘗試馴服。</p>
      ) : (
        <ul className="space-y-2">
          {pets.map((p) => {
            const st = derivePetStats(p);
            return (
              <li key={p.id} className="flex gap-3 rounded-lg border border-border bg-raised/60 p-3">
                <Portrait src={`/art/${p.monsterId}.jpg`} alt={p.name} className="h-16 w-12 rounded-md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    {p.name}
                    <span className="ml-2 text-xs text-muted">Lv.{p.level}</span>
                    {p.active ? <span className="ml-2 text-xs text-accent">出戰</span> : null}
                  </p>
                  <div className="mt-2">
                    <StatBar value={p.hp} max={st.hp} tone="hp" />
                  </div>
                  <div className="mt-2 flex gap-1">
                    <GButton
                      className="min-h-10 px-3 text-xs"
                      variant={p.active ? "primary" : "ghost"}
                      disabled={p.active}
                      onClick={() => setActivePet(p.id)}
                    >
                      出戰
                    </GButton>
                    <GButton className="min-h-10 px-3 text-xs" variant="danger" onClick={() => releasePet(p.id)}>
                      釋放
                    </GButton>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Overlay>
  );
}

export function MapPanel() {
  const locationId = useGame((s) => s.locationId);
  const flags = useGame((s) => s.flags);
  const setPanel = useGame((s) => s.setPanel);
  const travel = useGame((s) => s.travel);

  useEffect(() => {
    preloadArt(...Object.values(LOCATIONS).map((l) => l.scene));
  }, []);

  return (
    <Overlay title="地圖" onClose={() => setPanel(null)}>
      <CrystalStrip />
      <ul className="mt-3 space-y-2">
        {Object.values(LOCATIONS).map((loc) => {
          const locked = locationLocked(loc, flags);
          if (loc.id === "lake") return null;
          const here = loc.id === locationId;
          return (
            <li key={loc.id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => {
                  travel(loc.id);
                  setPanel(null);
                }}
                className={cn(
                  "flex w-full gap-3 overflow-hidden rounded-lg border border-border text-left",
                  here ? "bg-raised" : "bg-surface",
                  locked && "opacity-40",
                )}
              >
                <Portrait src={loc.scene} alt="" className="h-20 w-28" />
                <span className="flex min-w-0 flex-1 flex-col justify-center py-2 pr-3">
                  <span className="text-sm font-medium">
                    {loc.name}
                    {here ? <span className="ml-2 text-xs text-accent">此地</span> : null}
                    {locked ? <span className="ml-2 text-xs text-muted">未解鎖</span> : null}
                  </span>
                  <span className="mt-1 line-clamp-2 text-xs text-muted">{loc.blurb}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Overlay>
  );
}

export function ShopPanel() {
  const gold = useGame((s) => s.gold);
  const hero = useGame((s) => s.hero);
  const flags = useGame((s) => s.flags);
  const setPanel = useGame((s) => s.setPanel);
  const buy = useGame((s) => s.buy);
  const rows = shopCatalog(hero?.level ?? 1, flags);
  return (
    <Overlay title="雜貨鋪" onClose={() => setPanel(null)}>
      <p className="mb-3 text-sm text-muted">
        持有 {gold} 金。密銀是店裡最後一批兵器。傳說武器要四十級、找到龍巢，再去公佈欄接清輝湖的委託。
      </p>
      <ul className="space-y-2">
        {rows.map(({ id, locked }) => {
          const item = ITEMS[id];
          if (!item) return null;
          return (
            <li
              key={id}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-border bg-raised/60 p-3",
                locked && "opacity-55",
              )}
            >
              <ItemLine itemId={id} />
              {locked ? (
                <p className="ml-auto max-w-[9rem] shrink-0 text-right text-xs text-muted">{locked}</p>
              ) : (
                <GButton className="ml-auto min-h-10 shrink-0 px-3 text-xs" onClick={() => buy(id)}>
                  {item.price} 金
                </GButton>
              )}
            </li>
          );
        })}
      </ul>
    </Overlay>
  );
}

export function SmithPanel() {
  const hero = useGame((s) => s.hero);
  const gold = useGame((s) => s.gold);
  const setPanel = useGame((s) => s.setPanel);
  const smithUpgrade = useGame((s) => s.smithUpgrade);
  if (!hero) return null;
  const wCost = 40 * (hero.weaponPlus + 1);
  const aCost = 40 * (hero.armorPlus + 1);
  return (
    <Overlay title="鐵匠" onClose={() => setPanel(null)}>
      <p className="mb-4 text-sm text-muted">
        強化已裝備的武器與防具。每次 +2 攻擊或防禦，最多 +5。持有 {gold} 金。
      </p>
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-raised/60 p-3">
          <p className="text-sm">
            武器 {ITEMS[hero.weaponId ?? ""]?.name ?? "無"} +{hero.weaponPlus}
          </p>
          <GButton
            className="mt-3"
            wide
            disabled={!hero.weaponId || hero.weaponPlus >= 5}
            onClick={() => smithUpgrade("weapon")}
          >
            {hero.weaponPlus >= 5 ? "已達上限" : `強化武器　${wCost} 金`}
          </GButton>
        </div>
        <div className="rounded-lg border border-border bg-raised/60 p-3">
          <p className="text-sm">
            防具 {ITEMS[hero.armorId ?? ""]?.name ?? "無"} +{hero.armorPlus}
          </p>
          <GButton
            className="mt-3"
            wide
            disabled={!hero.armorId || hero.armorPlus >= 5}
            onClick={() => smithUpgrade("armor")}
          >
            {hero.armorPlus >= 5 ? "已達上限" : `強化防具　${aCost} 金`}
          </GButton>
        </div>
      </div>
    </Overlay>
  );
}

export function BoardPanel() {
  const quests = useGame((s) => s.quests) ?? {};
  const inventory = useGame((s) => s.inventory);
  const pets = useGame((s) => s.pets);
  const gold = useGame((s) => s.gold);
  const hero = useGame((s) => s.hero);
  const flags = useGame((s) => s.flags);
  const setPanel = useGame((s) => s.setPanel);
  const acceptQuest = useGame((s) => s.acceptQuest);
  const turnInQuest = useGame((s) => s.turnInQuest);
  const listed = BOARD_QUEST_IDS.filter((id) => {
    const def = QUESTS[id];
    return def && isQuestListed(def, hero?.level ?? 1, flags);
  });

  return (
    <Overlay title="公佈欄" onClose={() => setPanel(null)}>
      <p className="mb-4 text-sm text-muted">
        村民把委託釘在這塊板上。接了就去做，做完回來回報，賞金才會到手。持有 {gold} 金。
        {hero && legendQuestAvailable(hero.level, flags) && !quests["lake_bough"]
          ? " 長老新釘了一張清輝湖的委託。"
          : ""}
      </p>
      <ul className="space-y-3">
        {listed.map((id) => {
          const def = QUESTS[id];
          const entry = quests[id];
          const progress = liveQuestProgress(def, entry, inventory, pets);
          const ready = isQuestReady(def, entry, inventory, pets);
          const targetName =
            def.kind === "deliver" || def.kind === "visit"
              ? ITEMS[def.targetId]?.name
              : MONSTERS[def.targetId]?.name;
          const statusLabel =
            entry?.status === "done"
              ? "已回報"
              : ready
                ? "可回報"
                : entry
                  ? "進行中"
                  : "未接";
          return (
            <li key={id} className="rounded-lg border border-border bg-raised/60 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium">{def.title}</p>
                <p className="shrink-0 text-xs text-muted">{statusLabel}</p>
              </div>
              <p className="mt-1 text-xs text-muted">委託人　{def.poster}</p>
              <p className="mt-2 text-sm leading-relaxed">{def.desc}</p>
              <p className="mt-2 text-xs text-muted">{def.hint}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-xs tabular-nums text-muted">
                  {targetName} {Math.min(progress, def.count)}/{def.count}
                  <span className="ml-2">· 賞金 {def.reward} 金</span>
                </p>
                {!entry ? (
                  <GButton className="min-h-10 px-3 text-xs" variant="primary" onClick={() => acceptQuest(id)}>
                    接受
                  </GButton>
                ) : entry.status === "done" ? (
                  <span className="text-xs text-accent">完成</span>
                ) : (
                  <GButton
                    className="min-h-10 px-3 text-xs"
                    variant="primary"
                    disabled={!ready}
                    onClick={() => turnInQuest(id)}
                  >
                    回報
                  </GButton>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Overlay>
  );
}

export function SystemPanel() {
  const setPanel = useGame((s) => s.setPanel);
  const saveToSlot = useGame((s) => s.saveToSlot);
  const loadFromSlot = useGame((s) => s.loadFromSlot);
  const goTitle = useGame((s) => s.goTitle);
  const screen = useGame((s) => s.screen);
  const hero = useGame((s) => s.hero);
  const slotsTick = useGame((s) => s.slotsTick);
  const slots = readSlots();
  const [confirm, setConfirm] = useState<{ kind: "save" | "load"; index: number } | null>(null);
  const canSave = Boolean(hero) || Boolean(readResume()?.data.hero);
  void slotsTick;

  return (
    <Overlay title="存檔／讀檔" onClose={() => setPanel(null)}>
      <p className="mb-4 text-sm text-muted">
        冒險中隨時可寫入三個分檔。標題畫面的「繼續冒險」會回到上次離開的進度。
      </p>
      <ul className="space-y-3">
        {Array.from({ length: SLOT_COUNT }, (_, index) => {
          const file = slots[index];
          return (
            <li key={index} className="rounded-lg border border-border bg-raised/60 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium">檔案 {index + 1}</p>
                <p className="text-xs text-muted">
                  {file
                    ? new Date(file.preview.savedAt).toLocaleString("zh-TW", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "空"}
                </p>
              </div>
              {file ? (
                <p className="mt-1 text-sm">
                  {file.preview.name}　{CLASSES[file.preview.classId]?.name} Lv.{file.preview.level}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted">尚未寫入</p>
              )}
              {file ? (
                <p className="mt-1 text-xs text-muted">
                  {LOCATIONS[file.preview.locationId]?.name ?? file.preview.locationId}　{file.preview.gold} 金
                </p>
              ) : null}
              {confirm?.index === index ? (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-muted">
                    {confirm.kind === "save" ? "覆蓋這個檔案？" : "讀取這個檔案，目前未存的進度會被替換。"}
                  </p>
                  <div className="flex gap-2">
                    <GButton
                      variant="primary"
                      className="min-h-10 flex-1 px-3 text-xs"
                      onClick={() => {
                        if (confirm.kind === "save") saveToSlot(index);
                        else loadFromSlot(index);
                        setConfirm(null);
                      }}
                    >
                      確定
                    </GButton>
                    <GButton className="min-h-10 flex-1 px-3 text-xs" onClick={() => setConfirm(null)}>
                      取消
                    </GButton>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <GButton
                    className="min-h-10 flex-1 px-3 text-xs"
                    disabled={!canSave}
                    onClick={() => (file ? setConfirm({ kind: "save", index }) : saveToSlot(index))}
                  >
                    存檔
                  </GButton>
                  <GButton
                    variant="primary"
                    className="min-h-10 flex-1 px-3 text-xs"
                    disabled={!file}
                    onClick={() => setConfirm({ kind: "load", index })}
                  >
                    讀檔
                  </GButton>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {screen !== "title" ? (
        <GButton className="mt-4" wide onClick={goTitle}>
          回標題畫面
        </GButton>
      ) : null}
    </Overlay>
  );
}

export function ActivePanel() {
  const panel = useGame((s) => s.panel);
  if (panel === "inventory") return <InventoryPanel />;
  if (panel === "skills") return <SkillsPanel />;
  if (panel === "party") return <PartyPanel />;
  if (panel === "map") return <MapPanel />;
  if (panel === "shop") return <ShopPanel />;
  if (panel === "smith") return <SmithPanel />;
  if (panel === "board") return <BoardPanel />;
  if (panel === "system") return <SystemPanel />;
  return null;
}
