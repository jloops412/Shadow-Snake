/**
 * Deterministic barrier navigation for the tactical board.
 *
 * Unit locomotion remains continuous. The grid is consulted only when a
 * straight-line order intersects a built wall or controlled gate, at which
 * point this module finds the next open cell around the barrier. Friendly
 * powered gates are IFF passages; hostile forces must route around or breach.
 */

export const TACTICAL_GRID = Object.freeze({ columns: 32, rows: 20 });

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function cellKey(column, row) {
  return `${column}:${row}`;
}

function cellForPoint(point, columns, rows) {
  return {
    column: clamp(Math.floor((point.x / 100) * columns), 0, columns - 1),
    row: clamp(Math.floor((point.y / 100) * rows), 0, rows - 1),
  };
}

function pointForCell(cell, columns, rows) {
  return {
    x: ((cell.column + 0.5) / columns) * 100,
    y: ((cell.row + 0.5) / rows) * 100,
  };
}

export function barrierPassableFor(barrier, unitTeam, powerOnline = true) {
  if (!barrier || barrier.hp <= 0 || barrier.disabled) return true;
  if (barrier.kind === "wall") return false;
  if (barrier.kind !== "gate") return true;
  return barrier.team === unitTeam && powerOnline;
}

function barrierCells(barrier, columns, rows) {
  const [width, height] = barrier.footprint ?? [2, 1];
  const cellWidth = 100 / columns;
  const cellHeight = 100 / rows;
  const startColumn = clamp(Math.round(barrier.x / cellWidth - width / 2), 0, columns - width);
  const startRow = clamp(Math.round(barrier.y / cellHeight - height / 2), 0, rows - height);
  const cells = [];
  for (let row = startRow; row < startRow + height; row += 1) {
    for (let column = startColumn; column < startColumn + width; column += 1) {
      cells.push({ column, row });
    }
  }
  return cells;
}

function directRouteIsClear(from, target, blocked, columns, rows) {
  const deltaX = target.x - from.x;
  const deltaY = target.y - from.y;
  const distance = Math.hypot(deltaX, deltaY);
  const sampleDistance = Math.min(100 / columns, 100 / rows) * 0.45;
  const samples = Math.max(1, Math.ceil(distance / sampleDistance));
  const start = cellForPoint(from, columns, rows);
  for (let index = 1; index <= samples; index += 1) {
    const point = {
      x: from.x + deltaX * (index / samples),
      y: from.y + deltaY * (index / samples),
    };
    const cell = cellForPoint(point, columns, rows);
    if (cell.column === start.column && cell.row === start.row) continue;
    if (blocked.has(cellKey(cell.column, cell.row))) return false;
  }
  return true;
}

function nearestBarrier(from, barriers) {
  return [...barriers]
    .sort((first, second) =>
      Math.hypot(first.x - from.x, first.y - from.y) - Math.hypot(second.x - from.x, second.y - from.y),
    )[0];
}

/**
 * Returns a continuous destination when unobstructed, a grid-cell waypoint
 * when a detour is required, or a barrier id when no route exists and the
 * caller should issue a breach order.
 */
export function nextBarrierWaypoint({
  from,
  target,
  unitTeam,
  powerOnline = true,
  barriers = [],
  columns = TACTICAL_GRID.columns,
  rows = TACTICAL_GRID.rows,
}) {
  const activeBarriers = barriers.filter((barrier) => !barrierPassableFor(barrier, unitTeam, powerOnline));
  if (!activeBarriers.length) return { point: { x: target.x, y: target.y }, direct: true };

  const blocked = new Map();
  activeBarriers.forEach((barrier) => {
    barrierCells(barrier, columns, rows).forEach((cell) => blocked.set(cellKey(cell.column, cell.row), barrier.id));
  });
  if (directRouteIsClear(from, target, blocked, columns, rows)) {
    return { point: { x: target.x, y: target.y }, direct: true };
  }

  const start = cellForPoint(from, columns, rows);
  const goal = cellForPoint(target, columns, rows);
  const startKey = cellKey(start.column, start.row);
  const goalKey = cellKey(goal.column, goal.row);
  const queue = [start];
  const parent = new Map([[startKey, null]]);
  const directions = [
    { column: 1, row: 0 },
    { column: 0, row: 1 },
    { column: -1, row: 0 },
    { column: 0, row: -1 },
  ];

  while (queue.length) {
    const current = queue.shift();
    const currentKey = cellKey(current.column, current.row);
    if (currentKey === goalKey) break;
    const candidates = directions
      .map((direction) => ({ column: current.column + direction.column, row: current.row + direction.row }))
      .filter((cell) => cell.column >= 0 && cell.column < columns && cell.row >= 0 && cell.row < rows)
      .filter((cell) => !blocked.has(cellKey(cell.column, cell.row)))
      .filter((cell) => !parent.has(cellKey(cell.column, cell.row)))
      .sort((first, second) =>
        Math.abs(first.column - goal.column) + Math.abs(first.row - goal.row) -
        (Math.abs(second.column - goal.column) + Math.abs(second.row - goal.row)),
      );
    candidates.forEach((cell) => {
      parent.set(cellKey(cell.column, cell.row), currentKey);
      queue.push(cell);
    });
  }

  if (!parent.has(goalKey)) {
    return { point: { x: from.x, y: from.y }, direct: false, blockingBarrierId: nearestBarrier(from, activeBarriers)?.id };
  }

  const path = [];
  let cursor = goalKey;
  while (cursor) {
    const [column, row] = cursor.split(":").map(Number);
    path.push({ column, row });
    cursor = parent.get(cursor);
  }
  path.reverse();
  const nextCell = path[Math.min(1, path.length - 1)];
  return { point: pointForCell(nextCell, columns, rows), direct: false };
}

export function repairZoneStats(level = 1, preservationDoctrine = false) {
  const safeLevel = clamp(Math.round(level), 1, 3);
  const doctrineRate = preservationDoctrine ? 1.35 : 1;
  const structureRate = (3 + safeLevel * 2) * doctrineRate;
  return {
    radius: 9 + safeLevel * 2,
    structureRate,
    vehicleRate: structureRate * 1.3,
  };
}
