import { Component, type ReactNode } from "react";
import { GButton } from "./chrome";

type Props = { children: ReactNode; onReset: () => void };
type State = { error: Error | null };

export class ErrorReset extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
        <p className="font-display text-2xl">霧把畫面吞了一角</p>
        <p className="max-w-sm text-sm text-muted">進行中的狀態出錯了。可以回到標題，再從存檔繼續。</p>
        <GButton
          variant="primary"
          onClick={() => {
            this.setState({ error: null });
            this.props.onReset();
          }}
        >
          回標題畫面
        </GButton>
      </div>
    );
  }
}
