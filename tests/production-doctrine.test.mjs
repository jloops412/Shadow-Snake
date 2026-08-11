import assert from "node:assert/strict";
import test from "node:test";

import { counterMultiplier, recoveryLoadValue } from "../game/production-doctrine.mjs";

test("Recovery Mule payouts scale with controlled relay value", () => {
  assert.equal(recoveryLoadValue(0), 150);
  assert.equal(recoveryLoadValue(6), 270);
  assert.equal(recoveryLoadValue(10), 350);
});

test("combined-arms counters create distinct target roles", () => {
  assert.ok(counterMultiplier("ghost", "infantry") > counterMultiplier("ghost", "vehicle"));
  assert.ok(counterMultiplier("jackal", "infantry") > counterMultiplier("jackal", "structure"));
  assert.ok(counterMultiplier("lancer", "vehicle") > counterMultiplier("lancer", "infantry"));
  assert.ok(counterMultiplier("mantis", "structure") > counterMultiplier("mantis", "infantry"));
});
