import test from "node:test";
import assert from "node:assert/strict";

import {
  THEATER_TACTICS,
  alarmBuildRate,
  moraleBand,
  raidComposition,
  raidDoctrineFor,
  suppressionMoraleLoss,
  terrainEffectAt,
} from "../game/tactical-doctrine.mjs";

test("all thirteen theaters ship mechanical terrain and a raid cycle", () => {
  assert.equal(Object.keys(THEATER_TACTICS).length, 13);
  for (const tactics of Object.values(THEATER_TACTICS)) {
    assert.equal(tactics.zones.length, 3);
    assert.equal(tactics.raidCycle.length, 4);
    assert.ok(tactics.zones.some((zone) => zone.type === "hard-cover" || zone.type === "concealment"));
  }
});

test("terrain changes damage, signature, movement, and high-ground output", () => {
  const cover = terrainEffectAt("sable-crown", { x: 42, y: 56 });
  const concealment = terrainEffectAt("sable-crown", { x: 20, y: 72 });
  const elevation = terrainEffectAt("sable-crown", { x: 60, y: 40 });
  assert.ok(cover.damageTaken < 1);
  assert.ok(concealment.signature < 1);
  assert.ok(elevation.outgoingDamage > 1);
  assert.equal(terrainEffectAt("sable-crown", { x: 5, y: 5 }).zone, null);
});

test("morale and alarms are readable, interruptible systems", () => {
  assert.equal(moraleBand(100), "steady");
  assert.equal(moraleBand(30), "pinned");
  assert.equal(moraleBand(8), "broken");
  assert.ok(suppressionMoraleLoss("foxhound", "open") > suppressionMoraleLoss("foxhound", "hard-cover"));
  assert.ok(alarmBuildRate({ linked: true, sourceKind: "scout", difficulty: "standard" }) > alarmBuildRate({ linked: false, sourceKind: "scout", difficulty: "standard" }));
});

test("raid doctrines rotate and produce role-specific deterministic forces", () => {
  assert.equal(raidDoctrineFor("sable-crown", 1), "scout");
  assert.equal(raidDoctrineFor("sable-crown", 4), "siege");
  assert.deepEqual(raidComposition("assault", 3, 2), ["hunter", "guard", "hunter"]);
  assert.deepEqual(raidComposition("siege", 2, 4), ["hunter", "guard"]);
});
