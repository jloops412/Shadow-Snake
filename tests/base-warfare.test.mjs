import test from "node:test";
import assert from "node:assert/strict";
import { barrierPassableFor, nextBarrierWaypoint, repairZoneStats } from "../game/base-warfare.mjs";

const wall = { id: "wall-a", kind: "wall", team: "player", x: 50, y: 50, hp: 760, disabled: false, footprint: [2, 1] };
const gate = { id: "gate-a", kind: "gate", team: "player", x: 50, y: 50, hp: 940, disabled: false, footprint: [2, 1] };

test("powered IFF gates pass friendly forces and stop hostiles", () => {
  assert.equal(barrierPassableFor(gate, "player", true), true);
  assert.equal(barrierPassableFor(gate, "enemy", true), false);
  assert.equal(barrierPassableFor(gate, "player", false), false);
  assert.equal(barrierPassableFor(wall, "player", true), false);
});

test("a wall changes a crossing order into a deterministic detour", () => {
  const route = nextBarrierWaypoint({
    from: { x: 40, y: 50 },
    target: { x: 60, y: 50 },
    unitTeam: "player",
    barriers: [wall],
  });
  assert.equal(route.direct, false);
  assert.notDeepEqual(route.point, { x: 60, y: 50 });
  assert.equal(route.blockingBarrierId, undefined);
});

test("a sealed defensive line forces hostile breaching while a friendly gate remains a passage", () => {
  const line = Array.from({ length: 16 }, (_, index) => ({
    id: index === 8 ? "gate-center" : `wall-${index}`,
    kind: index === 8 ? "gate" : "wall",
    team: "player",
    x: (index * 2 + 1) * (100 / 32),
    y: 52.5,
    hp: 800,
    disabled: false,
    footprint: [2, 1],
  }));
  const hostile = nextBarrierWaypoint({ from: { x: 50, y: 65 }, target: { x: 50, y: 35 }, unitTeam: "enemy", barriers: line });
  const friendly = nextBarrierWaypoint({ from: { x: 50, y: 65 }, target: { x: 50, y: 35 }, unitTeam: "player", barriers: line });
  assert.equal(hostile.direct, false);
  assert.ok(hostile.blockingBarrierId);
  assert.equal(friendly.blockingBarrierId, undefined);
});

test("repair bay upgrades expand coverage and doctrine multiplies real rates", () => {
  const levelOne = repairZoneStats(1, false);
  const levelThree = repairZoneStats(3, true);
  assert.ok(levelThree.radius > levelOne.radius);
  assert.ok(levelThree.structureRate > levelOne.structureRate);
  assert.equal(levelThree.vehicleRate, levelThree.structureRate * 1.3);
});
