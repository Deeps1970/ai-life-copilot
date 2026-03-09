import { useState, useEffect, useCallback } from "react";

export interface TrackedSuggestion {
  id: string;
  text: string;
  createdAt: number;
  completed: boolean;
  completedAt?: number;
  category?: "steps" | "sleep" | "water" | "screen" | "exercise" | "transport" | "meals" | "general";
}

const STORAGE_KEY = "aiCoachSuggestions";

function detectCategory(text: string): TrackedSuggestion["category"] {
  const lower = text.toLowerCase();
  if (lower.includes("step") || lower.includes("walk") || lower.includes("walking")) return "steps";
  if (lower.includes("sleep") || lower.includes("bed") || lower.includes("nap")) return "sleep";
  if (lower.includes("water") || lower.includes("hydrat") || lower.includes("drink")) return "water";
  if (lower.includes("screen") || lower.includes("phone") || lower.includes("device")) return "screen";
  if (lower.includes("exercise") || lower.includes("workout") || lower.includes("gym") || lower.includes("run")) return "exercise";
  if (lower.includes("transport") || lower.includes("cycling") || lower.includes("bike") || lower.includes("bus")) return "transport";
  if (lower.includes("meal") || lower.includes("food") || lower.includes("eat") || lower.includes("diet") || lower.includes("vegetable")) return "meals";
  return "general";
}

/** Extract bullet-point suggestions from AI response text */
export function extractSuggestions(text: string): string[] {
  const lines = text.split("\n");
  const suggestions: string[] = [];
  for (const line of lines) {
    // Match lines starting with bullet markers or emoji
    const trimmed = line.trim();
    const match = trimmed.match(/^(?:[•\-\*]|[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}])\s*(.+)/u);
    if (match) {
      const clean = match[1].replace(/\*\*/g, "").trim();
      // Only keep actionable suggestions (skip very short or question-like)
      if (clean.length > 10 && !clean.endsWith("?")) {
        suggestions.push(clean);
      }
    }
  }
  return suggestions.slice(0, 5);
}

export function useSuggestionTracker() {
  const [suggestions, setSuggestions] = useState<TrackedSuggestion[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suggestions));
  }, [suggestions]);

  const addSuggestions = useCallback((texts: string[]) => {
    setSuggestions((prev) => {
      // Avoid duplicates (by similar text within last 24h)
      const recent = prev.filter((s) => Date.now() - s.createdAt < 86400000);
      const recentTexts = new Set(recent.map((s) => s.text.toLowerCase()));
      const newItems: TrackedSuggestion[] = texts
        .filter((t) => !recentTexts.has(t.toLowerCase()))
        .map((text) => ({
          id: crypto.randomUUID(),
          text,
          createdAt: Date.now(),
          completed: false,
          category: detectCategory(text),
        }));
      return [...newItems, ...prev].slice(0, 50); // keep max 50
    });
  }, []);

  const completeSuggestion = useCallback((id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: true, completedAt: Date.now() } : s))
    );
  }, []);

  const getActiveSuggestions = useCallback(() => {
    return suggestions.filter((s) => !s.completed && Date.now() - s.createdAt < 172800000); // 48h
  }, [suggestions]);

  const getRecentCompleted = useCallback(() => {
    return suggestions.filter((s) => s.completed && s.completedAt && Date.now() - s.completedAt < 86400000);
  }, [suggestions]);

  return { suggestions, addSuggestions, completeSuggestion, getActiveSuggestions, getRecentCompleted };
}
