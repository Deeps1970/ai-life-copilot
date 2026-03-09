import { useState, useEffect, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";

export type VapiStatus = "idle" | "connecting" | "active";

interface UseVapiOptions {
  publicKey: string;
  assistantId: string;
  onMessage?: (msg: VapiMessage) => void;
}

export interface VapiMessage {
  type: string;
  role?: "assistant" | "user";
  transcript?: string;
  transcriptType?: "partial" | "final";
}

export function useVapi({ publicKey, assistantId, onMessage }: UseVapiOptions) {
  const vapiRef = useRef<Vapi | null>(null);
  const [status, setStatus] = useState<VapiStatus>("idle");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => setStatus("active"));
    vapi.on("call-end", () => {
      setStatus("idle");
      setVolumeLevel(0);
    });
    vapi.on("volume-level", (level: number) => setVolumeLevel(level));
    vapi.on("error", (err: unknown) => {
      console.error("Vapi error:", err);
      setStatus("idle");
      setVolumeLevel(0);
    });
    vapi.on("message", (msg: VapiMessage) => {
      onMessage?.(msg);
    });

    return () => {
      vapi.stop();
      vapiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  const start = useCallback(async () => {
    if (!vapiRef.current || status !== "idle") return;
    setStatus("connecting");
    try {
      await vapiRef.current.start(assistantId);
    } catch (err) {
      console.error("Vapi start error:", err);
      setStatus("idle");
    }
  }, [assistantId, status]);

  const stop = useCallback(() => {
    vapiRef.current?.stop();
    setStatus("idle");
    setVolumeLevel(0);
  }, []);

  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return;
    const next = !isMuted;
    vapiRef.current.setMuted(next);
    setIsMuted(next);
  }, [isMuted]);

  const toggle = useCallback(() => {
    if (status === "idle") start();
    else stop();
  }, [status, start, stop]);

  return { status, volumeLevel, isMuted, start, stop, toggle, toggleMute };
}
