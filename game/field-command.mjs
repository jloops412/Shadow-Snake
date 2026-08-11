/**
 * Field-command rules shared by construction, deployment defaults, and the
 * operation launchpad. Keep these pure so the UI never invents a second set of
 * tactical rules.
 */

export const STRUCTURE_NETWORK_RADIUS = 22;
export const CAPTURED_OUTPOST_RADIUS = 26;

const STEALTH_ROLES = new Set(["wraith", "specter", "ghost", "hacker", "raven"]);
const HOLD_ROLES = new Set(["medic", "engineer", "mule"]);

export function defaultStanceForUnit(kind, team = "player") {
  if (team !== "player") return "hold";
  if (STEALTH_ROLES.has(kind)) return "stealth";
  if (HOLD_ROLES.has(kind)) return "hold";
  return "assault";
}

export function buildNetworkSources({ structures = [], nodes = [] }) {
  const structureSources = structures
    .filter((structure) => structure.team === "player" && !structure.disabled)
    .map((structure) => ({
      id: structure.id,
      kind: "structure",
      label: structure.kind === "hq" ? "FORWARD COMMAND" : "BASE NETWORK",
      x: structure.x,
      y: structure.y,
      radius: STRUCTURE_NETWORK_RADIUS,
    }));
  const outpostSources = nodes
    .filter((node) => node.owner === "player")
    .map((node) => ({
      id: node.id,
      kind: "outpost",
      label: node.name ?? "CAPTURED OUTPOST",
      x: node.x,
      y: node.y,
      radius: CAPTURED_OUTPOST_RADIUS,
    }));
  return [...structureSources, ...outpostSources];
}

export function buildNetworkSourceAt(game, point) {
  return buildNetworkSources(game)
    .map((source) => ({
      ...source,
      distance: Math.hypot(source.x - point.x, source.y - point.y),
    }))
    .filter((source) => source.distance <= source.radius)
    .sort((first, second) => first.distance - second.distance)[0] ?? null;
}

export const OPERATION_PHASES = [
  {
    key: "recon",
    label: "RECON",
    instruction: "Scout routes, paint contacts, and expose the signal net.",
    kinds: ["specter", "ghost", "raven", "weasel"],
    stance: "stealth",
  },
  {
    key: "infiltrate",
    label: "INFILTRATE",
    instruction: "Move low-signature assets into hacking and recovery range.",
    kinds: ["wraith", "hacker", "ghost", "engineer"],
    stance: "stealth",
  },
  {
    key: "assault",
    label: "ASSAULT",
    instruction: "Commit line units and armor with engage-on-route orders.",
    kinds: ["viper", "lancer", "foxhound", "weasel", "jackal", "mantis"],
    stance: "assault",
  },
];

export function operationPhaseAssets(phaseKey, units = []) {
  const phase = OPERATION_PHASES.find((candidate) => candidate.key === phaseKey);
  if (!phase) return [];
  return units.filter((unit) => unit.team === "player" && phase.kinds.includes(unit.kind));
}

export function rankProgress(xp = 0) {
  const thresholds = [0, 2, 4, 8];
  const rank = xp >= 8 ? 3 : xp >= 4 ? 2 : xp >= 2 ? 1 : 0;
  const next = rank >= 3 ? null : thresholds[rank + 1];
  return {
    rank,
    next,
    remaining: next === null ? 0 : Math.max(0, next - xp),
  };
}

export function veterancyCooldown(baseSeconds, rank = 0) {
  return Math.max(baseSeconds * 0.78, baseSeconds * (1 - Math.max(0, Math.min(3, rank)) * 0.06));
}
