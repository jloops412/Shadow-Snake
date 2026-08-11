/**
 * The Prologue's terminal-state authority.
 * Keep progression decisions here so gameplay, saves, and automated tests share
 * one unambiguous route through all four operations.
 */

/**
 * @typedef {0 | 1 | 2 | 3} OperationStage
 * @typedef {{
 *   operationStage: OperationStage,
 *   hqAlive: boolean,
 *   footholdSecured: boolean,
 *   ghostLineBroken: boolean,
 *   blackRelayBroken: boolean,
 *   basiliskAlive: boolean,
 *   uplinkOnline: boolean,
 * }} MissionSnapshot
 */

/**
 * @param {MissionSnapshot} snapshot
 * @returns {{ kind: "continue" } | { kind: "checkpoint", nextStage: OperationStage } | { kind: "victory" } | { kind: "defeat", reason: "forward-command-destroyed" }}
 */
export function evaluateMissionGraph(snapshot) {
  if (!snapshot.hqAlive) {
    return { kind: "defeat", reason: "forward-command-destroyed" };
  }

  if (snapshot.operationStage === 0 && snapshot.footholdSecured) {
    return { kind: "checkpoint", nextStage: 1 };
  }

  if (snapshot.operationStage === 1 && snapshot.ghostLineBroken) {
    return { kind: "checkpoint", nextStage: 2 };
  }

  if (snapshot.operationStage === 2 && snapshot.blackRelayBroken) {
    return { kind: "checkpoint", nextStage: 3 };
  }

  if (
    snapshot.operationStage === 3 &&
    !snapshot.basiliskAlive &&
    !snapshot.uplinkOnline
  ) {
    return { kind: "victory" };
  }

  return { kind: "continue" };
}

/**
 * Guided and Standard each provide one emergency Forward Command recovery per
 * operation. Hardline never does. A spent recovery cannot silently retrigger.
 *
 * @param {{ difficulty: "guided" | "standard" | "hardline", operationStage: OperationStage, hqHp: number, usedStages: OperationStage[] }} state
 */
export function shouldTriggerEmergencyRecovery(state) {
  return (
    state.difficulty !== "hardline" &&
    state.hqHp <= 0 &&
    !state.usedStages.includes(state.operationStage)
  );
}
