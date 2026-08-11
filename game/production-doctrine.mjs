/**
 * Pure production/economy rules shared by the simulation and deterministic
 * tests. Keep strategic counters here instead of burying them in UI copy.
 */

export function recoveryLoadValue(nodeIncome) {
  return 150 + Math.max(0, nodeIncome) * 20;
}

/**
 * @param {string} attacker
 * @param {"infantry" | "vehicle" | "structure"} targetClass
 */
export function counterMultiplier(attacker, targetClass) {
  const armored = targetClass === "vehicle" || targetClass === "structure";
  if (attacker === "lancer") return armored ? 1.7 : 0.52;
  if (attacker === "mantis") return armored ? 1.35 : 0.58;
  if (attacker === "jackal" || attacker === "viper") return armored ? 0.7 : 1.28;
  if (attacker === "ghost") return armored ? 0.38 : 1.55;
  if (["wraith", "hacker", "specter", "medic", "engineer"].includes(attacker)) {
    return armored ? 0.55 : 1;
  }
  return 1;
}
