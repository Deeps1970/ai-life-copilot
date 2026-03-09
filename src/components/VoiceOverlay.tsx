import { Mic, MicOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VapiStatus } from "@/hooks/use-vapi";

interface VoiceOverlayProps {
  status: VapiStatus;
  volumeLevel: number;
  isMuted: boolean;
  onStop: () => void;
  onToggleMute: () => void;
}

export const VoiceOverlay = ({ status, volumeLevel, isMuted, onStop, onToggleMute }: VoiceOverlayProps) => {
  if (status === "idle") return null;

  const scale = 1 + volumeLevel * 0.5;
  const glowOpacity = 0.15 + volumeLevel * 0.45;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Pulsing rings */}
      <div className="relative flex items-center justify-center mb-8">
        <div
          className="absolute rounded-full transition-transform duration-150 ease-out"
          style={{
            width: 220,
            height: 220,
            transform: `scale(${scale * 1.2})`,
            background: `radial-gradient(circle, hsl(265 80% 60% / ${glowOpacity * 0.3}) 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute rounded-full transition-transform duration-150 ease-out"
          style={{
            width: 160,
            height: 160,
            transform: `scale(${scale * 1.1})`,
            background: `radial-gradient(circle, hsl(190 90% 50% / ${glowOpacity * 0.4}) 0%, transparent 70%)`,
          }}
        />
        <div
          className="relative w-28 h-28 rounded-full flex items-center justify-center border border-primary/30 transition-transform duration-150 ease-out"
          style={{
            transform: `scale(${scale})`,
            background: "var(--gradient-primary)",
            boxShadow: `0 0 ${30 + volumeLevel * 40}px hsl(265 80% 60% / ${glowOpacity})`,
          }}
        >
          {status === "connecting" ? (
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:300ms]" />
            </div>
          ) : (
            <Mic size={36} className="text-white" />
          )}
        </div>
      </div>

      {/* Status text */}
      <h3 className="font-display text-xl font-semibold mb-1">
        {status === "connecting" ? "Connecting..." : "Voice Coach Active"}
      </h3>
      <p className="text-sm text-muted-foreground mb-8">
        {status === "connecting"
          ? "Setting up your voice session"
          : "Speak naturally — your AI coach is listening"}
      </p>

      {/* Controls */}
      {status === "active" && (
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full border-border/50"
            onClick={onToggleMute}
          >
            {isMuted ? <MicOff size={22} className="text-destructive" /> : <Mic size={22} />}
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={onStop}
          >
            <PhoneOff size={22} />
          </Button>
        </div>
      )}
    </div>
  );
};
