import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callGemini(apiKey: string, body: object, attempt = 1): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // Retry once on rate-limit or 5xx
  if ((resp.status === 429 || resp.status >= 500) && attempt < 2) {
    await new Promise((r) => setTimeout(r, 2000));
    return callGemini(apiKey, body, attempt + 1);
  }

  return resp;
}

function buildGeminiBody(systemPrompt: string, messages: { role: string; content: string }[]) {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  return {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      maxOutputTokens: 512,
      temperature: 0.7,
    },
  };
}

// Transform Gemini SSE stream to OpenAI-compatible SSE stream
function transformStream(geminiStream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = geminiStream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        // Flush remaining buffer
        if (buffer.trim()) {
          processLines(buffer, controller, encoder);
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIdx).trim();
        buffer = buffer.slice(newlineIdx + 1);
        if (!line) continue;
        processLine(line, controller, encoder);
      }
    },
  });
}

function processLines(text: string, controller: ReadableStreamDefaultController, encoder: TextEncoder) {
  for (const line of text.split("\n")) {
    if (line.trim()) processLine(line.trim(), controller, encoder);
  }
}

function processLine(line: string, controller: ReadableStreamDefaultController, encoder: TextEncoder) {
  if (!line.startsWith("data: ")) return;
  const jsonStr = line.slice(6);
  try {
    const parsed = JSON.parse(jsonStr);
    const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const openAiChunk = {
        choices: [{ delta: { content: text } }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAiChunk)}\n\n`));
    }
  } catch {
    // skip malformed
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, lifestyleData, activeSuggestions, completedSuggestions } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const systemPrompt = `You are AI Life Copilot, a smart lifestyle and wellness coach.

Your goal is to give helpful advice that improves the user's health, productivity, and daily habits.

Adjust your response style based on the type of question:

CASE 1 — Lifestyle or habit improvement questions (e.g. "How can I improve my sleep?", "How do I reduce screen time?"):
• Keep answers short
• Use bullet points with emoji
• Focus on practical actions
• Limit to 3–5 suggestions

CASE 2 — Knowledge or explanation questions (e.g. "How can I make biriyani healthier?", "What foods improve energy?"):
• Provide a short explanation (1–2 sentences)
• Then list practical suggestions
• Keep under 120 words
• Avoid unnecessary long paragraphs

GENERAL RULES:
• Keep responses friendly and practical
• Avoid long essays
• Avoid repeating the user's question
• Focus on actionable guidance
• Prefer bullet points over paragraphs
• The response should feel like advice from a smart lifestyle coach, not a textbook

${lifestyleData ? `User lifestyle data: Sleep ${lifestyleData.sleepHours}h, Water ${lifestyleData.waterIntake}L, Steps ${lifestyleData.steps}, Meals ${lifestyleData.mealsType}, Screen ${lifestyleData.screenTime}h, Exercise ${lifestyleData.exerciseTime}min, Transport ${lifestyleData.transportType}. Use this to personalize tips.` : "No lifestyle data yet. Give general tips."}

${activeSuggestions?.length ? `ACTIVE SUGGESTIONS (previously given, not yet completed):\n${activeSuggestions.map((s: string) => `• ${s}`).join("\n")}\nWhen appropriate, follow up on these. Ask if they completed any. Don't repeat the same suggestions — build on them or suggest new ones.` : ""}

${completedSuggestions?.length ? `RECENTLY COMPLETED (user confirmed these):\n${completedSuggestions.map((s: string) => `✅ ${s}`).join("\n")}\nAcknowledge their progress positively and suggest next steps.` : ""}`;

    const geminiBody = buildGeminiBody(systemPrompt, messages);
    const response = await callGemini(GEMINI_API_KEY, geminiBody);

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI Coach is thinking... please try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI Coach is thinking... please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform Gemini SSE to OpenAI-compatible SSE so the frontend parser works unchanged
    const transformed = transformStream(response.body!);

    return new Response(transformed, {
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
