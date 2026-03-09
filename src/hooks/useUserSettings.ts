import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export interface UserSettings {
  notifications_health: boolean;
  notifications_water: boolean;
  notifications_steps: boolean;
  notifications_sleep: boolean;
  cloud_sync: boolean;
  share_anonymous_data: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  notifications_health: false,
  notifications_water: false,
  notifications_steps: false,
  notifications_sleep: false,
  cloud_sync: true,
  share_anonymous_data: false,
};

const LOCAL_KEY = "ailifecopilot_settings";

function loadLocal(): UserSettings {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveLocal(s: UserSettings) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(s));
}

export function useUserSettings(session: Session | null) {
  const [settings, setSettingsState] = useState<UserSettings>(loadLocal);
  const [loading, setLoading] = useState(true);

  // Load from Supabase if logged in
  useEffect(() => {
    if (!session) {
      setSettingsState(loadLocal());
      setLoading(false);
      return;
    }

    (async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) {
        const s: UserSettings = {
          notifications_health: data.notifications_health,
          notifications_water: data.notifications_water,
          notifications_steps: data.notifications_steps,
          notifications_sleep: data.notifications_sleep,
          cloud_sync: data.cloud_sync,
          share_anonymous_data: data.share_anonymous_data,
        };
        setSettingsState(s);
        saveLocal(s);
      }
      setLoading(false);
    })();
  }, [session]);

  const updateSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      const next = { ...settings, ...patch };
      setSettingsState(next);
      saveLocal(next);

      if (session) {
        await supabase.from("user_settings").upsert(
          { user_id: session.user.id, ...next, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      }
    },
    [settings, session]
  );

  return { settings, updateSettings, loading };
}
