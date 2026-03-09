import { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { Mic, Square, Loader2 } from "lucide-react";

const VoiceAssistant = () => {
  const [callStatus, setCallStatus] = useState<"inactive" | "loading" | "active">("inactive");
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      console.error("VITE_VAPI_PUBLIC_KEY is not set");
      return;
    }

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => setCallStatus("active"));
    vapi.on("call-end", () => setCallStatus("inactive"));
    vapi.on("speech-start", () => console.log("Assistant speaking..."));
    vapi.on("speech-end", () => console.log("Assistant stopped speaking"));
    vapi.on("error", (e) => {
      console.error("Vapi Error:", e);
      setCallStatus("inactive");
    });

    return () => {
      vapi.stop();
      vapi.removeAllListeners();
      vapiRef.current = null;
    };
  }, []);

  const toggleCall = async () => {
    const vapi = vapiRef.current;
    if (!vapi) return;

    if (callStatus === "active") {
      vapi.stop();
      setCallStatus("inactive");
    } else {
      try {
        setCallStatus("loading");
        const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;
        await vapi.start(assistantId, {
          maxDurationSeconds: 1200,
          firstMessage:
            "Hey! I'm your AI Life Copilot. How can I help you today?",
          endCallPhrases: [],
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are AI Life Copilot, a friendly and conversational voice wellness coach.

CRITICAL RULES:
- You are having a CONVERSATION. Do NOT hang up or end the call after one response.
- After answering a question, ask a follow-up or check if the user needs anything else.
- Keep responses concise and natural for voice (2-3 sentences max per turn).
- Be warm, encouraging, and sound like a real coach — not a textbook.
- Give practical, actionable advice on sleep, fitness, nutrition, hydration, screen time, and daily habits.
- If the user is silent, gently prompt them: "Anything else I can help with?"
- Only say goodbye if the user explicitly says they're done.`,
              },
            ],
          },
        });
      } catch (err) {
        console.error("Vapi start error:", err);
        setCallStatus("inactive");
      }
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex items-center justify-center">
      {/* Optional: Add a text tooltip that appears when active */}
      {callStatus === "active" && (
        <div className="absolute right-20 bg-black/60 backdrop-blur-md border border-purple-500/30 text-white px-4 py-2 rounded-full text-sm font-medium animate-fade-in whitespace-nowrap">
          AI Copilot Listening...
        </div>
      )}

      <button
        onClick={toggleCall}
        className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
          callStatus === "active"
            ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-105"
            : "bg-gray-900 border border-cyan-500/50 hover:bg-gray-800 hover:scale-105"
        }`}
      >
        {/* Glowing pulse effect when active */}
        {callStatus === "active" && (
          <div className="absolute inset-0 rounded-full bg-purple-500 opacity-50 animate-ping"></div>
        )}

        {/* Icon Logic */}
        {callStatus === "loading" ? (
          <Loader2 size={24} className="text-cyan-400 animate-spin" />
        ) : callStatus === "active" ? (
          <Square size={20} className="text-white fill-white" />
        ) : (
          <Mic size={24} className="text-cyan-400" />
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;
