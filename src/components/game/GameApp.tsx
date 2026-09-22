import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { BOOT_ART, preloadArt } from "@/game/art";
import { captureSave, writeResume } from "@/game/saves";
import { useGame } from "@/game/store";
import { registerPwa } from "@/pwa";
import { ErrorReset } from "./ErrorReset";
import { ActivePanel } from "./panels";
import { Dock, StatusBar, Toast } from "./chrome";
import {
  BattleScreen,
  CreateScreen,
  DialogueScreen,
  EndingScreen,
  TitleScreen,
  WorldScreen,
} from "./screens";

function bootPersist() {
  const s = useGame.getState();
  if (s.hero && s.screen !== "title" && s.screen !== "create") {
    try {
      writeResume(captureSave(s), true);
    } catch {
      /* ignore quota */
    }
  }
  useGame.setState({
    screen: "title",
    panel: null,
    toast: null,
    hydrated: true,
  });
}

function GameShell() {
  const screen = useGame((s) => s.screen);
  const panel = useGame((s) => s.panel);
  const setPanel = useGame((s) => s.setPanel);
  const goTitle = useGame((s) => s.goTitle);
  const hydrated = useGame((s) => s.hydrated);
  const [ready, setReady] = useState(() => useGame.getState().hydrated);
  const [bootKey, setBootKey] = useState(0);

  useEffect(() => {
    registerPwa();
  }, []);

  useEffect(() => {
    if (useGame.getState().hydrated) {
      setReady(true);
      return;
    }
    let cancelled = false;
    void Promise.resolve(useGame.persist.rehydrate())
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        if (useGame.getState().hydrated && useGame.getState().screen !== "title") {
          setReady(true);
          return;
        }
        bootPersist();
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (ready) preloadArt(...BOOT_ART);
  }, [ready]);

  const showStatus = screen === "world" || screen === "battle";
  const showDock = screen === "world";
  const showSaveFab = screen === "dialogue";

  return (
    <ErrorReset
      key={bootKey}
      onReset={() => {
        useGame.setState({ battle: null, panel: null, toast: null });
        goTitle();
        setBootKey((n) => n + 1);
      }}
    >
      <div className="relative mx-auto flex h-dvh w-full max-w-4xl flex-col overflow-hidden bg-bg">
        {!ready || !hydrated || screen === "title" ? <TitleScreen /> : null}
        {ready && hydrated && screen === "create" ? <CreateScreen /> : null}
        {ready && hydrated && screen === "ending" ? <EndingScreen /> : null}
        {ready && hydrated && showStatus ? <StatusBar /> : null}
        {ready && hydrated && screen === "dialogue" ? <DialogueScreen /> : null}
        {ready && hydrated && screen === "world" ? <WorldScreen /> : null}
        {ready && hydrated && screen === "battle" ? <BattleScreen /> : null}
        {ready && hydrated && showDock ? <Dock /> : null}
        {ready && hydrated && showSaveFab ? (
          <button
            type="button"
            onClick={() => setPanel(panel === "system" ? null : "system")}
            className="absolute right-3 top-3 z-30 flex size-11 flex-col items-center justify-center rounded-md bg-surface/90 text-xs text-muted"
            aria-label="存檔"
          >
            <Save className="size-4" strokeWidth={1.75} />
            存檔
          </button>
        ) : null}
        {ready ? <ActivePanel /> : null}
        <Toast />
      </div>
    </ErrorReset>
  );
}

export function GameApp() {
  return <GameShell />;
}