import assert from "node:assert/strict";
import test from "node:test";

import { CAMPAIGN_ACTS, CAMPAIGN_CAST_BY_THEATER, CAMPAIGN_OPERATION_COUNT, CAMPAIGN_THEATERS, campaignOperationRole, evaluateTheaterGraph, mergeCampaignProgress, nextTheaterId } from "../game/campaign-doctrine.mjs";

test("the complete storyboard forms one unbroken thirteen-theater campaign", () => {
  assert.deepEqual(CAMPAIGN_THEATERS.map((theater) => theater.act), [
    "PROLOGUE",
    "ACT I", "ACT I", "ACT I",
    "ACT II", "ACT II", "ACT II",
    "ACT III", "ACT III", "ACT III",
    "ACT IV", "ACT IV", "ACT IV",
  ]);
  assert.deepEqual(CAMPAIGN_ACTS, ["PROLOGUE", "ACT I", "ACT II", "ACT III", "ACT IV"]);
  assert.equal(CAMPAIGN_THEATERS.length, 13);
  assert.equal(CAMPAIGN_OPERATION_COUNT, 59);
  for (const theater of CAMPAIGN_THEATERS) {
    assert.ok(CAMPAIGN_CAST_BY_THEATER[theater.id]?.includes("Eli / Shadow Snake"));
    assert.ok(CAMPAIGN_CAST_BY_THEATER[theater.id]?.includes("David / Rotten Snake"));
  }
  for (let index = 0; index < CAMPAIGN_THEATERS.length - 1; index += 1) {
    assert.equal(nextTheaterId(CAMPAIGN_THEATERS[index].id), CAMPAIGN_THEATERS[index + 1].id);
  }
  assert.equal(nextTheaterId(CAMPAIGN_THEATERS.at(-1).id), null);
});

test("all 59 storyboard operations reach checkpoint, victory, or explicit defeat", () => {
  for (const theater of CAMPAIGN_THEATERS) {
    const finalStage = theater.operations.length - 1;
    for (let stage = 0; stage < finalStage; stage += 1) {
      assert.deepEqual(
        evaluateTheaterGraph({ operationStage: stage, operationCount: theater.operations.length, hqAlive: true, objectiveComplete: true, bossAlive: true, commandTargetOnline: true }),
        { kind: "checkpoint", nextStage: stage + 1 },
        `${theater.title} operation ${stage + 1} must unlock the next operation`,
      );
      assert.deepEqual(
        evaluateTheaterGraph({ operationStage: stage, operationCount: theater.operations.length, hqAlive: true, objectiveComplete: false, bossAlive: true, commandTargetOnline: true }),
        { kind: "continue" },
        `${theater.title} operation ${stage + 1} cannot advance early`,
      );
    }
    assert.deepEqual(
      evaluateTheaterGraph({ operationStage: finalStage, operationCount: theater.operations.length, hqAlive: true, objectiveComplete: false, bossAlive: false, commandTargetOnline: false }),
      { kind: "victory" },
      `${theater.title} final operation must reach victory`,
    );
    for (let stage = 0; stage <= finalStage; stage += 1) {
      assert.deepEqual(
        evaluateTheaterGraph({ operationStage: stage, operationCount: theater.operations.length, hqAlive: false, objectiveComplete: true, bossAlive: false, commandTargetOnline: false }),
        { kind: "defeat", reason: "forward-command-destroyed" },
        `${theater.title} operation ${stage + 1} must reach explicit defeat`,
      );
    }
  }
});

test("large Metal Gear-class bosses are reserved for final operations", () => {
  for (const theater of CAMPAIGN_THEATERS) {
    assert.ok(theater.finalTarget);
    assert.ok(["commander", "vehicle", "metal-gear"].includes(theater.finalTargetClass));
    if (theater.finalTargetClass === "metal-gear") assert.equal(theater.finalUnitKind, "basilisk");
    else assert.notEqual(theater.finalUnitKind, "basilisk");
  }
});

test("every four- and five-operation theater routes to assets that exist", () => {
  for (const theater of CAMPAIGN_THEATERS) {
    const roles = theater.operations.map((_, stage) => campaignOperationRole(stage, theater.operations.length));
    assert.deepEqual(roles.slice(0, 3), ["foothold", "radar", "relays"]);
    assert.equal(roles.at(-1), "finale");
    assert.equal(roles.filter((role) => role === "command").length, theater.operations.length === 5 ? 1 : 0);
  }
});

test("a stale signed-in profile cannot relock locally completed Act I theaters", () => {
  const merged = mergeCampaignProgress(
    { completedTheaterIds: ["sable-crown", "harrow-spine", "st-heliot"], unlockedDoctrine: ["fieldLogistics"], commanderXp: 1650, doctrinePoints: 2, updatedAt: 20 },
    { completedTheaterIds: ["sable-crown"], unlockedDoctrine: [], commanderXp: 550, doctrinePoints: 0, updatedAt: 10 },
  );
  assert.deepEqual(merged.completedTheaterIds, ["sable-crown", "harrow-spine", "st-heliot"]);
  assert.equal(merged.commanderXp, 1650);
  assert.equal(merged.doctrinePoints, 2);
});
