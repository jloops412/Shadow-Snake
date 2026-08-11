import test from "node:test";
import assert from "node:assert/strict";
import { CAMPAIGN_THEATERS } from "../game/campaign-doctrine.mjs";
import { OPERATION_PROFILES, operationDoctrine } from "../game/operation-doctrine.mjs";

test("all 59 storyboard operations resolve to a mechanical mission family", () => {
  const contracts = CAMPAIGN_THEATERS.flatMap((theater) => theater.operations.map((operation, operationStage) => operationDoctrine({
    operation,
    operationStage,
    operationCount: theater.operations.length,
    finalTargetClass: theater.finalTargetClass,
  })));
  assert.equal(contracts.length, 59);
  contracts.forEach((contract) => {
    assert.ok(OPERATION_PROFILES[contract.type]);
    assert.ok(contract.rule.length > 24);
    assert.ok(contract.captureRate > 0);
    assert.ok(contract.hackRate > 0);
  });
  assert.ok(new Set(contracts.map((contract) => contract.type)).size >= 8);
});

test("finales preserve boss scale while choosing hunt or siege grammar", () => {
  for (const theater of CAMPAIGN_THEATERS) {
    const finale = operationDoctrine({
      operation: theater.operations.at(-1),
      operationStage: theater.operations.length - 1,
      operationCount: theater.operations.length,
      finalTargetClass: theater.finalTargetClass,
    });
    assert.equal(finale.type, theater.finalTargetClass === "metal-gear" ? "siege" : "hunt");
  }
});

test("mission families materially alter different simulation levers", () => {
  assert.ok(OPERATION_PROFILES.recon.detectionPressure < 1);
  assert.ok(OPERATION_PROFILES.sabotage.hackRate > 1);
  assert.ok(OPERATION_PROFILES.convoy.logisticsYield > 1);
  assert.ok(OPERATION_PROFILES.defense.raidPace < 1);
  assert.ok(OPERATION_PROFILES.reconstruction.sustainRate > 1);
});
