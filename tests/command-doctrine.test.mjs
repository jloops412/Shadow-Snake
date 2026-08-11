import assert from "node:assert/strict";
import test from "node:test";

import {
  FORMATIONS,
  destinationForFormation,
  formationOffset,
  issueSerializableOrder,
  nextFormation,
  promoteSerializableOrder,
} from "../game/command-doctrine.mjs";

test("formation destinations give every selected team a distinct slot", () => {
  for (const formation of FORMATIONS) {
    const points = Array.from({ length: 7 }, (_, index) => formationOffset(formation, index, 7));
    assert.equal(new Set(points.map((point) => `${point.x}:${point.y}`)).size, points.length, formation);
  }
});

test("formation destinations respect battlefield clamps", () => {
  const point = destinationForFormation({ x: 99, y: 2 }, "loose", 6, 7, (x) => Math.min(98, Math.max(2, x)), (y) => Math.min(97, Math.max(3, y)));
  assert.ok(point.x >= 2 && point.x <= 98);
  assert.ok(point.y >= 3 && point.y <= 97);
});

test("a direct formation destination preserves a free-form command point", () => {
  const commandPoint = { x: 51.37, y: 44.61 };
  const destination = destinationForFormation(commandPoint, "line", 0, 1, (x) => x, (y) => y);
  assert.deepEqual(destination, commandPoint);
});

test("queued orders survive and promote in issue order", () => {
  const move = { kind: "move", x: 10, y: 10 };
  const guard = { kind: "guard", x: 20, y: 20 };
  const withMove = issueSerializableOrder({ id: "alpha", orderQueue: [] }, move, false);
  const queued = issueSerializableOrder(withMove, guard, true);
  assert.deepEqual(queued.order, move);
  assert.deepEqual(queued.orderQueue, [guard]);
  const promoted = promoteSerializableOrder({ ...queued, order: undefined });
  assert.deepEqual(promoted.order, guard);
  assert.deepEqual(promoted.orderQueue, []);
});

test("a direct order replaces the old plan while formation cycling is stable", () => {
  const direct = issueSerializableOrder({ order: { kind: "move", x: 1, y: 1 }, orderQueue: [{ kind: "move", x: 2, y: 2 }] }, { kind: "move", x: 3, y: 3 }, false);
  assert.deepEqual(direct.orderQueue, []);
  assert.equal(nextFormation("wedge"), "line");
  assert.equal(nextFormation("loose"), "wedge");
});
