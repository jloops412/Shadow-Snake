/**
 * Pure command rules shared by the battlefield simulation and deterministic
 * tests. Orders stay serializable so command queues survive saves/checkpoints.
 */

export const FORMATIONS = ["wedge", "line", "column", "loose"];

export function nextFormation(current) {
  const index = FORMATIONS.indexOf(current);
  return FORMATIONS[(index + 1 + FORMATIONS.length) % FORMATIONS.length];
}

export function formationOffset(formation, index, count, spacing = 2.4) {
  const centered = index - (count - 1) / 2;
  if (formation === "line") return { x: centered * spacing, y: 0 };
  if (formation === "column") return { x: 0, y: centered * spacing };
  if (formation === "loose") {
    const columns = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / columns);
    return {
      x: ((index % columns) - (columns - 1) / 2) * spacing * 1.55,
      y: (Math.floor(index / columns) - (rows - 1) / 2) * spacing * 1.55,
    };
  }
  if (index === 0) return { x: 0, y: -spacing * 0.6 };
  const rank = Math.ceil(index / 2);
  const side = index % 2 === 0 ? 1 : -1;
  return { x: side * rank * spacing, y: rank * spacing * 0.82 };
}

export function destinationForFormation(point, formation, index, count, clampX, clampY) {
  const offset = formationOffset(formation, index, count);
  return {
    x: clampX(point.x + offset.x),
    y: clampY(point.y + offset.y),
  };
}

export function issueSerializableOrder(unit, order, queue) {
  const currentQueue = Array.isArray(unit.orderQueue) ? unit.orderQueue : [];
  if (queue && unit.order) return { ...unit, orderQueue: [...currentQueue, order] };
  return { ...unit, order, orderQueue: queue ? currentQueue : [] };
}

export function promoteSerializableOrder(unit) {
  const queue = Array.isArray(unit.orderQueue) ? unit.orderQueue : [];
  if (unit.order || !queue.length) return unit;
  return { ...unit, order: queue[0], orderQueue: queue.slice(1) };
}
