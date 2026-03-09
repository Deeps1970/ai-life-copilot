import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { calculateScores, type LifestyleData } from "@/lib/store";

export interface LifestyleLog {
  date: string; // YYYY-MM-DD
  steps: number;
  sleep_hours: number;
  water_intake: number;
  screen_time: number;
  meals_quality: string;
  exercise_time: number;
  transport_type: string;
  health_score: number;
  productivity_score: number;
  sustainability_score: number;
}

const LS_KEY = "lifestyle_logs";

function lifestyleDataToLog(data: LifestyleData, date: string): LifestyleLog {
  const scores = calculateScores(data);
  return {
    date,
    steps: data.steps,
    sleep_hours: data.sleepHours,
    water_intake: data.waterIntake,
    screen_time: data.screenTime,
    meals_quality: data.mealsType,
    exercise_time: data.exerciseTime,
    transport_type: data.transportType,
    health_score: scores.health,
    productivity_score: scores.productivity,
    sustainability_score: scores.sustainability,
  };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function getLocalLogs(): LifestyleLog[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalLogs(logs: LifestyleLog[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(logs));
}

export function useLifestyleLogs() {
  const [logs, setLogs] = useState<LifestyleLog[]>(() => getLocalLogs());
  const [loading, setLoading] = useState(false);
  const userIdRef = useRef<string | null>(null);

  // Check auth and load from Supabase if authenticated
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data }) => {
      if (cancelled) return;
      const uid = data.user?.id ?? null;
      userIdRef.current = uid;
      if (uid) {
        setLoading(true);
        const { data: rows } = await supabase
          .from("lifestyle_logs")
          .select("*")
          .eq("user_id", uid)
          .order("date", { ascending: true });
        if (!cancelled && rows) {
          const mapped = rows.map((r) => ({
            date: r.date,
            steps: r.steps,
            sleep_hours: Number(r.sleep_hours),
            water_intake: Number(r.water_intake),
            screen_time: Number(r.screen_time),
            meals_quality: r.meals_quality,
            exercise_time: r.exercise_time,
            transport_type: r.transport_type,
            health_score: r.health_score,
            productivity_score: r.productivity_score,
            sustainability_score: r.sustainability_score,
          }));
          setLogs(mapped);
        }
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Upsert a log for a given date — updates state immediately
  const upsertLog = useCallback(async (data: LifestyleData, date?: string) => {
    const d = date || todayISO();
    const log = lifestyleDataToLog(data, d);

    // Optimistically update state
    setLogs((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((l) => l.date === d);
      if (idx >= 0) updated[idx] = log;
      else updated.push(log);
      updated.sort((a, b) => a.date.localeCompare(b.date));
      // Also persist to localStorage always
      saveLocalLogs(updated);
      return updated;
    });

    // If authenticated, also persist to Supabase
    const uid = userIdRef.current;
    if (uid) {
      await supabase.from("lifestyle_logs").upsert(
        { ...log, user_id: uid },
        { onConflict: "user_id,date" }
      );
    }
  }, []);

  return { logs, loading, upsertLog };
}
