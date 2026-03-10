import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// --- Gemini direct call ---
async function callGemini(
  apiKey: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<Response> {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
    }),
  });
}

// --- Lovable AI Gateway call (fallback) ---
async function callLovable(
  apiKey: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<Response> {
  return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
    }),
  });
}

// Transform Gemini SSE → OpenAI-compatible SSE
function transformGeminiStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim()) flushLines(buffer, controller, encoder);
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (line) emitLine(line, controller, encoder);
      }
    },
  });
}

function flushLines(text: string, c: ReadableStreamDefaultController, enc: TextEncoder) {
  for (const l of text.split("\n")) if (l.trim()) emitLine(l.trim(), c, enc);
}

function emitLine(line: string, c: ReadableStreamDefaultController, enc: TextEncoder) {
  if (!line.startsWith("data: ")) return;
  try {
    const parsed = JSON.parse(line.slice(6));
    const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      c.enqueue(enc.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`));
    }
  } catch { /* skip */ }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, lifestyleData, activeSuggestions, completedSuggestions } = await req.json();

    const systemPrompt = `You are AI Life Copilot, a smart lifestyle and wellness coach.

Your goal is to give helpful advice that improves the user's health, productivity, and daily habits.

Adjust your response style based on the type of question:

CASE 1 — Lifestyle or habit improvement questions:
• Keep answers short
• Use bullet points with emoji
• Focus on practical actions
• Limit to 3–5 suggestions

CASE 2 — Knowledge or explanation questions:
• Provide a short explanation (1–2 sentences)
• Then list practical suggestions
• Keep under 120 words

GENERAL RULES:
• Keep responses friendly and practical
• Avoid long essays or repeating the question
• Focus on actionable guidance
• Prefer bullet points over paragraphs

${lifestyleData ? `User lifestyle data: Sleep ${lifestyleData.sleepHours}h, Water ${lifestyleData.waterIntake}L, Steps ${lifestyleData.steps}, Meals ${lifestyleData.mealsType}, Screen ${lifestyleData.screenTime}h, Exercise ${lifestyleData.exerciseTime}min, Transport ${lifestyleData.transportType}. Personalize tips.` : "No lifestyle data yet. Give general tips."}

${activeSuggestions?.length ? `ACTIVE SUGGESTIONS:\n${activeSuggestions.map((s: string) => `• ${s}`).join("\n")}\nFollow up on these. Don't repeat — build on them.` : ""}

${completedSuggestions?.length ? `RECENTLY COMPLETED:\n${completedSuggestions.map((s: string) => `✅ ${s}`).join("\n")}\nAcknowledge progress and suggest next steps.` : ""}`;

    const chatMessages = messages.map(({ role, content }: { role: string; content: string }) => ({ role, content }));

    // Strategy: try Gemini direct first, fall back to Lovable AI Gateway
    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");

    let response: Response | null = null;
    let useGeminiTransform = false;

    // Attempt 1: Gemini direct
    if (GEMINI_KEY) {
      try {
        const r = await callGemini(GEMINI_KEY, systemPrompt, chatMessages);
        if (r.ok) {
          response = r;
          useGeminiTransform = true;
        } else {
          const errText = await r.text();
          console.error("Gemini error:", r.status, errText.slice(0, 300));
          // If rate-limited, wait and retry once
          if (r.status === 429) {
            await new Promise((res) => setTimeout(res, 2000));
            const r2 = await callGemini(GEMINI_KEY, systemPrompt, chatMessages);
            if (r2.ok) {
              response = r2;
              useGeminiTransform = true;
            } else {
              await r2.text(); // consume body
            }
          }
        }
      } catch (e) {
        console.error("Gemini call failed:", e);
      }
    }

    // Attempt 2: Lovable AI Gateway fallback
    if (!response && LOVABLE_KEY) {
      try {
        const r = await callLovable(LOVABLE_KEY, systemPrompt, chatMessages);
        if (r.ok) {
          response = r;
          useGeminiTransform = false;
        } else {
          const errText = await r.text();
          console.error("Lovable AI error:", r.status, errText.slice(0, 300));
          if (r.status === 429) {
            await new Promise((res) => setTimeout(res, 2000));
            const r2 = await callLovable(LOVABLE_KEY, systemPrompt, chatMessages);
            if (r2.ok) {
              response = r2;
              useGeminiTransform = false;
            } else {
              await r2.text();
            }
          }
        }
      } catch (e) {
        console.error("Lovable AI call failed:", e);
      }
    }

    if (!response || !response.body) {
      return new Response(
        JSON.stringify({ error: "AI Coach is thinking... please try again." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stream = useGeminiTransform ? transformGeminiStream(response.body) : response.body;

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-coach error:", e);
    return new Response(
      JSON.stringify({ error: "AI Coach is thinking... please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
