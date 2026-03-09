import { Heart, Droplets, Footprints, Moon, Dumbbell, Brain } from "lucide-react";

const FloatingIcons = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <Heart className="floating-icon top-[10%] left-[10%] animate-float" size={40} />
    <Droplets className="floating-icon top-[20%] right-[15%] animate-float-delayed" size={36} />
    <Footprints className="floating-icon bottom-[30%] left-[20%] animate-float" size={44} />
    <Moon className="floating-icon top-[40%] right-[25%] animate-float-delayed" size={32} />
    <Dumbbell className="floating-icon bottom-[20%] right-[10%] animate-float" size={38} />
    <Brain className="floating-icon top-[60%] left-[8%] animate-float-delayed" size={34} />
  </div>
);

export default FloatingIcons;
