import { Palette, Check } from "lucide-react";
import type { UserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";

interface Props {
  settings: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
}

const themes = [
  {
    id: "dark",
    label: "Copilot Dark",
    desc: "Dark gradient with neon accents",
    preview: "bg-[#0B0F2A]",
  },
  {
    id: "light",
    label: "Clean Light",
    desc: "Light and readable interface",
    preview: "bg-[#F7F8FC]",
  },
];

// Apply CSS variables for each theme
export function applyTheme(themeId: string) {
  const root = document.documentElement;

  if (themeId === "light") {
    root.classList.add("light-theme");
  } else {
    root.classList.remove("light-theme");
  }
}

// Initialize theme on load
export function initTheme() {
  try {
    const raw = localStorage.getItem("ailifecopilot_settings");
    const theme = raw ? JSON.parse(raw).theme || "dark" : "dark";
    applyTheme(theme);
  } catch {
    applyTheme("dark");
  }
}

export default function AppearanceSettings({ settings, onUpdate }: Props) {
  const handleSelect = (themeId: string) => {
    applyTheme(themeId);
    onUpdate({ theme: themeId });
    toast.success(`Theme switched to ${themeId === "light" ? "Light Mode" : "Dark Mode"}`);
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2 mb-2">
        <Palette size={20} className="text-primary" />
        <h2 className="text-lg font-display font-bold">Appearance</h2>
      </div>
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => handleSelect(t.id)}
          className="glass-card p-4 flex items-center gap-4 w-full text-left hover:bg-primary/5 transition-colors"
        >
          <div className={`w-10 h-10 rounded-xl ${t.preview} border border-border/50`} />
          <div className="flex-1">
            <p className="font-medium text-sm">{t.label}</p>
            <p className="text-xs text-muted-foreground">{t.desc}</p>
          </div>
          {settings.theme === t.id && (
            <Check size={18} className="text-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
