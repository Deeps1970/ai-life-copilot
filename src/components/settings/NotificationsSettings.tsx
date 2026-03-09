import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { UserSettings } from "@/hooks/useUserSettings";

interface Props {
  settings: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
}

const items = [
  { key: "notifications_health" as const, label: "Daily Health Reminder", desc: "Get a daily wellness check-in" },
  { key: "notifications_water" as const, label: "Drink Water Reminder", desc: "Stay hydrated throughout the day" },
  { key: "notifications_steps" as const, label: "Step Goal Reminder", desc: "Track your daily movement" },
  { key: "notifications_sleep" as const, label: "Sleep Reminder", desc: "Prepare for healthy rest" },
];

async function requestPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    toast.error("Notifications are not supported in this browser.");
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") {
    toast.error("Notifications are disabled in your browser.");
    return false;
  }
  const result = await Notification.requestPermission();
  if (result !== "granted") {
    toast.error("Notifications are disabled in your browser.");
    return false;
  }
  return true;
}

export default function NotificationsSettings({ settings, onUpdate }: Props) {
  const handleToggle = async (key: keyof UserSettings, checked: boolean) => {
    if (checked) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    onUpdate({ [key]: checked });
    toast.success(checked ? "Reminder enabled" : "Reminder disabled");
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2 mb-2">
        <Bell size={20} className="text-primary" />
        <h2 className="text-lg font-display font-bold">Notifications</h2>
      </div>
      {items.map((item) => (
        <div key={item.key} className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
          <Switch
            checked={settings[item.key] as boolean}
            onCheckedChange={(c) => handleToggle(item.key, c)}
          />
        </div>
      ))}
    </div>
  );
}
