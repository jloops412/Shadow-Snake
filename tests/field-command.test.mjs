import assert from "node:assert/strict";
import test from "node:test";

import {
  buildNetworkSourceAt,
  defaultStanceForUnit,
  operationPhaseAssets,
  rankProgress,
  veterancyCooldown,
} from "../game/field-command.mjs";

test("captured outposts project a forward construction network", () => {
  const game = {
    structures: [{ id: "hq", team: "player", kind: "hq", x: 10, y: 85, disabled: false }],
    nodes: [{ id: "relay-b", name: "SUPPLY 02", owner: "player", x: 62, y: 44 }],
  };
  assert.equal(buildNetworkSourceAt(game, { x: 66, y: 46 })?.id, "relay-b");
  assert.equal(buildNetworkSourceAt(game, { x: 94, y: 5 }), null);
});

test("new forces inherit a posture that matches their battlefield role", () => {
  assert.equal(defaultStanceForUnit("wraith"), "stealth");
  assert.equal(defaultStanceForUnit("specter"), "stealth");
  assert.equal(defaultStanceForUnit("medic"), "hold");
  assert.equal(defaultStanceForUnit("mule"), "hold");
  assert.equal(defaultStanceForUnit("viper"), "assault");
  assert.equal(defaultStanceForUnit("mantis"), "assault");
});

test("operation phases use only the available role-matched assets", () => {
  const units = [
    { id: "w", team: "player", kind: "wraith" },
    { id: "s", team: "player", kind: "specter" },
    { id: "v", team: "player", kind: "viper" },
    { id: "e", team: "enemy", kind: "specter" },
  ];
  assert.deepEqual(operationPhaseAssets("recon", units).map((unit) => unit.id), ["s"]);
  assert.deepEqual(operationPhaseAssets("infiltrate", units).map((unit) => unit.id), ["w"]);
  assert.deepEqual(operationPhaseAssets("assault", units).map((unit) => unit.id), ["v"]);
});

test("veterancy exposes real promotion progress and reduces role cooldowns", () => {
  assert.deepEqual(rankProgress(3), { rank: 1, next: 4, remaining: 1 });
  assert.deepEqual(rankProgress(8), { rank: 3, next: null, remaining: 0 });
  assert.ok(veterancyCooldown(20, 3) < veterancyCooldown(20, 0));
});
