import type { VoiceOrbMode } from "@/features/chat/components/VoiceOrb";
import type { UseVoiceChat } from "@/features/chat/hooks/useVoiceChat";

export interface VoiceVisuals {
  mode: VoiceOrbMode;
  label: string;
  /** Volume source matching who is talking (stable function reference). */
  getLevel: () => number;
}

/** Maps the call state to what the voice UI shows. */
export function getVoiceVisuals(voice: UseVoiceChat): VoiceVisuals {
  const { status, isMuted, agentState, isUserTurnPending } = voice;

  if (status === "connecting") {
    return { mode: "connecting", label: "Conectando...", getLevel: voice.getMicLevel };
  }
  if (agentState === "speaking") {
    return { mode: "speaking", label: "Assistente falando", getLevel: voice.getAgentLevel };
  }
  if (agentState === "thinking") {
    return { mode: "thinking", label: "Pensando...", getLevel: voice.getAgentLevel };
  }
  if (isMuted) {
    return { mode: "muted", label: "Microfone desligado", getLevel: voice.getMicLevel };
  }
  if (isUserTurnPending) {
    return { mode: "listening", label: "Ouvindo você...", getLevel: voice.getMicLevel };
  }
  return { mode: "idle", label: "Pode falar", getLevel: voice.getMicLevel };
}

/** `m:ss` since `start` (epoch ms). */
export function formatCallDuration(start: number, now: number): string {
  const seconds = Math.max(0, Math.floor((now - start) / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
