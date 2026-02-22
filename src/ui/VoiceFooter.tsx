import { VoiceQuickAdd } from "./VoiceQuickAdd";

export function VoiceFooter() {
  return (
    <footer className="voice-footer-container">
      <div className="voice-footer-panel">
        <VoiceQuickAdd variant="dock" />
      </div>
    </footer>
  );
}
