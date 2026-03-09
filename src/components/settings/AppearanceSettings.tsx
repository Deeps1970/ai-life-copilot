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
    label: "Dark Mode",
    desc: "Classic dark interface",
    preview: "bg-[hsl(230,25%,7%)]",
  },
  {
    id: "light",
    label: "Light Mode",
    desc: "Clean light interface",
    preview: "bg-[hsl(0,0%,98%)]",
  },
  {
    id: "ai-gradient",
    label: "AI Gradient",
    desc: "Purple-to-cyan gradient",
    preview: "bg-gradient-to-br from-[hsl(265,80%,30%)] to-[hsl(190,90%,30%)]",
  },
  {
    id: "midnight",
    label: "Midnight",
    desc: "Deep blue midnight",
    preview: "bg-[hsl(230,50%,10%)]",
  },
];

// Apply CSS variables for each theme
function applyTheme(themeId: string) {
  const root = document.documentElement;

  const themeVars: Record<string, Record<string, string>> = {
    dark: {
      "--background": "230 25% 7%",
      "--foreground": "210 40% 96%",
      "--card": "230 25% 10%",
      "--card-foreground": "210 40% 96%",
      "--popover": "230 25% 10%",
      "--popover-foreground": "210 40% 96%",
      "--muted": "220 30% 15%",
      "--muted-foreground": "215 20% 55%",
      "--secondary": "220 60% 18%",
      "--secondary-foreground": "210 40% 96%",
      "--border": "220 30% 18%",
      "--input": "220 30% 18%",
    },
    light: {
      "--background": "0 0% 98%",
      "--foreground": "230 25% 10%",
      "--card": "0 0% 100%",
      "--card-foreground": "230 25% 10%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "230 25% 10%",
      "--muted": "220 15% 92%",
      "--muted-foreground": "215 15% 45%",
      "--secondary": "220 15% 90%",
      "--secondary-foreground": "230 25% 10%",
      "--border": "220 15% 85%",
      "--input": "220 15% 85%",
    },
    "ai-gradient": {
      "--background": "265 40% 8%",
      "--foreground": "210 40% 96%",
      "--card": "265 35% 12%",
      "--card-foreground": "210 40% 96%",
      "--popover": "265 35% 12%",
      "--popover-foreground": "210 40% 96%",
      "--muted": "265 25% 16%",
      "--muted-foreground": "260 15% 55%",
      "--secondary": "260 40% 20%",
      "--secondary-foreground": "210 40% 96%",
      "--border": "265 25% 20%",
      "--input": "265 25% 20%",
    },
    midnight: {
      "--background": "230 50% 5%",
      "--foreground": "210 40% 96%",
      "--card": "230 50% 8%",
      "--card-foreground": "210 40% 96%",
      "--popover": "230 50% 8%",
      "--popover-foreground": "210 40% 96%",
      "--muted": "230 40% 12%",
      "--muted-foreground": "220 20% 50%",
      "--secondary": "230 45% 15%",
      "--secondary-foreground": "210 40% 96%",
      "--border": "230 40% 15%",
      "--input": "230 40% 15%",
    },
  };

  const vars = themeVars[themeId] || themeVars.dark;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
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
    toast.success(`Theme set to ${themes.find((t) => t.id === themeId)?.label}`);
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
