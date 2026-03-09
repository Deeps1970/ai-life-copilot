import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles } from "lucide-react";
import FloatingIcons from "@/components/FloatingIcons";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <FloatingIcons />

      <div className="relative z-10 max-w-3xl mx-auto text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8">
          <Brain size={18} className="text-primary" />
          <span className="text-sm font-medium text-primary">AI Life Copilot</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display mb-6 leading-tight">
          Upgrade Your Life with{" "}
          <span className="gradient-text">AI Insights</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          AI Life Copilot analyzes your daily lifestyle and provides personalized insights to improve your health, productivity, and sustainability.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg" onClick={() => navigate("/input")} className="text-base gap-2">
            <Sparkles size={18} />
            Start Analysis
          </Button>
          <Button variant="heroOutline" size="lg" onClick={() => navigate("/dashboard")} className="text-base">
            View Dashboard
          </Button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

export default Landing;
