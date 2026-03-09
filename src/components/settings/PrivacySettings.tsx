import { useState } from "react";
import { Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { UserSettings } from "@/hooks/useUserSettings";
import type { Session } from "@supabase/supabase-js";

interface Props {
  settings: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
  session: Session | null;
}

export default function PrivacySettings({ settings, onUpdate, session }: Props) {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteData = async () => {
    setDeleting(true);
    try {
      localStorage.clear();
      if (session) {
        await supabase.from("user_settings").delete().eq("user_id", session.user.id);
        await supabase.auth.signOut();
      }
      toast.success("All data deleted");
      window.location.reload();
    } catch {
      toast.error("Failed to delete data");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2 mb-2">
        <Shield size={20} className="text-primary" />
        <h2 className="text-lg font-display font-bold">Privacy</h2>
      </div>

      <div className="glass-card p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">Cloud Sync</p>
          <p className="text-xs text-muted-foreground">
            {session ? "Sync settings to the cloud" : "Login to enable cloud sync"}
          </p>
        </div>
        <Switch
          checked={settings.cloud_sync}
          onCheckedChange={(c) => onUpdate({ cloud_sync: c })}
          disabled={!session}
        />
      </div>

      <div className="glass-card p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">Share Anonymous Data</p>
          <p className="text-xs text-muted-foreground">Help improve AI Life Copilot</p>
        </div>
        <Switch
          checked={settings.share_anonymous_data}
          onCheckedChange={(c) => onUpdate({ share_anonymous_data: c })}
        />
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="glass-card p-4 flex items-center gap-4 w-full text-left hover:bg-destructive/10 transition-colors">
            <div>
              <p className="font-medium text-sm text-destructive">Delete My Data</p>
              <p className="text-xs text-muted-foreground">Remove all stored lifestyle data</p>
            </div>
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all your lifestyle data? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteData}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete Everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
