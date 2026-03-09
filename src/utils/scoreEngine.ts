import { type LifestyleData } from "@/lib/store";

export function calculateScores(data: LifestyleData) {
  // Health Score
  let health = 0;
  health += Math.min(data.sleepHours / 8, 1) * 25;
  health += Math.min(data.waterIntake / 3, 1) * 25;
  health += Math.min(data.steps / 10000, 1) * 25;
  health += (data.mealsType === "healthy" ? 25 : data.mealsType === "mixed" ? 15 : 5);
  health += Math.min(data.exerciseTime / 60, 1) * 10;

  // Productivity Score
  let productivity = 0;
  productivity += Math.max(0, (1 - data.screenTime / 12)) * 35;
  productivity += Math.min(data.sleepHours / 8, 1) * 35;
  productivity += Math.min(data.exerciseTime / 60, 1) * 15;
  productivity += (data.mealsType === "healthy" ? 15 : data.mealsType === "mixed" ? 8 : 3);

  // Sustainability Score
  let sustainability = 0;
  const transportScores = { walk: 40, bike: 35, public: 25, car: 5 };
  sustainability += transportScores[data.transportType];
  sustainability += (data.mealsType === "healthy" ? 30 : data.mealsType === "mixed" ? 15 : 5);
  sustainability += Math.min(data.waterIntake / 3, 1) * 15;
  sustainability += Math.max(0, (1 - data.screenTime / 12)) * 15;

  return {
    health: Math.min(Math.round(health), 100),
    productivity: Math.min(Math.round(productivity), 100),
    sustainability: Math.min(Math.round(sustainability), 100),
  };
}
