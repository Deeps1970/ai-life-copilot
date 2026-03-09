import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@/components/CircularProgress";
import { calculateScores, getImprovements, defaultData, type LifestyleData } from "@/lib/store";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, ArrowRight, Heart, Brain, Leaf, BarChart3, Lightbulb, MessageCircle, Settings, Activity, Plus } from "lucide-react";
import { useLifestyleLogs, type LifestyleLog } from "@/hooks/useLifestyleLogs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const chartColors = {
  grid: "rgba(255,255,255,0.08)",
  axis: "hsl(215,20%,55%)",
  tooltipBg: "hsl(230,25%,10%)",
  tooltipBorder: "hsl(220,30%,18%)",
  primary: "hsl(265,80%,60%)",
  accent: "hsl(190,90%,50%)",
  yellow: "hsl(45,90%,55%)",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildChartData(logs: LifestyleLog[], days: number) {
  const sliced = logs.slice(-days);
  return {
    healthTrend: sliced.map((l) => ({ day: formatDate(l.date), score: l.health_score })),
    stepsVsScreen: sliced.map((l) => ({ day: formatDate(l.date), steps: l.steps, screen: l.screen_time })),
    sleepTrend: sliced.map((l) => ({ day: formatDate(l.date), hours: l.sleep_hours })),
  };
}

const mobileGridItems = [
  { icon: Heart, label: "Health Score", color: "text-red-400", section: "scores" },
  { icon: Brain, label: "Productivity", color: "text-primary", section: "scores" },
  { icon: Leaf, label: "Sustainability", color: "text-green-400", section: "scores" },
  { icon: Activity, label: "Lifestyle Logs", color: "text-accent", section: "logs" },
  { icon: Lightbulb, label: "AI Improvements", color: "text-yellow-400", section: "improvements" },
  { icon: BarChart3, label: "Analytics", color: "text-blue-400", section: "analytics" },
  { icon: MessageCircle, label: "AI Chat Coach", color: "text-purple-400", section: "chat" },
  { icon: Settings, label: "Settings", color: "text-muted-foreground", section: "settings" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<LifestyleData>(defaultData);
  const [rangeDays, setRangeDays] = useState<7 | 30>(7);
  const [addDayOpen, setAddDayOpen] = useState(false);
  const [newDay, setNewDay] = useState<LifestyleData>({ ...defaultData });

  const { logs, upsertLog } = useLifestyleLogs();

  useEffect(() => {
    const saved = localStorage.getItem("lifestyleData");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const scores = calculateScores(data);
  const improvements = getImprovements(data);

  const hasLogs = logs.length > 0;
  const { healthTrend, stepsVsScreen, sleepTrend } = buildChartData(logs, rangeDays);

  const handleGridClick = (section: string) => {
    if (section === "chat") return navigate("/chat");
    if (section === "logs") return navigate("/input");
    if (section === "settings") return navigate("/profile");
    const el = document.getElementById(section);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddDay = async () => {
    // Generate a date: if logs exist, next day after last log, else today
    let dateStr: string;
    if (logs.length > 0) {
      const lastDate = new Date(logs[logs.length - 1].date + "T00:00:00");
      lastDate.setDate(lastDate.getDate() + 1);
      dateStr = lastDate.toISOString().slice(0, 10);
    } else {
      dateStr = new Date().toISOString().slice(0, 10);
    }
    await upsertLog(newDay, dateStr);
    setNewDay({ ...defaultData });
    setAddDayOpen(false);
    toast.success("New day added to analytics!");
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-0 px-4 pt-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold font-display mb-1 gradient-text">AI Life Dashboard</h1>
        <p className="text-muted-foreground mb-8">Your personalized lifestyle analysis</p>

        {/* Mobile Grid */}
        <div className="grid grid-cols-4 gap-3 mb-8 md:hidden">
          {mobileGridItems.map((item) => (
            <button key={item.label} className="mobile-grid-item" onClick={() => handleGridClick(item.section)}>
              <item.icon size={28} className={item.color} />
              <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Scores */}
        <section id="scores" className="mb-10">
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" /> AI Life Scores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CircularProgress value={scores.health} color="green" label="Health Score" description="Based on sleep, water, steps & meals" />
            <CircularProgress value={scores.productivity} color="blue" label="Productivity Score" description="Based on screen time, sleep & focus" />
            <CircularProgress value={scores.sustainability} color="cyan" label="Sustainability Score" description="Based on transport & consumption" />
          </div>
        </section>

        {/* Improvements */}
        <section id="improvements" className="mb-10">
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Lightbulb size={20} className="text-yellow-400" /> AI Recommended Improvements
          </h2>
          <div className="grid gap-3">
            {improvements.map((s, i) => (
              <div key={i} className="glass-card p-4 flex items-center gap-4">
                <span className="text-2xl">{s.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{s.text}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  s.impact === "High" ? "bg-red-500/20 text-red-400" :
                  s.impact === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-green-500/20 text-green-400"
                }`}>
                  {s.impact}
                </span>
                <ArrowRight size={16} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        </section>

        {/* Analytics */}
        <section id="analytics" className="mb-10">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-xl font-display font-semibold flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-400" /> Lifestyle Analytics
            </h2>
            <div className="flex items-center gap-2">
              <Dialog open={addDayOpen} onOpenChange={setAddDayOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 border-primary/30 text-primary hover:bg-primary/10">
                    <Plus size={14} /> Add New Day
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-primary/20 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display">Add Demo Day</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <label className="text-sm text-muted-foreground">Steps: {newDay.steps.toLocaleString()}</label>
                      <Slider value={[newDay.steps]} min={0} max={20000} step={500} onValueChange={([v]) => setNewDay((p) => ({ ...p, steps: v }))} />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Sleep: {newDay.sleepHours}h</label>
                      <Slider value={[newDay.sleepHours]} min={0} max={12} step={0.5} onValueChange={([v]) => setNewDay((p) => ({ ...p, sleepHours: v }))} />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Water: {newDay.waterIntake}L</label>
                      <Slider value={[newDay.waterIntake]} min={0} max={5} step={0.1} onValueChange={([v]) => setNewDay((p) => ({ ...p, waterIntake: Math.round(v * 10) / 10 }))} />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Screen Time: {newDay.screenTime}h</label>
                      <Slider value={[newDay.screenTime]} min={0} max={16} step={0.5} onValueChange={([v]) => setNewDay((p) => ({ ...p, screenTime: v }))} />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Meals Quality</label>
                      <div className="flex gap-2">
                        {(["healthy", "mixed", "fastfood"] as const).map((t) => (
                          <button key={t} onClick={() => setNewDay((p) => ({ ...p, mealsType: t }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${newDay.mealsType === t ? "bg-primary/20 text-primary border border-primary/40" : "bg-muted/50 text-muted-foreground border border-transparent"}`}>
                            {t === "fastfood" ? "Fast Food" : t.charAt(0).toUpperCase() + t.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button variant="hero" className="w-full" onClick={handleAddDay}>Save Day</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="flex rounded-lg overflow-hidden border border-muted/30">
                <button onClick={() => setRangeDays(7)} className={`px-3 py-1.5 text-xs font-medium transition-all ${rangeDays === 7 ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>7 Days</button>
                <button onClick={() => setRangeDays(30)} className={`px-3 py-1.5 text-xs font-medium transition-all ${rangeDays === 30 ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>30 Days</button>
              </div>
            </div>
          </div>

          {!hasLogs ? (
            <div className="glass-card p-10 text-center">
              <Activity size={40} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Start tracking your lifestyle to see analytics.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/input")}>Log Your First Day</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-card p-5">
                <h3 className="font-semibold mb-4">Daily Health Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={healthTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="day" stroke={chartColors.axis} fontSize={12} />
                    <YAxis stroke={chartColors.axis} fontSize={12} />
                    <Tooltip contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: "12px", color: "#fff" }} />
                    <Line type="monotone" dataKey="score" stroke={chartColors.primary} strokeWidth={2} dot={{ fill: chartColors.primary }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-semibold mb-4">Steps vs Screen Time</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stepsVsScreen}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="day" stroke={chartColors.axis} fontSize={12} />
                    <YAxis stroke={chartColors.axis} fontSize={12} />
                    <Tooltip contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: "12px", color: "#fff" }} />
                    <Bar dataKey="steps" fill={chartColors.accent} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="screen" fill={chartColors.yellow} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-5 md:col-span-2">
                <h3 className="font-semibold mb-4">Sleep Quality Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={sleepTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="day" stroke={chartColors.axis} fontSize={12} />
                    <YAxis stroke={chartColors.axis} fontSize={12} />
                    <Tooltip contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: "12px", color: "#fff" }} />
                    <Line type="monotone" dataKey="hours" stroke={chartColors.yellow} strokeWidth={2} dot={{ fill: chartColors.yellow }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
