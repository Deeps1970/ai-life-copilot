import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Droplets, Footprints, Utensils, Smartphone, Dumbbell, Bus, Car, Bike, PersonStanding } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { defaultData, type LifestyleData } from "@/lib/store";

const LifestyleInput = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<LifestyleData>(defaultData);

  useEffect(() => {
    const saved = localStorage.getItem("lifestyleData");
    if (saved) {
      try { setData(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleSubmit = () => {
    localStorage.setItem("lifestyleData", JSON.stringify(data));
    // Save to daily history for analytics charts
    const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
    const history: Array<{ day: string; data: LifestyleData }> = JSON.parse(localStorage.getItem("lifestyleHistory") || "[]");
    const existing = history.findIndex((h) => h.day === today);
    if (existing >= 0) history[existing] = { day: today, data };
    else history.push({ day: today, data });
    // Keep last 7 entries
    localStorage.setItem("lifestyleHistory", JSON.stringify(history.slice(-7)));
    navigate("/dashboard");
  };

  const update = (key: keyof LifestyleData, value: number | string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen pb-24 lg:pb-0 px-4 pt-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold font-display mb-2 gradient-text">Daily Lifestyle Log</h1>
        <p className="text-muted-foreground mb-8">Enter your daily data for AI analysis</p>

        <div className="grid gap-4">
          {/* Sleep */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/10"><Moon size={20} className="text-primary" /></div>
              <div>
                <h3 className="font-semibold">Sleep Hours</h3>
                <p className="text-sm text-muted-foreground">{data.sleepHours} hours</p>
              </div>
            </div>
            <Slider value={[data.sleepHours]} min={0} max={12} step={0.5} onValueChange={([v]) => update("sleepHours", v)} />
          </div>

          {/* Water */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-accent/10"><Droplets size={20} className="text-accent" /></div>
              <div>
                <h3 className="font-semibold">Water Intake</h3>
                <p className="text-sm text-muted-foreground">{data.waterIntake} liters</p>
              </div>
            </div>
            <Slider value={[data.waterIntake]} min={0} max={5} step={0.1} onValueChange={([v]) => update("waterIntake", Math.round(v * 10) / 10)} />
          </div>

          {/* Steps */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-green-500/10"><Footprints size={20} className="text-green-400" /></div>
              <div>
                <h3 className="font-semibold">Steps Walked</h3>
                <p className="text-sm text-muted-foreground">{data.steps.toLocaleString()} steps</p>
              </div>
            </div>
            <Slider value={[data.steps]} min={0} max={20000} step={500} onValueChange={([v]) => update("steps", v)} />
          </div>

          {/* Meals */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-orange-500/10"><Utensils size={20} className="text-orange-400" /></div>
              <h3 className="font-semibold">Meals Type</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["healthy", "mixed", "fastfood"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => update("mealsType", type)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    data.mealsType === type
                      ? "bg-primary/20 text-primary border border-primary/40"
                      : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted"
                  }`}
                >
                  {type === "fastfood" ? "Fast Food" : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Screen Time */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-red-500/10"><Smartphone size={20} className="text-red-400" /></div>
              <div>
                <h3 className="font-semibold">Screen Time</h3>
                <p className="text-sm text-muted-foreground">{data.screenTime} hours</p>
              </div>
            </div>
            <Slider value={[data.screenTime]} min={0} max={16} step={0.5} onValueChange={([v]) => update("screenTime", v)} />
          </div>

          {/* Exercise */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-yellow-500/10"><Dumbbell size={20} className="text-yellow-400" /></div>
              <div>
                <h3 className="font-semibold">Exercise Time</h3>
                <p className="text-sm text-muted-foreground">{data.exerciseTime} minutes</p>
              </div>
            </div>
            <Slider value={[data.exerciseTime]} min={0} max={180} step={5} onValueChange={([v]) => update("exerciseTime", v)} />
          </div>

          {/* Transport */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-blue-500/10"><Bus size={20} className="text-blue-400" /></div>
              <h3 className="font-semibold">Transport Type</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([
                { key: "car", icon: Car, label: "Car" },
                { key: "bike", icon: Bike, label: "Bike" },
                { key: "public", icon: Bus, label: "Public" },
                { key: "walk", icon: PersonStanding, label: "Walk" },
              ] as const).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => update("transportType", key)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all ${
                    data.transportType === key
                      ? "bg-primary/20 text-primary border border-primary/40"
                      : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted"
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button variant="hero" size="lg" className="w-full mt-6 text-base" onClick={handleSubmit}>
          Analyze My Lifestyle
        </Button>
      </div>
    </div>
  );
};

export default LifestyleInput;
