import { useMemo } from "react";

export function useChartTheme() {
  return useMemo(() => {
    const isLight = document.documentElement.classList.contains("light-theme");
    return {
      grid: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
      axis: isLight ? "hsl(215,16%,37%)" : "hsl(215,20%,55%)",
      tooltipBg: isLight ? "#ffffff" : "hsl(230,25%,10%)",
      tooltipBorder: isLight ? "hsl(220,13%,86%)" : "hsl(220,30%,18%)",
      primary: isLight ? "hsl(249,53%,56%)" : "hsl(265,80%,60%)",
      accent: isLight ? "hsl(217,91%,60%)" : "hsl(190,90%,50%)",
      yellow: isLight ? "hsl(45,90%,45%)" : "hsl(45,90%,55%)",
    };
  }, []);
}
