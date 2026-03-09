
CREATE TABLE public.lifestyle_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  steps INTEGER NOT NULL DEFAULT 0,
  sleep_hours NUMERIC(3,1) NOT NULL DEFAULT 0,
  water_intake NUMERIC(3,1) NOT NULL DEFAULT 0,
  screen_time NUMERIC(3,1) NOT NULL DEFAULT 0,
  meals_quality TEXT NOT NULL DEFAULT 'mixed',
  exercise_time INTEGER NOT NULL DEFAULT 0,
  transport_type TEXT NOT NULL DEFAULT 'public',
  health_score INTEGER NOT NULL DEFAULT 0,
  productivity_score INTEGER NOT NULL DEFAULT 0,
  sustainability_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.lifestyle_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs" ON public.lifestyle_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" ON public.lifestyle_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs" ON public.lifestyle_logs
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs" ON public.lifestyle_logs
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
