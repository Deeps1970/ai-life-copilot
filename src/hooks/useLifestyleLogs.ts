import { useState, useEffect, useCallback } from "react";
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
  const [logs, setLogs] = useState<LifestyleLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Check auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Load logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    if (userId) {
      const { data } = await supabase
        .from("lifestyle_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: true });
      if (data) {
        setLogs(data.map((r) => ({
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
        })));
      }
    } else {
      setLogs(getLocalLogs());
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Upsert a log for a given date
  const upsertLog = useCallback(async (data: LifestyleData, date?: string) => {
    const d = date || todayISO();
    const log = lifestyleDataToLog(data, d);

    if (userId) {
      await supabase.from("lifestyle_logs").upsert(
        { ...log, user_id: userId },
        { onConflict: "user_id,date" }
      );
    } else {
      const local = getLocalLogs();
      const idx = local.findIndex((l) => l.date === d);
      if (idx >= 0) local[idx] = log;
      else local.push(log);
      saveLocalLogs(local);
    }
    await fetchLogs();
  }, [userId, fetchLogs]);

  return { logs, loading, upsertLog, refetch: fetchLogs };
}
