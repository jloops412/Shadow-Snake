"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";

type Phase = "menu" | "playing" | "won" | "lost";
type Team = "player" | "enemy";
type Difficulty = "guided" | "standard" | "hardline";
type Stance = "stealth" | "hold" | "assault";
type SecurityState = "hidden" | "suspicion" | "caution" | "alert";
type UnitKind =
  | "wraith"
  | "viper"
  | "specter"
  | "lancer"
  | "medic"
  | "guard"
  | "hunter"
  | "scout";
type StructureKind =
  | "hq"
  | "generator"
  | "barracks"
  | "sentry"
  | "sensor"
  | "enemyRadar"
  | "enemyRelay"
  | "enemyUplink"
  | "enemyTurret"
  | "enemyGate";
type BuildKey = "generator" | "barracks" | "sentry" | "sensor";
type TrainKey = "wraith" | "viper" | "specter" | "lancer" | "medic";
type SquadSlot = "alpha" | "bravo" | "charlie";
type SquadCohort = "all" | "infil" | "assault" | "support";
type TechKey =
  | "whisperMesh"
  | "spectralWeave"
  | "fieldMedicine"
  | "traumaNetwork"
  | "relayBrokerage"
  | "rapidFabrication";
type AbilityMode =
  | "tranq"
  | "decoy"
  | "smoke"
  | "scan"
  | "grenade"
  | "demo"
  | "attackMove"
  | "patrol"
  | "breach"
  | "medkit"
  | "rally"
  | null;
type OrderKind = "move" | "attackMove" | "attack" | "capture" | "hack" | "tranq";
type EffectKind = "tracer" | "impact" | "move" | "noise" | "decoy" | "smoke" | "scan" | "blast" | "heal";

type Point = { x: number; y: number };

type Order = {
  kind: OrderKind;
  x: number;
  y: number;
  targetId?: string;
  delay?: number;
  phase?: Exclude<SquadCohort, "all">;
};

type Unit = Point & {
  id: string;
  team: Team;
  kind: UnitKind;
  hp: number;
  maxHp: number;
  stance: Stance;
  facing: number;
  order?: Order;
  patrol?: Point[];
  patrolIndex: number;
  attackCd: number;
  sleep: number;
  suppressed: number;
  revealed: number;
  raid: boolean;
  combatTimer: number;
  rank: 0 | 1 | 2 | 3;
  xp: number;
  kills: number;
};

type Structure = Point & {
  id: string;
  team: Team;
  kind: StructureKind;
  hp: number;
  maxHp: number;
  attackCd: number;
  disabled: boolean;
  hackProgress: number;
};

type ControlNode = Point & {
  id: string;
  name: string;
  income: number;
  capture: number;
  owner: Team | null;
  claimed: boolean;
};

type FieldCache = Point & {
  id: string;
  name: string;
  value: number;
  collected: boolean;
};

type QueueItem<T extends string> = {
  id: number;
  key: T;
  remaining: number;
  total: number;
  ready?: boolean;
};

type Effect = Point & {
  id: number;
  kind: EffectKind;
  ttl: number;
  maxTtl: number;
  radius?: number;
  x2?: number;
  y2?: number;
  team?: Team;
};

type Cooldowns = {
  tranq: number;
  decoy: number;
  smoke: number;
  scan: number;
  chaff: number;
  grenade: number;
  demo: number;
  medkit: number;
};

type Transmission = {
  speaker: string;
  text: string;
  ttl: number;
};

type GameState = {
  phase: Phase;
  difficulty: Difficulty;
  paused: boolean;
  speed: 1 | 1.5;
  elapsed: number;
  resources: number;
  alert: number;
  alertHold: number;
  lastKnown?: Point;
  raidTimer: number;
  raidWave: number;
  raidsCleared: number;
  responseTimer: number;
  radarTimer: number;
  jamTimer: number;
  selectedIds: string[];
  selectedStructureId?: string;
  squads: Record<SquadSlot, string[]>;
  activeSquad: SquadSlot | null;
  rallyPoint?: Point;
  units: Unit[];
  structures: Structure[];
  nodes: ControlNode[];
  caches: FieldCache[];
  unitQueue: QueueItem<TrainKey>[];
  structureQueue: QueueItem<BuildKey> | null;
  researchQueue: QueueItem<TechKey> | null;
  researched: TechKey[];
  buildMode: BuildKey | null;
  abilityMode: AbilityMode;
  cooldowns: Cooldowns;
  effects: Effect[];
  nextId: number;
  staff: number;
  detections: number;
  eliminations: number;
  losses: number;
  nodesSecured: number;
  transmission?: Transmission;
  logs: string[];
};

type TechSpec = {
  name: string;
  code: string;
  branch: "covert" | "support" | "systems";
  description: string;
  effect: string;
  cost: number;
  time: number;
  requires?: TechKey;
};

type UnitSpec = {
  name: string;
  code: string;
  role: string;
  hp: number;
  speed: number;
  range: number;
  vision: number;
  damage: number;
  cooldown: number;
  signature: number;
  cost: number;
  time: number;
  supply: number;
};

type DifficultySpec = {
  name: string;
  callsign: string;
  description: string;
  startingGmp: number;
  baseIncome: number;
  firstRaid: number;
  raidInterval: number;
  enemyDamage: number;
  detectionRate: number;
  captureRate: number;
  nodeBonus: number;
  raidBounty: number;
};

type GuideStep = {
  step: string;
  title: string;
  instruction: string;
  payoff: string;
  action: "alpha" | "base" | "wraith" | "ops" | "none";
  actionLabel?: string;
  targetId?: string;
  buildKey?: BuildKey;
};

const DIFFICULTY_SPECS: Record<Difficulty, DifficultySpec> = {
  guided: {
    name: "Guided operation",
    callsign: "GUIDED",
    description: "Best first run · live strategy guidance, a healthy command budget, and slower retaliation.",
    startingGmp: 1500,
    baseIncome: 5,
    firstRaid: 120,
    raidInterval: 70,
    enemyDamage: 0.82,
    detectionRate: 0.82,
    captureRate: 1.25,
    nodeBonus: 300,
    raidBounty: 260,
  },
  standard: {
    name: "Standard operation",
    callsign: "STANDARD",
    description: "The intended campaign balance with useful guidance and steady strategic pressure.",
    startingGmp: 1250,
    baseIncome: 4,
    firstRaid: 95,
    raidInterval: 58,
    enemyDamage: 1,
    detectionRate: 1,
    captureRate: 1,
    nodeBonus: 250,
    raidBounty: 220,
  },
  hardline: {
    name: "Hardline operation",
    callsign: "HARDLINE",
    description: "Lean resources, faster raids, sharper detection, and heavier incoming damage.",
    startingGmp: 980,
    baseIncome: 3,
    firstRaid: 70,
    raidInterval: 50,
    enemyDamage: 1.18,
    detectionRate: 1.15,
    captureRate: 0.9,
    nodeBonus: 200,
    raidBounty: 190,
  },
};

const UNIT_SPECS: Record<UnitKind, UnitSpec> = {
  wraith: {
    name: "Wraith",
    code: "WR",
    role: "Infiltration · suppressed",
    hp: 105,
    speed: 8.6,
    range: 9,
    vision: 19,
    damage: 34,
    cooldown: 1.15,
    signature: 0.58,
    cost: 260,
    time: 7,
    supply: 1,
  },
  viper: {
    name: "Viper",
    code: "VP",
    role: "Assault · anti-personnel",
    hp: 185,
    speed: 6.4,
    range: 10.5,
    vision: 17,
    damage: 31,
    cooldown: 0.78,
    signature: 1,
    cost: 330,
    time: 8,
    supply: 2,
  },
  specter: {
    name: "Specter",
    code: "SP",
    role: "Recon · electronic warfare",
    hp: 115,
    speed: 9,
    range: 12,
    vision: 27,
    damage: 10,
    cooldown: 1.2,
    signature: 0.7,
    cost: 360,
    time: 10,
    supply: 2,
  },
  lancer: {
    name: "Lancer",
    code: "LN",
    role: "Anti-armor · demolition",
    hp: 155,
    speed: 5.1,
    range: 13,
    vision: 16,
    damage: 76,
    cooldown: 2.25,
    signature: 1.18,
    cost: 470,
    time: 12,
    supply: 3,
  },
  medic: {
    name: "Lifeline",
    code: "MD",
    role: "Combat medic · sustain",
    hp: 132,
    speed: 6.9,
    range: 8.5,
    vision: 17,
    damage: 14,
    cooldown: 1.1,
    signature: 0.82,
    cost: 340,
    time: 10,
    supply: 2,
  },
  guard: {
    name: "Sentry",
    code: "G",
    role: "Patrol infantry",
    hp: 110,
    speed: 5.2,
    range: 9,
    vision: 16,
    damage: 17,
    cooldown: 1.05,
    signature: 1,
    cost: 0,
    time: 0,
    supply: 0,
  },
  hunter: {
    name: "Hunter",
    code: "H",
    role: "Heavy response unit",
    hp: 235,
    speed: 4.7,
    range: 10.5,
    vision: 17,
    damage: 28,
    cooldown: 0.92,
    signature: 1,
    cost: 0,
    time: 0,
    supply: 0,
  },
  scout: {
    name: "Watchdog",
    code: "D",
    role: "Detection drone",
    hp: 82,
    speed: 7.4,
    range: 7,
    vision: 22,
    damage: 8,
    cooldown: 1.15,
    signature: 1,
    cost: 0,
    time: 0,
    supply: 0,
  },
};

const BUILD_SPECS: Record<
  BuildKey,
  { name: string; code: string; role: string; cost: number; time: number; power: number; hp: number }
> = {
  generator: {
    name: "Micro Reactor",
    code: "MR",
    role: "+10 grid power",
    cost: 280,
    time: 7,
    power: -10,
    hp: 470,
  },
  barracks: {
    name: "Team Habitat",
    code: "TH",
    role: "+6 supply · faster training",
    cost: 420,
    time: 9,
    power: 2,
    hp: 620,
  },
  sentry: {
    name: "Sentry Nest",
    code: "SN",
    role: "Automated perimeter defense",
    cost: 330,
    time: 8,
    power: 4,
    hp: 540,
  },
  sensor: {
    name: "Passive Array",
    code: "PA",
    role: "Reveals nearby movement",
    cost: 300,
    time: 7,
    power: 3,
    hp: 400,
  },
};

const STRUCTURE_LABELS: Record<StructureKind, { name: string; code: string }> = {
  hq: { name: "Forward Command", code: "FOB" },
  generator: { name: "Micro Reactor", code: "MR" },
  barracks: { name: "Team Habitat", code: "TH" },
  sentry: { name: "Sentry Nest", code: "SN" },
  sensor: { name: "Passive Array", code: "PA" },
  enemyRadar: { name: "Detection Radar", code: "RD" },
  enemyRelay: { name: "Security Relay", code: "LK" },
  enemyUplink: { name: "Command Uplink", code: "AI" },
  enemyTurret: { name: "Gun Emplacement", code: "TX" },
  enemyGate: { name: "Response Hangar", code: "GH" },
};

const TERRAIN_ZONES = [
  { id: "shadow-a", x: 18, y: 68, w: 18, h: 13, label: "PINE SHADOW" },
  { id: "shadow-b", x: 39, y: 53, w: 18, h: 11, label: "DRAINAGE CUT" },
  { id: "shadow-c", x: 57, y: 38, w: 15, h: 9, label: "DEAD GROUND" },
];

const BUILD_KEYS = Object.keys(BUILD_SPECS) as BuildKey[];
const TRAIN_KEYS: TrainKey[] = ["wraith", "viper", "specter", "lancer", "medic"];
const SQUAD_SLOTS: SquadSlot[] = ["alpha", "bravo", "charlie"];

const TECH_SPECS: Record<TechKey, TechSpec> = {
  whisperMesh: {
    name: "Whisper Mesh",
    code: "WM-1",
    branch: "covert",
    description: "Encrypted low-emission command links.",
    effect: "−18% friendly detection signature",
    cost: 350,
    time: 12,
  },
  spectralWeave: {
    name: "Spectral Weave",
    code: "SW-2",
    branch: "covert",
    description: "Adaptive fabric tuned for dead ground.",
    effect: "+22% stealth movement in shadow",
    cost: 620,
    time: 18,
    requires: "whisperMesh",
  },
  fieldMedicine: {
    name: "Field Medicine",
    code: "FM-1",
    branch: "support",
    description: "Forward trauma doctrine and compact kits.",
    effect: "Unlock Lifeline medics + trauma pulse",
    cost: 320,
    time: 10,
  },
  traumaNetwork: {
    name: "Trauma Network",
    code: "TN-2",
    branch: "support",
    description: "Squad biometrics route care before collapse.",
    effect: "+55% medic healing and stronger trauma pulse",
    cost: 540,
    time: 16,
    requires: "fieldMedicine",
  },
  relayBrokerage: {
    name: "Relay Brokerage",
    code: "RB-1",
    branch: "systems",
    description: "Route captured supply through shadow markets.",
    effect: "+25% GMP from controlled relays",
    cost: 360,
    time: 12,
  },
  rapidFabrication: {
    name: "Rapid Fabrication",
    code: "RF-2",
    branch: "systems",
    description: "Distributed tooling and predictive logistics.",
    effect: "+25% build, training, and research speed",
    cost: 600,
    time: 17,
    requires: "relayBrokerage",
  },
};

const TECH_BRANCHES: Array<{ key: TechSpec["branch"]; name: string; lead: string }> = [
  { key: "covert", name: "Covert Systems", lead: "Signature and movement" },
  { key: "support", name: "Field Support", lead: "Survival and recovery" },
  { key: "systems", name: "Black Logistics", lead: "Economy and fabrication" },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function facingTo(from: Point, to: Point) {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI + 90;
}

function angleDifference(a: number, b: number) {
  return Math.abs(((a - b + 540) % 360) - 180);
}

function addLog(logs: string[], text: string) {
  return [text, ...logs].slice(0, 6);
}

function securityState(alert: number): SecurityState {
  if (alert >= 85) return "alert";
  if (alert >= 55) return "caution";
  if (alert >= 20) return "suspicion";
  return "hidden";
}

function cohortForUnit(kind: UnitKind): Exclude<SquadCohort, "all"> {
  if (kind === "wraith" || kind === "specter") return "infil";
  if (kind === "medic") return "support";
  return "assault";
}

function makeUnit(
  id: string,
  team: Team,
  kind: UnitKind,
  x: number,
  y: number,
  extras: Partial<Unit> = {},
): Unit {
  const spec = UNIT_SPECS[kind];
  return {
    id,
    team,
    kind,
    x,
    y,
    hp: spec.hp,
    maxHp: spec.hp,
    stance: team === "player" && kind === "wraith" ? "stealth" : "hold",
    facing: team === "player" ? -22 : 155,
    patrolIndex: 0,
    attackCd: 0,
    sleep: 0,
    suppressed: 0,
    revealed: team === "player" ? 999 : 0,
    raid: false,
    combatTimer: 0,
    rank: 0,
    xp: 0,
    kills: 0,
    ...extras,
  };
}

function makeStructure(
  id: string,
  team: Team,
  kind: StructureKind,
  x: number,
  y: number,
  hp: number,
): Structure {
  return {
    id,
    team,
    kind,
    x,
    y,
    hp,
    maxHp: hp,
    attackCd: 0,
    disabled: false,
    hackProgress: 0,
  };
}

function raidIntervalFor(difficulty: Difficulty, wave: number) {
  const base = DIFFICULTY_SPECS[difficulty].raidInterval;
  const floor = difficulty === "guided" ? 44 : difficulty === "standard" ? 38 : 31;
  return Math.max(floor, base - Math.max(0, wave - 1) * 3);
}

function raidContactCount(difficulty: Difficulty, wave: number) {
  const baseline = 1 + Math.ceil(wave / 2);
  return Math.min(6, baseline + (difficulty === "hardline" && wave >= 2 ? 1 : 0));
}

function structureBounty(kind: StructureKind) {
  if (kind === "enemyRadar") return 180;
  if (kind === "enemyRelay") return 200;
  if (kind === "enemyGate") return 350;
  if (kind === "enemyTurret") return 90;
  return 0;
}

function initialGame(phase: Phase = "menu", difficulty: Difficulty = "guided"): GameState {
  const tuning = DIFFICULTY_SPECS[difficulty];
  return {
    phase,
    difficulty,
    paused: false,
    speed: 1,
    elapsed: 0,
    resources: tuning.startingGmp,
    alert: 0,
    alertHold: 0,
    raidTimer: tuning.firstRaid,
    raidWave: 0,
    raidsCleared: 0,
    responseTimer: difficulty === "guided" ? 26 : difficulty === "standard" ? 20 : 16,
    radarTimer: difficulty === "guided" ? 12 : difficulty === "standard" ? 9 : 7,
    jamTimer: 0,
    selectedIds: ["wraith-1", "viper-1", "specter-1"],
    squads: {
      alpha: ["wraith-1", "viper-1", "specter-1"],
      bravo: [],
      charlie: [],
    },
    activeSquad: "alpha",
    rallyPoint: { x: 20, y: 78 },
    units: [
      makeUnit("wraith-1", "player", "wraith", 14, 78),
      makeUnit("viper-1", "player", "viper", 18, 82),
      makeUnit("specter-1", "player", "specter", 12, 85),
      makeUnit("guard-1", "enemy", "guard", 32, 63, {
        patrol: [{ x: 32, y: 63 }, { x: 41, y: 57 }, { x: 34, y: 52 }],
      }),
      makeUnit("guard-2", "enemy", "guard", 49, 47, {
        patrol: [{ x: 49, y: 47 }, { x: 57, y: 42 }, { x: 51, y: 36 }],
      }),
      makeUnit("guard-3", "enemy", "guard", 68, 39, {
        patrol: [{ x: 68, y: 39 }, { x: 73, y: 33 }, { x: 63, y: 32 }],
      }),
      makeUnit("hunter-1", "enemy", "hunter", 82, 34, {
        patrol: [{ x: 82, y: 34 }, { x: 88, y: 29 }, { x: 77, y: 28 }],
      }),
      makeUnit("scout-1", "enemy", "scout", 58, 30, {
        patrol: [{ x: 58, y: 30 }, { x: 67, y: 24 }, { x: 58, y: 19 }],
      }),
    ],
    structures: [
      makeStructure("hq", "player", "hq", 11, 86, 1250),
      makeStructure("enemy-radar", "enemy", "enemyRadar", 66, 27, 640),
      makeStructure("relay-a", "enemy", "enemyRelay", 75, 30, 600),
      makeStructure("relay-b", "enemy", "enemyRelay", 87, 28, 600),
      makeStructure("uplink", "enemy", "enemyUplink", 82, 14, 1500),
      makeStructure("turret-a", "enemy", "enemyTurret", 70, 38, 570),
      makeStructure("turret-b", "enemy", "enemyTurret", 90, 34, 570),
      makeStructure("enemy-gate", "enemy", "enemyGate", 94, 19, 900),
    ],
    nodes: [
      { id: "node-a", name: "SUPPLY 01", x: 28, y: 71, income: 6, capture: 0, owner: null, claimed: false },
      { id: "node-b", name: "SUPPLY 02", x: 48, y: 52, income: 7, capture: -100, owner: "enemy", claimed: false },
      { id: "node-c", name: "INTEL 03", x: 63, y: 42, income: 8, capture: -100, owner: "enemy", claimed: false },
    ],
    caches: [
      { id: "cache-a", name: "FIELD CACHE A", x: 23, y: 74, value: 220, collected: false },
      { id: "cache-b", name: "FIELD CACHE B", x: 43, y: 58, value: 260, collected: false },
      { id: "cache-c", name: "FIELD CACHE C", x: 59, y: 47, value: 320, collected: false },
    ],
    unitQueue: [],
    structureQueue: null,
    researchQueue: null,
    researched: [],
    buildMode: null,
    abilityMode: null,
    cooldowns: { tranq: 0, decoy: 0, smoke: 0, scan: 0, chaff: 0, grenade: 0, demo: 0, medkit: 0 },
    effects: [],
    nextId: 100,
    staff: 0,
    detections: 0,
    eliminations: 0,
    losses: 0,
    nodesSecured: 0,
    logs: [
      "OPS NET // Tactical grid synchronized",
      `Command allocation received: ${tuning.startingGmp} GMP · first raid in ${tuning.firstRaid}s`,
      "Alpha is preselected. Secure SUPPLY 01 and recover the nearby field cache.",
    ],
  };
}

function inShadow(point: Point) {
  return TERRAIN_ZONES.some(
    (zone) =>
      point.x >= zone.x &&
      point.x <= zone.x + zone.w &&
      point.y >= zone.y &&
      point.y <= zone.y + zone.h,
  );
}

function onRoad(point: Point) {
  const roadY = 91 - point.x * 0.64;
  return Math.abs(point.y - roadY) < 3.2;
}

function powerStats(structures: Structure[]) {
  let produced = 10;
  let used = 0;
  structures
    .filter((structure) => structure.team === "player" && !structure.disabled)
    .forEach((structure) => {
      if (structure.kind === "generator") produced += 10;
      if (structure.kind === "barracks") used += 2;
      if (structure.kind === "sentry") used += 4;
      if (structure.kind === "sensor") used += 3;
    });
  return { produced, used, online: produced >= used };
}

function supplyStats(units: Unit[], structures: Structure[], staff: number) {
  const used = units
    .filter((unit) => unit.team === "player")
    .reduce((total, unit) => total + UNIT_SPECS[unit.kind].supply, 0);
  const habitats = structures.filter(
    (structure) => structure.team === "player" && structure.kind === "barracks" && !structure.disabled,
  ).length;
  return { used, cap: 10 + habitats * 6 + Math.min(staff, 4) };
}

function economyStats(game: Pick<GameState, "nodes" | "researched" | "difficulty">) {
  const rawNodeIncome = game.nodes
    .filter((node) => node.owner === "player")
    .reduce((total, node) => total + node.income, 0);
  const nodeIncome = rawNodeIncome * (game.researched.includes("relayBrokerage") ? 1.25 : 1);
  const baseIncome = DIFFICULTY_SPECS[game.difficulty].baseIncome;
  return { income: baseIncome + nodeIncome, nodeIncome, baseIncome };
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function advanceGame(previous: GameState, rawDt: number): GameState {
  if (previous.phase !== "playing" || previous.paused) return previous;

  const dt = rawDt * previous.speed;
  const tuning = DIFFICULTY_SPECS[previous.difficulty];
  let units: Unit[] = previous.units.map((unit) => ({
    ...unit,
    order: unit.order ? { ...unit.order } : undefined,
    patrol: unit.patrol?.map((point) => ({ ...point })),
  }));
  let structures = previous.structures.map((structure) => ({ ...structure }));
  let nodes = previous.nodes.map((node) => ({ ...node }));
  let caches = previous.caches.map((cache) => ({ ...cache }));
  const effects = previous.effects
    .map((effect) => ({ ...effect, ttl: effect.ttl - dt }))
    .filter((effect) => effect.ttl > 0);
  let logs = previous.logs;
  let nextId = previous.nextId;
  let resources = previous.resources;
  let alert = previous.alert;
  let alertHold = Math.max(0, previous.alertHold - dt);
  let lastKnown = previous.lastKnown;
  let raidTimer = previous.raidTimer - dt;
  let raidWave = previous.raidWave;
  let raidsCleared = previous.raidsCleared;
  let responseTimer = previous.responseTimer - dt;
  let radarTimer = previous.radarTimer - dt;
  const jamTimer = Math.max(0, previous.jamTimer - dt);
  let detections = previous.detections;
  let eliminations = previous.eliminations;
  let losses = previous.losses;
  let nodesSecured = previous.nodesSecured;
  let researched = [...previous.researched];
  const researchQueue = previous.researchQueue ? { ...previous.researchQueue } : null;
  let transmission = previous.transmission
    ? { ...previous.transmission, ttl: previous.transmission.ttl - dt }
    : undefined;
  if (transmission && transmission.ttl <= 0) transmission = undefined;

  const cooldowns: Cooldowns = {
    tranq: Math.max(0, previous.cooldowns.tranq - dt),
    decoy: Math.max(0, previous.cooldowns.decoy - dt),
    smoke: Math.max(0, previous.cooldowns.smoke - dt),
    scan: Math.max(0, previous.cooldowns.scan - dt),
    chaff: Math.max(0, previous.cooldowns.chaff - dt),
    grenade: Math.max(0, previous.cooldowns.grenade - dt),
    demo: Math.max(0, previous.cooldowns.demo - dt),
    medkit: Math.max(0, previous.cooldowns.medkit - dt),
  };

  const power = powerStats(structures);
  const fabricationBonus = previous.researched.includes("rapidFabrication") ? 1.25 : 1;
  const buildRate = (power.online ? 1 : 0.35) * Math.min(1.5, 1 + previous.staff * 0.05) * fabricationBonus;
  const structureQueue = previous.structureQueue ? { ...previous.structureQueue } : null;
  let buildMode = previous.buildMode;
  if (structureQueue && !structureQueue.ready) {
    structureQueue.remaining = Math.max(0, structureQueue.remaining - dt * buildRate);
    if (structureQueue.remaining <= 0) {
      structureQueue.ready = true;
      buildMode = structureQueue.key;
      logs = addLog(logs, `${BUILD_SPECS[structureQueue.key].name} ready for placement`);
    }
  }

  const unitQueue = previous.unitQueue.map((item) => ({ ...item }));
  if (unitQueue.length) {
    unitQueue[0].remaining -= dt * buildRate;
    if (unitQueue[0].remaining <= 0) {
      const complete = unitQueue.shift()!;
      const spawn = structures.find(
        (structure) => structure.team === "player" && structure.kind === "barracks" && !structure.disabled,
      ) ?? structures.find((structure) => structure.kind === "hq" && structure.team === "player");
      if (spawn) {
        const angle = (nextId % 6) * 1.04;
        const deployed = makeUnit(
          `${complete.key}-${nextId++}`,
          "player",
          complete.key,
          clamp(spawn.x + Math.cos(angle) * 4.5, 3, 97),
          clamp(spawn.y + Math.sin(angle) * 4.5, 4, 96),
        );
        if (previous.rallyPoint) {
          deployed.order = { kind: "attackMove", ...previous.rallyPoint };
          deployed.stance = "assault";
        }
        units.push(deployed);
        logs = addLog(logs, `${UNIT_SPECS[complete.key].name} team deployed`);
      }
    }
  }

  if (researchQueue) {
    researchQueue.remaining = Math.max(0, researchQueue.remaining - dt * buildRate);
    if (researchQueue.remaining <= 0 && !researched.includes(researchQueue.key)) {
      researched = [...researched, researchQueue.key];
      const completed = TECH_SPECS[researchQueue.key];
      logs = addLog(logs, `${completed.name} research complete: ${completed.effect}`);
      transmission = {
        speaker: "ORBIT-893 // R&D",
        text: `${completed.code} is live across the operation. ${completed.effect}.`,
        ttl: 6,
      };
    }
  }
  const activeResearchQueue = researchQueue?.remaining === 0 ? null : researchQueue;

  const beforeSecurity = securityState(alert);
  const radar = structures.find(
    (structure) => structure.kind === "enemyRadar" && structure.team === "enemy" && !structure.disabled,
  );
  if (radar && jamTimer <= 0 && radarTimer <= 0) {
    effects.push({
      id: nextId++,
      kind: "scan",
      x: radar.x,
      y: radar.y,
      ttl: 1.8,
      maxTtl: 1.8,
      radius: 42,
      team: "enemy",
    });
    const exposed = units
      .filter((unit) => unit.team === "player")
      .filter((unit) => !inShadow(unit))
      .filter(
        (unit) =>
          !effects.some(
            (effect) => effect.kind === "smoke" && distance(effect, unit) <= (effect.radius ?? 0),
          ),
      )
      .sort((a, b) => distance(a, radar) - distance(b, radar))[0];
    if (exposed && distance(exposed, radar) <= 45) {
      alert = clamp(alert + 18 * tuning.detectionRate, 0, 100);
      alertHold = Math.max(alertHold, 5);
      lastKnown = { x: exposed.x, y: exposed.y };
      logs = addLog(logs, "Radar sweep found a signature in the open");
    }
    radarTimer = previous.difficulty === "guided" ? 12 : previous.difficulty === "standard" ? 9 : 8;
  } else if (radarTimer <= 0) {
    radarTimer = 3;
  }

  const playerUnits = () => units.filter((unit) => unit.team === "player" && unit.hp > 0);
  const enemyUnits = () => units.filter((unit) => unit.team === "enemy" && unit.hp > 0 && unit.sleep <= 0);

  enemyUnits().forEach((enemy) => {
    const enemySpec = UNIT_SPECS[enemy.kind];
    const contact = playerUnits()
      .map((player) => {
        const playerSpec = UNIT_SPECS[player.kind];
        const stanceSignature = player.stance === "stealth" ? 0.56 : player.stance === "hold" ? 0.78 : 1;
        const terrainSignature = inShadow(player) ? 0.5 : 1;
        const meshSignature = researched.includes("whisperMesh") ? 0.82 : 1;
        const smokeSignature = effects.some(
          (effect) => effect.kind === "smoke" && distance(effect, player) <= (effect.radius ?? 0),
        )
          ? 0.34
          : 1;
        const detectionRange = Math.max(
          3.5,
          enemySpec.vision * playerSpec.signature * stanceSignature * terrainSignature * smokeSignature * meshSignature,
        );
        const d = distance(enemy, player);
        const cone = angleDifference(enemy.facing, facingTo(enemy, player)) <= (enemy.kind === "scout" ? 76 : 59);
        return { player, d, visible: d <= 3.3 || (d <= detectionRange && cone) };
      })
      .filter((candidate) => candidate.visible)
      .sort((a, b) => a.d - b.d)[0];

    if (contact) {
      alert = clamp(
        alert + (enemy.kind === "scout" ? 58 : 44) * dt * tuning.detectionRate,
        0,
        100,
      );
      alertHold = Math.max(alertHold, 8);
      lastKnown = { x: contact.player.x, y: contact.player.y };
      enemy.order = {
        kind: "attack",
        targetId: contact.player.id,
        x: contact.player.x,
        y: contact.player.y,
      };
    } else if (!enemy.raid) {
      const heard = effects
        .filter((effect) => effect.kind === "noise" || effect.kind === "decoy")
        .filter((effect) => distance(enemy, effect) <= (effect.radius ?? 0))
        .sort((a, b) => distance(enemy, a) - distance(enemy, b))[0];
      if (heard) {
        enemy.order = { kind: "move", x: heard.x, y: heard.y };
        alert = clamp(alert + 5 * dt * tuning.detectionRate, 0, 100);
      } else if (securityState(alert) !== "hidden" && lastKnown) {
        enemy.order = { kind: "move", x: lastKnown.x, y: lastKnown.y };
      } else if (enemy.patrol?.length) {
        const point = enemy.patrol[enemy.patrolIndex % enemy.patrol.length];
        if (distance(enemy, point) < 1.1) {
          enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrol.length;
        }
        const nextPoint = enemy.patrol[enemy.patrolIndex % enemy.patrol.length];
        enemy.order = { kind: "move", x: nextPoint.x, y: nextPoint.y };
      }
    }
  });

  const currentSecurity = securityState(alert);
  if (beforeSecurity !== currentSecurity) {
    if (currentSecurity === "alert") {
      detections += 1;
      transmission = {
        speaker: "OPS // PRIORITY",
        text: "Contact confirmed. Break line of sight or commit to the fight.",
        ttl: 6,
      };
      logs = addLog(logs, "ALERT // Response network fully active");
    } else if (currentSecurity === "caution") {
      logs = addLog(logs, "CAUTION // Patrols converging on last known position");
    } else if (currentSecurity === "hidden") {
      logs = addLog(logs, "Contact lost. Patrol network returning to baseline.");
    }
  }

  if (alertHold <= 0) alert = clamp(alert - (currentSecurity === "alert" ? 4 : 8) * dt, 0, 100);

  units.forEach((unit) => {
    unit.attackCd = Math.max(0, unit.attackCd - dt);
    unit.suppressed = Math.max(0, unit.suppressed - dt);
    unit.combatTimer = Math.max(0, unit.combatTimer - dt);
    unit.revealed = unit.team === "player" ? 999 : Math.max(0, unit.revealed - dt);
    if (unit.sleep > 0) {
      unit.sleep = Math.max(0, unit.sleep - dt);
      unit.order = undefined;
    }
    if (unit.order?.delay && unit.order.delay > 0) {
      unit.order.delay = Math.max(0, unit.order.delay - dt);
    }
  });

  const fieldHospitals = structures.filter(
    (structure) =>
      structure.team === "player" &&
      !structure.disabled &&
      (structure.kind === "hq" || structure.kind === "barracks"),
  );
  units
    .filter((unit) => unit.team === "player" && unit.combatTimer <= 0 && unit.hp < unit.maxHp)
    .forEach((unit) => {
      const resupply = fieldHospitals.some((structure) => distance(structure, unit) <= 8.5);
      if (resupply) unit.hp = Math.min(unit.maxHp, unit.hp + 5.5 * dt);
    });

  const medics = units.filter(
    (unit) => unit.team === "player" && unit.kind === "medic" && unit.sleep <= 0,
  );
  const medicRate = researched.includes("traumaNetwork") ? 6.5 : 4.2;
  medics.forEach((medic) => {
    const casualty = units
      .filter(
        (unit) =>
          unit.team === "player" &&
          unit.id !== medic.id &&
          unit.hp < unit.maxHp &&
          distance(unit, medic) <= 8.5,
      )
      .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    if (casualty) casualty.hp = Math.min(casualty.maxHp, casualty.hp + medicRate * dt);
  });

  const onlineSensors = structures.filter(
    (structure) =>
      structure.team === "player" &&
      structure.kind === "sensor" &&
      !structure.disabled &&
      power.online,
  );
  units
    .filter((unit) => unit.team === "enemy")
    .forEach((enemy) => {
      const seenByUnit = units
        .filter((unit) => unit.team === "player")
        .some((friendly) => distance(friendly, enemy) <= UNIT_SPECS[friendly.kind].vision);
      const seenBySensor = onlineSensors.some((sensor) => distance(sensor, enemy) <= 24);
      const seenByScan = effects.some(
        (effect) =>
          effect.kind === "scan" &&
          effect.team === "player" &&
          distance(effect, enemy) <= (effect.radius ?? 0),
      );
      if (seenByUnit || seenBySensor || seenByScan) enemy.revealed = Math.max(enemy.revealed, seenByScan ? 7 : 2.5);
    });

  nodes = nodes.map((node) => {
    const friendly = units.filter(
      (unit) => unit.team === "player" && unit.sleep <= 0 && distance(unit, node) <= 5.2,
    ).length;
    const hostile = units.filter(
      (unit) => unit.team === "enemy" && unit.sleep <= 0 && distance(unit, node) <= 5.2,
    ).length;
    let capture = node.capture;
    if (friendly > hostile) {
      capture += 24 * tuning.captureRate * dt * Math.min(2, friendly - hostile);
    }
    if (hostile > friendly) capture -= 18 * dt * Math.min(2, hostile - friendly);
    capture = clamp(capture, -100, 100);
    let owner: Team | null = node.owner;
    let claimed = node.claimed;
    if (capture >= 100 && owner !== "player") {
      owner = "player";
      nodesSecured += 1;
      if (!claimed) {
        resources += tuning.nodeBonus;
        claimed = true;
        logs = addLog(
          logs,
          `${node.name} secured: +${tuning.nodeBonus} GMP and +${node.income}/s`,
        );
      } else {
        logs = addLog(logs, `${node.name} retaken`);
      }
    }
    if (capture <= -100 && owner !== "enemy") {
      owner = "enemy";
      logs = addLog(logs, `${node.name} lost to hostile control`);
    }
    if (capture > -100 && capture < 100) owner = null;
    return { ...node, capture, owner, claimed };
  });

  const damageUnits = new Map<string, number>();
  const damageStructures = new Map<string, number>();
  const damageSources = new Map<string, string>();

  const getEntity = (id?: string): Unit | Structure | ControlNode | undefined => {
    if (!id) return undefined;
    return (
      units.find((unit) => unit.id === id) ??
      structures.find((structure) => structure.id === id) ??
      nodes.find((node) => node.id === id)
    );
  };

  const moveToward = (unit: Unit, point: Point) => {
    const d = distance(unit, point);
    if (d <= 0.35) return true;
    const spec = UNIT_SPECS[unit.kind];
    const stealthMobility =
      unit.stance === "stealth" && inShadow(unit) && researched.includes("spectralWeave") ? 1.22 : 1;
    const stanceSpeed = (unit.stance === "stealth" ? 0.7 : 1) * stealthMobility;
    const suppressionSpeed = unit.suppressed > 0 ? 0.62 : 1;
    const roadSpeed = onRoad(unit) ? 1.16 : 1;
    const travel = Math.min(spec.speed * stanceSpeed * suppressionSpeed * roadSpeed * dt, d);
    unit.facing = facingTo(unit, point);
    unit.x = clamp(unit.x + ((point.x - unit.x) / d) * travel, 2, 98);
    unit.y = clamp(unit.y + ((point.y - unit.y) / d) * travel, 3, 97);
    return d <= 0.9;
  };

  const fire = (attacker: Unit, target: Unit | Structure) => {
    if (attacker.attackCd > 0) return;
    const spec = UNIT_SPECS[attacker.kind];
    const targetIsStructure = !("sleep" in target);
    let damage = spec.damage * (1 + attacker.rank * 0.1);
    if (attacker.team === "enemy") damage *= tuning.enemyDamage;
    if (attacker.kind === "lancer") damage *= targetIsStructure ? 1.75 : 0.58;
    if (attacker.kind === "viper" && !targetIsStructure) damage *= 1.18;
    if (attacker.kind === "wraith" && attacker.stance === "stealth" && securityState(alert) !== "alert") {
      damage *= 1.85;
    }
    if (targetIsStructure && target.kind === "enemyUplink") {
      const relaysOnline = structures.some(
        (structure) => structure.kind === "enemyRelay" && !structure.disabled && structure.hp > 0,
      );
      const radarOnline = structures.some(
        (structure) => structure.kind === "enemyRadar" && !structure.disabled && structure.hp > 0,
      );
      const mapControl = nodes.filter((node) => node.owner === "player").length >= 2;
      if (relaysOnline || radarOnline || !mapControl) damage = 0;
    }
    if (!targetIsStructure && inShadow(target)) damage *= 0.72;
    if (
      effects.some(
        (effect) => effect.kind === "smoke" && distance(effect, target) <= (effect.radius ?? 0),
      )
    ) {
      damage *= 0.8;
    }
    if (targetIsStructure) {
      damageStructures.set(target.id, (damageStructures.get(target.id) ?? 0) + damage);
    } else {
      damageUnits.set(target.id, (damageUnits.get(target.id) ?? 0) + damage);
      target.combatTimer = Math.max(target.combatTimer, 4);
      target.suppressed = Math.max(target.suppressed, attacker.kind === "viper" || attacker.kind === "hunter" ? 1.8 : 0.6);
    }
    damageSources.set(target.id, attacker.id);
    attacker.combatTimer = Math.max(attacker.combatTimer, 3);
    attacker.attackCd = spec.cooldown;
    effects.push({
      id: nextId++,
      kind: "tracer",
      x: attacker.x,
      y: attacker.y,
      x2: target.x,
      y2: target.y,
      ttl: 0.22,
      maxTtl: 0.22,
      team: attacker.team,
    });
    effects.push({
      id: nextId++,
      kind: "impact",
      x: target.x,
      y: target.y,
      ttl: 0.28,
      maxTtl: 0.28,
      team: attacker.team,
    });
    if (attacker.team === "player" && attacker.kind !== "wraith" && attacker.kind !== "specter") {
      effects.push({
        id: nextId++,
        kind: "noise",
        x: attacker.x,
        y: attacker.y,
        ttl: 0.9,
        maxTtl: 0.9,
        radius: attacker.kind === "lancer" ? 28 : 18,
        team: "player",
      });
      alert = clamp(alert + (attacker.kind === "lancer" ? 8 : 3), 0, 100);
      alertHold = Math.max(alertHold, 5);
    }
  };

  units.forEach((unit) => {
    if (unit.sleep > 0 || unit.hp <= 0) return;
    const spec = UNIT_SPECS[unit.kind];
    let order = unit.order;

    if (unit.team === "enemy" && unit.raid) {
      const nearestFriendly = units
        .filter((candidate) => candidate.team === "player")
        .map((candidate) => ({ candidate, d: distance(unit, candidate) }))
        .filter(({ d }) => d <= spec.vision)
        .sort((a, b) => a.d - b.d)[0];
      const infrastructureTargets = structures
        .filter((structure) => structure.team === "player")
        .map((structure) => {
          const strategicValue =
            structure.kind === "generator" ? 15 :
              structure.kind === "sentry" ? 10 :
                structure.kind === "barracks" ? 7 : 0;
          return { structure, score: distance(unit, structure) - strategicValue };
        })
        .sort((a, b) => a.score - b.score);
      const raidTarget =
        nearestFriendly?.candidate ??
        infrastructureTargets[0]?.structure ??
        structures.find((structure) => structure.id === "hq");
      if (raidTarget) {
        order = { kind: "attack", targetId: raidTarget.id, x: raidTarget.x, y: raidTarget.y };
        unit.order = order;
      }
    }

    if (unit.team === "player" && !order && unit.patrol?.length && unit.stance !== "stealth") {
      const patrolPoint = unit.patrol[unit.patrolIndex % unit.patrol.length];
      if (distance(unit, patrolPoint) < 1.1) {
        unit.patrolIndex = (unit.patrolIndex + 1) % unit.patrol.length;
      }
      const nextPoint = unit.patrol[unit.patrolIndex % unit.patrol.length];
      order = { kind: "attackMove", x: nextPoint.x, y: nextPoint.y };
      unit.order = order;
    }

    if (unit.team === "player" && !order && unit.stance !== "stealth") {
      const candidates = [
        ...units.filter((candidate) => candidate.team === "enemy" && candidate.sleep <= 0 && candidate.revealed > 0),
        ...structures.filter((candidate) => candidate.team === "enemy" && !candidate.disabled),
      ]
        .map((candidate) => ({ candidate, d: distance(unit, candidate) }))
        .filter(({ d }) => d <= (unit.stance === "assault" ? spec.vision : spec.range))
        .sort((a, b) => a.d - b.d);
      if (candidates[0]) {
        const candidate = candidates[0].candidate;
        order = { kind: "attack", targetId: candidate.id, x: candidate.x, y: candidate.y };
        if (unit.stance === "assault") unit.order = order;
      }
    }

    if (!order) return;
    if (order.delay && order.delay > 0) return;
    const target = getEntity(order.targetId);

    if (order.kind === "move") {
      if (moveToward(unit, order)) unit.order = undefined;
      return;
    }

    if (order.kind === "capture") {
      if (!target || !('capture' in target)) {
        unit.order = undefined;
        return;
      }
      if (distance(unit, target) > 4.2) moveToward(unit, target);
      return;
    }

    if (order.kind === "hack") {
      if (!target || !('disabled' in target) || target.team !== "enemy") {
        unit.order = undefined;
        return;
      }
      if (target.disabled) {
        unit.order = undefined;
        return;
      }
      const uplinkShielded =
        target.kind === "enemyUplink" &&
        (structures.some(
          (structure) => structure.kind === "enemyRelay" && !structure.disabled && structure.hp > 0,
        ) ||
          structures.some(
            (structure) => structure.kind === "enemyRadar" && !structure.disabled && structure.hp > 0,
          ) ||
          nodes.filter((node) => node.owner === "player").length < 2);
      if (uplinkShielded) {
        unit.order = undefined;
        logs = addLog(logs, "Uplink locked: secure two supply relays, blind radar, and sever both links");
        return;
      }
      if (distance(unit, target) > 3.8) {
        moveToward(unit, target);
      } else if (unit.kind === "wraith") {
        target.hackProgress = clamp(target.hackProgress + 26 * dt, 0, 100);
        if (target.hackProgress >= 100) {
          target.disabled = true;
          unit.order = undefined;
          const reward = target.kind === "enemyGate" ? 260 : 180;
          resources += reward;
          logs = addLog(logs, `${STRUCTURE_LABELS[target.kind].name} subverted: +${reward} GMP`);
          transmission = {
            speaker: "WRAITH // FIELD",
            text: `${STRUCTURE_LABELS[target.kind].name} is dark. No explosives required.`,
            ttl: 5,
          };
        }
      }
      return;
    }

    if (order.kind === "tranq") {
      if (!target || !('sleep' in target) || target.team !== "enemy" || target.kind === "scout") {
        unit.order = undefined;
        return;
      }
      if (distance(unit, target) > 12.5) {
        moveToward(unit, target);
      } else if (unit.kind === "wraith" && cooldowns.tranq <= 0) {
        target.sleep = 24;
        target.order = undefined;
        unit.order = undefined;
        cooldowns.tranq = 8;
        effects.push({
          id: nextId++,
          kind: "tracer",
          x: unit.x,
          y: unit.y,
          x2: target.x,
          y2: target.y,
          ttl: 0.32,
          maxTtl: 0.32,
          team: "player",
        });
        logs = addLog(logs, "Target sedated. Move Wraith close to recover.");
      }
      return;
    }

    if (order.kind === "attackMove") {
      const contact = [
        ...units.filter(
          (candidate) =>
            candidate.team === "enemy" &&
            candidate.sleep <= 0 &&
            candidate.revealed > 0,
        ),
        ...structures.filter(
          (candidate) => candidate.team === "enemy" && !candidate.disabled,
        ),
      ]
        .map((candidate) => ({ candidate, d: distance(unit, candidate) }))
        .filter(({ d }) => d <= spec.vision)
        .sort((a, b) => a.d - b.d)[0];
      if (contact) {
        if (contact.d <= spec.range) fire(unit, contact.candidate as Unit | Structure);
        else moveToward(unit, contact.candidate);
      } else if (moveToward(unit, order)) {
        unit.order = undefined;
      }
      return;
    }

    if (order.kind === "attack") {
      if (!target || (!('hp' in target)) || target.hp <= 0) {
        unit.order = undefined;
        return;
      }
      if ('sleep' in target && target.sleep > 0) {
        unit.order = undefined;
        return;
      }
      const d = distance(unit, target);
      if (d <= spec.range) {
        fire(unit, target as Unit | Structure);
      } else if (unit.stance !== "hold" || unit.team === "enemy" || unit.raid) {
        moveToward(unit, target);
      } else if (unit.team === "player") {
        unit.order = undefined;
      }
    }
  });

  structures.forEach((structure) => {
    structure.attackCd = Math.max(0, structure.attackCd - dt);
    const isFriendlySentry = structure.team === "player" && structure.kind === "sentry";
    const isEnemyTurret = structure.team === "enemy" && structure.kind === "enemyTurret";
    if (!isFriendlySentry && !isEnemyTurret) return;
    if (structure.disabled || structure.hp <= 0) return;
    if (isFriendlySentry && !power.online) return;
    if (isEnemyTurret && jamTimer > 0) return;
    const validEnemyTurret = isEnemyTurret && securityState(alert) !== "hidden";
    const candidates = units
      .filter((unit) => unit.team !== structure.team && unit.sleep <= 0)
      .map((unit) => ({ unit, d: distance(structure, unit) }))
      .filter(({ d }) => d <= (isFriendlySentry ? 16 : 17))
      .sort((a, b) => a.d - b.d);
    const target = candidates[0];
    if (!target || (isEnemyTurret && !validEnemyTurret && target.d > 5)) return;
    if (structure.attackCd <= 0) {
      const sentryDamage = isFriendlySentry ? 25 : 21 * tuning.enemyDamage;
      damageUnits.set(target.unit.id, (damageUnits.get(target.unit.id) ?? 0) + sentryDamage);
      target.unit.suppressed = Math.max(target.unit.suppressed, 1.4);
      target.unit.combatTimer = Math.max(target.unit.combatTimer, 4);
      structure.attackCd = isFriendlySentry ? 0.76 : 0.9;
      effects.push({
        id: nextId++,
        kind: "tracer",
        x: structure.x,
        y: structure.y,
        x2: target.unit.x,
        y2: target.unit.y,
        ttl: 0.2,
        maxTtl: 0.2,
        team: structure.team,
      });
      effects.push({
        id: nextId++,
        kind: "impact",
        x: target.unit.x,
        y: target.unit.y,
        ttl: 0.25,
        maxTtl: 0.25,
        team: structure.team,
      });
    }
  });

  const beforeUnits = units.map((unit) => ({ ...unit }));
  const beforeStructures = structures.map((structure) => ({ ...structure }));
  units = units
    .map((unit) => ({ ...unit, hp: unit.hp - (damageUnits.get(unit.id) ?? 0) }))
    .filter((unit) => unit.hp > 0);
  structures = structures
    .map((structure) => ({
      ...structure,
      hp: structure.hp - (damageStructures.get(structure.id) ?? 0),
    }))
    .filter((structure) => structure.hp > 0);

  beforeUnits.forEach((unit) => {
    if (units.some((candidate) => candidate.id === unit.id)) return;
    effects.push({
      id: nextId++,
      kind: "blast",
      x: unit.x,
      y: unit.y,
      ttl: 0.75,
      maxTtl: 0.75,
      team: unit.team,
    });
    if (unit.team === "player") {
      losses += 1;
      logs = addLog(logs, `${UNIT_SPECS[unit.kind].name} team lost`);
    } else {
      eliminations += 1;
      const bounty = unit.kind === "hunter" ? 75 : unit.kind === "scout" ? 45 : 40;
      resources += bounty;
      const killerId = damageSources.get(unit.id);
      const killer = units.find((candidate) => candidate.id === killerId && candidate.team === "player");
      if (killer) {
        killer.kills += 1;
        killer.xp += unit.kind === "hunter" ? 2 : 1;
        const nextRank = Math.min(3, killer.xp >= 8 ? 3 : killer.xp >= 4 ? 2 : killer.xp >= 2 ? 1 : 0) as 0 | 1 | 2 | 3;
        if (nextRank > killer.rank) {
          killer.rank = nextRank;
          killer.maxHp = Math.round(killer.maxHp * 1.08);
          killer.hp = Math.min(killer.maxHp, killer.hp + Math.round(killer.maxHp * 0.22));
          logs = addLog(logs, `${UNIT_SPECS[killer.kind].name} promoted to ${["Regular", "Veteran", "Elite", "Legend"][nextRank]}`);
        }
      }
      logs = addLog(logs, `${UNIT_SPECS[unit.kind].name} neutralized`);
    }
  });

  beforeStructures.forEach((structure) => {
    if (structures.some((candidate) => candidate.id === structure.id)) return;
    effects.push({
      id: nextId++,
      kind: "blast",
      x: structure.x,
      y: structure.y,
      ttl: 1.1,
      maxTtl: 1.1,
      team: structure.team,
    });
    if (structure.team === "enemy") {
      const bounty = structureBounty(structure.kind);
      if (bounty > 0) {
        resources += bounty;
        logs = addLog(logs, `Infrastructure bounty: +${bounty} GMP`);
      }
      const killerId = damageSources.get(structure.id);
      const killer = units.find((candidate) => candidate.id === killerId && candidate.team === "player");
      if (killer) {
        killer.xp += structure.kind === "enemyUplink" ? 3 : 1;
        killer.kills += 1;
      }
    }
    logs = addLog(logs, `${STRUCTURE_LABELS[structure.kind].name} destroyed`);
  });

  caches = caches.map((cache) => {
    if (cache.collected) return cache;
    const collector = units.find(
      (unit) => unit.team === "player" && unit.sleep <= 0 && distance(unit, cache) <= 3.8,
    );
    if (!collector) return cache;
    resources += cache.value;
    effects.push({
      id: nextId++,
      kind: "scan",
      x: cache.x,
      y: cache.y,
      ttl: 1.25,
      maxTtl: 1.25,
      radius: 6,
      team: "player",
    });
    logs = addLog(logs, `${cache.name} recovered: +${cache.value} GMP`);
    transmission = {
      speaker: "ORBIT-893 // LOGISTICS",
      text: `${cache.value} GMP routed to the field ledger. Scavenging the approach can fund the next move.`,
      ttl: 5,
    };
    return { ...cache, collected: true };
  });

  if (
    raidWave > raidsCleared &&
    !units.some((unit) => unit.team === "enemy" && unit.raid && unit.hp > 0)
  ) {
    raidsCleared = raidWave;
    const bounty = tuning.raidBounty + raidWave * 40;
    resources += bounty;
    logs = addLog(logs, `Raid ${raidWave} repelled: +${bounty} GMP defense contract`);
    transmission = {
      speaker: "FOB // QUARTERMASTER",
      text: `Perimeter secure. Defense contract paid ${bounty} GMP. Repair, reinforce, then resume the raid.`,
      ttl: 6,
    };
  }

  const gateOnline = structures.some(
    (structure) => structure.kind === "enemyGate" && structure.team === "enemy" && !structure.disabled,
  );
  if (gateOnline && raidTimer <= 0) {
    raidWave += 1;
    const gate = structures.find((structure) => structure.kind === "enemyGate")!;
    const count = raidContactCount(previous.difficulty, raidWave);
    for (let index = 0; index < count; index += 1) {
      const kind: UnitKind = raidWave >= 2 && index === 0 ? "hunter" : index === count - 1 && raidWave >= 3 ? "scout" : "guard";
      units.push(
        makeUnit(
          `${kind}-${nextId++}`,
          "enemy",
          kind,
          clamp(gate.x - index * 1.8, 2, 98),
          clamp(gate.y + index * 2, 3, 97),
          { raid: true, stance: "assault", order: { kind: "attack", targetId: "hq", x: 11, y: 86 } },
        ),
      );
    }
    raidTimer = raidIntervalFor(previous.difficulty, raidWave + 1);
    alert = Math.max(alert, 32);
    alertHold = Math.max(alertHold, 7);
    transmission = {
      speaker: "FOB // DEFENSE",
      text: `Raid group ${raidWave} crossed the perimeter. Defensive grid is live.`,
      ttl: 6,
    };
    logs = addLog(logs, `INCOMING RAID ${raidWave} // ${count} contacts`);
  }

  if (securityState(alert) === "alert" && responseTimer <= 0 && gateOnline) {
    const gate = structures.find((structure) => structure.kind === "enemyGate")!;
    const target = lastKnown ?? { x: 48, y: 52 };
    const responseKinds: UnitKind[] = previous.difficulty === "guided" ? ["guard"] : ["hunter", "guard"];
    responseKinds.forEach((kind, index) => {
      units.push(
        makeUnit(
          `${kind}-${nextId++}`,
          "enemy",
          kind,
          gate.x - index * 2,
          gate.y + index * 2,
          { stance: "assault", order: { kind: "move", ...target } },
        ),
      );
    });
    responseTimer = previous.difficulty === "guided" ? 28 : previous.difficulty === "standard" ? 21 : 18;
    logs = addLog(logs, "QRF deployed toward last known position");
  }
  if (securityState(alert) !== "alert" && responseTimer <= 0) responseTimer = 8;

  const economy = economyStats({ nodes, researched, difficulty: previous.difficulty });
  resources += economy.income * dt;

  const uplink = structures.find((structure) => structure.kind === "enemyUplink");
  const hq = structures.find((structure) => structure.kind === "hq" && structure.team === "player");
  const missionReady =
    nodes.filter((node) => node.owner === "player").length >= 2 &&
    !structures.some((structure) => structure.kind === "enemyRadar" && !structure.disabled) &&
    !structures.some((structure) => structure.kind === "enemyRelay" && !structure.disabled);
  let phase: Phase = previous.phase;
  if ((!uplink || uplink.disabled) && missionReady) phase = "won";
  if (!hq) phase = "lost";

  return {
    ...previous,
    phase,
    elapsed: previous.elapsed + dt,
    resources,
    alert,
    alertHold,
    lastKnown,
    raidTimer,
    raidWave,
    raidsCleared,
    responseTimer,
    radarTimer,
    jamTimer,
    selectedIds: previous.selectedIds.filter((id) => units.some((unit) => unit.id === id)),
    selectedStructureId: structures.some((structure) => structure.id === previous.selectedStructureId)
      ? previous.selectedStructureId
      : undefined,
    squads: {
      alpha: previous.squads.alpha.filter((id) => units.some((unit) => unit.id === id && unit.team === "player")),
      bravo: previous.squads.bravo.filter((id) => units.some((unit) => unit.id === id && unit.team === "player")),
      charlie: previous.squads.charlie.filter((id) => units.some((unit) => unit.id === id && unit.team === "player")),
    },
    activeSquad:
      previous.activeSquad && previous.squads[previous.activeSquad].some((id) => units.some((unit) => unit.id === id))
        ? previous.activeSquad
        : null,
    units,
    structures,
    nodes,
    caches,
    unitQueue,
    structureQueue,
    researchQueue: activeResearchQueue,
    researched,
    buildMode,
    cooldowns,
    effects,
    nextId,
    detections,
    eliminations,
    losses,
    nodesSecured,
    transmission,
    logs,
  };
}

function lineStyle(from: Point, to: Point): CSSProperties {
  const dx = to.x - from.x;
  const dy = (to.y - from.y) * (9 / 16);
  const length = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return {
    left: `${from.x}%`,
    top: `${from.y}%`,
    width: `${length}%`,
    transform: `rotate(${angle}deg)`,
  };
}

export default function Home() {
  const [game, setGame] = useState<GameState>(() => initialGame());
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("guided");
  const [muted, setMuted] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [coachExpanded, setCoachExpanded] = useState(true);
  const [multiSelect, setMultiSelect] = useState(false);
  const [deckTab, setDeckTab] = useState<"ops" | "base" | "forces" | "research">("ops");
  const [cohortFilter, setCohortFilter] = useState<SquadCohort>("all");
  const [deckCollapsed, setDeckCollapsed] = useState(false);
  const [objectivesOpen, setObjectivesOpen] = useState(true);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const gestureRef = useRef<{ x: number; y: number } | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const previousSecurity = useRef<SecurityState>("hidden");
  const helpWasPausedRef = useRef(false);

  const playTone = useCallback(
    (frequency = 520, duration = 0.08, type: OscillatorType = "square") => {
      if (muted || typeof window === "undefined") return;
      try {
        const context = audioRef.current ?? new AudioContext();
        audioRef.current = context;
        void context.resume();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        gain.gain.setValueAtTime(0.038, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + duration);
      } catch {
        // Sound is optional. Every game action remains visible and playable.
      }
    },
    [muted],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setGame((current) => advanceGame(current, 0.1));
    }, 100);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const state = securityState(game.alert);
    if (state === previousSecurity.current) return;
    if (state === "alert") {
      playTone(880, 0.2, "sawtooth");
      window.setTimeout(() => playTone(660, 0.2, "sawtooth"), 220);
    } else if (state === "caution") {
      playTone(620, 0.11);
    } else if (state === "hidden") {
      playTone(350, 0.08, "sine");
    }
    previousSecurity.current = state;
  }, [game.alert, playTone]);

  useEffect(() => {
    if (game.phase !== "playing") return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const frame = window.requestAnimationFrame(() => {
      viewport.scrollLeft = 0;
      viewport.scrollTop = viewport.scrollHeight;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [game.phase]);

  const selectedUnits = useMemo(
    () => game.units.filter((unit) => game.selectedIds.includes(unit.id)),
    [game.selectedIds, game.units],
  );
  const selectedStructure = useMemo(
    () => game.structures.find((structure) => structure.id === game.selectedStructureId),
    [game.selectedStructureId, game.structures],
  );
  const selectedPrimary = selectedUnits[0];
  const security = securityState(game.alert);
  const economy = economyStats(game);
  const difficultyTuning = DIFFICULTY_SPECS[game.difficulty];
  const power = powerStats(game.structures);
  const supply = supplyStats(game.units, game.structures, game.staff);
  const relaysOnline = game.structures.filter(
    (structure) => structure.kind === "enemyRelay" && !structure.disabled,
  ).length;
  const radarOnline = game.structures.some(
    (structure) => structure.kind === "enemyRadar" && !structure.disabled,
  );
  const gateOnline = game.structures.some(
    (structure) => structure.kind === "enemyGate" && !structure.disabled,
  );
  const uplinkOnline = game.structures.some(
    (structure) => structure.kind === "enemyUplink" && !structure.disabled,
  );
  const ownedNodes = game.nodes.filter((node) => node.owner === "player").length;
  const hasWraith = selectedUnits.some((unit) => unit.kind === "wraith");
  const hasSpecter = selectedUnits.some((unit) => unit.kind === "specter");
  const hasViper = selectedUnits.some((unit) => unit.kind === "viper");
  const hasLancer = selectedUnits.some((unit) => unit.kind === "lancer");
  const hasMedic = selectedUnits.some((unit) => unit.kind === "medic");
  const selectedCohortCount = new Set(selectedUnits.map((unit) => cohortForUnit(unit.kind))).size;
  const uplinkLocked = relaysOnline > 0 || radarOnline || ownedNodes < 2;
  const nextRaidContacts = raidContactCount(game.difficulty, game.raidWave + 1);
  const currentRaidWindow = game.raidWave === 0
    ? difficultyTuning.firstRaid
    : raidIntervalFor(game.difficulty, game.raidWave + 1);
  const cachesRecovered = game.caches.filter((cache) => cache.collected).length;
  const unrecoveredGmp = game.caches
    .filter((cache) => !cache.collected)
    .reduce((total, cache) => total + cache.value, 0);
  const sleepingInRange = game.units
    .filter((unit) => unit.team === "enemy" && unit.sleep > 0)
    .find((enemy) =>
      selectedUnits.some((friendly) => friendly.kind === "wraith" && distance(friendly, enemy) <= 5.2),
    );
  const activeSquadMembers = game.activeSquad
    ? game.squads[game.activeSquad]
        .map((id) => game.units.find((unit) => unit.id === id && unit.team === "player"))
        .filter((unit): unit is Unit => Boolean(unit))
    : [];
  const activeCohortCounts = activeSquadMembers.reduce(
    (counts, unit) => ({ ...counts, [cohortForUnit(unit.kind)]: counts[cohortForUnit(unit.kind)] + 1 }),
    { infil: 0, assault: 0, support: 0 },
  );

  const squadTagForUnit = (id: string) =>
    SQUAD_SLOTS.filter((slot) => game.squads[slot].includes(id))
      .map((slot) => slot.charAt(0).toUpperCase())
      .join("");

  const visibleEnemyIds = useMemo(
    () =>
      new Set(
        game.units
          .filter((unit) => unit.team === "enemy" && (unit.revealed > 0 || unit.sleep > 0))
          .map((unit) => unit.id),
      ),
    [game.units],
  );

  const guideStep = useMemo<GuideStep>(() => {
    const sentryOnline = game.structures.some(
      (structure) => structure.team === "player" && structure.kind === "sentry" && !structure.disabled,
    );
    const sentryQueued = game.structureQueue?.key === "sentry";
    if (!power.online) {
      return {
        step: "GRID PRIORITY",
        title: "Restore base power",
        instruction: "Open BASE and fabricate a Micro Reactor. Low power slows every production channel and shuts down Sentry Nests.",
        payoff: "Returns construction and defenses to full output.",
        action: "base",
        actionLabel: "OPEN BASE",
        buildKey: "generator",
      };
    }
    if (ownedNodes === 0) {
      return {
        step: "STEP 1 OF 6",
        title: "Fund the operation",
        instruction: "Alpha is already selected. Tap SUPPLY 01 and hold the ring until it turns green. Your squad moves and captures together.",
        payoff: `+${difficultyTuning.nodeBonus} GMP, +6 GMP/s, and a 220 GMP cache on the approach.`,
        action: "alpha",
        actionLabel: "SELECT ALPHA",
        targetId: "node-a",
      };
    }
    if (!sentryOnline) {
      return {
        step: "STEP 2 OF 6",
        title: sentryQueued ? "Deploy the first defense" : "Prepare for retaliation",
        instruction: sentryQueued
          ? "When fabrication completes, tap PLACE and position the Sentry Nest northeast of Forward Command on the incoming raid route."
          : "Open BASE and fabricate a Sentry Nest. A reactor is not needed yet—the starting grid can power this defense.",
        payoff: `${Math.ceil(game.raidTimer)}s until raid ${game.raidWave + 1}. Defense contract pays ${difficultyTuning.raidBounty + (game.raidWave + 1) * 40} GMP when cleared.`,
        action: "base",
        actionLabel: "OPEN BASE",
        buildKey: "sentry",
      };
    }
    if (ownedNodes < 2) {
      return {
        step: "STEP 3 OF 6",
        title: "Expand the income line",
        instruction: "Recall Alpha, then tap SUPPLY 02. Use Attack-move from OPS if the patrol blocks the route; use stealth for a quieter capture.",
        payoff: `+${difficultyTuning.nodeBonus} GMP and +7 GMP/s. Nearby Field Cache B holds 260 GMP.`,
        action: "alpha",
        actionLabel: "SELECT ALPHA",
        targetId: "node-b",
      };
    }
    if (radarOnline) {
      return {
        step: "STEP 4 OF 6",
        title: "Blind the detection grid",
        instruction: "Select Wraith alone, keep STEALTH posture, then tap the RD radar. Wraith will hack it automatically instead of opening fire.",
        payoff: "+180 GMP and no more wide-area radar sweeps.",
        action: "wraith",
        actionLabel: "SELECT STEALTH WRAITH",
        targetId: "enemy-radar",
      };
    }
    if (relaysOnline > 0) {
      return {
        step: "STEP 5 OF 6",
        title: `Sever ${relaysOnline} security relay${relaysOnline === 1 ? "" : "s"}`,
        instruction: "Hack each LK relay with Wraith for a quiet payout, or recall Alpha and assault it. Chaff disables hostile turrets during the approach.",
        payoff: "+180 GMP per hack; removing both unlocks the command uplink.",
        action: "wraith",
        actionLabel: "SELECT STEALTH WRAITH",
        targetId: game.structures.find((structure) => structure.kind === "enemyRelay" && !structure.disabled)?.id,
      };
    }
    if (uplinkOnline) {
      return {
        step: "STEP 6 OF 6",
        title: "Take the command uplink",
        instruction: "The AI node is exposed. Hack it with Wraith for a silent finish or send a mixed squad with a phased breach.",
        payoff: gateOnline ? "Optional: disable the GH response hangar first to stop all future raids." : "Response hangar offline. The approach is clear.",
        action: "wraith",
        actionLabel: "SELECT STEALTH WRAITH",
        targetId: "uplink",
      };
    }
    return {
      step: "COMPLETE",
      title: "Command network secured",
      instruction: "The operation is complete. Review the results screen to see how detection, losses, recovery, and speed affected the rank.",
      payoff: "Core doctrine validated.",
      action: "none",
    };
  }, [difficultyTuning, game.raidTimer, game.raidWave, game.structureQueue, game.structures, gateOnline, ownedNodes, power.online, radarOnline, relaysOnline, uplinkOnline]);

  const fundingLabel = (cost: number) => {
    if (game.resources >= cost) return `${cost} GMP`;
    const seconds = Math.ceil((cost - game.resources) / Math.max(0.1, economy.income));
    return `${cost} GMP · FUNDED IN ${seconds}s`;
  };

  const selectedLabel = game.activeSquad && selectedUnits.length
    ? `${game.activeSquad.toUpperCase()} · ${cohortFilter === "all" ? "FULL GROUP" : `${cohortFilter.toUpperCase()} ELEMENT`}`
    : selectedUnits.length > 1
    ? `${selectedUnits.length} TEAMS SELECTED`
    : selectedPrimary
      ? `${UNIT_SPECS[selectedPrimary.kind].name.toUpperCase()} · ${["REG", "VET", "ELT", "LGD"][selectedPrimary.rank]}`
      : selectedStructure
        ? STRUCTURE_LABELS[selectedStructure.kind].name.toUpperCase()
        : "NO TEAM SELECTED";

  const targetPromptText = game.buildMode
    ? `PLACE ${BUILD_SPECS[game.buildMode].name.toUpperCase()}`
    : game.abilityMode === "tranq"
      ? "TAP HOSTILE PERSONNEL"
      : game.abilityMode === "attackMove"
        ? "TAP DESTINATION · ENGAGE EN ROUTE"
        : game.abilityMode === "patrol"
          ? "TAP PATROL TURNAROUND POINT"
          : game.abilityMode === "breach"
            ? "TAP OBJECTIVE · INFIL 0s · ASSAULT +4s · SUPPORT +7s"
            : game.abilityMode === "medkit"
              ? "TAP CASUALTY ZONE WITHIN MEDIC RANGE"
          : game.abilityMode === "rally"
            ? "TAP NEW DEPLOYMENT RALLY POINT"
            : game.abilityMode === "grenade"
              ? "TAP GROUND WITHIN VIPER THROW RANGE"
              : game.abilityMode === "demo"
                ? "TAP GROUND WITHIN LANCER STRIKE RANGE"
                : `TAP GROUND FOR ${game.abilityMode?.toUpperCase()}`;

  const openManual = () => {
    helpWasPausedRef.current = game.paused;
    setGame((current) => ({ ...current, paused: true }));
    setHelpOpen(true);
  };

  const closeManual = () => {
    setHelpOpen(false);
    if (!helpWasPausedRef.current) {
      setGame((current) => ({ ...current, paused: false }));
    }
  };

  const restart = (phase: Phase = "playing") => {
    playTone(420, 0.08);
    setHelpOpen(false);
    setDeckTab("ops");
    setCohortFilter("all");
    setCoachExpanded(game.difficulty === "guided");
    setMultiSelect(false);
    setSelectedDifficulty(game.difficulty);
    setGame(initialGame(phase, game.difficulty));
  };

  const deploy = () => {
    playTone(610, 0.12);
    setGame(initialGame("playing", selectedDifficulty));
    setCoachExpanded(selectedDifficulty === "guided");
    setMultiSelect(false);
    setCohortFilter("all");
  };

  const selectUnit = (id: string, additive = false) => {
    playTone(540, 0.04);
    setGame((current) => {
      if (!additive) return { ...current, selectedIds: [id], activeSquad: null, selectedStructureId: undefined, abilityMode: null, buildMode: null };
      const selected = current.selectedIds.includes(id)
        ? current.selectedIds.filter((selectedId) => selectedId !== id)
        : [...current.selectedIds, id];
      return { ...current, selectedIds: selected, activeSquad: null, selectedStructureId: undefined, abilityMode: null, buildMode: null };
    });
    setCohortFilter("all");
  };

  const selectAll = useCallback(() => {
    playTone(590, 0.055);
    setGame((current) => ({
      ...current,
      selectedIds: current.units.filter((unit) => unit.team === "player").map((unit) => unit.id),
      activeSquad: null,
      selectedStructureId: undefined,
      abilityMode: null,
      buildMode: null,
    }));
  }, [playTone]);

  const assignSquad = (slot: SquadSlot) => {
    setGame((current) => {
      const assigned = current.selectedIds.filter((id) =>
        current.units.some((unit) => unit.id === id && unit.team === "player"),
      );
      if (!assigned.length) {
        return { ...current, logs: addLog(current.logs, "Select teams before assigning a command group") };
      }
      playTone(720, 0.07, "sine");
      return {
        ...current,
        squads: { ...current.squads, [slot]: assigned },
        activeSquad: slot,
        logs: addLog(current.logs, `${slot.toUpperCase()} group set: ${assigned.length} team${assigned.length === 1 ? "" : "s"}`),
      };
    });
    setCohortFilter("all");
  };

  const selectSquad = useCallback((slot: SquadSlot, cohort: SquadCohort = "all") => {
    setGame((current) => {
      const members = current.squads[slot]
        .map((id) => current.units.find((unit) => unit.id === id && unit.team === "player"))
        .filter((unit): unit is Unit => Boolean(unit));
      const selected = members
        .filter((unit) => cohort === "all" || cohortForUnit(unit.kind) === cohort)
        .map((unit) => unit.id);
      if (!selected.length) {
        return { ...current, logs: addLog(current.logs, `${slot.toUpperCase()} has no ${cohort === "all" ? "assigned teams" : `${cohort} element`}`) };
      }
      playTone(cohort === "infil" ? 420 : cohort === "assault" ? 650 : cohort === "support" ? 820 : 560, 0.055, "sine");
      return {
        ...current,
        selectedIds: selected,
        activeSquad: slot,
        selectedStructureId: undefined,
        abilityMode: null,
        buildMode: null,
      };
    });
    setCohortFilter(cohort);
  }, [playTone]);

  const executeGuideAction = () => {
    setDeckCollapsed(false);
    if (guideStep.action === "base") {
      setDeckTab("base");
      return;
    }
    if (guideStep.action === "ops") {
      setDeckTab("ops");
      return;
    }
    if (guideStep.action === "alpha") {
      setDeckTab("ops");
      setMultiSelect(false);
      selectSquad("alpha", "all");
      return;
    }
    if (guideStep.action === "wraith") {
      setDeckTab("ops");
      setMultiSelect(false);
      setCohortFilter("all");
      setGame((current) => {
        const wraith = current.units.find(
          (unit) => unit.team === "player" && unit.kind === "wraith",
        );
        if (!wraith) return current;
        return {
          ...current,
          selectedIds: [wraith.id],
          activeSquad: null,
          selectedStructureId: undefined,
          abilityMode: null,
          buildMode: null,
          units: current.units.map((unit) =>
            unit.id === wraith.id ? { ...unit, stance: "stealth", order: undefined } : unit,
          ),
          logs: addLog(current.logs, "Wraith selected in STEALTH posture"),
        };
      });
    }
  };

  const setStance = (stance: Stance) => {
    if (!selectedUnits.length) return;
    playTone(stance === "stealth" ? 360 : stance === "hold" ? 480 : 620, 0.06, "sine");
    setGame((current) => ({
      ...current,
      abilityMode: null,
      units: current.units.map((unit) =>
        current.selectedIds.includes(unit.id)
          ? { ...unit, stance, order: stance === "stealth" ? undefined : unit.order }
          : unit,
      ),
      logs: addLog(current.logs, `${stance.toUpperCase()} posture assigned to ${current.selectedIds.length} team${current.selectedIds.length === 1 ? "" : "s"}`),
    }));
  };

  const stopOrders = () => {
    if (!selectedUnits.length) return;
    playTone(310, 0.05, "sine");
    setGame((current) => ({
      ...current,
      abilityMode: null,
      units: current.units.map((unit) =>
        current.selectedIds.includes(unit.id)
          ? { ...unit, order: undefined, patrol: undefined, stance: "hold" }
          : unit,
      ),
      logs: addLog(current.logs, "Selected teams holding position"),
    }));
  };

  const fallBack = () => {
    if (!selectedUnits.length) return;
    playTone(390, 0.08, "sine");
    setGame((current) => {
      const hq = current.structures.find((structure) => structure.id === "hq");
      if (!hq) return current;
      let index = 0;
      return {
        ...current,
        abilityMode: null,
        units: current.units.map((unit) => {
          if (!current.selectedIds.includes(unit.id)) return unit;
          const slot = index++;
          return {
            ...unit,
            stance: "hold",
            patrol: undefined,
            order: {
              kind: "move" as const,
              x: hq.x + 5 + (slot % 3) * 2,
              y: hq.y - 5 + Math.floor(slot / 3) * 2,
            },
          };
        }),
        logs: addLog(current.logs, "Fallback order: resupply at Forward Command"),
      };
    });
  };

  const selectStructure = (id: string) => {
    playTone(440, 0.04, "sine");
    setGame((current) => ({
      ...current,
      selectedIds: [],
      activeSquad: null,
      selectedStructureId: id,
      abilityMode: null,
      buildMode: null,
    }));
    setDeckTab("base");
  };

  const repairSelectedStructure = () => {
    setGame((current) => {
      const target = current.structures.find(
        (structure) => structure.id === current.selectedStructureId && structure.team === "player",
      );
      if (!target || target.hp >= target.maxHp) return current;
      const repairAmount = Math.min(target.maxHp - target.hp, target.maxHp * 0.3);
      const cost = Math.max(25, Math.ceil(repairAmount * 0.42));
      if (current.resources < cost) {
        return { ...current, logs: addLog(current.logs, `Field repair requires ${cost} GMP`) };
      }
      playTone(680, 0.09, "sine");
      return {
        ...current,
        resources: current.resources - cost,
        structures: current.structures.map((structure) =>
          structure.id === target.id
            ? { ...structure, hp: Math.min(structure.maxHp, structure.hp + repairAmount) }
            : structure,
        ),
        logs: addLog(current.logs, `${STRUCTURE_LABELS[target.kind].name} repaired for ${cost} GMP`),
      };
    });
  };

  const sellSelectedStructure = () => {
    setGame((current) => {
      const target = current.structures.find(
        (structure) => structure.id === current.selectedStructureId && structure.team === "player",
      );
      if (!target || target.kind === "hq" || !(target.kind in BUILD_SPECS)) return current;
      const refund = Math.floor(BUILD_SPECS[target.kind as BuildKey].cost * 0.5);
      playTone(260, 0.08, "sawtooth");
      return {
        ...current,
        resources: current.resources + refund,
        selectedStructureId: undefined,
        structures: current.structures.filter((structure) => structure.id !== target.id),
        logs: addLog(current.logs, `${STRUCTURE_LABELS[target.kind].name} salvaged: +${refund} GMP`),
      };
    });
  };

  const cancelStructureQueue = () => {
    setGame((current) => {
      if (!current.structureQueue) return current;
      const refund = Math.floor(BUILD_SPECS[current.structureQueue.key].cost * 0.75);
      return {
        ...current,
        resources: current.resources + refund,
        structureQueue: null,
        buildMode: null,
        logs: addLog(current.logs, `Construction cancelled: +${refund} GMP`),
      };
    });
  };

  const cancelUnitQueue = (queueId: number) => {
    setGame((current) => {
      const item = current.unitQueue.find((candidate) => candidate.id === queueId);
      if (!item) return current;
      const refund = Math.floor(UNIT_SPECS[item.key].cost * 0.75);
      return {
        ...current,
        resources: current.resources + refund,
        unitQueue: current.unitQueue.filter((candidate) => candidate.id !== queueId),
        logs: addLog(current.logs, `${UNIT_SPECS[item.key].name} deployment cancelled: +${refund} GMP`),
      };
    });
  };

  const queueStructure = (key: BuildKey) => {
    const spec = BUILD_SPECS[key];
    setGame((current) => {
      if (current.structureQueue?.ready && current.structureQueue.key === key) {
        return { ...current, buildMode: key, abilityMode: null };
      }
      if (current.structureQueue) {
        return { ...current, logs: addLog(current.logs, "Construction channel is occupied") };
      }
      if (current.resources < spec.cost) {
        return { ...current, logs: addLog(current.logs, "Insufficient GMP") };
      }
      playTone(470, 0.06);
      return {
        ...current,
        resources: current.resources - spec.cost,
        structureQueue: { id: current.nextId, key, remaining: spec.time, total: spec.time },
        nextId: current.nextId + 1,
        logs: addLog(current.logs, `${spec.name} construction started`),
      };
    });
  };

  const queueUnit = (key: TrainKey) => {
    const spec = UNIT_SPECS[key];
    setGame((current) => {
      const currentSupply = supplyStats(current.units, current.structures, current.staff);
      const queuedSupply = current.unitQueue.reduce(
        (total, item) => total + UNIT_SPECS[item.key].supply,
        0,
      );
      if (current.unitQueue.length >= 4) {
        return { ...current, logs: addLog(current.logs, "Deployment queue is full") };
      }
      if (currentSupply.used + queuedSupply + spec.supply > currentSupply.cap) {
        return { ...current, logs: addLog(current.logs, "Supply cap reached. Build a Team Habitat.") };
      }
      if (key === "lancer" && !current.structures.some((structure) => structure.kind === "barracks")) {
        return { ...current, logs: addLog(current.logs, "Lancer requires a Team Habitat") };
      }
      if (key === "medic" && !current.researched.includes("fieldMedicine")) {
        return { ...current, logs: addLog(current.logs, "Lifeline requires Field Medicine research") };
      }
      if (current.resources < spec.cost) {
        return { ...current, logs: addLog(current.logs, "Insufficient GMP") };
      }
      playTone(510, 0.06);
      return {
        ...current,
        resources: current.resources - spec.cost,
        unitQueue: [
          ...current.unitQueue,
          { id: current.nextId, key, remaining: spec.time, total: spec.time },
        ],
        nextId: current.nextId + 1,
        logs: addLog(current.logs, `${spec.name} added to deployment queue`),
      };
    });
  };

  const startResearch = (key: TechKey) => {
    const spec = TECH_SPECS[key];
    setGame((current) => {
      if (current.researched.includes(key)) return current;
      if (current.researchQueue) {
        return { ...current, logs: addLog(current.logs, "R&D channel is already occupied") };
      }
      if (spec.requires && !current.researched.includes(spec.requires)) {
        return { ...current, logs: addLog(current.logs, `${spec.name} requires ${TECH_SPECS[spec.requires].name}`) };
      }
      if (current.resources < spec.cost) {
        return { ...current, logs: addLog(current.logs, `Research requires ${spec.cost} GMP`) };
      }
      playTone(760, 0.08, "sine");
      return {
        ...current,
        resources: current.resources - spec.cost,
        researchQueue: { id: current.nextId, key, remaining: spec.time, total: spec.time },
        nextId: current.nextId + 1,
        logs: addLog(current.logs, `ORBIT-893 started ${spec.name}`),
      };
    });
  };

  const cancelResearch = () => {
    setGame((current) => {
      if (!current.researchQueue) return current;
      const refund = Math.floor(TECH_SPECS[current.researchQueue.key].cost * 0.75);
      return {
        ...current,
        resources: current.resources + refund,
        researchQueue: null,
        logs: addLog(current.logs, `Research cancelled: +${refund} GMP`),
      };
    });
  };

  const armAbility = (mode: Exclude<AbilityMode, null>) => {
    setGame((current) => {
      const requiresWraith = mode === "tranq" || mode === "decoy";
      const requiresSpecter = mode === "scan";
      const requiresViper = mode === "grenade";
      const requiresLancer = mode === "demo";
      const requiresMedic = mode === "medkit";
      const requiresSquad = mode === "attackMove" || mode === "patrol" || mode === "breach";
      const selected = current.units.filter((unit) => current.selectedIds.includes(unit.id));
      if (requiresWraith && !selected.some((unit) => unit.kind === "wraith")) {
        return { ...current, logs: addLog(current.logs, "Select a Wraith team") };
      }
      if (requiresSpecter && !selected.some((unit) => unit.kind === "specter")) {
        return { ...current, logs: addLog(current.logs, "Select a Specter drone") };
      }
      if (requiresViper && !selected.some((unit) => unit.kind === "viper")) {
        return { ...current, logs: addLog(current.logs, "Select a Viper fireteam") };
      }
      if (requiresLancer && !selected.some((unit) => unit.kind === "lancer")) {
        return { ...current, logs: addLog(current.logs, "Select a Lancer team") };
      }
      if (requiresMedic && !selected.some((unit) => unit.kind === "medic")) {
        return { ...current, logs: addLog(current.logs, "Select a Lifeline medic") };
      }
      if (requiresSquad && !selected.length) {
        return { ...current, logs: addLog(current.logs, "Select at least one team") };
      }
      const cooldownKey = (["tranq", "decoy", "smoke", "scan", "grenade", "demo", "medkit"] as const)
        .find((key) => key === mode);
      if (cooldownKey && current.cooldowns[cooldownKey] > 0) return current;
      playTone(mode === "tranq" ? 780 : mode === "scan" ? 940 : mode === "demo" ? 220 : 450, 0.06, "sine");
      return {
        ...current,
        buildMode: null,
        abilityMode: current.abilityMode === mode ? null : mode,
      };
    });
  };

  const useChaff = () => {
    setGame((current) => {
      const selected = current.units.filter((unit) => current.selectedIds.includes(unit.id));
      if (!selected.some((unit) => unit.kind === "specter")) {
        return { ...current, logs: addLog(current.logs, "Select a Specter drone") };
      }
      if (current.cooldowns.chaff > 0) return current;
      playTone(230, 0.32, "sawtooth");
      return {
        ...current,
        jamTimer: 10,
        alert: Math.max(0, current.alert - 12),
        cooldowns: { ...current.cooldowns, chaff: 26 },
        logs: addLog(current.logs, "Chaff bloom: radar and hostile turrets jammed for 10s"),
        transmission: {
          speaker: "SPECTER // EW",
          text: "Their tactical picture is white noise. Move now.",
          ttl: 5,
        },
      };
    });
  };

  const recover = () => {
    if (!sleepingInRange) return;
    setGame((current) => {
      const target = current.units.find((unit) => unit.id === sleepingInRange.id);
      if (!target || target.sleep <= 0) return current;
      playTone(920, 0.12, "sine");
      return {
        ...current,
        resources: current.resources + 220,
        staff: current.staff + 1,
        units: current.units.filter((unit) => unit.id !== target.id),
        logs: addLog(current.logs, "Specialist recovered: +220 GMP · fabrication speed improved"),
      };
    });
  };

  const issueTargetOrder = (targetId: string) => {
    setGame((current) => {
      const selected = current.units.filter(
        (unit) => current.selectedIds.includes(unit.id) && unit.team === "player",
      );
      if (!selected.length) {
        return { ...current, logs: addLog(current.logs, "Select a team first") };
      }
      const enemyUnit = current.units.find((unit) => unit.id === targetId && unit.team === "enemy");
      const enemyStructure = current.structures.find(
        (structure) => structure.id === targetId && structure.team === "enemy",
      );
      if (current.abilityMode === "tranq") {
        const wraith = selected.find((unit) => unit.kind === "wraith");
        if (!wraith || !enemyUnit || enemyUnit.kind === "scout") {
          return { ...current, logs: addLog(current.logs, "Tranquilizer requires hostile personnel") };
        }
        return {
          ...current,
          abilityMode: null,
          selectedStructureId: undefined,
          units: current.units.map((unit) =>
            unit.id === wraith.id
              ? {
                  ...unit,
                  patrol: undefined,
                  order: { kind: "tranq", targetId, x: enemyUnit.x, y: enemyUnit.y },
                }
              : unit,
          ),
          logs: addLog(current.logs, "Suppressed dart order acknowledged"),
        };
      }
      if (enemyUnit?.sleep && selected.some((unit) => unit.kind === "wraith" && distance(unit, enemyUnit) <= 5.2)) {
        const wraith = selected.find((unit) => unit.kind === "wraith" && distance(unit, enemyUnit) <= 5.2)!;
        return {
          ...current,
          resources: current.resources + 220,
          staff: current.staff + 1,
          units: current.units.filter((unit) => unit.id !== enemyUnit.id),
          selectedIds: current.selectedIds.filter((id) => id !== enemyUnit.id),
          logs: addLog(current.logs, `${UNIT_SPECS[enemyUnit.kind].name} recovered by ${UNIT_SPECS[wraith.kind].name}`),
        };
      }
      playTone(enemyStructure ? 650 : 700, 0.05);
      return {
        ...current,
        abilityMode: null,
        buildMode: null,
        selectedStructureId: undefined,
        units: current.units.map((unit) => {
          if (!current.selectedIds.includes(unit.id)) return unit;
          if (enemyStructure && unit.kind === "wraith" && unit.stance === "stealth") {
            return {
              ...unit,
              patrol: undefined,
              order: {
                kind: "hack" as const,
                targetId,
                x: enemyStructure.x,
                y: enemyStructure.y,
              },
            };
          }
          const target = enemyUnit ?? enemyStructure;
          if (!target) return unit;
          return {
            ...unit,
            patrol: undefined,
            stance: unit.stance === "stealth" && unit.kind !== "wraith" ? "assault" : unit.stance,
            order: { kind: "attack" as const, targetId, x: target.x, y: target.y },
          };
        }),
      };
    });
  };

  const issueCaptureOrder = (nodeId: string) => {
    setGame((current) => {
      const node = current.nodes.find((candidate) => candidate.id === nodeId);
      if (!node || !current.selectedIds.length) return current;
      playTone(410, 0.05, "sine");
      return {
        ...current,
        abilityMode: null,
        buildMode: null,
        selectedStructureId: undefined,
        units: current.units.map((unit, index) =>
          current.selectedIds.includes(unit.id)
            ? {
                ...unit,
                patrol: undefined,
                order: {
                  kind: "capture" as const,
                  targetId: nodeId,
                  x: node.x + ((index % 3) - 1) * 1.8,
                  y: node.y + (Math.floor(index / 3) - 0.5) * 1.5,
                },
              }
            : unit,
        ),
        logs: addLog(current.logs, `Capture order: ${node.name}`),
      };
    });
  };

  const issueCacheOrder = (cacheId: string) => {
    setGame((current) => {
      const cache = current.caches.find(
        (candidate) => candidate.id === cacheId && !candidate.collected,
      );
      if (!cache) return current;
      if (!current.selectedIds.length) {
        return { ...current, logs: addLog(current.logs, "Select a team to recover the field cache") };
      }
      playTone(830, 0.07, "sine");
      let index = 0;
      return {
        ...current,
        abilityMode: null,
        buildMode: null,
        selectedStructureId: undefined,
        units: current.units.map((unit) => {
          if (!current.selectedIds.includes(unit.id)) return unit;
          const slot = index++;
          return {
            ...unit,
            patrol: undefined,
            order: {
              kind: "move" as const,
              x: cache.x + ((slot % 3) - 1) * 1.3,
              y: cache.y + Math.floor(slot / 3) * 1.2,
            },
          };
        }),
        logs: addLog(current.logs, `Recovery order: ${cache.name} · ${cache.value} GMP`),
      };
    });
  };

  const pointFromEvent = (event: ReactPointerEvent<HTMLDivElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 100, 2, 98),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100, 3, 97),
    };
  };

  const handleMapPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    gestureRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleMapPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = gestureRef.current;
    gestureRef.current = null;
    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) return;
    const point = pointFromEvent(event);

    setGame((current) => {
      if (current.buildMode) {
        const queue = current.structureQueue;
        if (!queue?.ready || queue.key !== current.buildMode) return current;
        const inBuildRadius = current.structures
          .filter((structure) => structure.team === "player")
          .some((structure) => distance(structure, point) <= 22);
        const collides = [...current.structures, ...current.nodes].some(
          (entity) => distance(entity, point) < 6.2,
        );
        const inEnemyKeep = point.x > 62 && point.y < 45;
        if (!inBuildRadius || collides || inEnemyKeep) {
          return {
            ...current,
            logs: addLog(current.logs, "Invalid site: stay inside the green build network and clear obstacles"),
          };
        }
        const spec = BUILD_SPECS[queue.key];
        playTone(610, 0.09);
        return {
          ...current,
          structures: [
            ...current.structures,
            makeStructure(
              `${queue.key}-${current.nextId}`,
              "player",
              queue.key,
              point.x,
              point.y,
              spec.hp,
            ),
          ],
          nextId: current.nextId + 1,
          structureQueue: null,
          buildMode: null,
          logs: addLog(current.logs, `${spec.name} deployed`),
        };
      }

      if (current.abilityMode === "rally") {
        playTone(560, 0.07, "sine");
        return {
          ...current,
          abilityMode: null,
          rallyPoint: point,
          effects: [
            ...current.effects,
            { id: current.nextId, kind: "move", ...point, ttl: 1.1, maxTtl: 1.1, team: "player" },
          ],
          nextId: current.nextId + 1,
          logs: addLog(current.logs, "Deployment rally point updated"),
        };
      }

      if (
        current.abilityMode === "attackMove" ||
        current.abilityMode === "patrol" ||
        current.abilityMode === "breach"
      ) {
        if (!current.selectedIds.length) return current;
        const command = current.abilityMode;
        const selectedTeams = current.units.filter((unit) => current.selectedIds.includes(unit.id));
        const representedCohorts = new Set(selectedTeams.map((unit) => cohortForUnit(unit.kind)));
        if (command === "breach" && representedCohorts.size < 2) {
          return {
            ...current,
            logs: addLog(current.logs, "Phased breach needs at least two elements: infiltrator, assault, or support"),
          };
        }
        let selectedIndex = 0;
        const selectedCount = current.selectedIds.length;
        const columns = Math.ceil(Math.sqrt(selectedCount));
        playTone(command === "patrol" ? 520 : 600, 0.06, "sine");
        return {
          ...current,
          abilityMode: null,
          selectedStructureId: undefined,
          units: current.units.map((unit) => {
            if (!current.selectedIds.includes(unit.id)) return unit;
            const col = selectedIndex % columns;
            const row = Math.floor(selectedIndex / columns);
            selectedIndex += 1;
            const destination = {
              x: clamp(point.x + (col - (columns - 1) / 2) * 2.1, 2, 98),
              y: clamp(point.y + (row - (Math.ceil(selectedCount / columns) - 1) / 2) * 2.1, 3, 97),
            };
            const cohort = cohortForUnit(unit.kind);
            const isBreach = command === "breach";
            const delay = isBreach ? (cohort === "infil" ? 0 : cohort === "assault" ? 4 : 7) : 0;
            const orderKind: OrderKind =
              command === "patrol" || command === "attackMove"
                ? "attackMove"
                : cohort === "assault"
                  ? "attackMove"
                  : "move";
            return {
              ...unit,
              stance: isBreach
                ? cohort === "infil"
                  ? "stealth" as const
                  : cohort === "assault"
                    ? "assault" as const
                    : "hold" as const
                : "assault" as const,
              patrol: command === "patrol" ? [{ x: unit.x, y: unit.y }, destination] : undefined,
              patrolIndex: command === "patrol" ? 1 : unit.patrolIndex,
              order: {
                kind: orderKind,
                ...destination,
                delay,
                phase: isBreach ? cohort : undefined,
              },
            };
          }),
          effects: [
            ...current.effects,
            { id: current.nextId, kind: "move", ...point, ttl: 1.1, maxTtl: 1.1, team: "player" },
          ],
          nextId: current.nextId + 1,
          logs: addLog(
            current.logs,
            command === "patrol"
              ? "Patrol route established"
              : command === "breach"
                ? "Phased breach armed: infiltrators moving, assault and support staged"
                : "Attack-move order acknowledged",
          ),
        };
      }

      if (current.abilityMode === "medkit" && current.cooldowns.medkit <= 0) {
        const medic = current.units.find(
          (unit) =>
            current.selectedIds.includes(unit.id) &&
            unit.kind === "medic" &&
            distance(unit, point) <= 13,
        );
        if (!medic) {
          return { ...current, logs: addLog(current.logs, "Trauma pulse is outside Lifeline range") };
        }
        const advanced = current.researched.includes("traumaNetwork");
        const heal = advanced ? 92 : 60;
        playTone(860, 0.16, "sine");
        return {
          ...current,
          abilityMode: null,
          cooldowns: { ...current.cooldowns, medkit: advanced ? 15 : 21 },
          units: current.units.map((unit) =>
            unit.team === "player" && distance(unit, point) <= 7.5
              ? { ...unit, hp: Math.min(unit.maxHp, unit.hp + heal), suppressed: 0 }
              : unit,
          ),
          effects: [
            ...current.effects,
            { id: current.nextId, kind: "heal", ...point, ttl: 1.2, maxTtl: 1.2, radius: 7.5, team: "player" },
          ],
          nextId: current.nextId + 1,
          logs: addLog(current.logs, `Lifeline trauma pulse restored up to ${heal} HP`),
        };
      }

      if (current.abilityMode === "grenade" && current.cooldowns.grenade <= 0) {
        const thrower = current.units.find(
          (unit) => current.selectedIds.includes(unit.id) && unit.kind === "viper" && distance(unit, point) <= 15,
        );
        if (!thrower) {
          return { ...current, logs: addLog(current.logs, "Grenade target is outside Viper throw range") };
        }
        const uplinkInterlocked =
          current.nodes.filter((node) => node.owner === "player").length < 2 ||
          current.structures.some((structure) => structure.kind === "enemyRadar" && !structure.disabled) ||
          current.structures.some((structure) => structure.kind === "enemyRelay" && !structure.disabled);
        playTone(180, 0.18, "sawtooth");
        return {
          ...current,
          abilityMode: null,
          alert: clamp(current.alert + 14, 0, 100),
          alertHold: Math.max(current.alertHold, 7),
          cooldowns: { ...current.cooldowns, grenade: 15 },
          units: current.units.map((unit) =>
            unit.team === "enemy" && distance(unit, point) <= 7.5
              ? { ...unit, hp: unit.hp - (unit.kind === "hunter" ? 62 : 96), suppressed: 3, combatTimer: 5 }
              : unit,
          ),
          structures: current.structures.map((structure) =>
            structure.team === "enemy" &&
            distance(structure, point) <= 6 &&
            !(structure.kind === "enemyUplink" && uplinkInterlocked)
              ? { ...structure, hp: structure.hp - 24 }
              : structure,
          ),
          effects: [
            ...current.effects,
            { id: current.nextId, kind: "blast", ...point, ttl: 0.9, maxTtl: 0.9, radius: 8, team: "player" },
            { id: current.nextId + 1, kind: "noise", ...point, ttl: 1, maxTtl: 1, radius: 28, team: "player" },
          ],
          nextId: current.nextId + 2,
          logs: addLog(current.logs, "Viper fragmentation grenade deployed"),
        };
      }

      if (current.abilityMode === "demo" && current.cooldowns.demo <= 0) {
        const lancer = current.units.find(
          (unit) => current.selectedIds.includes(unit.id) && unit.kind === "lancer" && distance(unit, point) <= 19,
        );
        if (!lancer) {
          return { ...current, logs: addLog(current.logs, "Demolition target is outside Lancer range") };
        }
        const uplinkLocked =
          current.nodes.filter((node) => node.owner === "player").length < 2 ||
          current.structures.some((structure) => structure.kind === "enemyRadar" && !structure.disabled) ||
          current.structures.some((structure) => structure.kind === "enemyRelay" && !structure.disabled);
        playTone(120, 0.28, "sawtooth");
        return {
          ...current,
          abilityMode: null,
          alert: clamp(current.alert + 26, 0, 100),
          alertHold: Math.max(current.alertHold, 9),
          cooldowns: { ...current.cooldowns, demo: 24 },
          units: current.units.map((unit) =>
            unit.team === "enemy" && distance(unit, point) <= 6.5
              ? { ...unit, hp: unit.hp - 108, suppressed: 4, combatTimer: 5 }
              : unit,
          ),
          structures: current.structures.map((structure) =>
            structure.team === "enemy" &&
            distance(structure, point) <= 6.5 &&
            !(structure.kind === "enemyUplink" && uplinkLocked)
              ? { ...structure, hp: structure.hp - 285 }
              : structure,
          ),
          effects: [
            ...current.effects,
            { id: current.nextId, kind: "blast", ...point, ttl: 1.2, maxTtl: 1.2, radius: 9, team: "player" },
            { id: current.nextId + 1, kind: "noise", ...point, ttl: 1.2, maxTtl: 1.2, radius: 38, team: "player" },
          ],
          nextId: current.nextId + 2,
          logs: addLog(current.logs, uplinkLocked ? "Lancer strike fired; uplink armor remains interlocked" : "Lancer demolition strike on target"),
        };
      }

      if (current.abilityMode === "decoy" && current.cooldowns.decoy <= 0) {
        playTone(510, 0.08, "sine");
        return {
          ...current,
          abilityMode: null,
          cooldowns: { ...current.cooldowns, decoy: 14 },
          effects: [
            ...current.effects,
            { id: current.nextId, kind: "decoy", ...point, ttl: 7, maxTtl: 7, radius: 24, team: "player" },
          ],
          nextId: current.nextId + 1,
          alert: clamp(current.alert + 5, 0, 100),
          logs: addLog(current.logs, "Acoustic decoy broadcasting"),
        };
      }

      if (current.abilityMode === "smoke" && current.cooldowns.smoke <= 0) {
        playTone(280, 0.18, "sine");
        return {
          ...current,
          abilityMode: null,
          cooldowns: { ...current.cooldowns, smoke: 24 },
          effects: [
            ...current.effects,
            { id: current.nextId, kind: "smoke", ...point, ttl: 11, maxTtl: 11, radius: 9, team: "player" },
          ],
          nextId: current.nextId + 1,
          logs: addLog(current.logs, "Smoke screen deployed for 11 seconds"),
        };
      }

      if (current.abilityMode === "scan" && current.cooldowns.scan <= 0) {
        playTone(940, 0.14, "sine");
        return {
          ...current,
          abilityMode: null,
          cooldowns: { ...current.cooldowns, scan: 17 },
          effects: [
            ...current.effects,
            { id: current.nextId, kind: "scan", ...point, ttl: 7, maxTtl: 7, radius: 22, team: "player" },
          ],
          nextId: current.nextId + 1,
          logs: addLog(current.logs, "Specter scan painting contacts"),
        };
      }

      if (!current.selectedIds.length) {
        return { ...current, logs: addLog(current.logs, "Select a team first") };
      }
      playTone(350, 0.04, "sine");
      const selectedCount = current.selectedIds.length;
      const columns = Math.ceil(Math.sqrt(selectedCount));
      let selectedIndex = 0;
      const moving = current.units.map((unit) => {
        if (!current.selectedIds.includes(unit.id)) return unit;
        const col = selectedIndex % columns;
        const row = Math.floor(selectedIndex / columns);
        selectedIndex += 1;
        const offsetX = (col - (columns - 1) / 2) * 2.1;
        const offsetY = (row - (Math.ceil(selectedCount / columns) - 1) / 2) * 2.1;
        return {
          ...unit,
          patrol: undefined,
          order: {
            kind: "move" as const,
            x: clamp(point.x + offsetX, 2, 98),
            y: clamp(point.y + offsetY, 3, 97),
          },
        };
      });
      return {
        ...current,
        abilityMode: null,
        selectedStructureId: undefined,
        units: moving,
        effects: [
          ...current.effects,
          { id: current.nextId, kind: "move", ...point, ttl: 1.1, maxTtl: 1.1, team: "player" },
        ],
        nextId: current.nextId + 1,
      };
    });
  };

  const recenterFromMinimap = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    viewport.scrollTo({
      left: clamp(x * viewport.scrollWidth - viewport.clientWidth / 2, 0, viewport.scrollWidth),
      top: clamp(y * viewport.scrollHeight - viewport.clientHeight / 2, 0, viewport.scrollHeight),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      if (event.key === " " || event.key.toLowerCase() === "p") {
        event.preventDefault();
        setGame((current) =>
          current.phase === "playing" ? { ...current, paused: !current.paused } : current,
        );
      }
      if (event.key.toLowerCase() === "a") selectAll();
      if (event.key.toLowerCase() === "g") armAbility("attackMove");
      if (event.key.toLowerCase() === "x") stopOrders();
      if (event.key.toLowerCase() === "f") fallBack();
      const groupIndex = Number(event.key) - 1;
      if (groupIndex >= 0 && groupIndex < SQUAD_SLOTS.length) {
        event.preventDefault();
        const slot = SQUAD_SLOTS[groupIndex];
        if (event.ctrlKey || event.metaKey) assignSquad(slot);
        else selectSquad(slot, "all");
      }
      if (event.key === "Escape") {
        setGame((current) => ({ ...current, abilityMode: null, buildMode: null }));
      }
      if (event.key.toLowerCase() === "z") setStance("stealth");
      if (event.key.toLowerCase() === "c") setStance("hold");
      if (event.key.toLowerCase() === "v") setStance("assault");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const missionRank = game.phase === "lost"
    ? "F"
    : game.detections === 0 && game.losses === 0
      ? "S"
      : game.losses === 0 && game.detections <= 2
        ? "A"
        : game.losses <= 1
          ? "B"
          : "C";

  if (game.phase === "menu") {
    return (
      <main className="titleScreen">
        <Image className="titleArt" src="/assets/key-art.png" alt="Snowbound military installation under a night storm" fill priority unoptimized sizes="100vw" />
        <div className="titleShade" />
        <div className="titleScanlines" />
        <section className="titleContent">
          <div className="titleKicker"><span>COMMAND REX</span><i>FIELD ECONOMY BUILD 0.7</i></div>
          <h1 className="wordmark"><span>SHADOW</span><span>PROTOCOL</span></h1>
          <p className="titleGenre">TACTICAL ESPIONAGE COMMAND</p>
          <p className="titleCopy">
            An infiltration RTS where staying unseen, controlling the map, expanding a forward base,
            and surviving retaliation are one connected strategy—not separate minigames.
          </p>
          <div className="systemPillars">
            <span><b>01</b> Scout & misdirect</span>
            <span><b>02</b> Capture & expand</span>
            <span><b>03</b> Raid & defend</span>
          </div>
          <div className="difficultySelect" aria-label="Operation pressure">
            <p>OPERATION PRESSURE</p>
            <div>
              {(Object.keys(DIFFICULTY_SPECS) as Difficulty[]).map((difficulty) => {
                const spec = DIFFICULTY_SPECS[difficulty];
                return (
                  <button
                    key={difficulty}
                    className={selectedDifficulty === difficulty ? "active" : ""}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    aria-pressed={selectedDifficulty === difficulty}
                  >
                    <b>{spec.callsign}</b><small>{spec.startingGmp} GMP · raid {spec.firstRaid}s</small>
                  </button>
                );
              })}
            </div>
            <span>{DIFFICULTY_SPECS[selectedDifficulty].description}</span>
          </div>
          <button className="primaryAction" onClick={deploy}>
            <span>Deploy · {DIFFICULTY_SPECS[selectedDifficulty].callsign}</span><b aria-hidden="true">›</b>
          </button>
          <p className="prototypeNote">Original tactical-espionage strategy game · Touch, mouse, or keyboard</p>
        </section>
        <aside className="titleMissionCard">
          <div><small>FIELD EXERCISE</small><b>SABLE KNIFE</b></div>
          <p>Secure supply relays. Build a powered FOB. Sever both security links. Take the command uplink before hostile raids overwhelm your position.</p>
          <ul>
            <li><i /> {DIFFICULTY_SPECS[selectedDifficulty].startingGmp} starting GMP · +{DIFFICULTY_SPECS[selectedDifficulty].baseIncome}/s stipend</li>
            <li><i /> First counter-raid at {DIFFICULTY_SPECS[selectedDifficulty].firstRaid} seconds</li>
            <li><i /> Dynamic patrol awareness</li>
            <li><i /> Construction, power, repair, salvage &amp; rally</li>
            <li><i /> Persistent mixed squads &amp; phased breach doctrine</li>
            <li><i /> Combat medics, veterancy &amp; field recovery</li>
            <li><i /> Branching passive R&amp;D through ORBIT-893</li>
            <li><i /> Infrastructure-hunting counter-raids</li>
          </ul>
        </aside>
      </main>
    );
  }

  return (
    <main className={`gameScreen security-${security}`}>
      <header className="topHud">
        <div className="hudIdentity">
          <span className="rexMark">CR</span>
          <div><b>SABLE KNIFE</b><small>{formatTime(game.elapsed)} · {difficultyTuning.callsign}</small></div>
        </div>
        <div className="economyHud">
          <span title={`Base stipend +${economy.baseIncome}/s · controlled relays +${economy.nodeIncome}/s`}><small>GMP</small><b>{Math.floor(game.resources).toLocaleString()}</b><em>+{economy.income}/s</em></span>
          <span className={!power.online ? "critical" : ""}><small>POWER</small><b>{power.produced - power.used}</b><em>{power.used}/{power.produced}</em></span>
          <span className={supply.used >= supply.cap ? "critical" : ""}><small>SUPPLY</small><b>{supply.used}</b><em>/{supply.cap}</em></span>
        </div>
        <div className={`securityHud ${security}`}>
          <div className="securityDial" style={{ "--alert": `${game.alert * 3.6}deg` } as CSSProperties}><i /></div>
          <span><small>THREAT STATE</small><b>{security}</b></span>
        </div>
        <div className="hudButtons">
          <button onClick={openManual} aria-label="Open field manual">?</button>
          <button onClick={() => setMuted((value) => !value)} aria-label={muted ? "Enable sound" : "Mute sound"}>{muted ? "×" : "♪"}</button>
          <button
            onClick={() => setGame((current) => ({ ...current, speed: current.speed === 1 ? 1.5 : 1 }))}
            aria-label="Change simulation speed"
          >{game.speed}×</button>
          <button
            className={game.paused ? "active" : ""}
            onClick={() => setGame((current) => ({ ...current, paused: !current.paused }))}
            aria-label={game.paused ? "Resume" : "Tactical pause"}
          >{game.paused ? "▶" : "Ⅱ"}</button>
        </div>
      </header>

      <div className="gameLayout">
        <section className="battleColumn" aria-label="Tactical battlefield">
          <div className="battlefieldViewport" ref={viewportRef}>
            <div
              className={`battlefieldCanvas ${game.buildMode ? "placing" : ""} ${game.abilityMode ? `ability-${game.abilityMode}` : ""}`}
              onPointerDown={handleMapPointerDown}
              onPointerUp={handleMapPointerUp}
            >
              <Image className="battlefieldImage" src="/assets/battlefield.png" alt="Arctic command compound tactical map" fill priority unoptimized sizes="(max-width: 900px) 860px, 75vw" draggable={false} />
              <div className="battlefieldTone" />
              <div className="mapGrid" />
              <div className="weatherLayer" />
              <div className="roadOverlay" />

              {TERRAIN_ZONES.map((zone) => (
                <div
                  key={zone.id}
                  className="terrainZone"
                  style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%` }}
                ><span>{zone.label} · LOW SIGNATURE</span></div>
              ))}

              {game.buildMode && game.structures.filter((structure) => structure.team === "player").map((structure) => (
                <div
                  key={`build-${structure.id}`}
                  className="buildRadius"
                  style={{ left: `${structure.x}%`, top: `${structure.y}%` }}
                />
              ))}

              {game.rallyPoint && (
                <div className="rallyMarker" style={{ left: `${game.rallyPoint.x}%`, top: `${game.rallyPoint.y}%` }}>
                  <i /><span>RALLY</span>
                </div>
              )}

              {game.effects.map((effect) => {
                if (effect.kind === "tracer" && effect.x2 !== undefined && effect.y2 !== undefined) {
                  return <i key={effect.id} className={`tracer ${effect.team}`} style={lineStyle(effect, { x: effect.x2, y: effect.y2 })} />;
                }
                if (effect.kind === "noise" || effect.kind === "decoy" || effect.kind === "scan" || effect.kind === "smoke" || effect.kind === "heal") {
                  return (
                    <i
                      key={effect.id}
                      className={`areaEffect ${effect.kind} ${effect.team ?? ""}`}
                      style={{
                        left: `${effect.x}%`,
                        top: `${effect.y}%`,
                        width: `${(effect.radius ?? 5) * 2}%`,
                        aspectRatio: "1",
                        opacity: clamp(effect.ttl / effect.maxTtl, 0.15, 1),
                      }}
                    />
                  );
                }
                return (
                  <i
                    key={effect.id}
                    className={`pointEffect ${effect.kind} ${effect.team ?? ""}`}
                    style={{ left: `${effect.x}%`, top: `${effect.y}%` }}
                  />
                );
              })}

              {game.caches.filter((cache) => !cache.collected).map((cache) => (
                <button
                  key={cache.id}
                  className="fieldCache"
                  style={{ left: `${cache.x}%`, top: `${cache.y}%` }}
                  onPointerUp={(event) => {
                    event.stopPropagation();
                    issueCacheOrder(cache.id);
                  }}
                  aria-label={`${cache.name}, worth ${cache.value} GMP`}
                >
                  <span>◇</span><b>{cache.value}</b><small>GMP CACHE</small>
                </button>
              ))}

              {game.nodes.map((node) => (
                <button
                  key={node.id}
                  className={`controlNode ${node.owner ?? "neutral"} ${guideStep.targetId === node.id ? "coachTarget" : ""}`}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    "--capture": `${Math.abs(node.capture) * 3.6}deg`,
                  } as CSSProperties}
                  onPointerUp={(event) => {
                    event.stopPropagation();
                    issueCaptureOrder(node.id);
                  }}
                  aria-label={`${node.name}, ${node.owner ?? "neutral"}, ${Math.round(Math.abs(node.capture))}% control`}
                >
                  <span className="captureRing"><i /></span>
                  <b>{node.name.slice(-2)}</b>
                  <small>{node.owner === "player" ? `+${node.income}/s` : node.owner === "enemy" ? "HOSTILE" : "CONTESTED"}</small>
                </button>
              ))}

              {game.structures.map((structure) => {
                const label = STRUCTURE_LABELS[structure.kind];
                const shielded = structure.kind === "enemyUplink" && uplinkLocked;
                const offline = structure.disabled || (structure.team === "enemy" && game.jamTimer > 0 && (structure.kind === "enemyRadar" || structure.kind === "enemyTurret"));
                const selected = structure.id === game.selectedStructureId;
                return (
                  <button
                    key={structure.id}
                    className={`structureMarker ${structure.team} ${structure.kind} ${offline ? "offline" : ""} ${shielded ? "shielded" : ""} ${selected ? "selected" : ""} ${guideStep.targetId === structure.id ? "coachTarget" : ""}`}
                    style={{ left: `${structure.x}%`, top: `${structure.y}%` }}
                    onPointerUp={(event) => {
                      event.stopPropagation();
                      if (structure.team === "enemy") issueTargetOrder(structure.id);
                      else selectStructure(structure.id);
                    }}
                    aria-label={`${label.name}, ${Math.ceil(structure.hp)} health${offline ? ", offline" : ""}`}
                  >
                    {(structure.kind === "enemyRadar" || structure.kind === "enemyTurret" || structure.kind === "sentry" || structure.kind === "sensor") && !offline && (
                      <i className="structureRange" />
                    )}
                    {shielded && <i className="shieldField" />}
                    <span className="structureBody"><i /><b>{label.code}</b></span>
                    <span className="healthBar"><i style={{ width: `${(structure.hp / structure.maxHp) * 100}%` }} /></span>
                    {structure.hackProgress > 0 && !structure.disabled && (
                      <span className="hackBar"><i style={{ width: `${structure.hackProgress}%` }} /></span>
                    )}
                    <small>{offline ? "OFFLINE" : label.name}</small>
                  </button>
                );
              })}

              {game.units.map((unit) => {
                if (unit.team === "enemy" && !visibleEnemyIds.has(unit.id)) return null;
                const spec = UNIT_SPECS[unit.kind];
                const selected = game.selectedIds.includes(unit.id);
                const destination = unit.order?.targetId
                  ? game.units.find((candidate) => candidate.id === unit.order?.targetId) ?? game.structures.find((candidate) => candidate.id === unit.order?.targetId) ?? game.nodes.find((candidate) => candidate.id === unit.order?.targetId)
                  : unit.order;
                return (
                  <div key={unit.id} className="unitLayer">
                    {selected && destination && <i className={`orderLine ${unit.order?.kind ?? "move"} ${unit.order?.delay ? "staged" : ""}`} style={lineStyle(unit, destination)} />}
                    {selected && destination && <i className={`orderDestination ${unit.order?.kind ?? "move"}`} style={{ left: `${destination.x}%`, top: `${destination.y}%` }} />}
                    <button
                      className={`unitMarker ${unit.team} ${unit.kind} ${unit.stance} ${selected ? "selected" : ""} ${unit.sleep > 0 ? "sleeping" : ""} ${unit.suppressed > 0 ? "suppressed" : ""}`}
                      style={{ left: `${unit.x}%`, top: `${unit.y}%`, "--facing": `${unit.facing}deg` } as CSSProperties}
                      onPointerUp={(event) => {
                        event.stopPropagation();
                        if (unit.team === "player") selectUnit(unit.id, multiSelect || event.shiftKey);
                        else issueTargetOrder(unit.id);
                      }}
                      onDoubleClick={(event) => {
                        event.stopPropagation();
                        if (unit.team === "player") {
                          setGame((current) => ({
                            ...current,
                            selectedIds: current.units.filter((candidate) => candidate.team === "player" && candidate.kind === unit.kind).map((candidate) => candidate.id),
                            activeSquad: null,
                          }));
                        }
                      }}
                      aria-label={`${unit.team === "player" ? "Friendly" : "Hostile"} ${spec.name}, ${Math.ceil(unit.hp)} health`}
                    >
                      {unit.team === "enemy" && unit.sleep <= 0 && <i className="visionCone" />}
                      <span className="selectionRing" />
                      <span className="facingTick" />
                      <span className="unitBody"><i /><b>{spec.code}</b></span>
                      <span className="healthBar"><i style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }} /></span>
                      {unit.team === "player" && unit.rank > 0 && (
                        <span className="rankPips" aria-label={`${["Regular", "Veteran", "Elite", "Legend"][unit.rank]} rank`}>
                          {Array.from({ length: unit.rank }, (_, index) => <i key={index} />)}
                        </span>
                      )}
                      {unit.sleep > 0 && <span className="statusBadge sleep">Z</span>}
                      {unit.suppressed > 0 && unit.sleep <= 0 && <span className="statusBadge suppressed">!</span>}
                      {unit.order?.delay && unit.order.delay > 0 && (
                        <span className={`statusBadge staged ${unit.order.phase ?? ""}`}>T−{Math.ceil(unit.order.delay)}</span>
                      )}
                    </button>
                  </div>
                );
              })}

              <div className="mapVignette" />
            </div>
          </div>

          <div className="battleHudOverlay">
              <button className={`objectiveHud ${objectivesOpen ? "open" : ""}`} onClick={(event) => { event.stopPropagation(); setObjectivesOpen((value) => !value); }}>
                <span className="objectiveHeader"><b>OPERATION SABLE KNIFE</b><i>{objectivesOpen ? "−" : "+"}</i></span>
                <span className="objectiveList">
                  <em className={ownedNodes >= 2 ? "done" : ""}><i>{ownedNodes >= 2 ? "✓" : "01"}</i> Hold two field relays <b>{ownedNodes}/2</b></em>
                  <em className={!radarOnline ? "done" : ""}><i>{!radarOnline ? "✓" : "02"}</i> Disable detection radar</em>
                  <em className={relaysOnline === 0 ? "done" : ""}><i>{relaysOnline === 0 ? "✓" : "03"}</i> Sever security relays <b>{2 - relaysOnline}/2</b></em>
                  <em className={!uplinkOnline ? "done" : uplinkLocked ? "locked" : ""}><i>{!uplinkOnline ? "✓" : uplinkLocked ? "⌁" : "04"}</i> {uplinkLocked && uplinkOnline ? "Unlock command uplink" : "Take command uplink"}</em>
                  <em className={!gateOnline ? "done optional" : "optional"}><i>{!gateOnline ? "✓" : "+"}</i> Optional: stop response hangar</em>
                  <em className={cachesRecovered === game.caches.length ? "done optional" : "optional"}><i>{cachesRecovered === game.caches.length ? "✓" : "$"}</i> Recover field caches <b>{cachesRecovered}/{game.caches.length}</b></em>
                </span>
              </button>

              <div className={`raidClock ${game.raidTimer < 15 ? "urgent" : ""} ${!gateOnline ? "offline" : ""}`}>
                <small>{gateOnline ? `RAID ${game.raidWave + 1} · ${nextRaidContacts} CONTACT${nextRaidContacts === 1 ? "" : "S"}` : "RESPONSE HANGAR"}</small>
                <b>{gateOnline ? `${Math.max(0, Math.ceil(game.raidTimer))}s` : "OFFLINE"}</b>
                <i style={{ width: gateOnline ? `${clamp((game.raidTimer / currentRaidWindow) * 100, 0, 100)}%` : "0%" }} />
              </div>

              <div className={`alertSplash ${security}`}><b>{security === "alert" ? "!" : security === "caution" ? "?" : "○"}</b><span>{security}</span></div>

              {game.transmission && !game.buildMode && !game.abilityMode && (
                <div className="fieldTransmission" role="status"><span>{game.transmission.speaker}</span><p>{game.transmission.text}</p></div>
              )}

              {(game.buildMode || game.abilityMode) && (
                <div className="targetPrompt">
                  <b>{targetPromptText}</b>
                  <button onClick={(event) => { event.stopPropagation(); setGame((current) => ({ ...current, buildMode: null, abilityMode: null })); }}>CANCEL</button>
                </div>
              )}

              <section className={`strategyCoach ${coachExpanded ? "expanded" : ""}`} aria-live="polite">
                <button className="strategyCoachHeader" onClick={() => setCoachExpanded((value) => !value)}>
                  <span><small>LIVE STRATEGY // {guideStep.step}</small><b>{guideStep.title}</b></span>
                  <i>{coachExpanded ? "−" : "+"}</i>
                </button>
                {coachExpanded && (
                  <div className="strategyCoachBody">
                    <p>{guideStep.instruction}</p>
                    <em>{guideStep.payoff}</em>
                    {guideStep.actionLabel && guideStep.action !== "none" && (
                      <button onClick={executeGuideAction}>{guideStep.actionLabel}<b>›</b></button>
                    )}
                  </div>
                )}
              </section>
          </div>

          <div className="fieldFooter">
            <div className="rosterStrip">
              <button className="allUnits" onClick={selectAll}><b>ALL</b><small>{game.units.filter((unit) => unit.team === "player").length}</small></button>
              <button
                className={`multiSelectToggle ${multiSelect ? "active" : ""}`}
                onClick={() => setMultiSelect((value) => !value)}
                aria-pressed={multiSelect}
                aria-label="Toggle additive multi-select"
              ><b>{multiSelect ? "MULTI ON" : "MULTI"}</b><small>{multiSelect ? "TAP TO ADD" : "SINGLE TAP"}</small></button>
              {game.units.filter((unit) => unit.team === "player").map((unit) => {
                const spec = UNIT_SPECS[unit.kind];
                const groupTag = squadTagForUnit(unit.id);
                return (
                  <button
                    key={unit.id}
                    className={`${game.selectedIds.includes(unit.id) ? "selected" : ""} ${guideStep.action === "wraith" && unit.kind === "wraith" ? "coachTarget" : ""}`}
                    onClick={(event) => selectUnit(unit.id, multiSelect || event.shiftKey)}
                  >
                    {groupTag && <em>{groupTag}</em>}<b>{spec.code}{unit.rank > 0 ? "★".repeat(unit.rank) : ""}</b><span><i style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }} /></span><small>{unit.stance.slice(0, 3)}</small>
                  </button>
                );
              })}
            </div>
            <button className="deckToggle" onClick={() => setDeckCollapsed((value) => !value)}><span>COMMAND</span><b>{deckCollapsed ? "▲" : "▼"}</b></button>
          </div>
        </section>

        <aside className={`commandDeck ${deckCollapsed ? "collapsed" : ""}`} aria-label="Command deck">
          <div className="deckTop">
            <div className="selectionSummary">
              <span><small>ACTIVE SELECTION</small><b>{selectedLabel}</b></span>
              <em>{selectedUnits.length === 1
                ? `${Math.ceil(selectedPrimary.hp)} / ${selectedPrimary.maxHp} HP`
                : selectedStructure
                  ? `${Math.ceil(selectedStructure.hp)} / ${selectedStructure.maxHp} INTEGRITY`
                  : `${selectedUnits.reduce((total, unit) => total + Math.ceil(unit.hp), 0)} COMBINED HP`}</em>
            </div>
            <div className="stanceControl" aria-label="Squad posture">
              {(["stealth", "hold", "assault"] as Stance[]).map((stance, index) => (
                <button key={stance} className={selectedUnits.length > 0 && selectedUnits.every((unit) => unit.stance === stance) ? "active" : ""} disabled={!selectedUnits.length} onClick={() => setStance(stance)}>
                  <kbd>{["Z", "C", "V"][index]}</kbd><b>{stance}</b><small>{stance === "stealth" ? "low sig" : stance === "hold" ? "no chase" : "auto engage"}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="deckTabs" role="tablist">
            <button className={deckTab === "ops" ? "active" : ""} onClick={() => setDeckTab("ops")}>OPS</button>
            <button className={deckTab === "base" ? "active" : ""} onClick={() => setDeckTab("base")}>BASE</button>
            <button className={deckTab === "forces" ? "active" : ""} onClick={() => setDeckTab("forces")}>FORCES</button>
            <button className={deckTab === "research" ? "active" : ""} onClick={() => setDeckTab("research")}>R&amp;D <small>{game.researched.length}/6</small></button>
          </div>

          <div className="deckBody">
            {deckTab === "ops" && (
              <div className="opsPanel">
                <section className="squadManager" aria-label="Persistent command groups">
                  <div className="squadManagerHeader">
                    <span><small>COMMAND GROUPS</small><b>Mixed-team squad control</b></span>
                    <em>Tap group · SET replaces roster</em>
                  </div>
                  <div className="squadSlots">
                    {SQUAD_SLOTS.map((slot, index) => {
                      const members = game.squads[slot]
                        .map((id) => game.units.find((unit) => unit.id === id && unit.team === "player"))
                        .filter((unit): unit is Unit => Boolean(unit));
                      const codes = members.map((unit) => UNIT_SPECS[unit.kind].code).join(" · ");
                      return (
                        <article key={slot} className={game.activeSquad === slot ? "active" : ""}>
                          <button className="squadSelect" disabled={!members.length} onClick={() => selectSquad(slot, "all")}>
                            <i>{index + 1}</i><span><b>{slot}</b><small>{members.length ? codes : "UNASSIGNED"}</small></span><em>{members.length}</em>
                          </button>
                          <button className="squadAssign" disabled={!selectedUnits.length} onClick={() => assignSquad(slot)}>SET</button>
                        </article>
                      );
                    })}
                  </div>
                  {game.activeSquad && activeSquadMembers.length > 0 && (
                    <div className="cohortFilter" aria-label={`${game.activeSquad} group elements`}>
                      <button className={cohortFilter === "all" ? "active" : ""} onClick={() => selectSquad(game.activeSquad!, "all")}>ALL <b>{activeSquadMembers.length}</b></button>
                      <button className={cohortFilter === "infil" ? "active" : ""} disabled={!activeCohortCounts.infil} onClick={() => selectSquad(game.activeSquad!, "infil")}>INFIL <b>{activeCohortCounts.infil}</b></button>
                      <button className={cohortFilter === "assault" ? "active" : ""} disabled={!activeCohortCounts.assault} onClick={() => selectSquad(game.activeSquad!, "assault")}>ASSAULT <b>{activeCohortCounts.assault}</b></button>
                      <button className={cohortFilter === "support" ? "active" : ""} disabled={!activeCohortCounts.support} onClick={() => selectSquad(game.activeSquad!, "support")}>SUPPORT <b>{activeCohortCounts.support}</b></button>
                    </div>
                  )}
                </section>
                <div className="commandGrid" aria-label="Squad commands">
                  <button className={game.abilityMode === "attackMove" ? "armed" : ""} disabled={!selectedUnits.length} onClick={() => armAbility("attackMove")}>
                    <span>↗</span><b>Attack-move</b><small>Engage en route</small>
                  </button>
                  <button className={game.abilityMode === "patrol" ? "armed" : ""} disabled={!selectedUnits.length} onClick={() => armAbility("patrol")}>
                    <span>⇄</span><b>Patrol</b><small>Defend a route</small>
                  </button>
                  <button className={game.abilityMode === "breach" ? "armed" : ""} disabled={selectedCohortCount < 2} onClick={() => armAbility("breach")}>
                    <span>ⅠⅡⅢ</span><b>Phased breach</b><small>Infil → assault → support</small>
                  </button>
                  <button disabled={!selectedUnits.length} onClick={stopOrders}>
                    <span>■</span><b>Stop &amp; hold</b><small>Cancel orders</small>
                  </button>
                  <button disabled={!selectedUnits.length} onClick={fallBack}>
                    <span>⌂</span><b>Fallback</b><small>Resupply at FOB</small>
                  </button>
                </div>
                <div className="abilityGrid">
                  <button className={game.abilityMode === "tranq" ? "armed" : ""} disabled={!hasWraith || game.cooldowns.tranq > 0} onClick={() => armAbility("tranq")}>
                    <span>TRQ</span><b>Suppressed dart</b><small>{game.cooldowns.tranq > 0 ? `${Math.ceil(game.cooldowns.tranq)}s` : "Personnel only"}</small>
                  </button>
                  <button className={game.abilityMode === "decoy" ? "armed" : ""} disabled={!hasWraith || game.cooldowns.decoy > 0} onClick={() => armAbility("decoy")}>
                    <span>DCY</span><b>Acoustic decoy</b><small>{game.cooldowns.decoy > 0 ? `${Math.ceil(game.cooldowns.decoy)}s` : "Pull patrols"}</small>
                  </button>
                  <button className={game.abilityMode === "scan" ? "armed" : ""} disabled={!hasSpecter || game.cooldowns.scan > 0} onClick={() => armAbility("scan")}>
                    <span>SCN</span><b>Recon sweep</b><small>{game.cooldowns.scan > 0 ? `${Math.ceil(game.cooldowns.scan)}s` : "Reveal area"}</small>
                  </button>
                  <button className={game.jamTimer > 0 ? "armed" : ""} disabled={!hasSpecter || game.cooldowns.chaff > 0} onClick={useChaff}>
                    <span>CHF</span><b>Chaff bloom</b><small>{game.cooldowns.chaff > 0 ? `${Math.ceil(game.cooldowns.chaff)}s` : "Jam electronics"}</small>
                  </button>
                  <button className={game.abilityMode === "smoke" ? "armed" : ""} disabled={game.cooldowns.smoke > 0} onClick={() => armAbility("smoke")}>
                    <span>SMK</span><b>Smoke screen</b><small>{game.cooldowns.smoke > 0 ? `${Math.ceil(game.cooldowns.smoke)}s` : "Break sight"}</small>
                  </button>
                  <button className={game.abilityMode === "grenade" ? "armed" : ""} disabled={!hasViper || game.cooldowns.grenade > 0} onClick={() => armAbility("grenade")}>
                    <span>FRG</span><b>Frag grenade</b><small>{game.cooldowns.grenade > 0 ? `${Math.ceil(game.cooldowns.grenade)}s` : "Viper · anti-personnel"}</small>
                  </button>
                  <button className={game.abilityMode === "demo" ? "armed" : ""} disabled={!hasLancer || game.cooldowns.demo > 0} onClick={() => armAbility("demo")}>
                    <span>DEM</span><b>Demolition strike</b><small>{game.cooldowns.demo > 0 ? `${Math.ceil(game.cooldowns.demo)}s` : "Lancer · anti-structure"}</small>
                  </button>
                  <button className={sleepingInRange ? "recoverReady" : ""} disabled={!sleepingInRange} onClick={recover}>
                    <span>↑</span><b>Recover target</b><small>{sleepingInRange ? "+staff · +220 GMP" : "Move Wraith close"}</small>
                  </button>
                  <button className={game.abilityMode === "medkit" ? "armed" : ""} disabled={!hasMedic || game.cooldowns.medkit > 0} onClick={() => armAbility("medkit")}>
                    <span>MED</span><b>Trauma pulse</b><small>{game.cooldowns.medkit > 0 ? `${Math.ceil(game.cooldowns.medkit)}s` : "Area heal · clear suppression"}</small>
                  </button>
                </div>
                <div className="tacticalReadout">
                  <div className="miniMapWrap">
                    <button className="miniMap" onPointerUp={recenterFromMinimap} aria-label="Tactical minimap; tap to recenter">
                      <Image src="/assets/battlefield.png" alt="" fill unoptimized sizes="132px" />
                      {game.nodes.map((node) => <i key={node.id} className={`node ${node.owner ?? "neutral"}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} />)}
                      {game.structures.map((structure) => <i key={structure.id} className={`structure ${structure.team}`} style={{ left: `${structure.x}%`, top: `${structure.y}%` }} />)}
                      {game.units.filter((unit) => unit.team === "player" || visibleEnemyIds.has(unit.id)).map((unit) => <i key={unit.id} className={`unit ${unit.team}`} style={{ left: `${unit.x}%`, top: `${unit.y}%` }} />)}
                      {game.rallyPoint && <i className="rally" style={{ left: `${game.rallyPoint.x}%`, top: `${game.rallyPoint.y}%` }} />}
                    </button>
                    <span>TACTICAL MAP · TAP TO RECENTER</span>
                  </div>
                  <div className="opsLog" aria-live="polite"><p>OPS NET</p>{game.logs.slice(0, 4).map((log, index) => <span key={`${log}-${index}`} className={index === 0 ? "fresh" : ""}><i>{index === 0 ? "›" : "·"}</i>{log}</span>)}</div>
                </div>
              </div>
            )}

            {deckTab === "base" && (
              <div className="productionPanel">
                <div className="economyPlanner">
                  <span><small>AVAILABLE</small><b>{Math.floor(game.resources).toLocaleString()} GMP</b></span>
                  <span><small>CASH FLOW</small><b>+{economy.income}/s</b></span>
                  <span><small>FIELD CACHES</small><b>{unrecoveredGmp} GMP</b></span>
                  <p>Income never stops. Capture bonuses, caches, hacked infrastructure, recovered staff, destroyed targets, and cleared raids all add immediate GMP.</p>
                </div>
                <div className="baseCommandRow">
                  <button className={game.abilityMode === "rally" ? "armed" : ""} onClick={() => armAbility("rally")}>
                    <span>⚑</span><b>Set rally</b><small>New teams move here</small>
                  </button>
                  <div className={`structureContext ${selectedStructure ? "active" : ""}`}>
                    <span><small>{selectedStructure ? "SELECTED STRUCTURE" : "FIELD MAINTENANCE"}</small><b>{selectedStructure ? STRUCTURE_LABELS[selectedStructure.kind].name : "Tap a friendly structure"}</b></span>
                    <button disabled={!selectedStructure || selectedStructure.hp >= selectedStructure.maxHp} onClick={repairSelectedStructure}>REPAIR</button>
                    <button disabled={!selectedStructure || selectedStructure.kind === "hq"} onClick={sellSelectedStructure}>SELL 50%</button>
                  </div>
                </div>
                <div className="channelHeader"><span><small>CONSTRUCTION CHANNEL</small><b>{game.structureQueue ? game.structureQueue.ready ? "READY TO PLACE" : "FABRICATING" : "AVAILABLE"}</b></span><em className={!power.online ? "critical" : ""}>{power.online ? "GRID NOMINAL" : "LOW POWER · 35% SPEED"}</em></div>
                {game.structureQueue && (
                  <div className="activeQueueRow">
                    <button className={`queueTrack ${game.structureQueue.ready ? "ready" : ""}`} onClick={() => game.structureQueue?.ready && setGame((current) => ({ ...current, buildMode: current.structureQueue?.key ?? null }))}>
                      <span><b>{BUILD_SPECS[game.structureQueue.key].name}</b><small>{game.structureQueue.ready ? "TAP TO PLACE" : `${Math.ceil(game.structureQueue.remaining)}s`}</small></span>
                      <i><b style={{ width: `${game.structureQueue.ready ? 100 : ((game.structureQueue.total - game.structureQueue.remaining) / game.structureQueue.total) * 100}%` }} /></i>
                    </button>
                    <button className="cancelQueue" onClick={cancelStructureQueue} aria-label="Cancel construction and refund 75 percent">×<small>75%</small></button>
                  </div>
                )}
                <div className="productionGrid">
                  {BUILD_KEYS.map((key) => {
                    const spec = BUILD_SPECS[key];
                    const ready = game.structureQueue?.ready && game.structureQueue.key === key;
                    return (
                      <button key={key} className={`${ready ? "ready" : ""} ${guideStep.buildKey === key ? "coachTarget" : ""}`} disabled={Boolean(game.structureQueue && !ready) || (!ready && game.resources < spec.cost)} onClick={() => queueStructure(key)}>
                        <span className="productionCode">{spec.code}</span>
                        <span><b>{spec.name}</b><small>{spec.role}</small><em>{ready ? "PLACE" : `${fundingLabel(spec.cost)} · ${spec.power < 0 ? `+${-spec.power}` : `−${spec.power}`} PWR`}</em></span>
                      </button>
                    );
                  })}
                </div>
                <p className="productionTip">Structures deploy after fabrication. The starting grid powers one Sentry Nest without a reactor. Add power only when demand approaches output; every friendly structure extends the build network.</p>
              </div>
            )}

            {deckTab === "forces" && (
              <div className="productionPanel">
                <div className="channelHeader"><span><small>DEPLOYMENT CHANNEL</small><b>{game.unitQueue.length ? `${game.unitQueue.length} TEAM${game.unitQueue.length === 1 ? "" : "S"} QUEUED` : "AVAILABLE"}</b></span><em>{supply.used}/{supply.cap} SUPPLY</em></div>
                {game.unitQueue.length > 0 && (
                  <div className="unitQueueRow">
                    {game.unitQueue.map((item, index) => (
                      <span key={item.id} className={index === 0 ? "active" : ""}><b>{UNIT_SPECS[item.key].code}</b><small>{index === 0 ? `${Math.ceil(item.remaining)}s` : "QUEUED"}</small>{index === 0 && <i style={{ width: `${((item.total - item.remaining) / item.total) * 100}%` }} />}<button onClick={() => cancelUnitQueue(item.id)} aria-label={`Cancel ${UNIT_SPECS[item.key].name} deployment and refund 75 percent`}>×</button></span>
                    ))}
                  </div>
                )}
                <div className="productionGrid forces">
                  {TRAIN_KEYS.map((key) => {
                    const spec = UNIT_SPECS[key];
                    const locked =
                      (key === "lancer" && !game.structures.some((structure) => structure.kind === "barracks")) ||
                      (key === "medic" && !game.researched.includes("fieldMedicine"));
                    const lockReason = key === "medic" ? "RESEARCH FIELD MEDICINE" : "REQUIRES TEAM HABITAT";
                    return (
                      <button key={key} disabled={locked || game.resources < spec.cost || game.unitQueue.length >= 4} onClick={() => queueUnit(key)}>
                        <span className="productionCode">{spec.code}</span>
                        <span><b>{spec.name}</b><small>{spec.role}</small><em>{locked ? lockReason : `${fundingLabel(spec.cost)} · ${spec.supply} SUPPLY`}</em></span>
                      </button>
                    );
                  })}
                </div>
                <p className="productionTip">Wraith bypasses security; Viper wins infantry fights; Specter controls information; Lancer breaks armor; Lifeline sustains a mixed group through prolonged contact.</p>
              </div>
            )}

            {deckTab === "research" && (
              <div className="researchPanel">
                <header className="researchAdvisor">
                  <span className="advisorMark">893</span>
                  <span><small>ORBIT-893 // SYSTEMS QUARTERMASTER</small><b>Field development network</b><em>Passive upgrades live here—not on the battlefield.</em></span>
                </header>
                {game.researchQueue && (
                  <div className="researchQueue">
                    <button className="researchTrack" disabled>
                      <span><b>{TECH_SPECS[game.researchQueue.key].name}</b><small>{Math.ceil(game.researchQueue.remaining)}s · {TECH_SPECS[game.researchQueue.key].effect}</small></span>
                      <i><b style={{ width: `${((game.researchQueue.total - game.researchQueue.remaining) / game.researchQueue.total) * 100}%` }} /></i>
                    </button>
                    <button className="cancelQueue" onClick={cancelResearch} aria-label="Cancel research and refund 75 percent">×<small>75%</small></button>
                  </div>
                )}
                <div className="techTree">
                  {TECH_BRANCHES.map((branch) => (
                    <section key={branch.key} className={`techBranch ${branch.key}`}>
                      <header><span><small>{branch.lead}</small><b>{branch.name}</b></span><em>{game.researched.filter((key) => TECH_SPECS[key].branch === branch.key).length}/2</em></header>
                      <div>
                        {(Object.keys(TECH_SPECS) as TechKey[])
                          .filter((key) => TECH_SPECS[key].branch === branch.key)
                          .map((key, index) => {
                            const spec = TECH_SPECS[key];
                            const complete = game.researched.includes(key);
                            const researching = game.researchQueue?.key === key;
                            const prerequisiteLocked = Boolean(spec.requires && !game.researched.includes(spec.requires));
                            const channelLocked = Boolean(game.researchQueue && !researching);
                            return (
                              <button
                                key={key}
                                className={`${complete ? "complete" : ""} ${researching ? "researching" : ""} ${prerequisiteLocked ? "locked" : ""}`}
                                disabled={complete || researching || prerequisiteLocked || channelLocked || game.resources < spec.cost}
                                onClick={() => startResearch(key)}
                              >
                                <i>{complete ? "✓" : index + 1}</i>
                                <span><b>{spec.name}</b><small>{spec.description}</small><em>{complete ? spec.effect : researching ? "RESEARCHING" : prerequisiteLocked && spec.requires ? `REQUIRES ${TECH_SPECS[spec.requires].code}` : `${fundingLabel(spec.cost)} · ${spec.time}s`}</em></span>
                                <strong>{spec.code}</strong>
                              </button>
                            );
                          })}
                      </div>
                    </section>
                  ))}
                </div>
                <p className="productionTip">Research competes for time and GMP but creates permanent operational advantages. Low power slows the R&amp;D channel alongside construction and deployment.</p>
              </div>
            )}
          </div>

          <footer className="deckFooter">
            <span><small>STAFF</small><b>{game.staff}</b><em>+{Math.min(50, game.staff * 5)}% FAB SPEED</em></span>
            <span><small>RELAYS</small><b>{ownedNodes}/3</b><em>+{economy.nodeIncome}/s</em></span>
            <span><small>RAID</small><b>{gateOnline ? Math.max(0, Math.ceil(game.raidTimer)) : "—"}</b><em>{gateOnline ? "SECONDS" : "HANGAR OFFLINE"}</em></span>
          </footer>
        </aside>
      </div>

      {game.paused && game.phase === "playing" && (
        <div className="pauseBanner"><span><b>TACTICAL PAUSE</b><small>Map, select, build, and queue orders while the field is frozen.</small></span><button onClick={() => setGame((current) => ({ ...current, paused: false }))}>RESUME ▶</button></div>
      )}

      {(game.phase === "won" || game.phase === "lost") && (
        <div className={`endOverlay ${game.phase}`}>
          <section className="endPanel">
            <p className="eyebrow">{game.phase === "won" ? "EXERCISE COMPLETE" : "FORWARD BASE LOST"}</p>
            <h2>{game.phase === "won" ? "The network is yours." : "The line collapsed."}</h2>
            <p>{game.phase === "won" ? "The command uplink is offline and the hostile response grid has been severed. Your result reflects the strategy you used—not just how many targets you destroyed." : "Hostile forces destroyed Forward Command. Contest supply earlier, protect the power grid, and use stealth to reduce the pressure on your defenses."}</p>
            <div className="rankBlock"><strong>{missionRank}</strong><span><b>{formatTime(game.elapsed)}</b><small>TIME</small></span><span><b>{game.detections}</b><small>ALERTS</small></span><span><b>{game.losses}</b><small>LOSSES</small></span><span><b>{game.staff}</b><small>RECOVERED</small></span></div>
            <div className="endActions"><button className="primaryAction" onClick={() => restart("playing")}><span>Run exercise again</span><b>›</b></button><button className="secondaryAction" onClick={() => restart("menu")}>Return to title</button></div>
          </section>
        </div>
      )}

      {helpOpen && (
        <div className="helpOverlay" role="dialog" aria-modal="true" aria-labelledby="manual-title">
          <section className="helpPanel">
            <button className="closeHelp" onClick={closeManual} aria-label="Close field manual">×</button>
            <p className="eyebrow">FIELD MANUAL // CORE LOOP</p>
            <h2 id="manual-title">Win the information war first.</h2>
            <div className="manualGrid">
              <article><b>00</b><span><strong>Follow the live strategy card</strong>The battlefield guide adapts to your current situation, highlights the next target or system, explains the payoff, and can select the right command element for you.</span></article>
              <article><b>01</b><span><strong>Build command groups</strong>Select any mix of teams, then SET Alpha, Bravo, or Charlie. Tap a group to recall it instantly; filter its infiltrator, assault, and support elements for separate orders.</span></article>
              <article><b>02</b><span><strong>Choose posture</strong>Stealth is quiet and slow. Hold defends without chasing. Assault automatically closes and engages.</span></article>
              <article><b>03</b><span><strong>Control the map</strong>Stand inside supply rings to turn them green. Each pays an immediate capture bonus plus permanent GMP income. Recover diamond-marked field caches for extra operating capital.</span></article>
              <article><b>04</b><span><strong>Build a real base</strong>Fabricate, then place structures inside the green build network. Power shortages slow production and shut down active defenses.</span></article>
              <article><b>05</b><span><strong>Manage escalation</strong>Vision cones, open terrain, radar sweeps, and loud weapons raise threat. Break sight and use shadows, smoke, decoys, or chaff to cool it down.</span></article>
              <article><b>06</b><span><strong>Raid and defend</strong>Relays shield the command uplink. Hack them with a stealth Wraith or destroy them, while periodic enemy raids hunt power and production.</span></article>
              <article><b>07</b><span><strong>Stage a real breach</strong>Phased breach sends infiltrators immediately, assault four seconds later, and support at seven. Use element filters when you want to control each wave manually.</span></article>
              <article><b>08</b><span><strong>Develop the force</strong>ORBIT-893 researches passive covert, medical, and logistics upgrades in the R&amp;D tree. Field Medicine unlocks Lifeline medics and their trauma pulse.</span></article>
              <article><b>09</b><span><strong>Preserve veterans</strong>Surviving teams gain combat ranks, damage bonuses, and maximum health. Repair or salvage structures and cancel queues when the plan changes.</span></article>
            </div>
            <p className="manualTip"><b>The field is paused while this manual is open.</b> On mobile, MULTI makes roster taps additive. On desktop, Shift-click adds units; Ctrl+1/2/3 assigns groups; 1/2/3 recalls them. A selects all, G arms attack-move, X stops, F falls back, Z/C/V changes posture, and Space or P pauses.</p>
            <button className="primaryAction" onClick={closeManual}><span>Return to command</span><b>›</b></button>
          </section>
        </div>
      )}
    </main>
  );
}
