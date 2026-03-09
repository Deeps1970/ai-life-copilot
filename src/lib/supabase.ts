import { createClient } from "@supabase/supabase-js";

// Support both Lovable Cloud env var names and standard Supabase env var names
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://fulztykuatvnapqmyugq.supabase.co";

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1bHp0eWt1YXR2bmFwcW15dWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzI2NjIsImV4cCI6MjA4ODYwODY2Mn0.VUvBeQ6lHSuQWsvfT26UO_Vq6lab26ZC8xnUJvGZQxo";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
