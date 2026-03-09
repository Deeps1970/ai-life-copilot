import { useEffect, useState } from "react";

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  description: string;
}

const CircularProgress = ({ value, max = 100, size = 140, strokeWidth = 10, color, label, description }: CircularProgressProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedValue / max) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 200);
    return () => clearTimeout(timer);
  }, [value]);

  const getColor = () => {
    if (value >= 70) return "hsl(150, 80%, 50%)";
    if (value >= 40) return "hsl(45, 90%, 55%)";
    return "hsl(0, 72%, 51%)";
  };

  return (
    <div className="score-card">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" style={{ overflow: 'visible' }}>
          <defs>
            <filter id={`glow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={getColor()} floodOpacity="0.6" />
            </filter>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            filter={`url(#glow-${label})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-display" style={{ color: getColor() }}>{animatedValue}</span>
          <span className="text-xs text-muted-foreground">/ {max}</span>
        </div>
      </div>
      <h3 className="font-display font-semibold text-lg">{label}</h3>
      <p className="text-xs text-muted-foreground text-center">{description}</p>
    </div>
  );
};

export default CircularProgress;
