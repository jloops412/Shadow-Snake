import assert from "node:assert/strict";
import test from "node:test";

import { evaluateMissionGraph, shouldTriggerEmergencyRecovery } from "../game/mission-graph.mjs";

const unresolved = {
  operationStage: 0,
  hqAlive: true,
  footholdSecured: false,
  ghostLineBroken: false,
  blackRelayBroken: false,
  basiliskAlive: true,
  uplinkOnline: true,
};

test("Prologue has a complete Operation 1 to victory path", () => {
  assert.deepEqual(
    evaluateMissionGraph({ ...unresolved, footholdSecured: true }),
    { kind: "checkpoint", nextStage: 1 },
  );
  assert.deepEqual(
    evaluateMissionGraph({ ...unresolved, operationStage: 1, ghostLineBroken: true }),
    { kind: "checkpoint", nextStage: 2 },
  );
  assert.deepEqual(
    evaluateMissionGraph({ ...unresolved, operationStage: 2, blackRelayBroken: true }),
    { kind: "checkpoint", nextStage: 3 },
  );
  assert.deepEqual(
    evaluateMissionGraph({ ...unresolved, operationStage: 3, basiliskAlive: false, uplinkOnline: false }),
    { kind: "victory" },
  );
});

test("Forward Command destruction is an explicit defeat at every operation", () => {
  for (const operationStage of [0, 1, 2, 3]) {
    assert.deepEqual(
      evaluateMissionGraph({
        ...unresolved,
        operationStage,
        hqAlive: false,
        footholdSecured: true,
        ghostLineBroken: true,
        blackRelayBroken: true,
        basiliskAlive: false,
        uplinkOnline: false,
      }),
      { kind: "defeat", reason: "forward-command-destroyed" },
    );
  }
});

test("No incomplete objective can silently advance or end the Prologue", () => {
  for (const operationStage of [0, 1, 2, 3]) {
    assert.deepEqual(
      evaluateMissionGraph({ ...unresolved, operationStage }),
      { kind: "continue" },
    );
  }
});

test("Guided and Standard get one explicit command recovery per operation", () => {
  for (const difficulty of ["guided", "standard"]) {
    assert.equal(shouldTriggerEmergencyRecovery({ difficulty, operationStage: 1, hqHp: 0, usedStages: [] }), true);
    assert.equal(shouldTriggerEmergencyRecovery({ difficulty, operationStage: 1, hqHp: 0, usedStages: [1] }), false);
    assert.equal(shouldTriggerEmergencyRecovery({ difficulty, operationStage: 1, hqHp: 12, usedStages: [] }), false);
  }
  assert.equal(shouldTriggerEmergencyRecovery({ difficulty: "hardline", operationStage: 1, hqHp: 0, usedStages: [] }), false);
});
