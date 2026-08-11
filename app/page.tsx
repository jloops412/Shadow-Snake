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
import { shouldTriggerEmergencyRecovery } from "@/game/mission-graph.mjs";
import { counterMultiplier, recoveryLoadValue } from "@/game/production-doctrine.mjs";
import { CAMPAIGN_CAST_BY_THEATER, CAMPAIGN_OPERATION_COUNT, CAMPAIGN_THEATERS, THEATER_BY_ID, campaignOperationRole, evaluateTheaterGraph, mergeCampaignProgress, nextTheaterId } from "@/game/campaign-doctrine.mjs";
import { destinationForFormation, issueSerializableOrder, nextFormation, promoteSerializableOrder } from "@/game/command-doctrine.mjs";
import { alarmBuildRate, moraleBand, raidComposition, raidDoctrineFor, suppressionMoraleLoss, terrainEffectAt, theaterTactics } from "@/game/tactical-doctrine.mjs";
import { nextBarrierWaypoint, repairZoneStats } from "@/game/base-warfare.mjs";
import { operationDoctrine } from "@/game/operation-doctrine.mjs";
import { OPERATION_PHASES, buildNetworkSourceAt, buildNetworkSources, defaultStanceForUnit, operationPhaseAssets, rankProgress, veterancyCooldown } from "@/game/field-command.mjs";
import { TacticalIcon } from "@/app/tactical-icons";
import { TacticalSprite } from "@/app/tactical-sprites";

type Phase = "menu" | "briefing" | "playing" | "won" | "lost";
type Team = "player" | "enemy";
type Difficulty = "guided" | "standard" | "hardline";
type Stance = "stealth" | "hold" | "assault";
type Formation = "wedge" | "line" | "column" | "loose";
type SecurityState = "hidden" | "suspicion" | "caution" | "alert";
type RaidDoctrine = "scout" | "sabotage" | "assault" | "siege";
type OperationStage = number;
type TheaterId = string;
type RewardChoice = "logistics" | "reinforce" | "intel";
type DefeatReason = "forward-command-destroyed";
type UnitKind =
  | "wraith"
  | "viper"
  | "specter"
  | "lancer"
  | "medic"
  | "engineer"
  | "ghost"
  | "hacker"
  | "foxhound"
  | "raven"
  | "weasel"
  | "mule"
  | "jackal"
  | "mantis"
  | "guard"
  | "hunter"
  | "scout"
  | "basilisk";
type StructureKind =
  | "hq"
  | "generator"
  | "barracks"
  | "vehicleBay"
  | "hospital"
  | "repairBay"
  | "comms"
  | "supplyDepot"
  | "rdLab"
  | "wall"
  | "gate"
  | "sentry"
  | "missileNest"
  | "sensor"
  | "enemyRadar"
  | "enemyRelay"
  | "enemyUplink"
  | "enemyTurret"
  | "enemyGate";
type BuildKey = "generator" | "supplyDepot" | "barracks" | "vehicleBay" | "rdLab" | "hospital" | "repairBay" | "comms" | "wall" | "gate" | "sentry" | "missileNest" | "sensor";
type TrainKey = "wraith" | "viper" | "specter" | "lancer" | "medic" | "engineer" | "ghost" | "hacker" | "foxhound" | "mule" | "raven" | "weasel" | "jackal" | "mantis";
type StructureLevel = 1 | 2 | 3;
type ProductionChannel = "infantry" | "vehicle";
type BuildCategory = "infrastructure" | "production" | "support" | "defense";
type ForceCategory = "infantry" | "specialist" | "vehicle";
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
  | "focus"
  | "guard"
  | "breach"
  | "medkit"
  | "rally"
  | "recon"
  | "infiltrate"
  | null;
type OrderKind = "move" | "attackMove" | "attack" | "capture" | "hack" | "tranq" | "guard";
type EffectKind = "tracer" | "impact" | "move" | "noise" | "decoy" | "smoke" | "scan" | "blast" | "heal";

type Point = { x: number; y: number };
type GridFootprint = readonly [number, number];

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
  orderQueue: Order[];
  patrol?: Point[];
  patrolIndex: number;
  attackCd: number;
  sleep: number;
  suppressed: number;
  morale: number;
  revealed: number;
  raid: boolean;
  raidRole?: RaidDoctrine;
  combatTimer: number;
  rank: 0 | 1 | 2 | 3;
  xp: number;
  kills: number;
  cargoGmp?: number;
  logisticsPhase?: "seek" | "loading" | "return";
  logisticsTimer?: number;
  logisticsTargetId?: string;
  boss?: boolean;
  callsign?: string;
  bossClass?: "commander" | "vehicle" | "metal-gear";
  breachTargetId?: string;
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
  level: StructureLevel;
  upgradeRemaining: number;
  upgradeTotal: number;
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

type OperationCheckpoint = {
  stage: OperationStage;
  operation: string;
  title: string;
  text: string;
  signal: string;
};

type GameState = {
  phase: Phase;
  defeatReason?: DefeatReason;
  theaterId: TheaterId;
  operationStage: OperationStage;
  checkpoint?: OperationCheckpoint;
  difficulty: Difficulty;
  paused: boolean;
  speed: 1 | 1.5;
  elapsed: number;
  resources: number;
  alert: number;
  alertHold: number;
  alarmProgress: number;
  alarmSourceId?: string;
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
  formation: Formation;
  queueMode: boolean;
  rallyPoint?: Point;
  units: Unit[];
  structures: Structure[];
  nodes: ControlNode[];
  caches: FieldCache[];
  unitQueue: QueueItem<TrainKey>[];
  structureQueue: QueueItem<BuildKey> | null;
  researchQueue: QueueItem<TechKey> | null;
  researched: TechKey[];
  campaignDoctrine: DoctrineKey[];
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
  emergencyRecoveryStages: OperationStage[];
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
  channel: ProductionChannel;
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

type MenuView = "command" | "campaign" | "progression" | "profile" | "settings";
type TouchMode = "orders" | "pan";
type TextScale = "comfortable" | "large";
type OperationPlanPhase = "recon" | "infiltrate" | "assault";
type DoctrineKey =
  | "fieldLogistics"
  | "forwardStores"
  | "distributedSupply"
  | "signalDiscipline"
  | "ghostRouting"
  | "silentNetwork"
  | "veteranCadre"
  | "combinedArms"
  | "missionCommand"
  | "rapidRecovery"
  | "combatRescue"
  | "preservationDoctrine"
  | "expeditionaryHub"
  | "phantomCommand"
  | "armoredCadre"
  | "casualtyProtocol";

type PlayerProgress = {
  callsign: string;
  doctrinePoints: number;
  commanderXp: number;
  completedTheaters: number;
  operationsCompleted: number;
  deployments: number;
  victories: number;
  totalDetections: number;
  totalLosses: number;
  bestRank: string;
  completedTheaterIds: TheaterId[];
  unlockedDoctrine: DoctrineKey[];
  updatedAt: number;
};

type PlayerSettings = {
  textScale: TextScale;
  showCoach: boolean;
  reducedEffects: boolean;
  muted: boolean;
};

type AccountState = {
  status: "checking" | "guest" | "signed-in";
  displayName?: string;
  email?: string;
};

type CampaignTheater = {
  id: TheaterId;
  act: string;
  actTitle: string;
  year: number;
  location: string;
  title: string;
  question: string;
  briefing: string;
  biome: string;
  doctrine: string;
  finalTarget: string;
  finalTargetClass: "commander" | "vehicle" | "metal-gear";
  finalUnitKind: UnitKind;
  victory: string;
  operations: Array<{ name: string; verb: string; signal: string }>;
};

const CAMPAIGN = CAMPAIGN_THEATERS as CampaignTheater[];

const DEFAULT_PROGRESS: PlayerProgress = {
  callsign: "SHADOW",
  doctrinePoints: 0,
  commanderXp: 0,
  completedTheaters: 0,
  operationsCompleted: 0,
  deployments: 0,
  victories: 0,
  totalDetections: 0,
  totalLosses: 0,
  bestRank: "—",
  completedTheaterIds: [],
  unlockedDoctrine: [],
  updatedAt: 0,
};

const DEFAULT_SETTINGS: PlayerSettings = {
  textScale: "large",
  showCoach: true,
  reducedEffects: false,
  muted: false,
};

const DOCTRINE_SPECS: Record<DoctrineKey, { name: string; branch: string; tier: number; cost: number; description: string; requires?: DoctrineKey }> = {
  fieldLogistics: {
    name: "Field Logistics",
    branch: "COMMAND",
    tier: 1,
    cost: 1,
    description: "Future deployments begin with a larger flexible operations reserve.",
  },
  forwardStores: { name: "Forward Stores", branch: "COMMAND", tier: 2, cost: 2, requires: "fieldLogistics", description: "Captured supply nodes pay a larger immediate theater bonus." },
  distributedSupply: { name: "Distributed Supply", branch: "COMMAND", tier: 3, cost: 3, requires: "forwardStores", description: "Field structures extend logistics and raise operational supply capacity." },
  signalDiscipline: {
    name: "Signal Discipline",
    branch: "STEALTH",
    tier: 1,
    cost: 1,
    description: "Teams retain concealment longer while repositioning between objectives.",
  },
  ghostRouting: { name: "Ghost Routing", branch: "STEALTH", tier: 2, cost: 2, requires: "signalDiscipline", description: "Covert specialists hack infrastructure faster under low threat." },
  silentNetwork: { name: "Silent Network", branch: "STEALTH", tier: 3, cost: 3, requires: "ghostRouting", description: "Comms Arrays suppress friendly signatures across their coverage." },
  veteranCadre: {
    name: "Veteran Cadre",
    branch: "FORCES",
    tier: 1,
    cost: 1,
    description: "Preserved veterans unlock advanced formation and focus-fire doctrine.",
  },
  combinedArms: { name: "Combined Arms", branch: "FORCES", tier: 2, cost: 2, requires: "veteranCadre", description: "Mixed infantry and vehicle groups gain faster target acquisition." },
  missionCommand: { name: "Mission Command", branch: "FORCES", tier: 3, cost: 3, requires: "combinedArms", description: "Veteran leaders improve nearby regular teams without replacing them." },
  rapidRecovery: {
    name: "Rapid Recovery",
    branch: "SUPPORT",
    tier: 1,
    cost: 1,
    description: "Recovery and medical networks return wounded teams to the fight sooner.",
  },
  combatRescue: { name: "Combat Rescue", branch: "SUPPORT", tier: 2, cost: 2, requires: "rapidRecovery", description: "Hospitals stabilize teams faster and recovered personnel yield more staff value." },
  preservationDoctrine: { name: "Preservation Doctrine", branch: "SUPPORT", tier: 3, cost: 3, requires: "combatRescue", description: "Repair Bays restore structures and light vehicles more efficiently." },
  expeditionaryHub: { name: "Expeditionary Hub", branch: "COMMAND", tier: 4, cost: 4, requires: "distributedSupply", description: "Mature campaigns open with a forward Supply Depot and an additional 600 GMP reserve." },
  phantomCommand: { name: "Phantom Command", branch: "STEALTH", tier: 4, cost: 4, requires: "silentNetwork", description: "Every theater begins under a 45-second electronic blackout that delays hostile acquisition." },
  armoredCadre: { name: "Armored Cadre", branch: "FORCES", tier: 4, cost: 4, requires: "missionCommand", description: "A veteran anti-armor team and recon vehicle deploy with the opening command element." },
  casualtyProtocol: { name: "Casualty Protocol", branch: "SUPPORT", tier: 4, cost: 4, requires: "preservationDoctrine", description: "A Lifeline medic and Combat Engineer deploy with field-medicine certification already active." },
};

const DIFFICULTY_SPECS: Record<Difficulty, DifficultySpec> = {
  guided: {
    name: "Guided operation",
    callsign: "GUIDED",
    description: "Best first run · live strategy guidance, a healthy command budget, and slower retaliation.",
    startingGmp: 2400,
    baseIncome: 9,
    firstRaid: 210,
    raidInterval: 118,
    enemyDamage: 0.56,
    detectionRate: 0.68,
    captureRate: 1.45,
    nodeBonus: 400,
    raidBounty: 400,
  },
  standard: {
    name: "Standard operation",
    callsign: "STANDARD",
    description: "The intended campaign balance with useful guidance and steady strategic pressure.",
    startingGmp: 1900,
    baseIncome: 7,
    firstRaid: 165,
    raidInterval: 94,
    enemyDamage: 0.76,
    detectionRate: 0.88,
    captureRate: 1.18,
    nodeBonus: 325,
    raidBounty: 325,
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
    channel: "infantry",
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
    channel: "infantry",
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
    channel: "infantry",
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
    channel: "infantry",
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
    channel: "infantry",
  },
  engineer: {
    name: "Combat Engineer",
    code: "EN",
    role: "Repair · capture · field works",
    hp: 138,
    speed: 6.3,
    range: 7.5,
    vision: 17,
    damage: 15,
    cooldown: 1.15,
    signature: 0.86,
    cost: 310,
    time: 9,
    supply: 2,
    channel: "infantry",
  },
  ghost: {
    name: "Ghost",
    code: "GH",
    role: "Sniper · observer · concealment",
    hp: 104,
    speed: 6.1,
    range: 18,
    vision: 28,
    damage: 92,
    cooldown: 2.7,
    signature: 0.48,
    cost: 520,
    time: 14,
    supply: 3,
    channel: "infantry",
  },
  hacker: {
    name: "Signal Hacker",
    code: "HK",
    role: "Fast intrusion · EW support",
    hp: 108,
    speed: 7.2,
    range: 8,
    vision: 22,
    damage: 11,
    cooldown: 1.25,
    signature: 0.56,
    cost: 430,
    time: 12,
    supply: 2,
    channel: "infantry",
  },
  foxhound: {
    name: "Foxhound",
    code: "FX",
    role: "Heavy infantry · suppression",
    hp: 280,
    speed: 4.6,
    range: 12,
    vision: 17,
    damage: 44,
    cooldown: 0.72,
    signature: 1.28,
    cost: 620,
    time: 16,
    supply: 4,
    channel: "infantry",
  },
  raven: {
    name: "Raven",
    code: "RV",
    role: "Recon drone · passive sensor",
    hp: 92,
    speed: 10.5,
    range: 7,
    vision: 34,
    damage: 8,
    cooldown: 1.35,
    signature: 0.52,
    cost: 390,
    time: 11,
    supply: 2,
    channel: "vehicle",
  },
  weasel: {
    name: "Weasel",
    code: "WL",
    role: "Light recon vehicle · interceptor",
    hp: 330,
    speed: 11,
    range: 11,
    vision: 25,
    damage: 29,
    cooldown: 0.62,
    signature: 1.2,
    cost: 650,
    time: 16,
    supply: 5,
    channel: "vehicle",
  },
  mule: {
    name: "Recovery Mule",
    code: "RM",
    role: "Autonomous logistics · GMP recovery",
    hp: 410,
    speed: 7.2,
    range: 0,
    vision: 18,
    damage: 0,
    cooldown: 9,
    signature: 1.1,
    cost: 540,
    time: 14,
    supply: 4,
    channel: "vehicle",
  },
  jackal: {
    name: "Jackal IFV",
    code: "JK",
    role: "Armored escort · anti-infantry",
    hp: 520,
    speed: 8.2,
    range: 12,
    vision: 22,
    damage: 42,
    cooldown: 0.56,
    signature: 1.42,
    cost: 790,
    time: 19,
    supply: 7,
    channel: "vehicle",
  },
  mantis: {
    name: "Mantis Tank",
    code: "MT",
    role: "Heavy armor · linebreaker",
    hp: 880,
    speed: 4.7,
    range: 14,
    vision: 19,
    damage: 112,
    cooldown: 2.15,
    signature: 1.78,
    cost: 1220,
    time: 28,
    supply: 11,
    channel: "vehicle",
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
    channel: "infantry",
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
    channel: "infantry",
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
    channel: "vehicle",
  },
  basilisk: {
    name: "Basilisk Rex",
    code: "BX",
    role: "Command prototype · siege walker",
    hp: 1450,
    speed: 3.2,
    range: 15,
    vision: 24,
    damage: 52,
    cooldown: 1.35,
    signature: 1,
    cost: 0,
    time: 0,
    supply: 0,
    channel: "vehicle",
  },
};

const BUILD_SPECS: Record<
  BuildKey,
  { name: string; code: string; role: string; cost: number; time: number; power: number; hp: number; footprint: [number, number] }
> = {
  generator: {
    name: "Micro Reactor",
    code: "MR",
    role: "+10 grid power",
    cost: 280,
    time: 7,
    power: -10,
    hp: 470,
    footprint: [2, 2],
  },
  barracks: {
    name: "Barracks",
    code: "BR",
    role: "+6 supply · infantry production",
    cost: 420,
    time: 9,
    power: 2,
    hp: 620,
    footprint: [3, 2],
  },
  vehicleBay: {
    name: "Vehicle Fabricator",
    code: "VF",
    role: "Independent vehicle production",
    cost: 760,
    time: 15,
    power: 5,
    hp: 780,
    footprint: [3, 3],
  },
  supplyDepot: {
    name: "Supply Depot",
    code: "SD",
    role: "Mule drop-off · +8 supply · extends base",
    cost: 500,
    time: 11,
    power: 2,
    hp: 610,
    footprint: [3, 2],
  },
  rdLab: {
    name: "R&D Laboratory",
    code: "RD",
    role: "Advanced chassis · faster research",
    cost: 820,
    time: 17,
    power: 6,
    hp: 590,
    footprint: [3, 2],
  },
  hospital: {
    name: "Field Hospital",
    code: "FH",
    role: "Rapid healing and recovery zone",
    cost: 520,
    time: 11,
    power: 3,
    hp: 560,
    footprint: [3, 2],
  },
  repairBay: {
    name: "Repair Bay",
    code: "RB",
    role: "Repairs structures and vehicles",
    cost: 600,
    time: 13,
    power: 4,
    hp: 640,
    footprint: [3, 2],
  },
  comms: {
    name: "Comms Array",
    code: "CA",
    role: "Radar coverage and signal control",
    cost: 560,
    time: 12,
    power: 4,
    hp: 510,
    footprint: [2, 2],
  },
  wall: {
    name: "Blast Wall",
    code: "BW",
    role: "Low-cost defensive barrier",
    cost: 90,
    time: 3,
    power: 0,
    hp: 760,
    footprint: [2, 1],
  },
  gate: {
    name: "Security Gate",
    code: "SG",
    role: "Reinforced controlled passage",
    cost: 170,
    time: 5,
    power: 1,
    hp: 940,
    footprint: [2, 1],
  },
  sentry: {
    name: "Sentry Nest",
    code: "SN",
    role: "Automated perimeter defense",
    cost: 330,
    time: 8,
    power: 4,
    hp: 540,
    footprint: [2, 2],
  },
  missileNest: {
    name: "Anti-Armor Nest",
    code: "AN",
    role: "Long-range vehicle and walker defense",
    cost: 620,
    time: 13,
    power: 6,
    hp: 520,
    footprint: [2, 2],
  },
  sensor: {
    name: "Passive Array",
    code: "PA",
    role: "Reveals nearby movement",
    cost: 300,
    time: 7,
    power: 3,
    hp: 400,
    footprint: [2, 2],
  },
};

const BUILD_INTEL: Record<BuildKey, { summary: string; effects: string[]; unlocks: string; caution: string }> = {
  generator: { summary: "Expands the electrical margin that keeps production and automated defenses online.", effects: ["+10 grid power", "+22 build-network radius", "0 supply"], unlocks: "Supports powered production, sensors, and defenses", caution: "A reactor is a priority raid target; losing it can trigger low power." },
  supplyDepot: { summary: "Banks physical Recovery Mule cargo and extends the vulnerable logistics network.", effects: ["−2 power", "+8 supply", "+22 build-network radius"], unlocks: "Recovery Mule logistics runs", caution: "Convoy GMP is not spendable until delivered here." },
  barracks: { summary: "Independent infantry queue, force capacity, and the first major technology prerequisite.", effects: ["−2 power", "+6 supply", "1 infantry queue"], unlocks: "L1 core operatives · L2 specialists/Vehicle Fabricator · L3 heavy operatives", caution: "Higher levels consume additional power but shorten infantry production." },
  vehicleBay: { summary: "Runs a parallel vehicle queue so armor and logistics do not block infantry training.", effects: ["−5 power", "1 vehicle queue", "+22 build-network radius"], unlocks: "L1 light vehicles · L2 IFV/Repair Bay · L3 Mantis with R&D", caution: "Requires Barracks L2 and becomes a high-value raid target." },
  rdLab: { summary: "Analyzes captured technology and accelerates theater research.", effects: ["−6 power", "+20% research speed", "prototype access"], unlocks: "Advanced chassis and recovered-technology branches", caution: "Requires Comms Array L2; no direct combat output." },
  hospital: { summary: "Creates a recovery zone that keeps veteran personnel in the campaign.", effects: ["−3 power", "+55% nearby infantry healing", "casualty stabilization"], unlocks: "Faster personnel recovery and medical doctrine bonuses", caution: "Does not repair vehicles or stop incoming damage." },
  repairBay: { summary: "Sustains structures and vehicles inside a visible restoration zone.", effects: ["−4 power", "+40% nearby repair rate", "vehicle sustain"], unlocks: "Recovery-grade restoration at higher levels", caution: "Requires Vehicle Fabricator; exposed repair hubs attract siege raids." },
  comms: { summary: "Turns reconnaissance into persistent information and controls the signal battle.", effects: ["−4 power", "+26 sensor radius", "faster target acquisition"], unlocks: "Raven drone · L2 R&D Laboratory · encrypted command upgrades", caution: "Jamming or power loss removes its tactical picture." },
  wall: { summary: "Shapes enemy pathing and buys time for layered defense.", effects: ["0 power", "+760 barrier integrity", "2×1 grid footprint"], unlocks: "Reinforced and hardened barrier upgrades", caution: "Walls without gates can obstruct friendly movement and repairs." },
  gate: { summary: "Creates a reinforced controlled opening in a defensive line.", effects: ["−1 power", "+940 barrier integrity", "controlled passage"], unlocks: "Reinforced and siege-gate upgrades", caution: "A powered gate is stronger but adds grid pressure." },
  sentry: { summary: "Automated anti-infantry perimeter coverage for raids and choke points.", effects: ["−4 power", "+12 defense radius", "anti-infantry fire"], unlocks: "Improved burst, range, and armor at L2/L3", caution: "Performs poorly against armor and shuts down under low power." },
  missileNest: { summary: "Long-range hard counter to armored vehicles and prototype walkers.", effects: ["−6 power", "+16 anti-armor radius", "high penetration"], unlocks: "Tandem-warhead prototype counter at L3", caution: "Requires Vehicle Fabricator L2 and is inefficient against infantry." },
  sensor: { summary: "Passive warning coverage without automatically escalating to lethal force.", effects: ["−3 power", "+18 detection radius", "reveals movement"], unlocks: "Counter-stealth and wider sensor packages", caution: "Detection creates information; it does not stop the contact." },
};

const STRUCTURE_LABELS: Record<StructureKind, { name: string; code: string }> = {
  hq: { name: "Forward Command", code: "FOB" },
  generator: { name: "Micro Reactor", code: "MR" },
  barracks: { name: "Barracks", code: "BR" },
  vehicleBay: { name: "Vehicle Fabricator", code: "VF" },
  supplyDepot: { name: "Supply Depot", code: "SD" },
  rdLab: { name: "R&D Laboratory", code: "RD" },
  hospital: { name: "Field Hospital", code: "FH" },
  repairBay: { name: "Repair Bay", code: "RB" },
  comms: { name: "Comms Array", code: "CA" },
  wall: { name: "Blast Wall", code: "BW" },
  gate: { name: "Security Gate", code: "SG" },
  sentry: { name: "Sentry Nest", code: "SN" },
  missileNest: { name: "Anti-Armor Nest", code: "AN" },
  sensor: { name: "Passive Array", code: "PA" },
  enemyRadar: { name: "Detection Radar", code: "RD" },
  enemyRelay: { name: "Security Relay", code: "LK" },
  enemyUplink: { name: "Command Uplink", code: "AI" },
  enemyTurret: { name: "Gun Emplacement", code: "TX" },
  enemyGate: { name: "Response Hangar", code: "GH" },
};

const THEATER_REGIONS: Array<{
  stage: OperationStage;
  code: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
}> = [
  { stage: 1, code: "OP 02", title: "GHOST LINE", x: 31, y: 35, w: 38, h: 40 },
  { stage: 2, code: "OP 03", title: "BLACK RELAY", x: 71, y: 20, w: 27, h: 34 },
  { stage: 3, code: "FINAL", title: "CROWN COMPLEX", x: 73, y: 3, w: 25, h: 20 },
];

const DEFAULT_THEATER_ID = "sable-crown";

const THEATER_RULES: Record<TheaterId, { label: string; startingGmp: number; baseIncome: number; raidPace: number; detection: number; enemyDamage: number }> = {
  "sable-crown": { label: "Baseline combined-arms proving ground", startingGmp: 0, baseIncome: 0, raidPace: 1, detection: 1, enemyDamage: 1 },
  "harrow-spine": { label: "Storm cover reduces detection; mountain logistics add reserves", startingGmp: 180, baseIncome: 0, raidPace: 1.08, detection: 0.82, enemyDamage: 1 },
  "st-heliot": { label: "Civilian grid pays steady income; mercenary raids arrive in waves", startingGmp: 220, baseIncome: 2, raidPace: 0.98, detection: 1, enemyDamage: 0.96 },
  "kingdom-failed": { label: "Salvage economy and fortified shipyard resistance", startingGmp: 320, baseIncome: 1, raidPace: 0.94, detection: 0.94, enemyDamage: 1 },
  "black-vault": { label: "Brownout economy; darkness favors low-signature forces", startingGmp: 360, baseIncome: -1, raidPace: 1.04, detection: 0.78, enemyDamage: 1 },
  "vostok-wound": { label: "Armored pursuit compresses raid windows", startingGmp: 420, baseIncome: 1, raidPace: 0.9, detection: 1.04, enemyDamage: 1.02 },
  "caspian-wake": { label: "Offshore supply pays well; interdiction is frequent", startingGmp: 480, baseIncome: 2, raidPace: 0.9, detection: 1, enemyDamage: 1 },
  "contract-coast": { label: "Dense utilities strengthen income and attract multi-front raids", startingGmp: 560, baseIncome: 3, raidPace: 0.86, detection: 1.02, enemyDamage: 1 },
  "zanzibar-corridor": { label: "Heat exposes movement; long logistics reduce passive income", startingGmp: 620, baseIncome: -1, raidPace: 0.92, detection: 1.12, enemyDamage: 1.02 },
  "perfect-son": { label: "Mirrored doctrine improves hostile detection and response timing", startingGmp: 680, baseIncome: 1, raidPace: 0.88, detection: 1.12, enemyDamage: 1.03 },
  "fox-line": { label: "Shared front produces fast coordinated counter-raids", startingGmp: 760, baseIncome: 2, raidPace: 0.84, detection: 1.06, enemyDamage: 1.04 },
  "fathers-grave": { label: "False command traffic sharpens detection pressure", startingGmp: 820, baseIncome: 1, raidPace: 0.88, detection: 1.14, enemyDamage: 1.04 },
  "no-mans-haven": { label: "Endgame reserves face the fastest retaliatory response", startingGmp: 1000, baseIncome: 3, raidPace: 0.8, detection: 1.08, enemyDamage: 1.06 },
};

function theaterRules(id: TheaterId) {
  return THEATER_RULES[id] ?? THEATER_RULES[DEFAULT_THEATER_ID];
}

function theaterFor(id: TheaterId) {
  return THEATER_BY_ID[id] ?? THEATER_BY_ID[DEFAULT_THEATER_ID];
}

function operationNamesFor(id: TheaterId) {
  return theaterFor(id).operations.map((operation: { name: string }) => operation.name.toUpperCase());
}

function operationNameFor(id: TheaterId, stage: number) {
  return operationNamesFor(id)[stage] ?? `OPERATION ${stage + 1}`;
}

const BUILD_KEYS = Object.keys(BUILD_SPECS) as BuildKey[];
const TRAIN_KEYS: TrainKey[] = ["wraith", "viper", "specter", "engineer", "ghost", "hacker", "lancer", "medic", "foxhound", "mule", "raven", "weasel", "jackal", "mantis"];
const SQUAD_SLOTS: SquadSlot[] = ["alpha", "bravo", "charlie"];

const BUILD_CATEGORIES: Array<{ key: BuildCategory; label: string; keys: BuildKey[] }> = [
  { key: "infrastructure", label: "GRID & LOGISTICS", keys: ["generator", "supplyDepot"] },
  { key: "production", label: "PRODUCTION", keys: ["barracks", "vehicleBay", "rdLab"] },
  { key: "support", label: "SUPPORT & INTEL", keys: ["hospital", "repairBay", "comms"] },
  { key: "defense", label: "DEFENSE", keys: ["wall", "gate", "sentry", "missileNest", "sensor"] },
];

const FORCE_CATEGORIES: Array<{ key: ForceCategory; label: string; keys: TrainKey[] }> = [
  { key: "infantry", label: "COMBAT", keys: ["wraith", "viper", "lancer", "foxhound"] },
  { key: "specialist", label: "SPECIALISTS", keys: ["specter", "engineer", "ghost", "hacker", "medic"] },
  { key: "vehicle", label: "VEHICLES", keys: ["mule", "raven", "weasel", "jackal", "mantis"] },
];

function isVehicleKind(kind: UnitKind) {
  return ["raven", "weasel", "mule", "jackal", "mantis", "scout", "basilisk"].includes(kind);
}

function counterProfile(attacker: UnitKind, target: Unit | Structure) {
  const targetClass = !("sleep" in target)
    ? "structure"
    : isVehicleKind(target.kind) ? "vehicle" : "infantry";
  return counterMultiplier(attacker, targetClass);
}

const STRUCTURE_UPGRADE_COPY: Partial<Record<StructureKind, [string, string]>> = {
  hq: ["Expanded command radius and hardened command net", "Redundant theater command and emergency power"],
  generator: ["+4 power and improved armor", "+6 additional power and hardened grid"],
  barracks: ["Unlock specialists and faster infantry training", "Unlock Foxhound heavy teams and maximum supply"],
  vehicleBay: ["Faster vehicle fabrication and field servicing", "Advanced chassis tooling and hardened production"],
  supplyDepot: ["Faster recovery unloading and +4 supply", "Encrypted theater logistics and +6 supply"],
  rdLab: ["Accelerated research and prototype analysis", "Black-project tooling and maximum research speed"],
  hospital: ["Larger trauma radius and faster stabilization", "Theater casualty network and maximum recovery"],
  repairBay: ["Expanded repair radius and faster restoration", "Recovery-grade restoration for structures and vehicles"],
  comms: ["Expanded radar and faster hostile acquisition", "Encrypted theater net and maximum sensor reach"],
  sentry: ["Improved range, armor, and burst damage", "Heavy nest with maximum suppression output"],
  missileNest: ["Faster missile cycle and wider acquisition", "Tandem-warhead system for heavy prototypes"],
  sensor: ["Expanded passive detection radius", "Counter-stealth theater sensor package"],
  wall: ["Reinforced composite barrier", "Hardened blast-deflection barrier"],
  gate: ["Reinforced security gate", "Hardened siege gate"],
};

function structureUpgradeCost(structure: Structure) {
  const base = structure.kind === "hq" ? 850 : BUILD_SPECS[structure.kind as BuildKey]?.cost ?? 300;
  return Math.round(base * (structure.level === 1 ? 0.72 : 1.08));
}

function structureUpgradeTime(structure: Structure) {
  return structure.kind === "wall" ? 5 + structure.level * 2 : 9 + structure.level * 5;
}

function highestStructureLevel(game: Pick<GameState, "structures">, kind: StructureKind) {
  return game.structures
    .filter((structure) => structure.team === "player" && structure.kind === kind && !structure.disabled)
    .reduce((highest, structure) => Math.max(highest, structure.level ?? 1), 0);
}

function buildLockReason(game: Pick<GameState, "structures">, key: BuildKey) {
  if (key === "vehicleBay" && highestStructureLevel(game, "barracks") < 2) return "REQUIRES BARRACKS L2";
  if ((key === "hospital" || key === "comms") && highestStructureLevel(game, "barracks") < 1) return "REQUIRES BARRACKS";
  if (key === "repairBay" && highestStructureLevel(game, "vehicleBay") < 1) return "REQUIRES VEHICLE FABRICATOR";
  if (key === "rdLab" && highestStructureLevel(game, "comms") < 2) return "REQUIRES COMMS ARRAY L2";
  if (key === "missileNest" && highestStructureLevel(game, "vehicleBay") < 2) return "REQUIRES VEHICLE FABRICATOR L2";
  return null;
}

function unitLockReason(game: Pick<GameState, "structures" | "researched">, key: TrainKey) {
  const barracks = highestStructureLevel(game, "barracks");
  const vehicles = highestStructureLevel(game, "vehicleBay");
  if (UNIT_SPECS[key].channel === "infantry" && barracks < 1) return "REQUIRES BARRACKS";
  if (["lancer", "medic", "ghost", "hacker"].includes(key) && barracks < 2) return "REQUIRES BARRACKS L2";
  if (key === "foxhound" && barracks < 3) return "REQUIRES BARRACKS L3";
  if (key === "medic" && !game.researched.includes("fieldMedicine")) return "RESEARCH FIELD MEDICINE";
  if (UNIT_SPECS[key].channel === "vehicle" && vehicles < 1) return "REQUIRES VEHICLE FABRICATOR";
  if (key === "raven" && highestStructureLevel(game, "comms") < 1) return "REQUIRES COMMS ARRAY";
  if (key === "mule" && highestStructureLevel(game, "supplyDepot") < 1) return "REQUIRES SUPPLY DEPOT";
  if (key === "jackal" && vehicles < 2) return "REQUIRES VEHICLE FABRICATOR L2";
  if (key === "mantis" && (vehicles < 3 || highestStructureLevel(game, "rdLab") < 1)) return "REQUIRES FABRICATOR L3 + R&D LAB";
  return null;
}

// The 32×20 board is the construction lattice and the readable footprint
// scale. Units use those footprints for selection/collision, but their orders
// and movement remain continuous instead of snapping to cells.
const GRID_COLUMNS = 32;
const GRID_ROWS = 20;
const BUILD_GRID_X = 100 / GRID_COLUMNS;
const BUILD_GRID_Y = 100 / GRID_ROWS;

function unitFootprint(kind: UnitKind): GridFootprint {
  if (kind === "basilisk") return [3, 3];
  if (kind === "mantis") return [2, 2];
  if (kind === "jackal" || kind === "weasel" || kind === "mule") return [2, 1];
  // Every personnel role is one actual operative, occupying one grid cell.
  return [1, 1];
}

function snapGridPoint(point: Point, footprint: GridFootprint = [1, 1]): Point {
  const [width, height] = footprint;
  const column = clamp(
    Math.round(point.x / BUILD_GRID_X - width / 2),
    0,
    GRID_COLUMNS - width,
  );
  const row = clamp(
    Math.round(point.y / BUILD_GRID_Y - height / 2),
    0,
    GRID_ROWS - height,
  );
  return {
    x: (column + width / 2) * BUILD_GRID_X,
    y: (row + height / 2) * BUILD_GRID_Y,
  };
}

function footprintsOverlap(
  first: Point,
  firstFootprint: GridFootprint,
  second: Point,
  secondFootprint: GridFootprint,
) {
  return Math.abs(first.x - second.x) < (firstFootprint[0] + secondFootprint[0]) * BUILD_GRID_X * 0.5 - 0.01 &&
    Math.abs(first.y - second.y) < (firstFootprint[1] + secondFootprint[1]) * BUILD_GRID_Y * 0.5 - 0.01;
}

type StructureConnectionSide = "north" | "east" | "south" | "west";

function structureConnectionFamily(kind: StructureKind) {
  if (kind === "wall" || kind === "gate" || kind === "enemyGate") return "barrier";
  return kind;
}

function structureConnections(structure: Structure, structures: Structure[]) {
  const [width, height] = structureFootprint(structure.kind);
  const sides = new Set<StructureConnectionSide>();
  structures.forEach((other) => {
    if (
      other.id === structure.id ||
      other.team !== structure.team ||
      structureConnectionFamily(other.kind) !== structureConnectionFamily(structure.kind)
    ) return;
    const [otherWidth, otherHeight] = structureFootprint(other.kind);
    const horizontalTouch = (width + otherWidth) * BUILD_GRID_X * 0.5;
    const verticalTouch = (height + otherHeight) * BUILD_GRID_Y * 0.5;
    const xAligned = Math.abs(structure.x - other.x) < 0.08;
    const yAligned = Math.abs(structure.y - other.y) < 0.08;
    if (yAligned && Math.abs(structure.x - other.x - horizontalTouch) < 0.08) sides.add("west");
    if (yAligned && Math.abs(other.x - structure.x - horizontalTouch) < 0.08) sides.add("east");
    if (xAligned && Math.abs(structure.y - other.y - verticalTouch) < 0.08) sides.add("north");
    if (xAligned && Math.abs(other.y - structure.y - verticalTouch) < 0.08) sides.add("south");
  });
  return Array.from(sides);
}

function nearestOpenUnitCell(
  proposed: Point,
  kind: UnitKind,
  units: Unit[],
  structures: Structure[],
  ignoreId?: string,
) {
  const footprint = unitFootprint(kind);
  const visited = new Set<string>();
  for (let radius = 0; radius <= 7; radius += 1) {
    for (let deltaY = -radius; deltaY <= radius; deltaY += 1) {
      for (let deltaX = -radius; deltaX <= radius; deltaX += 1) {
        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) !== radius) continue;
        const candidate = snapGridPoint({
          x: proposed.x + deltaX * BUILD_GRID_X,
          y: proposed.y + deltaY * BUILD_GRID_Y,
        }, footprint);
        const key = `${candidate.x}:${candidate.y}`;
        if (visited.has(key)) continue;
        visited.add(key);
        const blockedByStructure = structures.some((structure) =>
          footprintsOverlap(candidate, footprint, structure, structureFootprint(structure.kind)),
        );
        const blockedByUnit = units.some((unit) =>
          unit.id !== ignoreId && footprintsOverlap(candidate, footprint, unit, unitFootprint(unit.kind)),
        );
        if (!blockedByStructure && !blockedByUnit) return candidate;
      }
    }
  }
  return snapGridPoint(proposed, footprint);
}

function structureFootprint(kind: StructureKind) {
  if (kind in BUILD_SPECS) return BUILD_SPECS[kind as BuildKey].footprint;
  if (kind === "hq" || kind === "enemyUplink" || kind === "enemyGate") return [3, 3] as [number, number];
  return [2, 2] as [number, number];
}

function snapBuildPoint(point: Point, key: BuildKey): Point {
  return snapGridPoint(point, BUILD_SPECS[key].footprint);
}

function buildPlacementStatus(game: Pick<GameState, "structures" | "nodes" | "operationStage">, key: BuildKey, rawPoint: Point) {
  const point = snapBuildPoint(rawPoint, key);
  const [cellsWide, cellsHigh] = BUILD_SPECS[key].footprint;
  const halfWidth = cellsWide * BUILD_GRID_X * 0.5;
  const halfHeight = cellsHigh * BUILD_GRID_Y * 0.5;
  const networkSource = buildNetworkSourceAt(game, point);
  if (!networkSource) return { point, valid: false, reason: "OUTSIDE BUILD NETWORK" };
  const lockedRegion = THEATER_REGIONS.some((region) =>
    game.operationStage < region.stage &&
    point.x + halfWidth > region.x && point.x - halfWidth < region.x + region.w &&
    point.y + halfHeight > region.y && point.y - halfHeight < region.y + region.h,
  );
  if (lockedRegion) return { point, valid: false, reason: "SECTOR ENCRYPTED" };
  const collides = game.structures.some((structure) =>
    footprintsOverlap(point, BUILD_SPECS[key].footprint, structure, structureFootprint(structure.kind)),
  );
  if (collides) return { point, valid: false, reason: "FOOTPRINT OCCUPIED" };
  const blocksNode = game.nodes.some((node) => Math.abs(point.x - node.x) < halfWidth + 3.5 && Math.abs(point.y - node.y) < halfHeight + 4);
  if (blocksNode) return { point, valid: false, reason: "LOGISTICS ROUTE BLOCKED" };
  const hostileStronghold = point.x > 70 && point.y < 42 && game.operationStage < 3;
  if (hostileStronghold && networkSource.kind !== "outpost") return { point, valid: false, reason: "HOSTILE BUILD DENIAL" };
  const previewStructure = makeStructure("__preview__", "player", key, point.x, point.y, 1);
  const connects = structureConnections(previewStructure, game.structures).length > 0;
  return {
    point,
    valid: true,
    reason: connects
      ? `VALID · EXPANDS ${BUILD_SPECS[key].name.toUpperCase()}`
      : networkSource.kind === "outpost"
        ? `VALID · ${networkSource.label.toUpperCase()} FORWARD GRID`
        : "GRID CELL AVAILABLE",
  };
}

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
  if (kind === "wraith" || kind === "specter" || kind === "ghost" || kind === "hacker" || kind === "raven") return "infil";
  if (kind === "medic" || kind === "engineer") return "support";
  return "assault";
}

function plannedOrder(unit: Unit, order: Order, queue: boolean): Unit {
  return issueSerializableOrder(unit, order, queue) as Unit;
}

function formationDestination(point: Point, formation: Formation, index: number, count: number): Point {
  return destinationForFormation(
    point,
    formation,
    index,
    count,
    (x: number) => clamp(x, 2, 98),
    (y: number) => clamp(y, 3, 97),
  ) as Point;
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
  const point = snapGridPoint({ x, y }, unitFootprint(kind));
  return {
    id,
    team,
    kind,
    ...point,
    hp: spec.hp,
    maxHp: spec.hp,
    stance: defaultStanceForUnit(kind, team) as Stance,
    facing: team === "player" ? -22 : 155,
    orderQueue: [],
    patrolIndex: 0,
    attackCd: 0,
    sleep: 0,
    suppressed: 0,
    morale: 100,
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
  const point = snapGridPoint({ x, y }, structureFootprint(kind));
  return {
    id,
    team,
    kind,
    ...point,
    hp,
    maxHp: hp,
    attackCd: 0,
    disabled: false,
    hackProgress: 0,
    level: 1,
    upgradeRemaining: 0,
    upgradeTotal: 0,
  };
}

function raidIntervalFor(difficulty: Difficulty, wave: number, theaterId: TheaterId = DEFAULT_THEATER_ID) {
  const base = DIFFICULTY_SPECS[difficulty].raidInterval;
  const floor = difficulty === "guided" ? 82 : difficulty === "standard" ? 64 : 34;
  const acceleration = difficulty === "guided" ? 1.2 : difficulty === "standard" ? 1.6 : 3;
  return Math.max(floor, (base - Math.max(0, wave - 1) * acceleration) * theaterRules(theaterId).raidPace);
}

function raidContactCount(difficulty: Difficulty, wave: number) {
  const baseline = difficulty === "guided"
    ? 1 + Math.floor(wave / 4)
    : difficulty === "standard"
      ? 1 + Math.floor((wave + 1) / 3)
      : 1 + Math.ceil(wave / 2);
  return Math.min(6, baseline + (difficulty === "hardline" && wave >= 2 ? 1 : 0));
}

function structureBounty(kind: StructureKind) {
  if (kind === "enemyRadar") return 180;
  if (kind === "enemyRelay") return 200;
  if (kind === "enemyGate") return 350;
  if (kind === "enemyTurret") return 90;
  return 0;
}

function initialGame(phase: Phase = "menu", difficulty: Difficulty = "guided", theaterId: TheaterId = DEFAULT_THEATER_ID): GameState {
  const tuning = DIFFICULTY_SPECS[difficulty];
  const theater = theaterFor(theaterId);
  const rules = theaterRules(theaterId);
  const startingGmp = tuning.startingGmp + rules.startingGmp;
  const firstRaid = Math.round(tuning.firstRaid * rules.raidPace);
  return {
    phase,
    theaterId,
    operationStage: 0,
    difficulty,
    paused: false,
    speed: 1,
    elapsed: 0,
    resources: startingGmp,
    alert: 0,
    alertHold: 0,
    alarmProgress: 0,
    raidTimer: firstRaid,
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
    formation: "wedge",
    queueMode: false,
    rallyPoint: { x: 20, y: 78 },
    units: [
      makeUnit("wraith-1", "player", "wraith", 18, 77),
      makeUnit("viper-1", "player", "viper", 21, 82),
      makeUnit("specter-1", "player", "specter", 17, 87),
      makeUnit("guard-1", "enemy", "guard", 32, 63, {
        patrol: [{ x: 32, y: 63 }, { x: 41, y: 57 }, { x: 34, y: 52 }],
      }),
    ],
    structures: [
      makeStructure("hq", "player", "hq", 11, 86, 1250),
    ],
    nodes: [
      { id: "node-a", name: "SUPPLY 01", ...snapGridPoint({ x: 28, y: 71 }), income: 6, capture: 0, owner: null, claimed: false },
    ],
    caches: [
      { id: "cache-a", name: "FIELD CACHE A", ...snapGridPoint({ x: 23, y: 74 }), value: 220, collected: false },
    ],
    unitQueue: [],
    structureQueue: null,
    researchQueue: null,
    researched: [],
    campaignDoctrine: [],
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
    emergencyRecoveryStages: [],
    logs: [
      "OPS NET // Tactical grid synchronized",
      `Command allocation received: ${startingGmp} GMP · first raid in ${firstRaid}s`,
      `${theater.title} // ${theater.operations[0].verb}`,
    ],
  };
}

function unlockOperation(
  stage: OperationStage,
  units: Unit[],
  structures: Structure[],
  nodes: ControlNode[],
  caches: FieldCache[],
  theaterId: TheaterId,
) {
  const theater = theaterFor(theaterId);
  const role = campaignOperationRole(stage, theater.operations.length);
  if (role === "radar") {
    units.push(
      makeUnit("guard-2", "enemy", "guard", 49, 47, {
        patrol: [{ x: 49, y: 47 }, { x: 57, y: 42 }, { x: 51, y: 36 }],
      }),
      makeUnit("scout-1", "enemy", "scout", 58, 34, {
        patrol: [{ x: 58, y: 34 }, { x: 64, y: 29 }, { x: 54, y: 27 }],
      }),
    );
    structures.push(
      makeStructure("enemy-radar", "enemy", "enemyRadar", 66, 27, 640),
      makeStructure("turret-a", "enemy", "enemyTurret", 70, 38, 570),
      makeStructure("enemy-gate", "enemy", "enemyGate", 94, 19, 900),
    );
    nodes.push({ id: "node-b", name: "SUPPLY 02", x: 48, y: 52, income: 7, capture: -100, owner: "enemy", claimed: false });
    caches.push({ id: "cache-b", name: "FIELD CACHE B", x: 43, y: 58, value: 260, collected: false });
  }
  if (role === "relays") {
    units.push(
      makeUnit("guard-3", "enemy", "guard", 68, 39, {
        patrol: [{ x: 68, y: 39 }, { x: 73, y: 33 }, { x: 63, y: 32 }],
      }),
      makeUnit("hunter-1", "enemy", "hunter", 82, 34, {
        patrol: [{ x: 82, y: 34 }, { x: 88, y: 29 }, { x: 77, y: 28 }],
      }),
    );
    structures.push(
      makeStructure("relay-a", "enemy", "enemyRelay", 75, 30, 600),
      makeStructure("relay-b", "enemy", "enemyRelay", 87, 28, 600),
      makeStructure("turret-b", "enemy", "enemyTurret", 90, 34, 570),
    );
    nodes.push({ id: "node-c", name: "INTEL 03", x: 63, y: 42, income: 8, capture: -100, owner: "enemy", claimed: false });
    caches.push({ id: "cache-c", name: "FIELD CACHE C", x: 59, y: 47, value: 320, collected: false });
  }
  if (role === "command") {
    units.push(
      makeUnit("interdictor-1", "enemy", "hunter", 77, 22, {
        patrol: [{ x: 77, y: 22 }, { x: 86, y: 18 }, { x: 71, y: 17 }],
        revealed: 35,
      }),
      makeUnit("interdictor-2", "enemy", "guard", 88, 16),
    );
    structures.push(
      makeStructure("enemy-stage-command", "enemy", "enemyGate", 82, 12, 1100),
      makeStructure("turret-stage-d", "enemy", "enemyTurret", 72, 24, 620),
    );
    nodes.push({ id: "node-d", name: "COMMAND 04", x: 72, y: 29, income: 9, capture: -100, owner: "enemy", claimed: false });
    caches.push({ id: "cache-d", name: "FIELD CACHE D", x: 68, y: 34, value: 380, collected: false });
  }
  if (role === "finale") {
    const bossKind = theater.finalUnitKind as UnitKind;
    const bossHp = theater.finalTargetClass === "metal-gear" ? 1450 : theater.finalTargetClass === "vehicle" ? 980 : 620;
    units.push(
      makeUnit("theater-boss", "enemy", bossKind, 82, 22, {
        patrol: [{ x: 82, y: 22 }, { x: 89, y: 18 }, { x: 76, y: 18 }],
        revealed: 999,
        hp: bossHp,
        maxHp: bossHp,
        boss: true,
        callsign: theater.finalTarget,
        bossClass: theater.finalTargetClass,
      }),
      makeUnit("crown-guard-1", "enemy", "hunter", 76, 16),
      makeUnit("crown-guard-2", "enemy", "guard", 90, 15),
    );
    structures.push(makeStructure("uplink", "enemy", "enemyUplink", 82, 10, 1500));
  }

  // Operations may be authored with expressive coordinates, but all
  // interactable objectives resolve onto an unambiguous tile before entering
  // play.  This also keeps older theater data compatible with the grid board.
  nodes.splice(0, nodes.length, ...nodes.map((node) => ({ ...node, ...snapGridPoint(node) })));
  caches.splice(0, caches.length, ...caches.map((cache) => ({ ...cache, ...snapGridPoint(cache) })));
}

function inShadow(point: Point, theaterId: TheaterId = DEFAULT_THEATER_ID) {
  return terrainEffectAt(theaterId, point).zone?.type === "concealment";
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
      const level = structure.level ?? 1;
      if (structure.kind === "generator") produced += 10 + (level - 1) * (level === 3 ? 6 : 4);
      if (structure.kind === "barracks") used += 2 + (level - 1);
      if (structure.kind === "vehicleBay") used += 5 + (level - 1) * 2;
      if (structure.kind === "supplyDepot") used += 2 + (level - 1);
      if (structure.kind === "rdLab") used += 6 + (level - 1) * 2;
      if (structure.kind === "hospital") used += 3 + (level - 1);
      if (structure.kind === "repairBay") used += 4 + (level - 1);
      if (structure.kind === "comms") used += 4 + (level - 1) * 2;
      if (structure.kind === "gate") used += 1;
      if (structure.kind === "sentry") used += 4 + (level - 1) * 2;
      if (structure.kind === "missileNest") used += 6 + (level - 1) * 2;
      if (structure.kind === "sensor") used += 3 + (level - 1);
    });
  return { produced, used, online: produced >= used };
}

function supplyStats(units: Unit[], structures: Structure[], staff: number) {
  const used = units
    .filter((unit) => unit.team === "player")
    .reduce((total, unit) => total + UNIT_SPECS[unit.kind].supply, 0);
  const barracksSupply = structures
    .filter((structure) => structure.team === "player" && structure.kind === "barracks" && !structure.disabled)
    .reduce((total, structure) => total + 6 + ((structure.level ?? 1) - 1) * 4, 0);
  const depotSupply = structures
    .filter((structure) => structure.team === "player" && structure.kind === "supplyDepot" && !structure.disabled)
    .reduce((total, structure) => total + 8 + ((structure.level ?? 1) - 1) * (structure.level === 3 ? 6 : 4), 0);
  return { used, cap: 10 + barracksSupply + depotSupply + Math.min(staff, 6) };
}

function economyStats(game: Pick<GameState, "nodes" | "researched" | "difficulty" | "theaterId">) {
  const rawNodeIncome = game.nodes
    .filter((node) => node.owner === "player")
    .reduce((total, node) => total + node.income, 0);
  const nodeIncome = rawNodeIncome * (game.researched.includes("relayBrokerage") ? 1.25 : 1);
  const baseIncome = Math.max(1, DIFFICULTY_SPECS[game.difficulty].baseIncome + theaterRules(game.theaterId).baseIncome);
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
  const theaterPressure = theaterRules(previous.theaterId);
  const activeTheater = theaterFor(previous.theaterId);
  const activeOperationContract = operationDoctrine({
    operation: activeTheater.operations[previous.operationStage],
    operationStage: previous.operationStage,
    operationCount: activeTheater.operations.length,
    finalTargetClass: activeTheater.finalTargetClass,
  });
  let units: Unit[] = previous.units.map((unit) => promoteSerializableOrder({
    ...unit,
    morale: Number.isFinite(unit.morale) ? unit.morale : 100,
    order: unit.order ? { ...unit.order } : undefined,
    orderQueue: Array.isArray(unit.orderQueue) ? unit.orderQueue.map((order) => ({ ...order })) : [],
    patrol: unit.patrol?.map((point) => ({ ...point })),
  }) as Unit);
  let structures = previous.structures.map((structure) => ({
    ...structure,
    level: structure.level ?? 1,
    upgradeRemaining: structure.upgradeRemaining ?? 0,
    upgradeTotal: structure.upgradeTotal ?? 0,
  }));
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
  let alarmProgress = Number.isFinite(previous.alarmProgress) ? previous.alarmProgress : 0;
  let alarmSourceId = previous.alarmSourceId;
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
  let emergencyRecoveryStages = previous.emergencyRecoveryStages ?? [];
  let operationStage = previous.operationStage;
  let checkpoint = previous.checkpoint;
  let paused = previous.paused;
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
  structures.forEach((structure) => {
    if (structure.team !== "player" || structure.upgradeRemaining <= 0) return;
    const before = structure.upgradeRemaining;
    structure.upgradeRemaining = Math.max(0, structure.upgradeRemaining - dt * buildRate);
    if (before > 0 && structure.upgradeRemaining === 0) {
      structure.level = Math.min(3, structure.level + 1) as StructureLevel;
      structure.maxHp = Math.round(structure.maxHp * 1.22);
      structure.hp = Math.min(structure.maxHp, structure.hp + Math.round(structure.maxHp * 0.35));
      logs = addLog(logs, `${STRUCTURE_LABELS[structure.kind].name} upgraded to level ${structure.level}`);
      transmission = {
        speaker: "ORBIT-893 // BASE NETWORK",
        text: `${STRUCTURE_LABELS[structure.kind].name} level ${structure.level} online. ${STRUCTURE_UPGRADE_COPY[structure.kind]?.[structure.level - 2] ?? "Capacity expanded."}`,
        ttl: 5,
      };
    }
  });
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
  (["infantry", "vehicle"] as ProductionChannel[]).forEach((channel) => {
    const queueIndex = unitQueue.findIndex((item) => UNIT_SPECS[item.key].channel === channel);
    if (queueIndex < 0) return;
    const facilityKind: StructureKind = channel === "infantry" ? "barracks" : "vehicleBay";
    const facility = structures
      .filter((structure) => structure.team === "player" && structure.kind === facilityKind && !structure.disabled && structure.upgradeRemaining <= 0)
      .sort((a, b) => b.level - a.level)[0];
    if (!facility) return;
    const channelRate = buildRate * (1 + (facility.level - 1) * 0.22);
    unitQueue[queueIndex].remaining -= dt * channelRate;
    if (unitQueue[queueIndex].remaining > 0) return;
    const [complete] = unitQueue.splice(queueIndex, 1);
    const angle = (nextId % 6) * 1.04;
    const intendedSpawn = {
      x: clamp(facility.x + Math.cos(angle) * 4.5, 3, 97),
      y: clamp(facility.y + Math.sin(angle) * 4.5, 4, 96),
    };
    const spawnPoint = nearestOpenUnitCell(intendedSpawn, complete.key, units, structures);
    const deployed = makeUnit(
      `${complete.key}-${nextId++}`,
      "player",
      complete.key,
      spawnPoint.x,
      spawnPoint.y,
    );
    if (previous.rallyPoint) {
      deployed.order = {
        kind: deployed.stance === "assault" ? "attackMove" : "move",
        ...previous.rallyPoint,
      };
    }
    units.push(deployed);
    logs = addLog(logs, `${UNIT_SPECS[complete.key].name} deployed from ${STRUCTURE_LABELS[facilityKind].name} L${facility.level}`);
  });

  if (researchQueue) {
    const laboratoryRate = structures
      .filter((structure) => structure.team === "player" && structure.kind === "rdLab" && !structure.disabled && structure.upgradeRemaining <= 0)
      .reduce((rate, structure) => Math.max(rate, 1 + structure.level * 0.25), 1);
    researchQueue.remaining = Math.max(0, researchQueue.remaining - dt * buildRate * laboratoryRate);
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
      .filter((unit) => !inShadow(unit, previous.theaterId))
      .filter(
        (unit) =>
          !effects.some(
            (effect) => effect.kind === "smoke" && distance(effect, unit) <= (effect.radius ?? 0),
          ),
      )
      .sort((a, b) => distance(a, radar) - distance(b, radar))[0];
    if (exposed && distance(exposed, radar) <= 45) {
      alert = clamp(alert + 18 * tuning.detectionRate * theaterPressure.detection * activeOperationContract.detectionPressure, 0, 100);
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
  const alarmContacts: Array<{ enemy: Unit; player: Unit }> = [];

  enemyUnits().forEach((enemy) => {
    const enemySpec = UNIT_SPECS[enemy.kind];
    const contact = playerUnits()
      .map((player) => {
        const playerSpec = UNIT_SPECS[player.kind];
        const stanceSignature = player.stance === "stealth" ? 0.56 : player.stance === "hold" ? 0.78 : 1;
        const terrainSignature = terrainEffectAt(previous.theaterId, player).signature;
        const nearSilentComms = previous.campaignDoctrine?.includes("silentNetwork") && structures.some(
          (structure) => structure.team === "player" && structure.kind === "comms" && !structure.disabled && distance(structure, player) <= 24 + structure.level * 7,
        );
        const meshSignature = (researched.includes("whisperMesh") ? 0.82 : 1) * (previous.campaignDoctrine?.includes("signalDiscipline") ? 0.92 : 1) * (nearSilentComms ? 0.8 : 1);
        const smokeSignature = effects.some(
          (effect) => effect.kind === "smoke" && distance(effect, player) <= (effect.radius ?? 0),
        )
          ? 0.34
          : 1;
        const detectionRange = Math.max(
          3.5,
          enemySpec.vision * terrainEffectAt(previous.theaterId, enemy).vision * playerSpec.signature * stanceSignature * terrainSignature * smokeSignature * meshSignature,
        );
        const d = distance(enemy, player);
        const cone = angleDifference(enemy.facing, facingTo(enemy, player)) <= (enemy.kind === "scout" ? 76 : 59);
        return { player, d, visible: d <= 3.3 || (d <= detectionRange && cone) };
      })
      .filter((candidate) => candidate.visible)
      .sort((a, b) => a.d - b.d)[0];

    if (contact) {
      alarmContacts.push({ enemy, player: contact.player });
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
        alert = clamp(alert + 5 * dt * tuning.detectionRate * theaterPressure.detection, 0, 100);
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

  // A patrol sighting creates a readable, interruptible communications window
  // before the whole theater escalates. Sedate/eliminate the caller, jam the
  // network, or break line of sight before ALARM reaches 100.
  if (alarmContacts.length) {
    const activeContact = alarmContacts.find(({ enemy }) => enemy.id === alarmSourceId)
      ?? [...alarmContacts].sort((a, b) => (a.enemy.kind === "scout" ? -1 : 0) - (b.enemy.kind === "scout" ? -1 : 0))[0];
    alarmSourceId = activeContact.enemy.id;
    const linkedNetwork = jamTimer <= 0 && structures.some(
      (structure) => structure.team === "enemy" && !structure.disabled &&
        (structure.kind === "enemyRadar" || structure.kind === "enemyRelay" || structure.kind === "enemyGate"),
    );
    const beforeAlarm = alarmProgress;
    alarmProgress = clamp(
      alarmProgress + alarmBuildRate({ linked: linkedNetwork, sourceKind: activeContact.enemy.kind, difficulty: previous.difficulty }) * theaterPressure.detection * activeOperationContract.detectionPressure * dt,
      0,
      100,
    );
    alert = clamp(
      alert + (activeContact.enemy.kind === "scout" ? 14 : 9) * dt * tuning.detectionRate * theaterPressure.detection * activeOperationContract.detectionPressure,
      0,
      alarmProgress >= 100 ? 100 : 58,
    );
    alertHold = Math.max(alertHold, 6);
    if (beforeAlarm < 100 && alarmProgress >= 100) {
      alert = 100;
      alertHold = Math.max(alertHold, 12);
      logs = addLog(logs, "ALARM TRANSMITTED // Theater response network has the contact");
      transmission = {
        speaker: "OPS // ALARM",
        text: "The contact report got through. Break pursuit, destroy the response route, or prepare for the QRF.",
        ttl: 6,
      };
    }
  } else {
    const source = units.find((unit) => unit.id === alarmSourceId && unit.team === "enemy" && unit.sleep <= 0 && unit.hp > 0);
    alarmProgress = Math.max(0, alarmProgress - (source ? 18 : 34) * dt);
    if (alarmProgress <= 0) alarmSourceId = undefined;
  }

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
    const moraleRecovery = unit.combatTimer <= 0 ? 7.5 : 1.4;
    unit.morale = clamp((Number.isFinite(unit.morale) ? unit.morale : 100) + moraleRecovery * dt, 0, 100);
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
      (structure.kind === "hq" || structure.kind === "hospital"),
  );
  units
    .filter((unit) => unit.team === "player" && unit.combatTimer <= 0 && unit.hp < unit.maxHp)
    .forEach((unit) => {
      const hospital = fieldHospitals.find((structure) => distance(structure, unit) <= (structure.kind === "hospital" ? 10 + structure.level * 2 : 7));
      if (hospital) {
        const doctrineRate = previous.campaignDoctrine?.includes("rapidRecovery") ? 1.25 : 1;
        unit.hp = Math.min(unit.maxHp, unit.hp + (hospital.kind === "hospital" ? 6 + hospital.level * 3 : 3.5) * doctrineRate * activeOperationContract.sustainRate * dt);
        unit.morale = Math.min(100, unit.morale + (hospital.kind === "hospital" ? 11 : 5) * dt);
      }
    });

  const engineers = units.filter((unit) => unit.team === "player" && unit.kind === "engineer" && unit.sleep <= 0 && unit.combatTimer <= 0);
  engineers.forEach((engineer) => {
    const damaged = structures
      .filter((structure) => structure.team === "player" && structure.hp < structure.maxHp && distance(structure, engineer) <= 7)
      .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    if (damaged) damaged.hp = Math.min(damaged.maxHp, damaged.hp + 5.5 * dt);
  });

  const repairBays = structures.filter((structure) => structure.team === "player" && structure.kind === "repairBay" && !structure.disabled && power.online);
  repairBays.forEach((bay) => {
    const repair = repairZoneStats(bay.level, previous.campaignDoctrine?.includes("preservationDoctrine"));
    structures
      .filter((structure) => structure.team === "player" && structure.id !== bay.id && structure.hp < structure.maxHp && distance(structure, bay) <= repair.radius)
      .forEach((structure) => { structure.hp = Math.min(structure.maxHp, structure.hp + repair.structureRate * activeOperationContract.sustainRate * dt); });
    units
      .filter((unit) => unit.team === "player" && UNIT_SPECS[unit.kind].channel === "vehicle" && unit.hp < unit.maxHp && distance(unit, bay) <= repair.radius)
      .forEach((unit) => { unit.hp = Math.min(unit.maxHp, unit.hp + repair.vehicleRate * activeOperationContract.sustainRate * dt); });
  });

  const medics = units.filter(
    (unit) => unit.team === "player" && unit.kind === "medic" && unit.sleep <= 0,
  );
  const medicRate = (researched.includes("traumaNetwork") ? 6.5 : 4.2) * activeOperationContract.sustainRate;
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
    if (casualty) {
      casualty.hp = Math.min(casualty.maxHp, casualty.hp + medicRate * dt);
      casualty.morale = Math.min(100, casualty.morale + 7 * dt);
    }
  });

  const onlineSensors = structures.filter(
    (structure) =>
      structure.team === "player" &&
      structure.kind === "sensor" &&
      !structure.disabled &&
      power.online,
  );
  const onlineComms = structures.filter(
    (structure) => structure.team === "player" && structure.kind === "comms" && !structure.disabled && power.online,
  );
  units
    .filter((unit) => unit.team === "enemy")
    .forEach((enemy) => {
      const seenByUnit = units
        .filter((unit) => unit.team === "player")
        .some((friendly) => distance(friendly, enemy) <= UNIT_SPECS[friendly.kind].vision);
      const seenBySensor = onlineSensors.some((sensor) => distance(sensor, enemy) <= 22 + sensor.level * 5);
      const seenByComms = onlineComms.some((comms) => distance(comms, enemy) <= 24 + comms.level * 7);
      const seenByScan = effects.some(
        (effect) =>
          effect.kind === "scan" &&
          effect.team === "player" &&
          distance(effect, enemy) <= (effect.radius ?? 0),
      );
      if (seenByUnit || seenBySensor || seenByComms || seenByScan) enemy.revealed = Math.max(enemy.revealed, seenByScan ? 7 : seenByComms ? 4 : 2.5);
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
      capture += 24 * tuning.captureRate * activeOperationContract.captureRate * dt * Math.min(2, friendly - hostile);
    }
    if (hostile > friendly) capture -= 18 * dt * Math.min(2, hostile - friendly);
    capture = clamp(capture, -100, 100);
    let owner: Team | null = node.owner;
    let claimed = node.claimed;
    if (capture >= 100 && owner !== "player") {
      owner = "player";
      nodesSecured += 1;
      if (!claimed) {
        const captureBonus = Math.round(tuning.nodeBonus * (previous.campaignDoctrine?.includes("forwardStores") ? 1.35 : 1));
        resources += captureBonus;
        claimed = true;
        logs = addLog(
          logs,
          `${node.name} secured: +${captureBonus} GMP and +${node.income}/s`,
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
    const targetDistance = distance(unit, point);
    if (targetDistance <= 0.35) return true;
    const targetBarrierId = "id" in point ? String(point.id) : undefined;
    const barriers = structures
      .filter((structure) => structure.team === "player" && (structure.kind === "wall" || structure.kind === "gate") && structure.id !== targetBarrierId)
      .map((structure) => ({ ...structure, footprint: structureFootprint(structure.kind) }));
    const navigation = nextBarrierWaypoint({
      from: unit,
      target: point,
      unitTeam: unit.team,
      powerOnline: power.online,
      barriers,
    });
    if (navigation.blockingBarrierId) {
      if (unit.team === "enemy") {
        const barrier = structures.find((structure) => structure.id === navigation.blockingBarrierId);
        if (barrier) {
          unit.breachTargetId = barrier.id;
          unit.order = { kind: "attack", targetId: barrier.id, x: barrier.x, y: barrier.y };
        }
      }
      return false;
    }
    const navigationPoint = navigation.point;
    const d = distance(unit, navigationPoint);
    if (d <= 0.12) return targetDistance <= 0.9;
    const spec = UNIT_SPECS[unit.kind];
    const stealthMobility =
      unit.stance === "stealth" && inShadow(unit, previous.theaterId) && researched.includes("spectralWeave") ? 1.22 : 1;
    const stanceSpeed = (unit.stance === "stealth" ? 0.7 : 1) * stealthMobility;
    const moraleState = moraleBand(unit.morale);
    const suppressionSpeed = moraleState === "broken" ? 0.34 : moraleState === "pinned" ? 0.5 : unit.suppressed > 0 ? 0.72 : 1;
    const terrainSpeed = terrainEffectAt(previous.theaterId, unit).speed;
    const roadSpeed = onRoad(unit) ? 1.16 : 1;
    const travel = Math.min(spec.speed * stanceSpeed * suppressionSpeed * terrainSpeed * roadSpeed * dt, d);
    unit.facing = facingTo(unit, navigationPoint);
    unit.x = clamp(unit.x + ((navigationPoint.x - unit.x) / d) * travel, 2, 98);
    unit.y = clamp(unit.y + ((navigationPoint.y - unit.y) / d) * travel, 3, 97);
    return targetDistance <= 0.9;
  };

  const fire = (attacker: Unit, target: Unit | Structure) => {
    if (attacker.attackCd > 0) return;
    if (moraleBand(attacker.morale) === "broken") return;
    const spec = UNIT_SPECS[attacker.kind];
    const targetIsStructure = !("sleep" in target);
    const attackerTerrain = terrainEffectAt(previous.theaterId, attacker);
    let damage = spec.damage * attackerTerrain.outgoingDamage * (1 + attacker.rank * 0.1) * counterProfile(attacker.kind, target);
    if (attacker.team === "enemy") damage *= tuning.enemyDamage * theaterPressure.enemyDamage;
    if (!targetIsStructure && target.boss) {
      damage *= attacker.kind === "lancer" ? 1.2 : attacker.kind === "mantis" ? 1.1 : 0.62;
    }
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
      const prototypeOnline = units.some((unit) => unit.team === "enemy" && unit.boss && unit.hp > 0);
      if (relaysOnline || radarOnline || prototypeOnline || !mapControl) damage = 0;
    }
    if (!targetIsStructure) damage *= terrainEffectAt(previous.theaterId, target).damageTaken;
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
      const targetTerrain = terrainEffectAt(previous.theaterId, target);
      const moraleLoss = suppressionMoraleLoss(attacker.kind, targetTerrain.zone?.type ?? "open");
      target.morale = clamp(target.morale - moraleLoss, 0, 100);
      target.suppressed = Math.max(target.suppressed, moraleLoss >= 12 ? 2.4 : 0.9);
    }
    damageSources.set(target.id, attacker.id);
    attacker.combatTimer = Math.max(attacker.combatTimer, 3);
    attacker.attackCd = spec.cooldown * (moraleBand(attacker.morale) === "pinned" ? 1.55 : moraleBand(attacker.morale) === "shaken" ? 1.18 : 1);
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

  // Recovery Mules create a vulnerable C&C-style economy loop: they leave the
  // base, load at controlled supply relays, and must physically return to a
  // depot before the GMP enters the war chest.
  units
    .filter((unit) => unit.team === "player" && unit.kind === "mule" && unit.hp > 0)
    .forEach((mule) => {
      const depots = structures.filter(
        (structure) => structure.team === "player" && structure.kind === "supplyDepot" && !structure.disabled && structure.hp > 0,
      );
      const ownedNodes = nodes.filter((node) => node.owner === "player");
      if (!depots.length || !ownedNodes.length) {
        mule.order = undefined;
        mule.logisticsPhase = "seek";
        return;
      }

      let targetNode = ownedNodes.find((node) => node.id === mule.logisticsTargetId);
      if (!targetNode) {
        targetNode = ownedNodes
          .map((node) => ({ node, distance: distance(mule, node) }))
          .sort((a, b) => a.distance - b.distance)[0]?.node;
        mule.logisticsTargetId = targetNode?.id;
      }
      if (!targetNode) return;

      const depot = depots
        .map((structure) => ({ structure, distance: distance(mule, structure) }))
        .sort((a, b) => a.distance - b.distance)[0].structure;
      const phase = mule.logisticsPhase ?? "seek";

      if (phase === "seek") {
        mule.order = { kind: "move", x: targetNode.x, y: targetNode.y, targetId: targetNode.id };
        if (distance(mule, targetNode) <= 2.2) {
          mule.order = undefined;
          mule.logisticsPhase = "loading";
          mule.logisticsTimer = 5;
        } else {
          moveToward(mule, targetNode);
        }
        return;
      }

      if (phase === "loading") {
        mule.order = undefined;
        mule.logisticsTimer = Math.max(0, (mule.logisticsTimer ?? 5) - dt);
        if (mule.logisticsTimer <= 0) {
          mule.cargoGmp = Math.round(recoveryLoadValue(targetNode.income) * activeOperationContract.logisticsYield);
          mule.logisticsPhase = "return";
        }
        return;
      }

      mule.order = { kind: "move", x: depot.x, y: depot.y, targetId: depot.id };
      if (distance(mule, depot) <= 2.8) {
        const recovered = mule.cargoGmp ?? 0;
        resources += recovered;
        mule.cargoGmp = 0;
        mule.logisticsPhase = "seek";
        mule.logisticsTargetId = ownedNodes.length > 1
          ? ownedNodes[(ownedNodes.findIndex((node) => node.id === targetNode?.id) + 1) % ownedNodes.length].id
          : targetNode.id;
        mule.order = undefined;
        effects.push({ id: nextId++, kind: "scan", x: depot.x, y: depot.y, ttl: 1.1, maxTtl: 1.1, radius: 5, team: "player" });
        logs = addLog(logs, `Recovery Mule delivered ${recovered} GMP from ${targetNode.name}`);
        transmission = {
          speaker: "FOB // LOGISTICS",
          text: `Recovery convoy home. ${recovered} GMP cleared into the field ledger. Protect the next run.`,
          ttl: 4,
        };
      } else {
        moveToward(mule, depot);
      }
    });

  units.forEach((unit) => {
    if (unit.sleep > 0 || unit.hp <= 0) return;
    if (unit.team === "player" && unit.kind === "mule") return;
    const spec = UNIT_SPECS[unit.kind];
    let order = unit.order;

    if (unit.team === "enemy" && unit.raid) {
      const breachTarget = structures.find(
        (structure) => structure.id === unit.breachTargetId && structure.team === "player" && structure.hp > 0,
      );
      if (!breachTarget) unit.breachTargetId = undefined;
      const nearestFriendly = units
        .filter((candidate) => candidate.team === "player")
        .map((candidate) => ({ candidate, d: distance(unit, candidate) }))
        .filter(({ d }) => d <= spec.vision)
        .sort((a, b) => a.d - b.d)[0];
      const infrastructureTargets = structures
        .filter((structure) => structure.team === "player")
        .map((structure) => {
          const doctrine = unit.raidRole ?? "assault";
          const strategicValue = doctrine === "scout"
            ? structure.kind === "sensor" || structure.kind === "comms" ? 19 : structure.kind === "supplyDepot" ? 10 : 2
            : doctrine === "sabotage"
              ? structure.kind === "generator" ? 21 : structure.kind === "supplyDepot" || structure.kind === "rdLab" ? 18 : structure.kind === "vehicleBay" ? 11 : 3
              : doctrine === "siege"
                ? structure.kind === "sentry" || structure.kind === "missileNest" ? 20 : structure.kind === "repairBay" ? 17 : structure.kind === "hq" ? 13 : 4
                : structure.kind === "barracks" || structure.kind === "vehicleBay" ? 16 : structure.kind === "hq" ? 14 : structure.kind === "sentry" ? 11 : 5;
          return { structure, score: distance(unit, structure) - strategicValue };
        })
        .sort((a, b) => a.score - b.score);
      const raidTarget =
        breachTarget ??
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
      if (target.owner === "player") {
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
          units.some((candidate) => candidate.team === "enemy" && candidate.boss && candidate.hp > 0) ||
          nodes.filter((node) => node.owner === "player").length < 2);
      if (uplinkShielded) {
        unit.order = undefined;
        logs = addLog(logs, "Uplink locked: control the theater, sever the network, and defeat its command prototype");
        return;
      }
      if (distance(unit, target) > 3.8) {
        moveToward(unit, target);
      } else if (unit.kind === "wraith" || unit.kind === "hacker") {
        const doctrineRate = (previous.campaignDoctrine?.includes("ghostRouting") ? 1.25 : 1) * activeOperationContract.hackRate;
        target.hackProgress = clamp(target.hackProgress + (unit.kind === "hacker" ? 48 : 26) * doctrineRate * dt, 0, 100);
        if (target.hackProgress >= 100) {
          target.disabled = true;
          unit.order = undefined;
          const reward = target.kind === "enemyGate" ? 260 : 180;
          resources += reward;
          logs = addLog(logs, `${STRUCTURE_LABELS[target.kind].name} subverted: +${reward} GMP`);
          transmission = {
            speaker: `${UNIT_SPECS[unit.kind].name.toUpperCase()} // FIELD`,
            text: `${STRUCTURE_LABELS[target.kind].name} is dark. No explosives required.`,
            ttl: 5,
          };
        }
      }
      return;
    }

    if (order.kind === "tranq") {
      if (!target || !('sleep' in target) || target.team !== "enemy" || target.kind === "scout" || target.boss) {
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

    if (order.kind === "guard") {
      const contact = [
        ...units.filter((candidate) => candidate.team === "enemy" && candidate.sleep <= 0 && candidate.revealed > 0),
        ...structures.filter((candidate) => candidate.team === "enemy" && !candidate.disabled),
      ]
        .map((candidate) => ({ candidate, d: distance(unit, candidate), anchorDistance: distance(order, candidate) }))
        .filter(({ d, anchorDistance }) => d <= spec.vision && anchorDistance <= 12)
        .sort((a, b) => a.d - b.d)[0];
      if (contact) {
        if (contact.d <= spec.range) fire(unit, contact.candidate as Unit | Structure);
        else moveToward(unit, contact.candidate);
      } else if (distance(unit, order) > 1.5) {
        moveToward(unit, order);
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
    const isFriendlyMissile = structure.team === "player" && structure.kind === "missileNest";
    const isEnemyTurret = structure.team === "enemy" && structure.kind === "enemyTurret";
    if (!isFriendlySentry && !isFriendlyMissile && !isEnemyTurret) return;
    if (structure.disabled || structure.hp <= 0) return;
    if (isFriendlySentry && !power.online) return;
    if (isEnemyTurret && jamTimer > 0) return;
    const validEnemyTurret = isEnemyTurret && securityState(alert) !== "hidden";
    const candidates = units
      .filter((unit) => unit.team !== structure.team && unit.sleep <= 0)
      .map((unit) => ({ unit, d: distance(structure, unit), vehicle: isVehicleKind(unit.kind) }))
      .filter(({ d }) => d <= (isFriendlyMissile ? 19 + structure.level * 2 : isFriendlySentry ? 14 + structure.level * 2.5 : 17))
      .sort((a, b) => isFriendlyMissile && a.vehicle !== b.vehicle ? (a.vehicle ? -1 : 1) : a.d - b.d);
    const target = candidates[0];
    if (!target || (isEnemyTurret && !validEnemyTurret && target.d > 5)) return;
    if (structure.attackCd <= 0) {
      const sentryDamage = isFriendlyMissile
        ? (target.vehicle ? 82 + structure.level * 24 : 24 + structure.level * 7)
        : isFriendlySentry ? 19 + structure.level * 8 : 21 * tuning.enemyDamage * theaterPressure.enemyDamage;
      damageUnits.set(target.unit.id, (damageUnits.get(target.unit.id) ?? 0) + sentryDamage);
      target.unit.suppressed = Math.max(target.unit.suppressed, 1.4);
      target.unit.morale = clamp(
        target.unit.morale - suppressionMoraleLoss(isFriendlyMissile ? "lancer" : "viper", terrainEffectAt(previous.theaterId, target.unit).zone?.type ?? "open"),
        0,
        100,
      );
      target.unit.combatTimer = Math.max(target.unit.combatTimer, 4);
      structure.attackCd = isFriendlyMissile
        ? Math.max(1.45, 2.55 - structure.level * 0.28)
        : isFriendlySentry ? Math.max(0.48, 0.84 - structure.level * 0.1) : 0.9;
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
    }));

  const disabledCommand = structures.find(
    (structure) => structure.id === "hq" && structure.team === "player" && structure.hp <= 0,
  );
  const recoveryAvailable = disabledCommand && shouldTriggerEmergencyRecovery({
    difficulty: previous.difficulty,
    operationStage,
    hqHp: disabledCommand.hp,
    usedStages: emergencyRecoveryStages,
  });
  if (recoveryAvailable && disabledCommand) {
    const restoredFraction = previous.difficulty === "guided" ? 0.46 : 0.3;
    emergencyRecoveryStages = [...emergencyRecoveryStages, operationStage];
    structures = structures.map((structure) =>
      structure.id === disabledCommand.id
        ? { ...structure, hp: Math.round(structure.maxHp * restoredFraction) }
        : structure,
    );
    units = units.map((unit) =>
      unit.team === "enemy" && unit.raid
        ? {
            ...unit,
            raid: false,
            stance: "hold" as const,
            suppressed: Math.max(unit.suppressed, 5),
            morale: Math.min(unit.morale, 28),
            order: { kind: "move" as const, x: 94, y: 19 },
          }
        : unit,
    );
    raidTimer = Math.max(raidTimer, previous.difficulty === "guided" ? 135 : 95);
    alert = Math.min(alert, 24);
    alertHold = 0;
    logs = addLog(logs, `EMERGENCY COMMAND RECOVERY // Operation ${operationStage + 1} reserve spent`);
    transmission = {
      speaker: "ORBIT-893 // EMERGENCY NET",
      text: "Forward Command nearly collapsed. Redundant command cells are online and the raid is withdrawing. This operation has no second recovery—repair and harden the perimeter now.",
      ttl: 9,
    };
  }
  structures = structures.filter((structure) => structure.hp > 0);

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
      logs = addLog(logs, `${UNIT_SPECS[unit.kind].name} unit lost`);
    } else {
      eliminations += 1;
      const bounty = unit.boss ? 900 : unit.kind === "hunter" ? 75 : unit.kind === "scout" ? 45 : 40;
      resources += bounty;
      const killerId = damageSources.get(unit.id);
      const killer = units.find((candidate) => candidate.id === killerId && candidate.team === "player");
      if (killer) {
        killer.kills += 1;
        killer.xp += unit.boss ? 5 : unit.kind === "hunter" ? 2 : 1;
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
    const bounty = Math.round((tuning.raidBounty + raidWave * 40) * activeOperationContract.defenseContract);
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
    const raidDoctrine = raidDoctrineFor(previous.theaterId, raidWave) as RaidDoctrine;
    const raidKinds = raidComposition(raidDoctrine, count, raidWave) as UnitKind[];
    raidKinds.forEach((kind, index) => {
      units.push(
        makeUnit(
          `${kind}-${nextId++}`,
          "enemy",
          kind,
          clamp(gate.x - index * 1.8, 2, 98),
          clamp(gate.y + index * 2, 3, 97),
          { raid: true, raidRole: raidDoctrine, stance: "assault", order: { kind: "attack", targetId: "hq", x: 11, y: 86 } },
        ),
      );
    });
    raidTimer = raidIntervalFor(previous.difficulty, raidWave + 1, previous.theaterId) * activeOperationContract.raidPace;
    alert = Math.max(alert, 32);
    alertHold = Math.max(alertHold, 7);
    transmission = {
      speaker: "FOB // DEFENSE",
      text: `${raidDoctrine.toUpperCase()} raid ${raidWave} crossed the perimeter. Read the target pattern and protect the threatened network.`,
      ttl: 6,
    };
    logs = addLog(logs, `INCOMING ${raidDoctrine.toUpperCase()} RAID ${raidWave} // ${count} contacts`);
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

  const economy = economyStats({ nodes, researched, difficulty: previous.difficulty, theaterId: previous.theaterId });
  resources += economy.income * dt;

  const uplink = structures.find((structure) => structure.kind === "enemyUplink");
  const hq = structures.find((structure) => structure.kind === "hq" && structure.team === "player");
  const sentryOnline = structures.some(
    (structure) => structure.team === "player" && structure.kind === "sentry" && !structure.disabled,
  );
  const stageOneReady =
    nodes.some((node) => node.id === "node-a" && node.owner === "player") && sentryOnline;
  const stageTwoReady =
    nodes.some((node) => node.id === "node-b" && node.owner === "player") &&
    !structures.some((structure) => structure.kind === "enemyRadar" && !structure.disabled);
  const stageThreeReady =
    nodes.some((node) => node.id === "node-c" && node.owner === "player") &&
    !structures.some((structure) => structure.kind === "enemyRelay" && !structure.disabled);
  const stageFourReady =
    nodes.some((node) => node.id === "node-d" && node.owner === "player") &&
    !structures.some((structure) => structure.id === "enemy-stage-command" && !structure.disabled);
  const theater = activeTheater;
  const finalStage = theater.operations.length - 1;
  const operationRole = campaignOperationRole(operationStage, theater.operations.length);
  const objectiveComplete = operationRole === "foothold"
    ? stageOneReady
    : operationRole === "radar"
      ? stageTwoReady
      : operationRole === "relays"
        ? stageThreeReady
        : operationRole === "command"
          ? stageFourReady
          : false;
  const bossAlive = units.some((unit) => unit.boss && unit.team === "enemy");
  let phase: Phase = previous.phase;
  let defeatReason = previous.defeatReason;
  const missionDecision = evaluateTheaterGraph({
    operationStage,
    operationCount: theater.operations.length,
    hqAlive: Boolean(hq),
    objectiveComplete,
    bossAlive,
    commandTargetOnline: Boolean(uplink && !uplink.disabled),
  });

  if (missionDecision.kind === "checkpoint") {
    operationStage = missionDecision.nextStage;
    unlockOperation(operationStage, units, structures, nodes, caches, previous.theaterId);

    const routedRaiders = units.filter((unit) => unit.team === "enemy" && unit.raid).length;
    if (routedRaiders) {
      units = units.filter((unit) => unit.team !== "enemy" || !unit.raid);
      logs = addLog(logs, `${routedRaiders} raid contact${routedRaiders === 1 ? "" : "s"} routed as the sector changed hands`);
    }

    const repairFloor = previous.difficulty === "guided" ? 0.78 : previous.difficulty === "standard" ? 0.66 : 0.5;
    structures = structures.map((structure) =>
      structure.team === "player"
        ? { ...structure, hp: Math.max(structure.hp, Math.round(structure.maxHp * repairFloor)) }
        : structure,
    );

    const secured = theater.operations[operationStage - 1];
    const opening = theater.operations[operationStage];
    checkpoint = {
      stage: operationStage,
      operation: `${secured.name.toUpperCase()} SECURED`,
      title: `${opening.name} is now live. The theater continues.`,
      text: `Forward Command, surviving forces, veterans, structures, research, GMP, and captured territory persist. ${opening.verb}`,
      signal: opening.signal,
    };
    raidTimer = Math.max(
      raidTimer,
      operationStage === finalStage
        ? previous.difficulty === "guided" ? 150 : previous.difficulty === "standard" ? 115 : 76
        : previous.difficulty === "guided" ? 125 : previous.difficulty === "standard" ? 94 : 62,
    );
    paused = true;
  } else if (missionDecision.kind === "victory") {
    phase = "won";
  } else if (missionDecision.kind === "defeat") {
    phase = "lost";
    defeatReason = missionDecision.reason;
    paused = true;
  }

  return {
    ...previous,
    phase,
    defeatReason,
    operationStage,
    checkpoint,
    paused,
    elapsed: previous.elapsed + dt,
    resources,
    alert,
    alertHold,
    alarmProgress,
    alarmSourceId,
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
    emergencyRecoveryStages,
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
  const [selectedTheaterId, setSelectedTheaterId] = useState<TheaterId>(DEFAULT_THEATER_ID);
  const [menuView, setMenuView] = useState<MenuView>("command");
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const [touchMode, setTouchMode] = useState<TouchMode>("orders");
  const [progress, setProgress] = useState<PlayerProgress>(DEFAULT_PROGRESS);
  const [settings, setSettings] = useState<PlayerSettings>(DEFAULT_SETTINGS);
  const [account, setAccount] = useState<AccountState>({ status: "checking" });
  const [hasSave, setHasSave] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [coachExpanded, setCoachExpanded] = useState(true);
  const [multiSelect, setMultiSelect] = useState(false);
  const [deckTab, setDeckTab] = useState<"ops" | "base" | "forces" | "research">("ops");
  const [buildCategory, setBuildCategory] = useState<BuildCategory>("infrastructure");
  const [inspectedBuild, setInspectedBuild] = useState<BuildKey>("generator");
  const [forceCategory, setForceCategory] = useState<ForceCategory>("infantry");
  const [cohortFilter, setCohortFilter] = useState<SquadCohort>("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [deckCollapsed, setDeckCollapsed] = useState(true);
  const [objectivesOpen, setObjectivesOpen] = useState(true);
  const [selectionBox, setSelectionBox] = useState<{ start: Point; end: Point } | null>(null);
  const [buildPreview, setBuildPreview] = useState<Point | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const gestureRef = useRef<{ x: number; y: number; point: Point; pointerType: string } | null>(null);
  const selectionBoxRef = useRef<{ start: Point; end: Point } | null>(null);
  const gameRef = useRef(game);
  const progressRef = useRef(progress);
  const settingsRef = useRef(settings);
  const lastPhaseRef = useRef<Phase>(game.phase);
  const savedCheckpointStageRef = useRef<OperationStage | -1>(-1);
  const audioRef = useRef<AudioContext | null>(null);
  const previousSecurity = useRef<SecurityState>("hidden");
  const helpWasPausedRef = useRef(false);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    progressRef.current = progress;
    if (!hydrated) return;
    window.localStorage.setItem("command-rex-progress", JSON.stringify(progress));
  }, [hydrated, progress]);

  useEffect(() => {
    settingsRef.current = settings;
    if (!hydrated) return;
    window.localStorage.setItem("command-rex-settings", JSON.stringify(settings));
  }, [hydrated, settings]);

  useEffect(() => {
    const compactQuery = window.matchMedia("(max-width: 900px)");
    const syncCompactLayout = () => {
      const compact = compactQuery.matches;
      setIsCompactLayout(compact);
      if (compact) {
        setDeckCollapsed(true);
        setCoachExpanded(false);
        setObjectivesOpen(false);
      }
    };
    syncCompactLayout();
    compactQuery.addEventListener("change", syncCompactLayout);
    return () => compactQuery.removeEventListener("change", syncCompactLayout);
  }, []);

  useEffect(() => {
    // Persistent campaign, accessibility, and save state hydrate client-side.
    try {
      const storedProgress = window.localStorage.getItem("command-rex-progress");
      const storedSettings = window.localStorage.getItem("command-rex-settings");
      const storedSave = window.localStorage.getItem("command-rex-save");
      if (storedProgress) {
        const parsed = JSON.parse(storedProgress) as Partial<PlayerProgress>;
        const restored = mergeCampaignProgress(DEFAULT_PROGRESS, parsed) as PlayerProgress;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProgress(restored);
        const firstIncomplete = CAMPAIGN.find((theater) => !restored.completedTheaterIds.includes(theater.id));
        setSelectedTheaterId(firstIncomplete?.id ?? DEFAULT_THEATER_ID);
      }
      if (storedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
      setHasSave(Boolean(storedSave));
    } catch {
      setHasSave(false);
    }
    setHydrated(true);

    void fetch("/api/player", { headers: { accept: "application/json" } })
      .then(async (response) => {
        if (response.status === 401) {
          setAccount({ status: "guest" });
          return;
        }
        if (!response.ok) throw new Error("profile unavailable");
        const payload = await response.json() as {
          user?: { displayName: string; email: string };
          profile?: Partial<PlayerProgress>;
          settings?: Partial<PlayerSettings>;
          save?: GameState | null;
        };
        setAccount({ status: "signed-in", displayName: payload.user?.displayName, email: payload.user?.email });
        if (payload.profile) setProgress((current) => mergeCampaignProgress(current, payload.profile) as PlayerProgress);
        if (payload.settings) setSettings((current) => ({ ...current, ...payload.settings }));
        if (payload.save) {
          window.localStorage.setItem("command-rex-save", JSON.stringify(payload.save));
          setHasSave(true);
        }
      })
      .catch(() => setAccount({ status: "guest" }));
  }, []);

  useEffect(() => {
    const saveTimer = window.setInterval(() => {
      const current = gameRef.current;
      if (current.phase !== "playing" || current.checkpoint) return;
      const save = { ...current, paused: true, effects: [], transmission: undefined };
      window.localStorage.setItem("command-rex-save", JSON.stringify(save));
      setHasSave(true);
      if (account.status === "signed-in") {
        void fetch("/api/player", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profile: progressRef.current, settings: settingsRef.current, save }),
        });
      }
    }, 30000);
    return () => window.clearInterval(saveTimer);
  }, [account.status]);

  useEffect(() => {
    if (!hydrated || game.phase !== "playing" || game.checkpoint || game.operationStage === 0) return;
    if (savedCheckpointStageRef.current >= game.operationStage) return;
    const checkpointSave: GameState = {
      ...game,
      phase: "playing",
      paused: true,
      defeatReason: undefined,
      effects: [],
      transmission: {
        speaker: "ORBIT-893 // CHECKPOINT",
        text: `${operationNameFor(game.theaterId, game.operationStage)} restored. Forward Command is holding for your order.`,
        ttl: 7,
      },
    };
    window.localStorage.setItem("command-rex-checkpoint", JSON.stringify(checkpointSave));
    savedCheckpointStageRef.current = game.operationStage;
  }, [game, hydrated]);

  const playTone = useCallback(
    (frequency = 520, duration = 0.08, type: OscillatorType = "square") => {
      if (settings.muted || typeof window === "undefined") return;
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
    [settings.muted],
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
  const selectedNode = useMemo(
    () => game.nodes.find((node) => node.id === selectedNodeId && node.owner === "player"),
    [game.nodes, selectedNodeId],
  );
  const selectedPrimary = selectedUnits[0];
  const activeTheater = theaterFor(game.theaterId);
  const activeCast = CAMPAIGN_CAST_BY_THEATER[game.theaterId as keyof typeof CAMPAIGN_CAST_BY_THEATER] ?? [];
  const activeRules = theaterRules(game.theaterId);
  const activeTactics = theaterTactics(game.theaterId);
  const activeOperations = activeTheater.operations as Array<{ name: string; verb: string; signal: string }>;
  const activeFinalTarget = activeTheater.finalTarget;
  const finalOperationStage = activeOperations.length - 1;
  const friendlyTypeRoster = useMemo(() => {
    const kinds = new Map<UnitKind, number>();
    game.units.forEach((unit) => {
      if (unit.team === "player") kinds.set(unit.kind, (kinds.get(unit.kind) ?? 0) + 1);
    });
    return Array.from(kinds.entries()).map(([kind, count]) => ({ kind, count, spec: UNIT_SPECS[kind] }));
  }, [game.units]);
  const forwardCommand = game.structures.find((structure) => structure.id === "hq" && structure.team === "player");
  const commandIntegrity = forwardCommand ? Math.max(0, Math.ceil((forwardCommand.hp / forwardCommand.maxHp) * 100)) : 0;
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
  const buildNetwork = buildNetworkSources(game);
  const hasWraith = selectedUnits.some((unit) => unit.kind === "wraith");
  const hasSpecter = selectedUnits.some((unit) => unit.kind === "specter");
  const hasViper = selectedUnits.some((unit) => unit.kind === "viper");
  const hasLancer = selectedUnits.some((unit) => unit.kind === "lancer");
  const hasMedic = selectedUnits.some((unit) => unit.kind === "medic");
  const selectedCohortCount = new Set(selectedUnits.map((unit) => cohortForUnit(unit.kind))).size;
  const selectedRankProgress = selectedPrimary ? rankProgress(selectedPrimary.xp) : null;
  const operationPhaseReadiness = OPERATION_PHASES.map((phase) => ({
    ...phase,
    assets: operationPhaseAssets(phase.key, game.units) as Unit[],
  }));
  const uplinkLocked = relaysOnline > 0 || radarOnline || ownedNodes < 2 || game.units.some((unit) => unit.team === "enemy" && unit.boss);
  const activeOperation = operationNameFor(game.theaterId, game.operationStage);
  const activeOperationRole = campaignOperationRole(game.operationStage, activeOperations.length);
  const activeMission = operationDoctrine({
    operation: activeOperations[game.operationStage],
    operationStage: game.operationStage,
    operationCount: activeOperations.length,
    finalTargetClass: activeTheater.finalTargetClass,
  });
  const nextRaidContacts = raidContactCount(game.difficulty, game.raidWave + 1);
  const currentRaidWindow = game.raidWave === 0
    ? Math.round(difficultyTuning.firstRaid * activeRules.raidPace)
    : raidIntervalFor(game.difficulty, game.raidWave + 1, game.theaterId) * activeMission.raidPace;
  const nextRaidDoctrine = raidDoctrineFor(game.theaterId, game.raidWave + 1) as RaidDoctrine;
  const alarmSource = game.units.find((unit) => unit.id === game.alarmSourceId && unit.team === "enemy");
  const selectedTerrain = selectedPrimary ? terrainEffectAt(game.theaterId, selectedPrimary).zone : null;
  const cachesRecovered = game.caches.filter((cache) => cache.collected).length;
  const boss = game.units.find((unit) => unit.boss && unit.team === "enemy");
  const selectedRepair = selectedStructure?.kind === "repairBay"
    ? repairZoneStats(selectedStructure.level, game.campaignDoctrine.includes("preservationDoctrine"))
    : null;
  const selectedStructureEffect = selectedStructure?.kind === "repairBay" && selectedRepair
    ? `${selectedRepair.radius}M ZONE · +${(selectedRepair.structureRate * activeMission.sustainRate).toFixed(1)} STRUCTURE HP/S · +${(selectedRepair.vehicleRate * activeMission.sustainRate).toFixed(1)} VEHICLE HP/S`
    : selectedStructure?.kind === "gate"
      ? power.online ? "IFF PASSAGE · FRIENDLIES PASS · HOSTILES MUST ROUTE OR BREACH" : "LOW POWER · GATE FAIL-CLOSED FOR ALL MOVEMENT"
      : selectedStructure?.kind === "wall"
        ? "HARD BARRIER · BLOCKS MOVEMENT · FORCES PATHING OR BREACH"
        : selectedStructure?.kind === "hospital"
          ? `${10 + selectedStructure.level * 2}M TRAUMA ZONE · PERSONNEL HEALING / MORALE RECOVERY`
          : selectedStructure?.kind === "generator"
            ? `+${10 + (selectedStructure.level - 1) * (selectedStructure.level === 3 ? 6 : 4)} GRID POWER`
            : selectedStructure?.kind === "supplyDepot"
              ? `MULE DROP-OFF · +${8 + (selectedStructure.level - 1) * (selectedStructure.level === 3 ? 6 : 4)} SUPPLY · EXTENDS BUILD NETWORK`
              : selectedStructure ? "SELECTED FACILITY · REVIEW UPGRADE AND MAINTENANCE OPTIONS" : "";
  const buildPreviewStatus = game.buildMode && buildPreview
    ? buildPlacementStatus(game, game.buildMode, buildPreview)
    : null;
  const buildPreviewConnections = game.buildMode && buildPreviewStatus?.valid
    ? structureConnections(
        makeStructure("__preview__", "player", game.buildMode, buildPreviewStatus.point.x, buildPreviewStatus.point.y, 1),
        game.structures,
      )
    : [];
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

  const guideStep = (() : GuideStep => {
    const sentryOnline = game.structures.some(
      (structure) => structure.team === "player" && structure.kind === "sentry" && !structure.disabled,
    );
    const sentryQueued = game.structureQueue?.key === "sentry";
    if (commandIntegrity <= 45) {
      const recoverySpent = game.emergencyRecoveryStages.includes(game.operationStage) || game.difficulty === "hardline";
      return {
        step: recoverySpent ? "COMMAND CRITICAL" : "COMMAND WARNING",
        title: `Forward Command at ${commandIntegrity}%`,
        instruction: `Open BASE, tap Forward Command, and repair it now. ${recoverySpent ? "No emergency recovery remains for this operation." : "An emergency recovery is still available, but it only triggers once this operation."}`,
        payoff: "Forward Command destruction is the only base-loss defeat condition.",
        action: "base",
        actionLabel: "OPEN BASE REPAIR",
        targetId: "hq",
      };
    }
    if (game.alarmProgress > 0 && game.alarmProgress < 100) {
      return {
        step: "ALARM WINDOW",
        title: `Interrupt transmission · ${Math.ceil(game.alarmProgress)}%`,
        instruction: alarmSource && visibleEnemyIds.has(alarmSource.id)
          ? `The ${UNIT_SPECS[alarmSource.kind].name} is calling the response network. Break sight, sedate or eliminate the caller, or use Chaff before the meter reaches 100.`
          : "A hostile caller is transmitting from the last-known area. Break sight and jam the network; recon can expose the caller for a precision interruption.",
        payoff: "Stopping the report prevents a full theater alert and QRF deployment.",
        action: alarmSource && visibleEnemyIds.has(alarmSource.id) ? "wraith" : "ops",
        actionLabel: alarmSource && visibleEnemyIds.has(alarmSource.id) ? "SELECT STEALTH WRAITH" : "OPEN TACTICAL TOOLS",
        targetId: alarmSource && visibleEnemyIds.has(alarmSource.id) ? alarmSource.id : undefined,
      };
    }
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
        payoff: `${Math.ceil(game.raidTimer)}s until raid ${game.raidWave + 1}. Defense contract pays ${Math.round((difficultyTuning.raidBounty + (game.raidWave + 1) * 40) * activeMission.defenseContract)} GMP when cleared.`,
        action: "base",
        actionLabel: "OPEN BASE",
        buildKey: "sentry",
      };
    }
    if (game.operationStage === 1 && ownedNodes < 2) {
      return {
        step: "GHOST LINE // 1 OF 2",
        title: "Expand the income line",
        instruction: "Recall Alpha, then tap SUPPLY 02. Use Attack-move from OPS if the patrol blocks the route; use stealth for a quieter capture.",
        payoff: `+${difficultyTuning.nodeBonus} GMP and +7 GMP/s. Nearby Field Cache B holds 260 GMP.`,
        action: "alpha",
        actionLabel: "SELECT ALPHA",
        targetId: "node-b",
      };
    }
    if (game.operationStage === 1 && radarOnline) {
      return {
        step: "GHOST LINE // 2 OF 2",
        title: "Blind the detection grid",
        instruction: "Select Wraith alone, keep STEALTH posture, then tap the RD radar. Wraith will hack it automatically instead of opening fire.",
        payoff: "+180 GMP and no more wide-area radar sweeps.",
        action: "wraith",
        actionLabel: "SELECT STEALTH WRAITH",
        targetId: "enemy-radar",
      };
    }
    if (game.operationStage === 2 && ownedNodes < 3) {
      return {
        step: "BLACK RELAY // 1 OF 2",
        title: "Take the intelligence corridor",
        instruction: "Secure INTEL 03 to extend income and create a forward resupply line. Use a mixed squad: recon reveals the heavy patrol while assault holds the ring.",
        payoff: `+${difficultyTuning.nodeBonus} GMP, +8 GMP/s, and Field Cache C on the approach.`,
        action: "alpha",
        actionLabel: "SELECT ALPHA",
        targetId: "node-c",
      };
    }
    if (relaysOnline > 0) {
      return {
        step: "BLACK RELAY // 2 OF 2",
        title: `Sever ${relaysOnline} security relay${relaysOnline === 1 ? "" : "s"}`,
        instruction: "Hack each LK relay with Wraith for a quiet payout, or recall Alpha and assault it. Chaff disables hostile turrets during the approach.",
        payoff: "+180 GMP per hack; removing both unlocks the command uplink.",
        action: "wraith",
        actionLabel: "SELECT STEALTH WRAITH",
        targetId: game.structures.find((structure) => structure.kind === "enemyRelay" && !structure.disabled)?.id,
      };
    }
    if (game.operationStage === 3 && game.operationStage < finalOperationStage) {
      const nodeHeld = game.nodes.some((node) => node.id === "node-d" && node.owner === "player");
      const commandOnline = game.structures.some((structure) => structure.id === "enemy-stage-command" && !structure.disabled);
      return {
        step: `${activeOperation} // FIELD COMMAND`,
        title: nodeHeld ? "Break the field command" : "Secure COMMAND 04",
        instruction: nodeHeld ? "The perimeter node is yours. Disable the compact command post to open the final operation." : "Advance behind recon, take COMMAND 04, and protect the exposed supply line before striking the theater leader.",
        payoff: commandOnline ? "Opens the final sector while preserving the whole theater state." : "Final sector opening.",
        action: "alpha",
        actionLabel: "SELECT ALPHA",
        targetId: nodeHeld ? "enemy-stage-command" : "node-d",
      };
    }
    if (game.operationStage === finalOperationStage && boss) {
      return {
        step: `${activeOperation} // FINAL THREAT`,
        title: `Break ${activeFinalTarget} · ${Math.ceil((boss.hp / boss.maxHp) * 100)}%`,
        instruction: boss.bossClass === "metal-gear" ? "The Metal Gear-class walker resists small arms. Screen Lancers with Vipers, keep Lifeline behind the assault, and cut its support grid." : boss.bossClass === "vehicle" ? "This is a compact armored command vehicle, not a giant walker. Pin its escort, flank with anti-armor, and preserve a recovery route." : "The enemy commander fights as an elite field unit, not a skyscraper. Isolate the guard, suppress the position, and choose lethal or precision force deliberately.",
        payoff: `Removing ${activeFinalTarget} opens theater command and pays a 900 GMP bounty.`,
        action: "ops",
        actionLabel: "OPEN SQUAD COMMAND",
        targetId: boss.id,
      };
    }
    if (uplinkOnline) {
      return {
        step: "CROWN FALL // FINAL",
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
  })();

  const fundingLabel = (cost: number) => {
    if (game.resources >= cost) return `${cost} GMP`;
    const seconds = Math.ceil((cost - game.resources) / Math.max(0.1, economy.income));
    return `${cost} GMP · FUNDED IN ${seconds}s`;
  };

  const selectedLabel = game.activeSquad && selectedUnits.length
    ? `${game.activeSquad.toUpperCase()} · ${cohortFilter === "all" ? "FULL GROUP" : `${cohortFilter.toUpperCase()} ELEMENT`}`
    : selectedUnits.length > 1
    ? `${selectedUnits.length} UNITS SELECTED`
    : selectedPrimary
      ? `${UNIT_SPECS[selectedPrimary.kind].name.toUpperCase()} · ${["REG", "VET", "ELT", "LGD"][selectedPrimary.rank]}`
      : selectedStructure
        ? STRUCTURE_LABELS[selectedStructure.kind].name.toUpperCase()
        : selectedNode
          ? `${selectedNode.name.toUpperCase()} · FORWARD OUTPOST`
        : "NO UNIT SELECTED";

  const targetPromptText = game.buildMode
    ? `PLACE ${BUILD_SPECS[game.buildMode].name.toUpperCase()} · ${BUILD_SPECS[game.buildMode].footprint[0]}×${BUILD_SPECS[game.buildMode].footprint[1]} GRID · SNAP ACTIVE`
    : game.abilityMode === "tranq"
      ? "TAP HOSTILE PERSONNEL"
      : game.abilityMode === "attackMove"
        ? "TAP DESTINATION · ENGAGE EN ROUTE"
      : game.abilityMode === "patrol"
        ? "TAP PATROL TURNAROUND POINT"
        : game.abilityMode === "focus"
          ? "TAP ONE HOSTILE · ALL SELECTED UNITS CONCENTRATE FIRE"
          : game.abilityMode === "guard"
            ? "TAP DEFENSE ANCHOR · ENGAGE CONTACTS WITHIN 12M"
          : game.abilityMode === "breach"
            ? "TAP OBJECTIVE · INFIL 0s · ASSAULT +4s · SUPPORT +7s"
            : game.abilityMode === "recon"
              ? "RECON PHASE · TAP ROUTE OR OBSERVATION AREA"
              : game.abilityMode === "infiltrate"
                ? "INFILTRATION PHASE · TAP ROUTE OR HOSTILE SYSTEM TO HACK"
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

  const gameWithDoctrine = (phase: Phase, difficulty: Difficulty, theaterId: TheaterId = game.theaterId) => {
    const next = initialGame(phase, difficulty, theaterId);
    next.campaignDoctrine = [...progress.unlockedDoctrine];
    if (progress.unlockedDoctrine.includes("fieldLogistics")) next.resources += 300;
    if (progress.unlockedDoctrine.includes("veteranCadre")) {
      next.units = next.units.map((unit) => unit.team === "player" ? { ...unit, rank: 1 as const, xp: 20 } : unit);
    }
    if (progress.unlockedDoctrine.includes("expeditionaryHub")) {
      next.resources += 600;
      next.structures.push(makeStructure("doctrine-supply-depot", "player", "supplyDepot", 27, 88, BUILD_SPECS.supplyDepot.hp));
      next.logs = addLog(next.logs, "EXPEDITIONARY HUB // Forward stores deployed");
    }
    if (progress.unlockedDoctrine.includes("phantomCommand")) {
      next.jamTimer = 45;
      next.radarTimer += 45;
      next.logs = addLog(next.logs, "PHANTOM COMMAND // Theater acquisition delayed 45s");
    }
    if (progress.unlockedDoctrine.includes("armoredCadre")) {
      next.units.push(
        makeUnit("doctrine-lancer", "player", "lancer", 22, 73, { rank: 1, xp: 20 }),
        makeUnit("doctrine-weasel", "player", "weasel", 26, 77, { rank: 1, xp: 20 }),
      );
      next.logs = addLog(next.logs, "ARMORED CADRE // Veteran counter-force attached");
    }
    if (progress.unlockedDoctrine.includes("casualtyProtocol")) {
      next.researched = [...new Set([...next.researched, "fieldMedicine" as TechKey])];
      next.units.push(
        makeUnit("doctrine-medic", "player", "medic", 15, 72, { rank: 1, xp: 20 }),
        makeUnit("doctrine-engineer", "player", "engineer", 12, 76, { rank: 1, xp: 20 }),
      );
      next.logs = addLog(next.logs, "CASUALTY PROTOCOL // Medical-recovery team attached");
    }
    return next;
  };

  const restart = (phase: Phase = "playing") => {
    playTone(420, 0.08);
    if (phase === "playing") {
      window.localStorage.removeItem("command-rex-checkpoint");
      savedCheckpointStageRef.current = -1;
    }
    setHelpOpen(false);
    setDeckTab("ops");
    setCohortFilter("all");
    setCoachExpanded(!isCompactLayout && settings.showCoach && game.difficulty === "guided");
    setMultiSelect(false);
    setSelectedDifficulty(game.difficulty);
    setGame(gameWithDoctrine(phase, game.difficulty, game.theaterId));
  };

  const deploy = () => {
    playTone(610, 0.12);
    setGame(gameWithDoctrine("briefing", selectedDifficulty, selectedTheaterId));
    setCoachExpanded(!isCompactLayout && settings.showCoach && selectedDifficulty === "guided");
    setMultiSelect(false);
    setCohortFilter("all");
  };

  const advanceToNextTheater = () => {
    const nextId = nextTheaterId(game.theaterId) as TheaterId | null;
    if (!nextId) {
      restart("menu");
      setMenuView("campaign");
      return;
    }
    window.localStorage.removeItem("command-rex-checkpoint");
    window.localStorage.removeItem("command-rex-save");
    savedCheckpointStageRef.current = -1;
    setProgress((current) => {
      if (current.completedTheaterIds.includes(game.theaterId)) return current;
      const completedTheaterIds = [...current.completedTheaterIds, game.theaterId];
      return { ...current, completedTheaterIds, completedTheaters: completedTheaterIds.length, updatedAt: Date.now() };
    });
    setSelectedTheaterId(nextId);
    setGame(gameWithDoctrine("briefing", game.difficulty, nextId));
    setDeckTab("ops");
    setCohortFilter("all");
    setMultiSelect(false);
  };

  const beginOperation = () => {
    playTone(760, 0.12, "sine");
    window.localStorage.removeItem("command-rex-checkpoint");
    savedCheckpointStageRef.current = -1;
    setGame(gameWithDoctrine("playing", game.difficulty, game.theaterId));
    setCoachExpanded(!isCompactLayout && settings.showCoach && game.difficulty === "guided");
    setProgress((current) => ({ ...current, deployments: current.deployments + 1, updatedAt: Date.now() }));
  };

  const continueSavedGame = () => {
    try {
      const raw = window.localStorage.getItem("command-rex-save");
      if (!raw) return;
      const saved = JSON.parse(raw) as GameState;
      if (!Array.isArray(saved.units) || !Array.isArray(saved.structures) || !Array.isArray(saved.nodes)) throw new Error("invalid save");
      if (!Array.isArray(saved.caches)) saved.caches = [];
      saved.theaterId = saved.theaterId ?? DEFAULT_THEATER_ID;
      saved.formation = saved.formation ?? "wedge";
      saved.queueMode = saved.queueMode ?? false;
      saved.units = saved.units.map((unit) => ({
        ...unit,
        x: clamp(unit.x, 2, 98),
        y: clamp(unit.y, 3, 97),
        morale: Number.isFinite(unit.morale) ? unit.morale : 100,
        orderQueue: Array.isArray(unit.orderQueue) ? unit.orderQueue : [],
      }));
      saved.alarmProgress = Number.isFinite(saved.alarmProgress) ? saved.alarmProgress : 0;
      saved.alarmSourceId = saved.units.some((unit) => unit.id === saved.alarmSourceId) ? saved.alarmSourceId : undefined;
      saved.campaignDoctrine = Array.isArray(saved.campaignDoctrine) ? saved.campaignDoctrine : [...progress.unlockedDoctrine];
      saved.emergencyRecoveryStages = Array.isArray(saved.emergencyRecoveryStages) ? saved.emergencyRecoveryStages : [];
      saved.structures = saved.structures.map((structure) => ({
        ...structure,
        ...snapGridPoint(structure, structureFootprint(structure.kind)),
        level: structure.level ?? 1,
        upgradeRemaining: structure.upgradeRemaining ?? 0,
        upgradeTotal: structure.upgradeTotal ?? 0,
      }));
      saved.nodes = saved.nodes.map((node) => ({ ...node, ...snapGridPoint(node) }));
      saved.caches = saved.caches.map((cache) => ({ ...cache, ...snapGridPoint(cache) }));
      setSelectedDifficulty(saved.difficulty ?? "guided");
      setGame({ ...saved, phase: "playing", paused: true, effects: [], transmission: undefined });
      setDeckCollapsed(isCompactLayout);
      setMenuView("command");
      playTone(680, 0.1, "sine");
    } catch {
      window.localStorage.removeItem("command-rex-save");
      setHasSave(false);
    }
  };

  const retryLastOperation = () => {
    try {
      const raw = window.localStorage.getItem("command-rex-checkpoint");
      if (!raw) {
        restart("playing");
        return;
      }
      const saved = JSON.parse(raw) as GameState;
      if (!Array.isArray(saved.units) || !saved.structures.some((structure) => structure.id === "hq")) {
        throw new Error("invalid checkpoint");
      }
      savedCheckpointStageRef.current = saved.operationStage;
      saved.theaterId = saved.theaterId ?? DEFAULT_THEATER_ID;
      saved.formation = saved.formation ?? "wedge";
      saved.queueMode = saved.queueMode ?? false;
      saved.units = saved.units.map((unit) => ({ ...unit, morale: Number.isFinite(unit.morale) ? unit.morale : 100, orderQueue: Array.isArray(unit.orderQueue) ? unit.orderQueue : [] }));
      saved.alarmProgress = Number.isFinite(saved.alarmProgress) ? saved.alarmProgress : 0;
      saved.alarmSourceId = saved.units.some((unit) => unit.id === saved.alarmSourceId) ? saved.alarmSourceId : undefined;
      saved.campaignDoctrine = Array.isArray(saved.campaignDoctrine) ? saved.campaignDoctrine : [...progress.unlockedDoctrine];
      saved.emergencyRecoveryStages = Array.isArray(saved.emergencyRecoveryStages) ? saved.emergencyRecoveryStages : [];
      saved.structures = saved.structures.map((structure) => ({ ...structure, level: structure.level ?? 1, upgradeRemaining: structure.upgradeRemaining ?? 0, upgradeTotal: structure.upgradeTotal ?? 0 }));
      setSelectedDifficulty(saved.difficulty);
      setDeckTab("ops");
      setDeckCollapsed(isCompactLayout);
      setGame({ ...saved, phase: "playing", paused: true, defeatReason: undefined, effects: [] });
      playTone(310, 0.18, "sine");
    } catch {
      window.localStorage.removeItem("command-rex-checkpoint");
      restart("playing");
    }
  };

  const saveAndReturnToMenu = () => {
    const current = gameRef.current;
    if (current.phase === "playing") {
      const save = { ...current, phase: "playing" as const, paused: true, effects: [], transmission: undefined };
      window.localStorage.setItem("command-rex-save", JSON.stringify(save));
      setHasSave(true);
      if (account.status === "signed-in") {
        void fetch("/api/player", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profile: progressRef.current, settings: settingsRef.current, save }),
        });
      }
    }
    setMenuView("command");
    setGame((state) => ({ ...state, phase: "menu", paused: true }));
  };

  const unlockDoctrine = (key: DoctrineKey) => {
    setProgress((current) => {
      const spec = DOCTRINE_SPECS[key];
      if (current.doctrinePoints < spec.cost || current.unlockedDoctrine.includes(key)) return current;
      if (spec.requires && !current.unlockedDoctrine.includes(spec.requires)) return current;
      return {
        ...current,
        doctrinePoints: current.doctrinePoints - spec.cost,
        unlockedDoctrine: [...current.unlockedDoctrine, key],
        updatedAt: Date.now(),
      };
    });
    playTone(820, 0.12, "sine");
  };

  const continueOperation = (choice: RewardChoice) => {
    playTone(choice === "intel" ? 880 : choice === "reinforce" ? 650 : 520, 0.16, "sine");
    setProgress((current) => {
      const gainedXp = 150;
      const nextXp = current.commanderXp + gainedXp;
      const earnedPoints = Math.floor(nextXp / 500) - Math.floor(current.commanderXp / 500);
      return {
        ...current,
        commanderXp: nextXp,
        doctrinePoints: current.doctrinePoints + earnedPoints,
        operationsCompleted: current.operationsCompleted + 1,
        updatedAt: Date.now(),
      };
    });
    setGame((current) => {
      if (!current.checkpoint) return current;
      const rewardUnit: TrainKey = current.operationStage >= 3 ? "lancer" : current.operationStage === 2 ? "medic" : "viper";
      const hq = current.structures.find((structure) => structure.id === "hq");
      const reinforced = choice === "reinforce" && hq
        ? [
            ...current.units,
            makeUnit(`${rewardUnit}-${current.nextId}`, "player", rewardUnit, hq.x + 6, hq.y - 4),
          ]
        : current.units;
      const revealed = choice === "intel"
        ? reinforced.map((unit) => unit.team === "enemy" ? { ...unit, revealed: Math.max(unit.revealed, 75) } : unit)
        : reinforced;
      const rewardText = choice === "logistics"
        ? "+700 GMP black budget routed"
        : choice === "reinforce"
          ? `${UNIT_SPECS[rewardUnit].name} unit airlifted to the FOB`
          : "Hostile contacts revealed and security pressure reduced";
      return {
        ...current,
        paused: false,
        checkpoint: undefined,
        resources: current.resources + (choice === "logistics" ? 700 : 0),
        alert: choice === "intel" ? Math.min(current.alert, 8) : current.alert,
        alertHold: choice === "intel" ? 0 : current.alertHold,
        units: revealed,
        nextId: current.nextId + (choice === "reinforce" ? 1 : 0),
        logs: addLog(current.logs, `${current.checkpoint.operation} // ${rewardText}`),
        transmission: {
          speaker: "SHADOW SNAKE // COMMAND",
          text: `We keep the base. We keep the people. Open ${operationNameFor(current.theaterId, current.operationStage)}.`,
          ttl: 7,
        },
      };
    });
  };

  const selectUnit = (id: string, additive = false) => {
    playTone(540, 0.04);
    setSelectedNodeId(null);
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
    setSelectedNodeId(null);
    setGame((current) => ({
      ...current,
      selectedIds: current.units.filter((unit) => unit.team === "player").map((unit) => unit.id),
      activeSquad: null,
      selectedStructureId: undefined,
      abilityMode: null,
      buildMode: null,
    }));
  }, [playTone]);

  const selectUnitType = useCallback((requestedKind?: UnitKind) => {
    playTone(625, 0.055, "sine");
    setSelectedNodeId(null);
    setGame((current) => {
      const selectedKind = requestedKind ?? current.units.find(
        (unit) => unit.team === "player" && current.selectedIds.includes(unit.id),
      )?.kind;
      if (!selectedKind) {
        return { ...current, logs: addLog(current.logs, "Select one unit, then use TYPE to recall every matching unit") };
      }
      const matching = current.units
        .filter((unit) => unit.team === "player" && unit.kind === selectedKind)
        .map((unit) => unit.id);
      if (!matching.length) return current;
      return {
        ...current,
        selectedIds: matching,
        activeSquad: null,
        selectedStructureId: undefined,
        abilityMode: null,
        buildMode: null,
        logs: addLog(current.logs, `${UNIT_SPECS[selectedKind].name.toUpperCase()} TYPE SELECT // ${matching.length} unit${matching.length === 1 ? "" : "s"}`),
      };
    });
    setCohortFilter("all");
  }, [playTone]);

  const cycleUnit = useCallback(() => {
    playTone(675, 0.045, "sine");
    setSelectedNodeId(null);
    setGame((current) => {
      const friendlies = current.units.filter((unit) => unit.team === "player" && unit.kind !== "mule");
      if (!friendlies.length) return current;
      const currentIndex = friendlies.findIndex((unit) => current.selectedIds[0] === unit.id);
      const next = friendlies[(currentIndex + 1 + friendlies.length) % friendlies.length];
      return {
        ...current,
        selectedIds: [next.id],
        activeSquad: null,
        selectedStructureId: undefined,
        abilityMode: null,
        buildMode: null,
        logs: addLog(current.logs, `NEXT UNIT // ${UNIT_SPECS[next.kind].name.toUpperCase()} selected`),
      };
    });
    setCohortFilter("all");
  }, [playTone]);

  const centerSelection = () => {
    const focus = selectedPrimary ?? selectedStructure ?? selectedNode ?? forwardCommand;
    const viewport = viewportRef.current;
    if (!focus || !viewport) return;
    viewport.scrollTo({
      left: clamp((focus.x / 100) * viewport.scrollWidth - viewport.clientWidth / 2, 0, viewport.scrollWidth - viewport.clientWidth),
      top: clamp((focus.y / 100) * viewport.scrollHeight - viewport.clientHeight / 2, 0, viewport.scrollHeight - viewport.clientHeight),
      behavior: "smooth",
    });
  };

  const openDeckTab = (tab: typeof deckTab) => {
    setDeckTab(tab);
    setDeckCollapsed(false);
  };

  const cycleFormation = () => {
    playTone(610, 0.045, "sine");
    setGame((current) => {
      const formation = nextFormation(current.formation) as Formation;
      return { ...current, formation, logs: addLog(current.logs, `${formation.toUpperCase()} formation selected`) };
    });
  };

  const toggleQueueMode = () => {
    playTone(game.queueMode ? 330 : 760, 0.045, "sine");
    setGame((current) => ({
      ...current,
      queueMode: !current.queueMode,
      logs: addLog(current.logs, `ORDER QUEUE ${current.queueMode ? "OFF" : "ON"} // ${current.queueMode ? "new commands replace" : "commands append"}`),
    }));
  };

  const assignSquad = (slot: SquadSlot) => {
    setGame((current) => {
      const assigned = current.selectedIds.filter((id) =>
        current.units.some((unit) => unit.id === id && unit.team === "player"),
      );
      if (!assigned.length) {
        return { ...current, logs: addLog(current.logs, "Select units before assigning a command group") };
      }
      playTone(720, 0.07, "sine");
      return {
        ...current,
        squads: { ...current.squads, [slot]: assigned },
        activeSquad: slot,
        logs: addLog(current.logs, `${slot.toUpperCase()} group set: ${assigned.length} unit${assigned.length === 1 ? "" : "s"}`),
      };
    });
    setCohortFilter("all");
  };

  const selectSquad = useCallback((slot: SquadSlot, cohort: SquadCohort = "all") => {
    setSelectedNodeId(null);
    setGame((current) => {
      const members = current.squads[slot]
        .map((id) => current.units.find((unit) => unit.id === id && unit.team === "player"))
        .filter((unit): unit is Unit => Boolean(unit));
      const selected = members
        .filter((unit) => cohort === "all" || cohortForUnit(unit.kind) === cohort)
        .map((unit) => unit.id);
      if (!selected.length) {
        return { ...current, logs: addLog(current.logs, `${slot.toUpperCase()} has no ${cohort === "all" ? "assigned units" : `${cohort} element`}`) };
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

  const cycleSquad = () => {
    const populated = SQUAD_SLOTS.filter((slot) =>
      game.squads[slot].some((id) => game.units.some((unit) => unit.id === id && unit.team === "player")),
    );
    if (!populated.length) {
      setGame((current) => ({ ...current, logs: addLog(current.logs, "Assign a command group in OPS before cycling groups") }));
      return;
    }
    const currentIndex = game.activeSquad ? populated.indexOf(game.activeSquad) : -1;
    selectSquad(populated[(currentIndex + 1 + populated.length) % populated.length], "all");
  };

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
          ? { ...unit, stance, order: stance === "stealth" ? undefined : unit.order, orderQueue: stance === "stealth" ? [] : unit.orderQueue }
          : unit,
      ),
      logs: addLog(current.logs, `${stance.toUpperCase()} posture assigned to ${current.selectedIds.length} unit${current.selectedIds.length === 1 ? "" : "s"}`),
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
          ? { ...unit, order: undefined, orderQueue: [], patrol: undefined, stance: "hold" }
          : unit,
      ),
      logs: addLog(current.logs, "Selected units holding position"),
    }));
  };

  const fallBack = () => {
    if (!selectedUnits.length) return;
    playTone(390, 0.08, "sine");
    setGame((current) => {
      const fallbackSites: Point[] = [
        ...current.structures.filter((structure) => structure.team === "player" && ["hq", "supplyDepot", "hospital", "repairBay"].includes(structure.kind)),
        ...current.nodes.filter((node) => node.owner === "player"),
      ];
      if (!fallbackSites.length) return current;
      let index = 0;
      return {
        ...current,
        abilityMode: null,
        units: current.units.map((unit) => {
          if (!current.selectedIds.includes(unit.id)) return unit;
          const slot = index++;
          const fallback = [...fallbackSites].sort((first, second) => distance(unit, first) - distance(unit, second))[0];
          return {
            ...unit,
            stance: "hold",
            patrol: undefined,
            orderQueue: [],
            order: {
              kind: "move" as const,
              x: clamp(fallback.x + 4 + (slot % 3) * 1.5, 2, 98),
              y: clamp(fallback.y - 4 + Math.floor(slot / 3) * 1.5, 3, 97),
            },
          };
        }),
        logs: addLog(current.logs, "Fallback order: nearest secure command, logistics, or recovery outpost"),
      };
    });
  };

  const selectStructure = (id: string) => {
    playTone(440, 0.04, "sine");
    setSelectedNodeId(null);
    setGame((current) => ({
      ...current,
      selectedIds: [],
      activeSquad: null,
      selectedStructureId: id,
      abilityMode: null,
      buildMode: null,
    }));
  };

  const selectControlNode = (id: string) => {
    const node = game.nodes.find((candidate) => candidate.id === id && candidate.owner === "player");
    if (!node) return;
    playTone(585, 0.055, "sine");
    setSelectedNodeId(id);
    setGame((current) => ({
      ...current,
      selectedIds: [],
      activeSquad: null,
      selectedStructureId: undefined,
      abilityMode: null,
      buildMode: null,
      logs: addLog(current.logs, `${node.name} forward construction grid selected`),
    }));
  };

  const openSelectedStructureSystem = () => {
    if (!selectedStructure) return;
    if (selectedStructure.kind === "barracks" || selectedStructure.kind === "vehicleBay") {
      openDeckTab("forces");
      return;
    }
    if (selectedStructure.kind === "rdLab" || selectedStructure.kind === "comms") {
      openDeckTab("research");
      return;
    }
    openDeckTab("base");
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

  const upgradeSelectedStructure = () => {
    setGame((current) => {
      const target = current.structures.find(
        (structure) => structure.id === current.selectedStructureId && structure.team === "player",
      );
      if (!target || target.level >= 3 || target.upgradeRemaining > 0) return current;
      const cost = structureUpgradeCost(target);
      if (current.resources < cost) {
        return { ...current, logs: addLog(current.logs, `${STRUCTURE_LABELS[target.kind].name} upgrade requires ${cost} GMP`) };
      }
      const duration = structureUpgradeTime(target);
      playTone(740, 0.1, "sine");
      return {
        ...current,
        resources: current.resources - cost,
        structures: current.structures.map((structure) =>
          structure.id === target.id
            ? { ...structure, upgradeRemaining: duration, upgradeTotal: duration }
            : structure,
        ),
        logs: addLog(current.logs, `${STRUCTURE_LABELS[target.kind].name} level ${target.level + 1} upgrade started`),
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
      const locked = buildLockReason(current, key);
      if (locked) return { ...current, logs: addLog(current.logs, locked) };
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
    if (isCompactLayout && game.structureQueue?.ready && game.structureQueue.key === key) {
      setDeckCollapsed(true);
    }
  };

  const queueForwardStructure = (key: BuildKey) => {
    const category = BUILD_CATEGORIES.find((candidate) => candidate.keys.includes(key));
    if (category) setBuildCategory(category.key);
    setInspectedBuild(key);
    queueStructure(key);
    setSelectedNodeId(null);
  };

  const rallyAtSelectedNode = () => {
    if (!selectedNode) return;
    playTone(620, 0.07, "sine");
    setGame((current) => ({
      ...current,
      rallyPoint: { x: selectedNode.x, y: selectedNode.y },
      logs: addLog(current.logs, `${selectedNode.name} set as the forward deployment rally`),
    }));
  };

  const queueUnit = (key: TrainKey) => {
    const spec = UNIT_SPECS[key];
    setGame((current) => {
      const currentSupply = supplyStats(current.units, current.structures, current.staff);
      const queuedSupply = current.unitQueue.reduce(
        (total, item) => total + UNIT_SPECS[item.key].supply,
        0,
      );
      const channelCount = current.unitQueue.filter((item) => UNIT_SPECS[item.key].channel === spec.channel).length;
      if (channelCount >= 4) {
        return { ...current, logs: addLog(current.logs, `${spec.channel === "infantry" ? "Barracks" : "Vehicle"} deployment queue is full`) };
      }
      if (currentSupply.used + queuedSupply + spec.supply > currentSupply.cap) {
        return { ...current, logs: addLog(current.logs, "Supply cap reached. Build or upgrade a Barracks or Supply Depot.") };
      }
      const locked = unitLockReason(current, key);
      if (locked) return { ...current, logs: addLog(current.logs, locked) };
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
      const requiresSquad = mode === "attackMove" || mode === "patrol" || mode === "breach" || mode === "focus" || mode === "guard";
      const selected = current.units.filter((unit) => current.selectedIds.includes(unit.id));
      if (requiresWraith && !selected.some((unit) => unit.kind === "wraith")) {
        return { ...current, logs: addLog(current.logs, "Select a Wraith unit") };
      }
      if (requiresSpecter && !selected.some((unit) => unit.kind === "specter")) {
        return { ...current, logs: addLog(current.logs, "Select a Specter drone") };
      }
      if (requiresViper && !selected.some((unit) => unit.kind === "viper")) {
        return { ...current, logs: addLog(current.logs, "Select a Viper unit") };
      }
      if (requiresLancer && !selected.some((unit) => unit.kind === "lancer")) {
        return { ...current, logs: addLog(current.logs, "Select a Lancer unit") };
      }
      if (requiresMedic && !selected.some((unit) => unit.kind === "medic")) {
        return { ...current, logs: addLog(current.logs, "Select a Lifeline medic") };
      }
      if (requiresSquad && !selected.length) {
        return { ...current, logs: addLog(current.logs, "Select at least one unit") };
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
    if (isCompactLayout) setDeckCollapsed(true);
  };

  const launchOperationPhase = (phaseKey: OperationPlanPhase) => {
    const phase = OPERATION_PHASES.find((candidate) => candidate.key === phaseKey);
    if (!phase) return;
    setSelectedNodeId(null);
    setGame((current) => {
      const assets = operationPhaseAssets(phaseKey, current.units) as Unit[];
      if (!assets.length) {
        return { ...current, logs: addLog(current.logs, `${phase.label} phase has no available role-matched assets`) };
      }
      const selectedIds = assets.map((unit) => unit.id);
      const abilityMode: AbilityMode = phaseKey === "assault" ? "attackMove" : phaseKey;
      playTone(phaseKey === "recon" ? 760 : phaseKey === "infiltrate" ? 470 : 260, 0.075, "sine");
      return {
        ...current,
        selectedIds,
        activeSquad: null,
        selectedStructureId: undefined,
        buildMode: null,
        abilityMode,
        units: current.units.map((unit) => selectedIds.includes(unit.id)
          ? { ...unit, stance: phase.stance as Stance, patrol: undefined }
          : unit),
        logs: addLog(current.logs, `${phase.label} PHASE READY // ${assets.map((unit) => UNIT_SPECS[unit.kind].code).join(" · ")} // tap the field target`),
      };
    });
    if (isCompactLayout) setDeckCollapsed(true);
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
        cooldowns: { ...current.cooldowns, chaff: veterancyCooldown(26, Math.max(...selected.filter((unit) => unit.kind === "specter").map((unit) => unit.rank))) },
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

  const issueTargetOrder = (targetId: string, queueOverride = false) => {
    setGame((current) => {
      const selected = current.units.filter(
        (unit) => current.selectedIds.includes(unit.id) && unit.team === "player",
      );
      if (!selected.length) {
        return { ...current, logs: addLog(current.logs, "Select a unit first") };
      }
      const enemyUnit = current.units.find((unit) => unit.id === targetId && unit.team === "enemy");
      const enemyStructure = current.structures.find(
        (structure) => structure.id === targetId && structure.team === "enemy",
      );
      if (current.abilityMode === "tranq") {
        const wraith = selected.find((unit) => unit.kind === "wraith");
        if (!wraith || !enemyUnit || enemyUnit.kind === "scout" || enemyUnit.boss) {
          return { ...current, logs: addLog(current.logs, "Tranquilizer requires hostile personnel") };
        }
        return {
          ...current,
          abilityMode: null,
          cooldowns: { ...current.cooldowns, tranq: veterancyCooldown(8, wraith.rank) },
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
      const focused = current.abilityMode === "focus";
      const queue = current.queueMode || queueOverride;
      return {
        ...current,
        abilityMode: null,
        buildMode: null,
        selectedStructureId: undefined,
        units: current.units.map((unit) => {
          if (!current.selectedIds.includes(unit.id)) return unit;
          if (!focused && enemyStructure && (unit.kind === "wraith" || unit.kind === "hacker") && unit.stance === "stealth") {
            return plannedOrder({
              ...unit,
              patrol: undefined,
            }, {
                kind: "hack" as const,
                targetId,
                x: enemyStructure.x,
                y: enemyStructure.y,
              }, queue);
          }
          const target = enemyUnit ?? enemyStructure;
          if (!target) return unit;
          return plannedOrder({
            ...unit,
            patrol: undefined,
            stance: unit.stance === "stealth" && unit.kind !== "wraith" && unit.kind !== "hacker" ? "assault" : unit.stance,
          }, { kind: "attack" as const, targetId, x: target.x, y: target.y }, queue);
        }),
        logs: focused ? addLog(current.logs, `FOCUS FIRE // ${selected.length} units concentrating on one target`) : current.logs,
      };
    });
  };

  const issueCaptureOrder = (nodeId: string, queueOverride = false) => {
    setSelectedNodeId(null);
    setGame((current) => {
      const node = current.nodes.find((candidate) => candidate.id === nodeId);
      if (!node || !current.selectedIds.length) return current;
      playTone(410, 0.05, "sine");
      let selectedIndex = 0;
      return {
        ...current,
        abilityMode: null,
        buildMode: null,
        selectedStructureId: undefined,
        units: current.units.map((unit) => {
          if (!current.selectedIds.includes(unit.id)) return unit;
          const destination = formationDestination(node, current.formation, selectedIndex++, current.selectedIds.length);
          return plannedOrder({ ...unit, patrol: undefined }, { kind: "capture", targetId: nodeId, ...destination }, current.queueMode || queueOverride);
        }),
        logs: addLog(current.logs, `Capture order: ${node.name}`),
      };
    });
  };

  const issueCacheOrder = (cacheId: string, queueOverride = false) => {
    setGame((current) => {
      const cache = current.caches.find(
        (candidate) => candidate.id === cacheId && !candidate.collected,
      );
      if (!cache) return current;
      if (!current.selectedIds.length) {
        return { ...current, logs: addLog(current.logs, "Select a unit to recover the field cache") };
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
          const destination = formationDestination(cache, current.formation, slot, current.selectedIds.length);
          return plannedOrder({
            ...unit,
            patrol: undefined,
          }, { kind: "move", ...destination }, current.queueMode || queueOverride);
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
    if (event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("button, .unitMarker, .structureMarker, .controlNode, .fieldCache")) return;
    if (event.pointerType !== "mouse" && touchMode === "pan") return;
    const point = pointFromEvent(event);
    if (game.buildMode) setBuildPreview(buildPlacementStatus(game, game.buildMode, point).point);
    gestureRef.current = { x: event.clientX, y: event.clientY, point, pointerType: event.pointerType };
  };

  const handleMapPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (game.buildMode) {
      setBuildPreview(buildPlacementStatus(game, game.buildMode, pointFromEvent(event)).point);
      return;
    }
    const start = gestureRef.current;
    if (!start || start.pointerType !== "mouse" || event.buttons !== 1 || game.buildMode || game.abilityMode) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) < 16) return;
    const nextBox = { start: start.point, end: pointFromEvent(event) };
    selectionBoxRef.current = nextBox;
    setSelectionBox(nextBox);
  };

  const handleMapPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = gestureRef.current;
    gestureRef.current = null;
    const completedBox = selectionBoxRef.current;
    selectionBoxRef.current = null;
    if (completedBox) {
      const minX = Math.min(completedBox.start.x, completedBox.end.x);
      const maxX = Math.max(completedBox.start.x, completedBox.end.x);
      const minY = Math.min(completedBox.start.y, completedBox.end.y);
      const maxY = Math.max(completedBox.start.y, completedBox.end.y);
      setGame((current) => {
        const boxed = current.units
          .filter((unit) => unit.team === "player" && unit.x >= minX && unit.x <= maxX && unit.y >= minY && unit.y <= maxY)
          .map((unit) => unit.id);
        if (!boxed.length) return current;
        return { ...current, selectedIds: boxed, activeSquad: null, selectedStructureId: undefined, abilityMode: null, buildMode: null };
      });
      setSelectionBox(null);
      setCohortFilter("all");
      playTone(590, 0.055);
      return;
    }
    if (start?.pointerType !== "mouse" && touchMode === "pan") return;
    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) return;
    const point = pointFromEvent(event);
    const queueOverride = event.shiftKey;
    if (game.buildMode) setBuildPreview(null);

    setGame((current) => {
      if (current.buildMode) {
        const queue = current.structureQueue;
        if (!queue?.ready || queue.key !== current.buildMode) return current;
        const placement = buildPlacementStatus(current, current.buildMode, point);
        if (!placement.valid) {
          return {
            ...current,
            logs: addLog(current.logs, `Invalid site: ${placement.reason.toLowerCase()}`),
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
              placement.point.x,
              placement.point.y,
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
        current.abilityMode === "breach" ||
        current.abilityMode === "guard" ||
        current.abilityMode === "recon" ||
        current.abilityMode === "infiltrate"
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
        playTone(command === "patrol" ? 520 : 600, 0.06, "sine");
        return {
          ...current,
          abilityMode: null,
          selectedStructureId: undefined,
          units: current.units.map((unit) => {
            if (!current.selectedIds.includes(unit.id)) return unit;
            const destination = formationDestination(point, current.formation, selectedIndex++, selectedCount);
            const cohort = cohortForUnit(unit.kind);
            const isBreach = command === "breach";
            const delay = isBreach ? (cohort === "infil" ? 0 : cohort === "assault" ? 4 : 7) : 0;
            const orderKind: OrderKind =
              command === "guard"
                ? "guard"
                : command === "recon" || command === "infiltrate"
                  ? "move"
              : command === "patrol" || command === "attackMove"
                ? "attackMove"
                : cohort === "assault"
                  ? "attackMove"
                  : "move";
            return plannedOrder({
              ...unit,
              stance: isBreach
                ? cohort === "infil"
                  ? "stealth" as const
                  : cohort === "assault"
                    ? "assault" as const
                    : "hold" as const
                : command === "recon" || command === "infiltrate"
                  ? "stealth" as const
                  : "assault" as const,
              patrol: command === "patrol" ? [{ x: unit.x, y: unit.y }, destination] : undefined,
              patrolIndex: command === "patrol" ? 1 : unit.patrolIndex,
            }, {
                kind: orderKind,
                ...destination,
                delay,
                phase: isBreach ? cohort : undefined,
              }, current.queueMode || queueOverride);
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
              : command === "guard"
                ? "Guard area established: contacts inside the perimeter will be engaged"
              : command === "breach"
                ? "Phased breach armed: infiltrators moving, assault and support staged"
              : command === "recon"
                ? "Recon phase launched: low-signature assets moving to observation positions"
              : command === "infiltrate"
                ? "Infiltration phase launched: covert assets moving without automatic engagement"
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
          cooldowns: { ...current.cooldowns, medkit: veterancyCooldown(advanced ? 15 : 21, medic.rank) },
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
          current.structures.some((structure) => structure.kind === "enemyRelay" && !structure.disabled) ||
          current.units.some((unit) => unit.team === "enemy" && unit.boss);
        playTone(180, 0.18, "sawtooth");
        return {
          ...current,
          abilityMode: null,
          alert: clamp(current.alert + 14, 0, 100),
          alertHold: Math.max(current.alertHold, 7),
          cooldowns: { ...current.cooldowns, grenade: veterancyCooldown(15, thrower.rank) },
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
          current.structures.some((structure) => structure.kind === "enemyRelay" && !structure.disabled) ||
          current.units.some((unit) => unit.team === "enemy" && unit.boss);
        playTone(120, 0.28, "sawtooth");
        return {
          ...current,
          abilityMode: null,
          alert: clamp(current.alert + 26, 0, 100),
          alertHold: Math.max(current.alertHold, 9),
          cooldowns: { ...current.cooldowns, demo: veterancyCooldown(24, lancer.rank) },
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
        const operatorRank = Math.max(0, ...current.units.filter((unit) => current.selectedIds.includes(unit.id) && unit.kind === "wraith").map((unit) => unit.rank));
        playTone(510, 0.08, "sine");
        return {
          ...current,
          abilityMode: null,
          cooldowns: { ...current.cooldowns, decoy: veterancyCooldown(14, operatorRank) },
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
        const operatorRank = Math.max(0, ...current.units.filter((unit) => current.selectedIds.includes(unit.id) && unit.kind === "specter").map((unit) => unit.rank));
        playTone(940, 0.14, "sine");
        return {
          ...current,
          abilityMode: null,
          cooldowns: { ...current.cooldowns, scan: veterancyCooldown(17, operatorRank) },
          effects: [
            ...current.effects,
            { id: current.nextId, kind: "scan", ...point, ttl: 7, maxTtl: 7, radius: 22, team: "player" },
          ],
          nextId: current.nextId + 1,
          logs: addLog(current.logs, "Specter scan painting contacts"),
        };
      }

      if (current.abilityMode === "focus") {
        return { ...current, logs: addLog(current.logs, "FOCUS FIRE requires a hostile unit or structure") };
      }

      if (!current.selectedIds.length) {
        return { ...current, logs: addLog(current.logs, "Select a unit first") };
      }
      playTone(350, 0.04, "sine");
      const selectedCount = current.selectedIds.length;
      let selectedIndex = 0;
      const moving = current.units.map((unit) => {
        if (!current.selectedIds.includes(unit.id)) return unit;
        const destination = formationDestination(point, current.formation, selectedIndex++, selectedCount);
        return plannedOrder({
          ...unit,
          patrol: undefined,
        }, { kind: "move", ...destination }, current.queueMode || queueOverride);
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
        logs: (current.queueMode || queueOverride)
          ? addLog(current.logs, `WAYPOINT QUEUED // ${selectedCount} unit${selectedCount === 1 ? "" : "s"} · ${current.formation.toUpperCase()}`)
          : addLog(current.logs, `MOVE // ${selectedCount} unit${selectedCount === 1 ? "" : "s"} · ${current.formation.toUpperCase()}`),
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
      if (event.key.toLowerCase() === "t") selectUnitType();
      if (event.key.toLowerCase() === "g") armAbility("attackMove");
      if (event.key.toLowerCase() === "h") armAbility("guard");
      if (event.key.toLowerCase() === "o") armAbility("focus");
      if (event.key.toLowerCase() === "q") toggleQueueMode();
      if (event.key === "[") cycleFormation();
      if (event.key === "Tab") {
        event.preventDefault();
        cycleUnit();
      }
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

  useEffect(() => {
    const previous = lastPhaseRef.current;
    lastPhaseRef.current = game.phase;
    if (previous === game.phase || (game.phase !== "won" && game.phase !== "lost")) return;
    if (game.phase === "lost") {
      playTone(196, 0.42, "sawtooth");
      window.setTimeout(() => playTone(146, 0.58, "sawtooth"), 300);
    } else {
      window.localStorage.removeItem("command-rex-checkpoint");
      savedCheckpointStageRef.current = -1;
    }
    window.localStorage.removeItem("command-rex-save");
    setHasSave(false);
    setProgress((current) => {
      const rankWeight: Record<string, number> = { "—": -1, F: 0, C: 1, B: 2, A: 3, S: 4 };
      const newlyCompleted = game.phase === "won" && !current.completedTheaterIds.includes(game.theaterId);
      const completedTheaterIds = newlyCompleted ? [...current.completedTheaterIds, game.theaterId] : current.completedTheaterIds;
      const next: PlayerProgress = {
        ...current,
        completedTheaters: completedTheaterIds.length,
        completedTheaterIds,
        victories: current.victories + (game.phase === "won" ? 1 : 0),
        commanderXp: current.commanderXp + (game.phase === "won" ? 550 : 0),
        doctrinePoints: current.doctrinePoints + (game.phase === "won" ? Math.floor((current.commanderXp + 550) / 500) - Math.floor(current.commanderXp / 500) + (missionRank === "S" ? 1 : 0) : 0),
        totalDetections: current.totalDetections + game.detections,
        totalLosses: current.totalLosses + game.losses,
        bestRank: rankWeight[missionRank] > rankWeight[current.bestRank] ? missionRank : current.bestRank,
        updatedAt: Date.now(),
      };
      if (account.status === "signed-in") {
        void fetch("/api/player", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profile: next, settings, save: null }),
        });
      }
      return next;
    });
  }, [account.status, game.detections, game.losses, game.phase, game.theaterId, missionRank, playTone, settings]);

  if (game.phase === "menu") {
    return (
      <main className={`titleScreen mainMenuScreen text-${settings.textScale}`}>
        <Image className="titleArt" src="/assets/key-art.png" alt="Snowbound military installation under a night storm" fill priority unoptimized sizes="100vw" />
        <div className="titleShade" />
        <div className="titleScanlines" />
        <header className="menuIdentity">
          <span>COMMAND REX</span>
          <b>SHADOW SNAKE {"//"} BUILD 1.9</b>
          <em>{account.status === "signed-in" ? `SYNCED · ${account.displayName ?? progress.callsign}` : account.status === "checking" ? "CHECKING COMMAND LINK" : "LOCAL PROFILE"}</em>
        </header>
        <nav className="mainMenuNav" aria-label="Main menu">
          {([
            ["command", "PLAY"],
            ["campaign", "CAMPAIGN"],
            ["progression", "DOCTRINE"],
            ["profile", "PROFILE"],
            ["settings", "SETTINGS"],
          ] as [MenuView, string][]).map(([view, label], index) => (
            <button key={view} className={menuView === view ? "active" : ""} onClick={() => setMenuView(view)}>
              <i>0{index + 1}</i><span>{label}</span>
            </button>
          ))}
        </nav>

        <section className="menuWorkspace">
          {menuView === "command" && (
            <div className="menuPanel playPanel">
              <div className="titleKicker"><span>1987–1990</span><i>THE COMPLETE INHERITANCE WAR</i></div>
              <h1 className="wordmark"><span>SHADOW</span><span>SNAKE</span></h1>
              <p className="titleGenre">TACTICAL ESPIONAGE COMMAND</p>
              <p className="titleCopy">Thirteen persistent theaters. Build the free haven, command mixed squads, infiltrate Cipher&apos;s networks, survive the war economy, find Rotten Snake, and carry the brothers&apos; choices through all 59 operations.</p>
              <div className="menuActions">
                <button className="primaryAction" disabled={!hasSave} onClick={continueSavedGame}><span>{hasSave ? "Continue theater" : "No active theater"}</span><b>›</b></button>
                <button className="secondaryMenuAction" onClick={() => setMenuView("campaign")}><span>New campaign</span><b>+</b></button>
              </div>
              <div className="quickStatus">
                <span><small>CAMPAIGN</small><b>{progress.completedTheaters}/{CAMPAIGN.length} THEATERS</b></span>
                <span><small>BEST RANK</small><b>{progress.bestRank}</b></span>
                <span><small>DOCTRINE</small><b>{progress.doctrinePoints} DP</b></span>
              </div>
            </div>
          )}

          {menuView === "campaign" && (
            <div className="menuPanel campaignPanel">
              <p className="menuEyebrow">CAMPAIGN COMMAND</p>
              <h2>The complete brothers&apos; war.</h2>
              <p className="menuLead">The storyboard is now one continuous 1987–1990 campaign: {CAMPAIGN.length} persistent theaters, {CAMPAIGN_OPERATION_COUNT} linked operations, four acts and a final endgame. Every theater can checkpoint, win, fail, restart, and unlock the next.</p>
              <div className="campaignOverview" aria-label="Campaign scope">
                <span><small>THEATERS</small><b>{CAMPAIGN.length}</b></span>
                <span><small>OPERATIONS</small><b>{CAMPAIGN_OPERATION_COUNT}</b></span>
                <span><small>SECURED</small><b>{progress.completedTheaters}</b></span>
                <span><small>FINAL YEAR</small><b>1990</b></span>
              </div>
              <div className="campaignStructure theaterCampaignStructure">
                {CAMPAIGN.map((theater, index) => {
                  const previous = CAMPAIGN[index - 1];
                  const unlocked = index === 0 || (previous && progress.completedTheaterIds.includes(previous.id));
                  const complete = progress.completedTheaterIds.includes(theater.id);
                  return (
                    <button
                      key={theater.id}
                      className={`${selectedTheaterId === theater.id ? "active" : ""} ${complete ? "complete" : ""} ${!unlocked ? "locked" : ""}`}
                      disabled={!unlocked}
                      onClick={() => setSelectedTheaterId(theater.id)}
                    >
                      <i>{index.toString().padStart(2, "0")}</i>
                      <span><small>{theater.act} · {theater.year}</small><b>{theater.title}</b><em>{theater.operations.length} operations · {theater.biome.toLowerCase()}</em></span>
                      <strong>{complete ? "SECURED" : unlocked ? "AVAILABLE" : "LOCKED"}</strong>
                    </button>
                  );
                })}
              </div>
              <div className="selectedTheaterBrief">
                <small>{theaterFor(selectedTheaterId).act} {"//"} {theaterFor(selectedTheaterId).actTitle}</small>
                <b>{theaterFor(selectedTheaterId).question}</b>
                <span>{theaterFor(selectedTheaterId).location} · {theaterFor(selectedTheaterId).doctrine}</span>
                <span>Field contacts: {(CAMPAIGN_CAST_BY_THEATER[selectedTheaterId as keyof typeof CAMPAIGN_CAST_BY_THEATER] ?? []).join(" · ")}</span>
                <span>Field rule: {theaterRules(selectedTheaterId).label}</span>
                <span>Final threat: {theaterFor(selectedTheaterId).finalTarget} · {theaterFor(selectedTheaterId).finalTargetClass === "metal-gear" ? "METAL GEAR CLASS" : theaterFor(selectedTheaterId).finalTargetClass.toUpperCase()}</span>
                <div className="selectedOperationTrack">{theaterFor(selectedTheaterId).operations.map((operation: { name: string }, index: number) => <i key={operation.name}><b>{String(index + 1).padStart(2, "0")}</b><small>{operation.name}</small></i>)}</div>
              </div>
              <div className="difficultySelect" aria-label="Operation pressure">
                <p>NEW CAMPAIGN PRESSURE</p>
                <div>{(Object.keys(DIFFICULTY_SPECS) as Difficulty[]).map((difficulty) => {
                  const spec = DIFFICULTY_SPECS[difficulty];
                  return <button key={difficulty} className={selectedDifficulty === difficulty ? "active" : ""} onClick={() => setSelectedDifficulty(difficulty)} aria-pressed={selectedDifficulty === difficulty}><b>{spec.callsign}</b><small>{spec.startingGmp} GMP · first raid {spec.firstRaid}s</small></button>;
                })}</div>
                <span>{DIFFICULTY_SPECS[selectedDifficulty].description}</span>
              </div>
              <button className="primaryAction" onClick={deploy}><span>Review {theaterFor(selectedTheaterId).title} · {DIFFICULTY_SPECS[selectedDifficulty].callsign}</span><b>›</b></button>
            </div>
          )}

          {menuView === "progression" && (
            <div className="menuPanel progressionPanel">
              <p className="menuEyebrow">CAMPAIGN DOCTRINE {"//"} {progress.doctrinePoints} POINT{progress.doctrinePoints === 1 ? "" : "S"} AVAILABLE</p>
              <h2>A career, not a checkout screen.</h2>
              <p className="menuLead">Complete operations, optional objectives, and full theaters to earn Command XP. Every 500 XP grants a Doctrine Point; deeper tiers cost more and open new strategies without replacing battlefield judgment.</p>
              <div className="doctrineProgress"><span><small>COMMAND LEVEL {Math.floor(progress.commanderXp / 500) + 1}</small><b>{progress.commanderXp.toLocaleString()} XP</b></span><i><b style={{ width: `${(progress.commanderXp % 500) / 5}%` }} /></i><em>{500 - (progress.commanderXp % 500)} XP TO NEXT POINT</em></div>
              <div className="doctrineGrid">{(Object.keys(DOCTRINE_SPECS) as DoctrineKey[]).map((key) => {
                const spec = DOCTRINE_SPECS[key];
                const unlocked = progress.unlockedDoctrine.includes(key);
                const prerequisiteLocked = Boolean(spec.requires && !progress.unlockedDoctrine.includes(spec.requires));
                return <button key={key} className={`${unlocked ? "unlocked" : ""} ${prerequisiteLocked ? "locked" : ""}`} disabled={unlocked || prerequisiteLocked || progress.doctrinePoints < spec.cost} onClick={() => unlockDoctrine(key)}><small>{spec.branch} · TIER {spec.tier}</small><b>{spec.name}</b><span>{spec.description}</span><em>{unlocked ? "ACTIVE" : prerequisiteLocked && spec.requires ? `REQUIRES ${DOCTRINE_SPECS[spec.requires].name.toUpperCase()}` : `UNLOCK · ${spec.cost} DP`}</em></button>;
              })}</div>
            </div>
          )}

          {menuView === "profile" && (
            <div className="menuPanel profilePanel">
              <p className="menuEyebrow">COMMANDER PROFILE</p>
              <h2>{account.status === "signed-in" ? account.displayName : progress.callsign}</h2>
              <p className="menuLead">Your campaign record, doctrine, settings, and active theater save can follow you when the command link is signed in.</p>
              <div className="profileStats">
                <span><small>DEPLOYMENTS</small><b>{progress.deployments}</b></span><span><small>VICTORIES</small><b>{progress.victories}</b></span><span><small>OPERATIONS</small><b>{progress.operationsCompleted}</b></span><span><small>COMMAND XP</small><b>{progress.commanderXp.toLocaleString()}</b></span><span><small>BEST RANK</small><b>{progress.bestRank}</b></span><span><small>DETECTIONS / LOSSES</small><b>{progress.totalDetections} / {progress.totalLosses}</b></span>
              </div>
              {account.status === "signed-in" ? <a className="accountAction" href="/signout-with-chatgpt?return_to=%2F">Sign out of command link</a> : <a className="accountAction primary" href="/signin-with-chatgpt?return_to=%2F">Sign in with ChatGPT to sync progress</a>}
              <p className="accountNote">Guest play still saves on this device. Signed-in play adds account-backed continuity for future levels and devices.</p>
            </div>
          )}

          {menuView === "settings" && (
            <div className="menuPanel settingsPanel">
              <p className="menuEyebrow">ACCESSIBILITY &amp; CONTROL</p>
              <h2>Make command readable.</h2>
              <div className="settingsList">
                <article><span><b>Interface text</b><small>Comfortable is the new baseline. Large adds another readability step.</small></span><div><button className={settings.textScale === "comfortable" ? "active" : ""} onClick={() => setSettings((current) => ({ ...current, textScale: "comfortable" }))}>COMFORTABLE</button><button className={settings.textScale === "large" ? "active" : ""} onClick={() => setSettings((current) => ({ ...current, textScale: "large" }))}>LARGE</button></div></article>
                <article><span><b>Live strategy coach</b><small>Contextual guidance during the active operation.</small></span><button className={settings.showCoach ? "active" : ""} onClick={() => setSettings((current) => ({ ...current, showCoach: !current.showCoach }))}>{settings.showCoach ? "ON" : "OFF"}</button></article>
                <article><span><b>Interface sound</b><small>Command acknowledgements and security-state cues.</small></span><button className={!settings.muted ? "active" : ""} onClick={() => setSettings((current) => ({ ...current, muted: !current.muted }))}>{settings.muted ? "OFF" : "ON"}</button></article>
                <article><span><b>Reduced effects</b><small>Removes scanline drift, weather motion, and nonessential pulses.</small></span><button className={settings.reducedEffects ? "active" : ""} onClick={() => setSettings((current) => ({ ...current, reducedEffects: !current.reducedEffects }))}>{settings.reducedEffects ? "ON" : "OFF"}</button></article>
              </div>
            </div>
          )}
        </section>
        <p className="prototypeNote menuFooter">Original tactical-espionage strategy game · Touch, mouse, or keyboard</p>
      </main>
    );
  }

  if (game.phase === "briefing") {
    return (
      <main className={`briefingScreen text-${settings.textScale} ${settings.reducedEffects ? "reduced-effects" : ""}`}>
        <Image className="briefingArt" src="/assets/key-art.png" alt="A snowbound offshore command installation" fill priority unoptimized sizes="100vw" />
        <div className="briefingShade" />
        <header className="briefingHeader"><span>COMMAND REX</span><b>CAMPAIGN FILE {"//"} {activeTheater.act}</b><button onClick={() => restart("menu")}>BACK</button></header>
        <section className="briefingDossier">
          <p className="eyebrow">{activeTheater.year} {"//"} {activeTheater.location.toUpperCase()}</p>
          <h1>{activeTheater.title}</h1>
          <p className="briefingLead">They called him <b>Eli</b> and classified him as the failed inheritance of the twentieth century&apos;s greatest soldier. He chose another name: <strong>Shadow Snake.</strong></p>
          <p>{activeTheater.briefing}</p>
          <blockquote>“{activeTheater.question}”</blockquote>
          <div className="briefingDoctrine">
            <article><small>COMMAND</small><b>Build a mobile nation</b><span>Capture logistics, establish power, train specialists, and preserve veterans.</span></article>
            <article><small>INFILTRATE</small><b>See before you strike</b><span>Recon, concealment, hacking, and misdirection can dismantle a base without a frontal war.</span></article>
            <article><small>CONSEQUENCE</small><b>Every tactic leaves a trace</b><span>Lethal force, alarms, recovery, and destruction shape resources and future pressure.</span></article>
          </div>
          <div className="briefingObjectives"><span><small>THEATER</small><b>Complete {activeOperations.length} linked operations</b></span><span><small>FINAL THREAT</small><b>{activeTheater.finalTarget}</b></span><span><small>PRESSURE</small><b>{difficultyTuning.callsign} · {activeRules.label}</b></span></div>
          <div className="briefingFieldRule"><small>{activeMission.label} MISSION // {activeTactics.weather}</small><b>{activeMission.rule}</b><span>Field rule: {activeTactics.rule} · Enemy cycle: {activeTactics.raidCycle.map((raid: RaidDoctrine) => raid.toUpperCase()).join(" → ")}</span></div>
          <div className="briefingCast"><small>FIELD CONTACTS</small><span>{activeCast.map((name) => <b key={name}>{name}</b>)}</span></div>
          <button className="primaryAction" onClick={beginOperation}><span>Begin Operation {activeOperations[0].name}</span><b>›</b></button>
        </section>
        <aside className="campaignRail">
          <p>SHADOW SNAKE {"//"} CAMPAIGN</p>
          {CAMPAIGN.map((theater, index) => <article key={theater.id} className={theater.id === activeTheater.id ? "active" : ""}><i>{index.toString().padStart(2, "0")}</i><span><small>{theater.act}</small><b>{theater.title}</b><em>{theater.operations.length} operations</em></span></article>)}
        </aside>
      </main>
    );
  }

  return (
    <main className={`gameScreen theater-${activeTheater.id} security-${security} text-${settings.textScale} ${settings.reducedEffects ? "reduced-effects" : ""}`}>
      <header className="topHud">
        <div className="hudIdentity">
          <span className="rexMark">CR</span>
          <div><b>SHADOW SNAKE</b><small>{activeTheater.title.toUpperCase()} · {formatTime(game.elapsed)} · {difficultyTuning.callsign}</small></div>
        </div>
        <div className="economyHud">
          <span title={`Base stipend +${economy.baseIncome}/s · controlled relays +${economy.nodeIncome}/s`}><small>GMP</small><b>{Math.floor(game.resources).toLocaleString()}</b><em>+{economy.income}/s</em></span>
          <span className={!power.online ? "critical" : ""}><small>POWER</small><b>{power.produced - power.used}</b><em>{power.used}/{power.produced}</em></span>
          <span className={supply.used >= supply.cap ? "critical" : ""}><small>SUPPLY</small><b>{supply.used}</b><em>/{supply.cap}</em></span>
          <span className={commandIntegrity <= 35 ? "critical" : ""} title="Forward Command integrity; destruction ends the theater"><small>COMMAND</small><b>{commandIntegrity}%</b><em>{game.emergencyRecoveryStages.includes(game.operationStage) || game.difficulty === "hardline" ? "NO RESERVE" : "RECOVERY READY"}</em></span>
        </div>
        <div className={`securityHud ${security}`}>
          <div className="securityDial" style={{ "--alert": `${game.alert * 3.6}deg` } as CSSProperties}><i /></div>
          <span><small>THREAT STATE</small><b>{security}</b></span>
        </div>
        <div className="hudButtons">
          <button className="hudMenuButton" onClick={saveAndReturnToMenu} aria-label="Save and return to main menu">☰</button>
          <button className="hudHelpButton" onClick={openManual} aria-label="Open field manual">?</button>
          <button className="hudSoundButton" onClick={() => setSettings((current) => ({ ...current, muted: !current.muted }))} aria-label={settings.muted ? "Enable sound" : "Mute sound"}>{settings.muted ? "×" : "♪"}</button>
          <button
            className="hudSpeedButton"
            onClick={() => setGame((current) => ({ ...current, speed: current.speed === 1 ? 1.5 : 1 }))}
            aria-label="Change simulation speed"
          >{game.speed}×</button>
          <button
            className={`hudPauseButton ${game.paused ? "active" : ""}`}
            onClick={() => setGame((current) => ({ ...current, paused: !current.paused }))}
            aria-label={game.paused ? "Resume" : "Tactical pause"}
          >{game.paused ? "▶" : "Ⅱ"}</button>
        </div>
      </header>

      <div className={`gameLayout ${deckCollapsed ? "deck-collapsed" : ""}`}>
        <section className="battleColumn" aria-label="Tactical battlefield">
          <div className="battlefieldViewport" ref={viewportRef}>
            <div
              className={`battlefieldCanvas touch-${touchMode} ${game.buildMode ? "placing" : ""} ${game.abilityMode ? `ability-${game.abilityMode}` : ""}`}
              onPointerDown={handleMapPointerDown}
              onPointerMove={handleMapPointerMove}
              onPointerUp={handleMapPointerUp}
              onPointerCancel={() => { gestureRef.current = null; selectionBoxRef.current = null; setSelectionBox(null); setBuildPreview(null); }}
              onContextMenu={(event) => event.preventDefault()}
            >
              <Image className="battlefieldImage" src="/assets/battlefield-v2.webp" alt="Snowbound island command theater tactical map" fill priority unoptimized sizes="(max-width: 900px) 1280px, 85vw" draggable={false} />
              <div className="battlefieldTone" />
              <div className="mapGrid" />
              {game.buildMode && <div className="buildPlacementGrid" />}
              <div className="weatherLayer" />
              <div className="roadOverlay" />

              {selectionBox && (
                <i
                  className="selectionBox"
                  style={{
                    left: `${Math.min(selectionBox.start.x, selectionBox.end.x)}%`,
                    top: `${Math.min(selectionBox.start.y, selectionBox.end.y)}%`,
                    width: `${Math.abs(selectionBox.end.x - selectionBox.start.x)}%`,
                    height: `${Math.abs(selectionBox.end.y - selectionBox.start.y)}%`,
                  }}
                />
              )}

              {activeTactics.zones.map((zone: { id: string; type: string; label: string; x: number; y: number; w: number; h: number }) => (
                <div
                  key={zone.id}
                  className={`terrainZone ${zone.type}`}
                  style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%` }}
                ><span>{zone.label} · {zone.type === "hard-cover" ? "−34% DAMAGE" : zone.type === "concealment" ? "−52% SIGNATURE" : zone.type === "elevation" ? "+VISION / FIRE" : "SLOW / EXPOSED"}</span></div>
              ))}

              {game.lastKnown && security !== "hidden" && (
                <div className="lastKnownMarker" style={{ left: `${game.lastKnown.x}%`, top: `${game.lastKnown.y}%` }}>
                  <i /><span>LAST KNOWN</span>
                </div>
              )}

              {THEATER_REGIONS.filter((region) => game.operationStage < region.stage).map((region) => (
                <div
                  key={region.code}
                  className="regionFog"
                  style={{ left: `${region.x}%`, top: `${region.y}%`, width: `${region.w}%`, height: `${region.h}%` }}
                >
                  <span><small>{region.code}{" // "}ENCRYPTED</small><b>{region.title}</b><em>Complete {operationNameFor(game.theaterId, Math.max(0, region.stage - 1))} to reveal</em></span>
                </div>
              ))}

              {game.buildMode && buildNetwork.map((source) => (
                <div
                  key={`build-${source.id}`}
                  className={`buildRadius ${source.kind}`}
                  style={{
                    left: `${source.x}%`,
                    top: `${source.y}%`,
                    width: `${source.radius * 2}%`,
                  }}
                ><span>{source.kind === "outpost" ? `${source.label} · FORWARD BUILD GRID` : "BASE NETWORK"}</span></div>
              ))}

              {game.buildMode && buildPreviewStatus && (
                <div
                  className={`buildGhost ${buildPreviewStatus.valid ? "valid" : "blocked"} ${buildPreviewConnections.map((side) => `connected-${side}`).join(" ")}`}
                  style={{
                    left: `${buildPreviewStatus.point.x}%`,
                    top: `${buildPreviewStatus.point.y}%`,
                    width: `${BUILD_SPECS[game.buildMode].footprint[0] * BUILD_GRID_X}%`,
                    height: `${BUILD_SPECS[game.buildMode].footprint[1] * BUILD_GRID_Y}%`,
                  }}
                >
                  {buildPreviewConnections.map((side) => <i key={side} className={`structureConnector ${side}`} />)}
                  <span><b>{BUILD_SPECS[game.buildMode].code} · {BUILD_SPECS[game.buildMode].footprint[0]}×{BUILD_SPECS[game.buildMode].footprint[1]}</b><small>{buildPreviewStatus.reason}</small></span>
                </div>
              )}

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
                    issueCacheOrder(cache.id, event.shiftKey);
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
                    if (node.owner === "player") selectControlNode(node.id);
                    else issueCaptureOrder(node.id, event.shiftKey);
                  }}
                  aria-label={`${node.name}, ${node.owner ?? "neutral"}, ${Math.round(Math.abs(node.capture))}% control${node.owner === "player" ? ", forward construction grid available" : ""}`}
                >
                  <span className="captureRing"><i /></span>
                  <b>{node.name.slice(-2)}</b>
                  <small>{node.owner === "player" ? `+${node.income}/s · BUILD GRID` : node.owner === "enemy" ? "HOSTILE" : "CONTESTED"}</small>
                </button>
              ))}

              {game.structures.map((structure) => {
                const label = STRUCTURE_LABELS[structure.kind];
                const footprint = structureFootprint(structure.kind);
                const connections = structureConnections(structure, game.structures);
                const shielded = structure.kind === "enemyUplink" && uplinkLocked;
                const offline = structure.disabled || (structure.team === "enemy" && game.jamTimer > 0 && (structure.kind === "enemyRadar" || structure.kind === "enemyTurret"));
                const selected = structure.id === game.selectedStructureId;
                const friendlyGateOpen = structure.team === "player" && structure.kind === "gate" && power.online && !structure.disabled;
                return (
                  <button
                    key={structure.id}
                    className={`structureMarker gridFootprint ${structure.team} ${structure.kind} ${connections.map((side) => `connected-${side}`).join(" ")} ${friendlyGateOpen ? "gate-open" : structure.kind === "gate" ? "gate-closed" : ""} ${offline ? "offline" : ""} ${shielded ? "shielded" : ""} ${selected ? "selected" : ""} ${guideStep.targetId === structure.id ? "coachTarget" : ""}`}
                    style={{
                      left: `${structure.x}%`,
                      top: `${structure.y}%`,
                      width: `${footprint[0] * BUILD_GRID_X}%`,
                      height: `${footprint[1] * BUILD_GRID_Y}%`,
                    }}
                    onPointerUp={(event) => {
                      event.stopPropagation();
                      if (structure.team === "enemy") issueTargetOrder(structure.id, event.shiftKey);
                      else selectStructure(structure.id);
                    }}
                    aria-label={`${label.name}, ${footprint[0]} by ${footprint[1]} grid footprint, ${Math.ceil(structure.hp)} health${offline ? ", offline" : ""}`}
                  >
                    {(structure.kind === "enemyRadar" || structure.kind === "enemyTurret" || structure.kind === "sentry" || structure.kind === "missileNest" || structure.kind === "sensor") && !offline && (
                      <i className="structureRange" />
                    )}
                    {selected && (structure.kind === "repairBay" || structure.kind === "hospital") && !offline && (
                      <i className={`structureRange supportRange ${structure.kind}`} />
                    )}
                    {shielded && <i className="shieldField" />}
                    {connections.map((side) => <span key={side} className={`structureConnector ${side}`} />)}
                    <span className="structureBody"><TacticalSprite kind={structure.kind} team={structure.team} /></span>
                    <span className="healthBar"><i style={{ width: `${(structure.hp / structure.maxHp) * 100}%` }} /></span>
                    {structure.hackProgress > 0 && !structure.disabled && (
                      <span className="hackBar"><i style={{ width: `${structure.hackProgress}%` }} /></span>
                    )}
                    <small>{offline ? "OFFLINE" : `${label.name}${structure.team === "player" ? ` · L${structure.level ?? 1}` : ""}`}</small>
                    {structure.kind === "gate" && structure.team === "player" && <span className={`gateAccess ${friendlyGateOpen ? "open" : "closed"}`}>{friendlyGateOpen ? "IFF OPEN" : "FAIL CLOSED"}</span>}
                    {structure.upgradeRemaining > 0 && (
                      <span className="upgradeBar"><i style={{ width: `${((structure.upgradeTotal - structure.upgradeRemaining) / structure.upgradeTotal) * 100}%` }} /></span>
                    )}
                  </button>
                );
              })}

              {game.units.map((unit) => {
                if (unit.team === "enemy" && !visibleEnemyIds.has(unit.id)) return null;
                const spec = UNIT_SPECS[unit.kind];
                const footprint = unitFootprint(unit.kind);
                const selected = game.selectedIds.includes(unit.id);
                const terrainZone = terrainEffectAt(game.theaterId, unit).zone;
                const unitMoraleBand = moraleBand(unit.morale);
                const destination = unit.order?.targetId
                  ? game.units.find((candidate) => candidate.id === unit.order?.targetId) ?? game.structures.find((candidate) => candidate.id === unit.order?.targetId) ?? game.nodes.find((candidate) => candidate.id === unit.order?.targetId)
                  : unit.order;
                const queuedPoints = unit.orderQueue.map((order) => order.targetId
                  ? game.units.find((candidate) => candidate.id === order.targetId) ?? game.structures.find((candidate) => candidate.id === order.targetId) ?? game.nodes.find((candidate) => candidate.id === order.targetId) ?? order
                  : order);
                return (
                  <div key={unit.id} className="unitLayer">
                    {selected && destination && <i className={`orderLine ${unit.order?.kind ?? "move"} ${unit.order?.delay ? "staged" : ""}`} style={lineStyle(unit, destination)} />}
                    {selected && destination && <i className={`orderDestination ${unit.order?.kind ?? "move"}`} style={{ left: `${destination.x}%`, top: `${destination.y}%` }} />}
                    {selected && queuedPoints.map((queued, index) => {
                      const from = index === 0 ? (destination ?? unit) : queuedPoints[index - 1];
                      return <span key={`${unit.id}-queue-${index}`}><i className="orderLine queued" style={lineStyle(from, queued)} /><i className="orderDestination queued" style={{ left: `${queued.x}%`, top: `${queued.y}%` }}>{index + 1}</i></span>;
                    })}
                    <button
                      className={`unitMarker gridUnit ${unit.team} ${unit.kind} ${unit.boss ? `theaterBoss boss-${unit.bossClass}` : ""} ${unit.stance} morale-${unitMoraleBand} ${terrainZone ? `terrain-${terrainZone.type}` : ""} ${selected ? "selected" : ""} ${unit.sleep > 0 ? "sleeping" : ""} ${unit.suppressed > 0 ? "suppressed" : ""}`}
                      style={{
                        left: `${unit.x}%`,
                        top: `${unit.y}%`,
                        width: `${footprint[0] * BUILD_GRID_X}%`,
                        height: `${footprint[1] * BUILD_GRID_Y}%`,
                        "--facing": `${unit.facing}deg`,
                      } as CSSProperties}
                      onPointerUp={(event) => {
                        event.stopPropagation();
                        if (unit.team === "player") selectUnit(unit.id, multiSelect || event.shiftKey);
                        else issueTargetOrder(unit.id, event.shiftKey);
                      }}
                      onDoubleClick={(event) => {
                        event.stopPropagation();
                        if (unit.team === "player") selectUnitType(unit.kind);
                      }}
                      aria-label={`${unit.team === "player" ? "Friendly" : "Hostile"} ${unit.callsign ?? spec.name}, ${footprint[0]} by ${footprint[1]} grid footprint, ${Math.ceil(unit.hp)} health`}
                    >
                      {unit.team === "enemy" && unit.sleep <= 0 && <i className="visionCone" />}
                      <span className="selectionRing" />
                      <span className="facingTick" />
                      <span className="unitBody"><TacticalSprite kind={unit.kind} team={unit.team} /><i /><b>{spec.code}</b></span>
                      <span className="healthBar"><i style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }} /></span>
                      <span className="moraleBar" aria-label={`${Math.ceil(unit.morale)} morale, ${unitMoraleBand}`}><i style={{ width: `${unit.morale}%` }} /></span>
                      {unit.team === "player" && unit.rank > 0 && (
                        <span className="rankPips" aria-label={`${["Regular", "Veteran", "Elite", "Legend"][unit.rank]} rank`}>
                          {Array.from({ length: unit.rank }, (_, index) => <i key={index} />)}
                        </span>
                      )}
                      {unit.sleep > 0 && <span className="statusBadge sleep">Z</span>}
                      {(unit.suppressed > 0 || unitMoraleBand !== "steady") && unit.sleep <= 0 && <span className={`statusBadge suppressed ${unitMoraleBand}`}>{unitMoraleBand === "broken" ? "BRK" : unitMoraleBand === "pinned" ? "PIN" : "!"}</span>}
                      {unit.raidRole && <span className={`statusBadge raidRole ${unit.raidRole}`}>{unit.raidRole.slice(0, 3).toUpperCase()}</span>}
                      {unit.kind === "mule" && unit.team === "player" && (
                        <span className="statusBadge logistics">{unit.logisticsPhase === "loading" ? "LOAD" : unit.logisticsPhase === "return" ? `${unit.cargoGmp ?? 0}` : "RUN"}</span>
                      )}
                      {unit.order?.delay && unit.order.delay > 0 && (
                        <span className={`statusBadge staged ${unit.order.phase ?? ""}`}>T−{Math.ceil(unit.order.delay)}</span>
                      )}
                      {unit.orderQueue.length > 0 && <span className="statusBadge queued">Q{unit.orderQueue.length}</span>}
                      {unit.boss && <span className="bossCallsign">{unit.callsign}</span>}
                    </button>
                  </div>
                );
              })}

              {selectedStructure && selectedStructure.team === "player" && (
                <section
                  className="entityCommandHalo structureHalo"
                  style={{ left: `${clamp(selectedStructure.x, 15, 85)}%`, top: `${clamp(selectedStructure.y, 18, 82)}%` }}
                  aria-label={`${STRUCTURE_LABELS[selectedStructure.kind].name} contextual commands`}
                >
                  <header><span><small>FACILITY COMMAND · LEVEL {selectedStructure.level}</small><b>{STRUCTURE_LABELS[selectedStructure.kind].name}</b></span><em>{Math.ceil(selectedStructure.hp)}/{selectedStructure.maxHp}</em></header>
                  <p>{selectedStructureEffect}</p>
                  <div className="contextActionRow">
                    <button disabled={selectedStructure.hp >= selectedStructure.maxHp} onClick={repairSelectedStructure}><b>REPAIR</b><small>restore 30%</small></button>
                    <button className="primary" disabled={selectedStructure.level >= 3 || selectedStructure.upgradeRemaining > 0 || game.resources < structureUpgradeCost(selectedStructure)} onClick={upgradeSelectedStructure}><b>{selectedStructure.upgradeRemaining > 0 ? "UPGRADING" : selectedStructure.level >= 3 ? "MAX LEVEL" : `UPGRADE L${selectedStructure.level + 1}`}</b><small>{selectedStructure.level < 3 ? `${structureUpgradeCost(selectedStructure)} GMP` : "complete"}</small></button>
                    <button onClick={openSelectedStructureSystem}><b>{selectedStructure.kind === "barracks" || selectedStructure.kind === "vehicleBay" ? "DEPLOY" : selectedStructure.kind === "rdLab" || selectedStructure.kind === "comms" ? "R&D" : "BUILD"}</b><small>full system</small></button>
                    <button className="danger" disabled={selectedStructure.kind === "hq"} onClick={sellSelectedStructure}><b>SALVAGE</b><small>50% refund</small></button>
                  </div>
                  {selectedStructure.level < 3 && selectedStructure.upgradeRemaining <= 0 && <footer>NEXT · {STRUCTURE_UPGRADE_COPY[selectedStructure.kind]?.[selectedStructure.level - 1] ?? "Expanded field capability"}</footer>}
                </section>
              )}

              {selectedPrimary && (
                <section
                  className="entityCommandHalo unitHalo"
                  style={{ left: `${clamp(selectedPrimary.x, 15, 85)}%`, top: `${clamp(selectedPrimary.y, 18, 82)}%` }}
                  aria-label={`${UNIT_SPECS[selectedPrimary.kind].name} contextual commands`}
                >
                  <header><span><small>{selectedUnits.length > 1 ? `${selectedUnits.length} UNIT ELEMENT` : `${["REGULAR", "VETERAN", "ELITE", "LEGEND"][selectedPrimary.rank]} · ${selectedPrimary.xp} XP`}</small><b>{selectedUnits.length > 1 ? selectedLabel : UNIT_SPECS[selectedPrimary.kind].name}</b></span><em>{selectedUnits.length > 1 ? `${selectedCohortCount} ROLES` : `${Math.ceil(selectedPrimary.hp)}/${selectedPrimary.maxHp}`}</em></header>
                  {selectedUnits.length === 1 && <p>{UNIT_SPECS[selectedPrimary.kind].role} · +{selectedPrimary.rank * 10}% damage · −{selectedPrimary.rank * 6}% role cooldown{selectedRankProgress?.next ? ` · ${selectedRankProgress.remaining} XP to next rank` : " · maximum rank"}</p>}
                  <div className="contextStances" aria-label="Contextual posture">
                    {(["stealth", "hold", "assault"] as Stance[]).map((stance) => <button key={stance} className={selectedUnits.every((unit) => unit.stance === stance) ? "active" : ""} onClick={() => setStance(stance)}><b>{stance}</b><small>{stance === "stealth" ? "avoid fire" : stance === "hold" ? "hold ground" : "engage"}</small></button>)}
                  </div>
                  <div className="contextActionRow unitActions">
                    {selectedUnits.some((unit) => unit.kind === "wraith") && <button disabled={game.cooldowns.tranq > 0} onClick={() => armAbility("tranq")}><b>TRANQ</b><small>{game.cooldowns.tranq > 0 ? `${Math.ceil(game.cooldowns.tranq)}s` : "personnel"}</small></button>}
                    {selectedUnits.some((unit) => unit.kind === "wraith") && <button disabled={game.cooldowns.decoy > 0} onClick={() => armAbility("decoy")}><b>DECOY</b><small>{game.cooldowns.decoy > 0 ? `${Math.ceil(game.cooldowns.decoy)}s` : "misdirect"}</small></button>}
                    {selectedUnits.some((unit) => unit.kind === "specter") && <button disabled={game.cooldowns.scan > 0} onClick={() => armAbility("scan")}><b>SCAN</b><small>{game.cooldowns.scan > 0 ? `${Math.ceil(game.cooldowns.scan)}s` : "reveal"}</small></button>}
                    {selectedUnits.some((unit) => unit.kind === "specter") && <button disabled={game.cooldowns.chaff > 0} onClick={useChaff}><b>CHAFF</b><small>{game.cooldowns.chaff > 0 ? `${Math.ceil(game.cooldowns.chaff)}s` : "jam net"}</small></button>}
                    {selectedUnits.some((unit) => unit.kind === "viper") && <button disabled={game.cooldowns.grenade > 0} onClick={() => armAbility("grenade")}><b>GRENADE</b><small>{game.cooldowns.grenade > 0 ? `${Math.ceil(game.cooldowns.grenade)}s` : "anti-personnel"}</small></button>}
                    {selectedUnits.some((unit) => unit.kind === "lancer") && <button disabled={game.cooldowns.demo > 0} onClick={() => armAbility("demo")}><b>DEMO</b><small>{game.cooldowns.demo > 0 ? `${Math.ceil(game.cooldowns.demo)}s` : "anti-structure"}</small></button>}
                    {selectedUnits.some((unit) => unit.kind === "medic") && <button disabled={game.cooldowns.medkit > 0} onClick={() => armAbility("medkit")}><b>TRAUMA</b><small>{game.cooldowns.medkit > 0 ? `${Math.ceil(game.cooldowns.medkit)}s` : "area heal"}</small></button>}
                    <button className="primary" onClick={() => armAbility("guard")}><b>GUARD</b><small>defend area</small></button>
                    <button onClick={() => armAbility("focus")}><b>FOCUS</b><small>one target</small></button>
                    <button onClick={fallBack}><b>FALLBACK</b><small>nearest FOB</small></button>
                  </div>
                </section>
              )}

              {selectedNode && (
                <section
                  className="entityCommandHalo outpostHalo"
                  style={{ left: `${clamp(selectedNode.x, 15, 85)}%`, top: `${clamp(selectedNode.y, 18, 82)}%` }}
                  aria-label={`${selectedNode.name} forward outpost commands`}
                >
                  <header><span><small>CAPTURED FORWARD OUTPOST</small><b>{selectedNode.name}</b></span><em>+{selectedNode.income}/s</em></header>
                  <p>Projects a 26m construction grid. Fortify this territory without chaining back to Forward Command.</p>
                  <div className="contextActionRow">
                    <button className="primary" disabled={Boolean(game.structureQueue) || game.resources < BUILD_SPECS.sentry.cost} onClick={() => queueForwardStructure("sentry")}><b>SENTRY</b><small>{BUILD_SPECS.sentry.cost} GMP</small></button>
                    <button disabled={Boolean(game.structureQueue) || game.resources < BUILD_SPECS.sensor.cost} onClick={() => queueForwardStructure("sensor")}><b>SENSOR</b><small>{BUILD_SPECS.sensor.cost} GMP</small></button>
                    <button disabled={Boolean(game.structureQueue) || game.resources < BUILD_SPECS.supplyDepot.cost} onClick={() => queueForwardStructure("supplyDepot")}><b>DEPOT</b><small>{BUILD_SPECS.supplyDepot.cost} GMP</small></button>
                    <button onClick={rallyAtSelectedNode}><b>RALLY</b><small>deploy here</small></button>
                    <button onClick={() => openDeckTab("base")}><b>ALL BUILDS</b><small>open catalog</small></button>
                  </div>
                </section>
              )}

              <div className="mapVignette" />
            </div>
          </div>

          <div className="battleHudOverlay">
              <div className="fieldConditionHud" title={activeTactics.rule}>
                <small>MISSION // {activeMission.label} · FIELD // {activeTactics.weather}</small>
                <b>{selectedTerrain ? `${selectedTerrain.label} · ${selectedTerrain.type.replace("-", " ")}` : activeMission.rule}</b>
              </div>
              {game.alarmProgress > 0 && game.alarmProgress < 100 && (
                <div className="alarmUplink" role="status">
                  <span><small>INTERRUPTIBLE ALARM</small><b>{alarmSource && visibleEnemyIds.has(alarmSource.id) ? `${UNIT_SPECS[alarmSource.kind].name} transmitting` : "Hostile caller transmitting"}</b></span>
                  <em>{Math.ceil(game.alarmProgress)}%</em>
                  <i><b style={{ width: `${game.alarmProgress}%` }} /></i>
                </div>
              )}
              {!game.buildMode && !game.abilityMode && !game.transmission && (
                <div className="phaseQuickRail" aria-label="Quick operation phases">
                  {operationPhaseReadiness.map((phase, index) => (
                    <button key={`quick-${phase.key}`} disabled={!phase.assets.length} onClick={() => launchOperationPhase(phase.key as OperationPlanPhase)}>
                      <i>{index + 1}</i><span><b>{phase.label}</b><small>{phase.assets.length} READY</small></span>
                    </button>
                  ))}
                </div>
              )}
              <div className="touchCommandBar" aria-label="Touch command controls">
                <div className="touchSelectionSummary" aria-live="polite">
                  <span><small>ACTIVE SELECTION</small><b>{selectedLabel}</b></span>
                  <em>{selectedUnits.length === 1 && selectedPrimary
                    ? `${Math.ceil(selectedPrimary.hp)}/${selectedPrimary.maxHp} HP · ${Math.ceil(selectedPrimary.morale)} MRL`
                    : selectedStructure
                      ? `${Math.ceil(selectedStructure.hp)}/${selectedStructure.maxHp} INTEGRITY`
                      : selectedNode
                        ? `+${selectedNode.income}/s · 26M BUILD GRID`
                      : selectedUnits.length
                        ? `${selectedUnits.reduce((total, unit) => total + Math.ceil(unit.hp), 0)} COMBINED HP`
                        : "TAP A UNIT OR STRUCTURE"}</em>
                </div>
                <button className={touchMode === "orders" ? "active" : ""} onClick={() => setTouchMode("orders")}><b>ORDER</b><small>tap ground</small></button>
                <button className={touchMode === "pan" ? "active" : ""} onClick={() => setTouchMode("pan")}><b>PAN</b><small>drag map</small></button>
                <button onClick={selectAll}><b>ALL</b><small>select forces</small></button>
                <button onClick={cycleUnit}><b>NEXT</b><small>cycle stack</small></button>
                <button disabled={!selectedPrimary} onClick={() => selectUnitType()}><b>TYPE</b><small>{selectedPrimary ? `all ${UNIT_SPECS[selectedPrimary.kind].code}` : "select one"}</small></button>
                <button disabled={!SQUAD_SLOTS.some((slot) => game.squads[slot].some((id) => game.units.some((unit) => unit.id === id && unit.team === "player")))} onClick={cycleSquad}><b>{game.activeSquad?.toUpperCase() ?? "GROUP"}</b><small>next group</small></button>
                <button disabled={!selectedPrimary && !selectedStructure && !selectedNode} onClick={centerSelection}><b>CENTER</b><small>find selection</small></button>
                <button className={game.abilityMode === "focus" ? "active" : ""} disabled={!selectedUnits.length} onClick={() => armAbility("focus")}><b>FOCUS</b><small>tap hostile</small></button>
                <button className={game.abilityMode === "guard" ? "active" : ""} disabled={!selectedUnits.length} onClick={() => armAbility("guard")}><b>GUARD</b><small>tap area</small></button>
                <button disabled={!selectedUnits.length} onClick={stopOrders}><b>STOP</b><small>hold here</small></button>
                <button disabled={!selectedUnits.length} onClick={fallBack}><b>FALLBACK</b><small>return FOB</small></button>
                <button className={!deckCollapsed ? "active" : ""} onClick={() => openDeckTab(selectedStructure ? "base" : "ops")}><b>COMMAND</b><small>{selectedStructure ? "manage base" : "orders & build"}</small></button>
              </div>
              <button className={`objectiveHud ${objectivesOpen ? "open" : ""}`} onClick={(event) => { event.stopPropagation(); setObjectivesOpen((value) => !value); }}>
                <span className="objectiveHeader"><b>{`OP ${game.operationStage + 1}/${activeOperations.length} · ${activeOperation} · ${activeMission.label}`}</b><i>{objectivesOpen ? "−" : "+"}</i></span>
                <span className="objectiveList">
                  {activeOperationRole === "foothold" && <><em className={ownedNodes >= 1 ? "done" : ""}><i>{ownedNodes >= 1 ? "✓" : "01"}</i> Secure SUPPLY 01</em><em className={game.structures.some((structure) => structure.kind === "sentry" && structure.team === "player") ? "done" : ""}><i>{game.structures.some((structure) => structure.kind === "sentry" && structure.team === "player") ? "✓" : "02"}</i> Establish perimeter defense</em></>}
                  {activeOperationRole === "radar" && <><em className={ownedNodes >= 2 ? "done" : ""}><i>{ownedNodes >= 2 ? "✓" : "01"}</i> Secure SUPPLY 02</em><em className={!radarOnline ? "done" : ""}><i>{!radarOnline ? "✓" : "02"}</i> Disable detection radar</em></>}
                  {activeOperationRole === "relays" && <><em className={ownedNodes >= 3 ? "done" : ""}><i>{ownedNodes >= 3 ? "✓" : "01"}</i> Secure INTEL 03</em><em className={relaysOnline === 0 ? "done" : ""}><i>{relaysOnline === 0 ? "✓" : "02"}</i> Sever security relays <b>{2 - relaysOnline}/2</b></em></>}
                  {activeOperationRole === "command" && <><em className={game.nodes.some((node) => node.id === "node-d" && node.owner === "player") ? "done" : ""}><i>{game.nodes.some((node) => node.id === "node-d" && node.owner === "player") ? "✓" : "01"}</i> Secure COMMAND 04</em><em className={!game.structures.some((structure) => structure.id === "enemy-stage-command" && !structure.disabled) ? "done" : ""}><i>{!game.structures.some((structure) => structure.id === "enemy-stage-command" && !structure.disabled) ? "✓" : "02"}</i> Break field command</em></>}
                  {activeOperationRole === "finale" && <><em className={!boss ? "done" : ""}><i>{!boss ? "✓" : "01"}</i> Defeat {activeTheater.finalTarget} {boss && <b>{Math.ceil((boss.hp / boss.maxHp) * 100)}%</b>}</em><em className={!uplinkOnline ? "done" : boss ? "locked" : ""}><i>{!uplinkOnline ? "✓" : boss ? "⌁" : "02"}</i> Secure theater command</em></>}
                  {game.operationStage >= 1 && <em className={!gateOnline ? "done optional" : "optional"}><i>{!gateOnline ? "✓" : "+"}</i> Optional: stop response hangar</em>}
                  {game.alarmProgress > 0 && game.alarmProgress < 100 && <em className="optional urgent"><i>!</i> Interrupt hostile alarm <b>{Math.ceil(game.alarmProgress)}%</b></em>}
                  <em className={cachesRecovered === game.caches.length ? "done optional" : "optional"}><i>{cachesRecovered === game.caches.length ? "✓" : "$"}</i> Recover field caches <b>{cachesRecovered}/{game.caches.length}</b></em>
                </span>
              </button>

              <div className={`raidClock ${game.raidTimer < 15 ? "urgent" : ""} ${!gateOnline ? "offline" : ""}`}>
                <small>{gateOnline ? `${nextRaidDoctrine.toUpperCase()} RAID ${game.raidWave + 1} · ${nextRaidContacts} CONTACT${nextRaidContacts === 1 ? "" : "S"}` : "RESPONSE HANGAR"}</small>
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

              {settings.showCoach && <section className={`strategyCoach ${coachExpanded ? "expanded" : ""}`} aria-live="polite">
                <button className="strategyCoachHeader" onClick={() => setCoachExpanded((value) => !value)}>
                  <span><small>LIVE STRATEGY {"//"} {guideStep.step}</small><b>{guideStep.title}</b></span>
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
              </section>}
          </div>

          <div className="fieldFooter">
            <div className="rosterStrip">
              <button className="allUnits" onClick={selectAll}><b>ALL</b><small>{game.units.filter((unit) => unit.team === "player").length}</small></button>
              <button className="cycleUnit" onClick={cycleUnit}><b>NEXT</b><small>TAB</small></button>
              <button
                className={`multiSelectToggle ${multiSelect ? "active" : ""}`}
                onClick={() => setMultiSelect((value) => !value)}
                aria-pressed={multiSelect}
                aria-label="Toggle additive multi-select"
              ><b>{multiSelect ? "MULTI ON" : "MULTI"}</b><small>{multiSelect ? "TAP TO ADD" : "SINGLE TAP"}</small></button>
              {friendlyTypeRoster.map(({ kind, count, spec }) => {
                const typeIds = game.units.filter((unit) => unit.team === "player" && unit.kind === kind).map((unit) => unit.id);
                const typeSelected = typeIds.length > 0 && typeIds.every((id) => game.selectedIds.includes(id)) && game.selectedIds.length === typeIds.length;
                return (
                  <button
                    key={`type-${kind}`}
                    className={`typeSelect ${typeSelected ? "selected" : ""}`}
                    onClick={() => selectUnitType(kind)}
                    aria-label={`Select all ${count} ${spec.name} units`}
                  ><TacticalIcon kind={kind} /><b>{spec.code} ×{count}</b><small>{spec.name}</small></button>
                );
              })}
              <i className="rosterDivider" aria-hidden="true" />
              {game.units.filter((unit) => unit.team === "player").map((unit) => {
                const spec = UNIT_SPECS[unit.kind];
                const groupTag = squadTagForUnit(unit.id);
                return (
                  <button
                    key={unit.id}
                    className={`${game.selectedIds.includes(unit.id) ? "selected" : ""} ${guideStep.action === "wraith" && unit.kind === "wraith" ? "coachTarget" : ""}`}
                    onClick={(event) => selectUnit(unit.id, multiSelect || event.shiftKey)}
                  >
                    {groupTag && <em>{groupTag}</em>}<TacticalIcon kind={unit.kind} /><b>{spec.code}{unit.rank > 0 ? "★".repeat(unit.rank) : ""}</b><span><i style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }} /></span><small>{unit.stance.slice(0, 3)}</small>
                  </button>
                );
              })}
            </div>
            <button className="deckToggle" aria-controls="command-deck" aria-expanded={!deckCollapsed} onClick={() => setDeckCollapsed((value) => !value)}><span>COMMAND</span><b>{deckCollapsed ? "▲" : "▼"}</b></button>
          </div>
        </section>

        {!deckCollapsed && <button className="deckScrim" onClick={() => setDeckCollapsed(true)} aria-label="Close command deck" />}
        <aside id="command-deck" className={`commandDeck ${deckCollapsed ? "collapsed" : ""}`} aria-label="Command deck" aria-hidden={isCompactLayout && deckCollapsed}>
          <button className="mobileDeckHandle" onClick={() => setDeckCollapsed(true)} aria-label="Close command deck"><span><small>COMMAND DECK</small><b>{deckTab === "ops" ? "Operations" : deckTab === "base" ? "Base construction" : deckTab === "forces" ? "Force deployment" : "Research & development"}</b></span><i>⌄</i></button>
          <div className="deckTop">
            <div className="selectionSummary">
              <span><small>ACTIVE SELECTION</small><b>{selectedLabel}</b></span>
              <em>{selectedUnits.length === 1
                ? `${Math.ceil(selectedPrimary.hp)} / ${selectedPrimary.maxHp} HP · ${Math.ceil(selectedPrimary.morale)} MORALE`
                : selectedStructure
                  ? `${Math.ceil(selectedStructure.hp)} / ${selectedStructure.maxHp} INTEGRITY`
                  : selectedNode
                    ? `+${selectedNode.income}/s · 26M FORWARD BUILD GRID`
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
            <button className={deckTab === "ops" ? "active" : ""} onClick={() => openDeckTab("ops")}>OPS</button>
            <button className={deckTab === "base" ? "active" : ""} onClick={() => openDeckTab("base")}>BASE</button>
            <button className={deckTab === "forces" ? "active" : ""} onClick={() => openDeckTab("forces")}>FORCES</button>
            <button className={deckTab === "research" ? "active" : ""} onClick={() => openDeckTab("research")}>R&amp;D <small>{game.researched.length}/6</small></button>
          </div>

          <div className="deckBody">
            {deckTab === "ops" && (
              <div className="opsPanel">
                <section className="operationLaunchpad" aria-label="Operation phase launchpad">
                  <header><span><small>OPERATION LAUNCHPAD · {activeMission.label}</small><b>Build the plan from available assets</b></span><em>RECON → INFILTRATE → ASSAULT</em></header>
                  <div>
                    {operationPhaseReadiness.map((phase, index) => {
                      const selected = phase.assets.length > 0 && phase.assets.every((unit) => game.selectedIds.includes(unit.id)) && game.selectedIds.length === phase.assets.length;
                      return (
                        <button key={phase.key} className={`${selected ? "active" : ""} phase-${phase.key}`} disabled={!phase.assets.length} onClick={() => launchOperationPhase(phase.key as OperationPlanPhase)}>
                          <i>{index + 1}</i><span><b>{phase.label}</b><small>{phase.instruction}</small><em>{phase.assets.length ? phase.assets.map((unit) => UNIT_SPECS[unit.kind].code).join(" · ") : "NO MATCHED ASSETS"}</em></span><strong>{phase.assets.length}</strong>
                        </button>
                      );
                    })}
                  </div>
                </section>
                <section className="squadManager" aria-label="Persistent command groups">
                  <div className="squadManagerHeader">
                    <span><small>COMMAND GROUPS</small><b>Mixed-unit squad control</b></span>
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
                  <button className={game.abilityMode === "focus" ? "armed" : ""} disabled={!selectedUnits.length} onClick={() => armAbility("focus")}>
                    <span>◎</span><b>Focus fire</b><small>One target · O</small>
                  </button>
                  <button className={game.abilityMode === "guard" ? "armed" : ""} disabled={!selectedUnits.length} onClick={() => armAbility("guard")}>
                    <span>⌾</span><b>Guard area</b><small>12m perimeter · H</small>
                  </button>
                  <button className={game.queueMode ? "armed" : ""} disabled={!selectedUnits.length} onClick={toggleQueueMode}>
                    <span>＋</span><b>{game.queueMode ? "Queue on" : "Queue orders"}</b><small>Shift or Q · append</small>
                  </button>
                  <button onClick={cycleFormation}>
                    <span>⋰</span><b>{game.formation} formation</b><small>[ · cycle spacing</small>
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
                      <Image src="/assets/battlefield-v2.webp" alt="" fill unoptimized sizes="132px" />
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
                  <span><small>RECOVERY RUNS</small><b>{game.units.filter((unit) => unit.team === "player" && unit.kind === "mule").length} ACTIVE</b></span>
                  <p>Stipends and controlled relays provide baseline income. Supply Depots unlock Recovery Mules that physically shuttle larger GMP loads home; if the convoy dies, its cargo is lost.</p>
                </div>
                <div className="baseCommandRow">
                  <button className={game.abilityMode === "rally" ? "armed" : ""} onClick={() => armAbility("rally")}>
                    <span>⚑</span><b>Set rally</b><small>New units move here</small>
                  </button>
                  <div className={`structureContext ${selectedStructure ? "active" : ""}`}>
                    <span><small>{selectedStructure ? `SELECTED · LEVEL ${selectedStructure.level ?? 1}` : "FIELD MAINTENANCE"}</small><b>{selectedStructure ? STRUCTURE_LABELS[selectedStructure.kind].name : "Tap a friendly structure"}</b>{selectedStructure && <em>{selectedStructureEffect}</em>}{selectedStructure && <strong>{selectedStructure.upgradeRemaining > 0 ? `UPGRADING · ${Math.ceil(selectedStructure.upgradeRemaining)}s` : selectedStructure.level >= 3 ? "MAXIMUM LEVEL" : STRUCTURE_UPGRADE_COPY[selectedStructure.kind]?.[(selectedStructure.level ?? 1) - 1]}</strong>}</span>
                    <button disabled={!selectedStructure || selectedStructure.hp >= selectedStructure.maxHp} onClick={repairSelectedStructure}>REPAIR</button>
                    <button disabled={!selectedStructure || (selectedStructure.level ?? 1) >= 3 || selectedStructure.upgradeRemaining > 0 || game.resources < structureUpgradeCost(selectedStructure)} onClick={upgradeSelectedStructure}>{selectedStructure && selectedStructure.upgradeRemaining > 0 ? "UPGRADING" : selectedStructure && selectedStructure.level < 3 ? `UPGRADE ${structureUpgradeCost(selectedStructure)}` : "MAX LEVEL"}</button>
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
                <div className="catalogTabs" role="tablist" aria-label="Structure categories">
                  {BUILD_CATEGORIES.map((category) => (
                    <button key={category.key} className={`category-${category.key} ${buildCategory === category.key ? "active" : ""}`} onClick={() => { setBuildCategory(category.key); setInspectedBuild(category.keys[0]); }}>
                      <TacticalIcon kind={category.key} /><span>{category.label}</span><small>{category.keys.length}</small>
                    </button>
                  ))}
                </div>
                <section className="structureIntelPanel" aria-live="polite">
                  <header><span className="productionCode"><TacticalIcon kind={inspectedBuild} /></span><span><small>PRE-CONSTRUCTION INTELLIGENCE</small><b>{BUILD_SPECS[inspectedBuild].name}</b><em>{BUILD_INTEL[inspectedBuild].summary}</em></span></header>
                  <div className="structureIntelStats">
                    <span><small>COST</small><b>{BUILD_SPECS[inspectedBuild].cost} GMP</b></span>
                    <span><small>TIME</small><b>{BUILD_SPECS[inspectedBuild].time}s</b></span>
                    <span><small>FOOTPRINT</small><b>{BUILD_SPECS[inspectedBuild].footprint[0]}×{BUILD_SPECS[inspectedBuild].footprint[1]}</b></span>
                    <span><small>GRID</small><b>{BUILD_SPECS[inspectedBuild].power < 0 ? `+${-BUILD_SPECS[inspectedBuild].power}` : `−${BUILD_SPECS[inspectedBuild].power}`} PWR</b></span>
                  </div>
                  <div className="structureIntelEffects">{BUILD_INTEL[inspectedBuild].effects.map((effect) => <b key={effect}>{effect}</b>)}</div>
                  <p><strong>UNLOCKS {"//"}</strong> {BUILD_INTEL[inspectedBuild].unlocks}</p>
                  <p className="caution"><strong>TRADEOFF {"//"}</strong> {BUILD_INTEL[inspectedBuild].caution}</p>
                  <button
                    className="fabricateStructure"
                    disabled={Boolean(game.structureQueue && !(game.structureQueue.ready && game.structureQueue.key === inspectedBuild)) || Boolean(buildLockReason(game, inspectedBuild)) || (!(game.structureQueue?.ready && game.structureQueue.key === inspectedBuild) && game.resources < BUILD_SPECS[inspectedBuild].cost)}
                    onClick={() => queueStructure(inspectedBuild)}
                  >
                    {game.structureQueue?.ready && game.structureQueue.key === inspectedBuild ? "PLACE READY STRUCTURE" : buildLockReason(game, inspectedBuild) ?? (game.resources >= BUILD_SPECS[inspectedBuild].cost ? `FABRICATE · ${BUILD_SPECS[inspectedBuild].cost} GMP` : fundingLabel(BUILD_SPECS[inspectedBuild].cost))}
                  </button>
                </section>
                <div className="productionGrid">
                  {BUILD_KEYS.filter((key) => BUILD_CATEGORIES.find((category) => category.key === buildCategory)?.keys.includes(key)).map((key) => {
                    const spec = BUILD_SPECS[key];
                    const ready = game.structureQueue?.ready && game.structureQueue.key === key;
                    const lockReason = buildLockReason(game, key);
                    return (
                      <button key={key} className={`catalogItem structureItem cat-${buildCategory} ${inspectedBuild === key ? "inspected" : ""} ${ready ? "ready" : ""} ${lockReason ? "locked" : ""} ${guideStep.buildKey === key ? "coachTarget" : ""}`} aria-pressed={inspectedBuild === key} onClick={() => setInspectedBuild(key)}>
                        <span className="productionCode"><TacticalIcon kind={key} /></span>
                        <span><b>{spec.name}</b><small>{spec.role}</small><em>{lockReason ?? (ready ? "READY TO PLACE" : `${fundingLabel(spec.cost)} · ${spec.power < 0 ? `+${-spec.power}` : `−${spec.power}`} PWR`)}</em></span>
                      </button>
                    );
                  })}
                </div>
                <p className="productionTip">Infrastructure funds and powers the war; production unlocks force branches; support preserves people and information; defenses shape the approach. Supply Depots launch vulnerable Recovery Mule runs, so your economy now lives on the map and can be protected—or cut apart.</p>
              </div>
            )}

            {deckTab === "forces" && (
              <div className="productionPanel">
                <div className="channelHeader"><span><small>DEPLOYMENT CHANNEL</small><b>{game.unitQueue.length ? `${game.unitQueue.length} UNIT${game.unitQueue.length === 1 ? "" : "S"} QUEUED` : "AVAILABLE"}</b></span><em>{supply.used}/{supply.cap} SUPPLY</em></div>
                {game.unitQueue.length > 0 && (
                  <div className="unitQueueRow">
                    {game.unitQueue.map((item, index) => {
                      const channel = UNIT_SPECS[item.key].channel;
                      const activeInChannel = game.unitQueue.findIndex((candidate) => UNIT_SPECS[candidate.key].channel === channel) === index;
                      return <span key={item.id} className={activeInChannel ? "active" : ""}><b>{UNIT_SPECS[item.key].code}</b><small>{activeInChannel ? `${channel.toUpperCase()} · ${Math.ceil(item.remaining)}s` : `${channel.toUpperCase()} · QUEUED`}</small>{activeInChannel && <i style={{ width: `${((item.total - item.remaining) / item.total) * 100}%` }} />}<button onClick={() => cancelUnitQueue(item.id)} aria-label={`Cancel ${UNIT_SPECS[item.key].name} deployment and refund 75 percent`}>×</button></span>;
                    })}
                  </div>
                )}
                <div className="catalogTabs forceCatalog" role="tablist" aria-label="Force categories">
                  {FORCE_CATEGORIES.map((category) => (
                    <button key={category.key} className={`category-${category.key} ${forceCategory === category.key ? "active" : ""}`} onClick={() => setForceCategory(category.key)}>
                      <TacticalIcon kind={category.key} /><span>{category.label}</span><small>{category.keys.length}</small>
                    </button>
                  ))}
                </div>
                <div className="productionGrid forces">
                  {TRAIN_KEYS.filter((key) => FORCE_CATEGORIES.find((category) => category.key === forceCategory)?.keys.includes(key)).map((key) => {
                    const spec = UNIT_SPECS[key];
                    const lockReason = unitLockReason(game, key);
                    const channelQueued = game.unitQueue.filter((item) => UNIT_SPECS[item.key].channel === spec.channel).length;
                    return (
                      <button key={key} className={`catalogItem forceItem cat-${forceCategory} ${lockReason ? "locked" : ""}`} disabled={Boolean(lockReason) || game.resources < spec.cost || channelQueued >= 4} onClick={() => queueUnit(key)}>
                        <span className="productionCode"><TacticalIcon kind={key} /></span>
                        <span><b>{spec.name}</b><small>{spec.role}</small><em>{lockReason ?? `${fundingLabel(spec.cost)} · ${spec.supply} SUPPLY · ${spec.channel.toUpperCase()}`}</em></span>
                      </button>
                    );
                  })}
                </div>
                <p className="productionTip">Combat teams beat exposed infantry; specialists create information, recovery, and sabotage advantages; vehicles add logistics, armor, and breakthrough power. Anti-personnel weapons lose efficiency against armor, while Lancers, Mantis tanks, and anti-armor nests punish vehicles and prototypes.</p>
              </div>
            )}

            {deckTab === "research" && (
              <div className="researchPanel">
                <header className="researchAdvisor">
                  <span className="advisorMark">893</span>
                  <span><small>ORBIT-893 {"//"} SYSTEMS QUARTERMASTER</small><b>Field development network</b><em>Passive upgrades live here—not on the battlefield.</em></span>
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

      {game.checkpoint && game.phase === "playing" && (
        <div className="checkpointOverlay" role="dialog" aria-modal="true" aria-labelledby="checkpoint-title">
          <section className="checkpointPanel">
            <p className="eyebrow">THEATER CHECKPOINT {"//"} {game.checkpoint.operation}</p>
            <div className="checkpointContinue"><b>{activeTheater.title.toUpperCase()} CONTINUES</b><span>OPERATION {game.operationStage + 1} OF {activeOperations.length} UNLOCKED</span></div>
            <span className="checkpointProgress">{activeOperations.map((operation, index) => <i key={operation.name} className={index <= game.operationStage ? "active" : ""}>{index + 1}<small>{operation.name.toUpperCase()}</small></i>)}</span>
            <h2 id="checkpoint-title">{game.checkpoint.title}</h2>
            <p>{game.checkpoint.text}</p>
            <blockquote><b>DAVID SIGNAL {"//"}</b> {game.checkpoint.signal}</blockquote>
            <div className="rewardChoice">
              <p><small>FIELD DECISION</small><b>Choose one advantage for the next operation</b></p>
              <button onClick={() => continueOperation("logistics")}><i>GMP</i><span><b>Black Budget</b><small>Route +700 GMP into the persistent war chest.</small></span></button>
              <button onClick={() => continueOperation("reinforce")}><i>+1</i><span><b>Reinforcement</b><small>Airlift a role matched to the next operation.</small></span></button>
              <button onClick={() => continueOperation("intel")}><i>○</i><span><b>Signal Sweep</b><small>Reveal new contacts and reset security pressure.</small></span></button>
            </div>
            <small className="checkpointNote">Choose one field advantage to resume this same persistent theater. Your FOB, army, veterans, research, GMP, and captured territory persist.</small>
          </section>
        </div>
      )}

      {game.paused && !game.checkpoint && game.phase === "playing" && (
        <div className="pauseBanner"><span><b>TACTICAL PAUSE</b><small>Map, select, build, and queue orders while the field is frozen.</small></span><button onClick={() => setGame((current) => ({ ...current, paused: false }))}>RESUME ▶</button></div>
      )}

      {(game.phase === "won" || game.phase === "lost") && (
        <div className={`endOverlay ${game.phase}`}>
          <section className={`endPanel ${game.phase === "lost" ? "missionFailedPanel" : ""}`}>
            <p className="eyebrow">{game.phase === "won" ? nextTheaterId(game.theaterId) ? `THEATER COMPLETE // ${activeTheater.title.toUpperCase()} SECURED` : `CAMPAIGN COMPLETE // ${CAMPAIGN_OPERATION_COUNT} OPERATIONS RESOLVED` : `TACTICAL NETWORK // ${activeTheater.title.toUpperCase()} · OPERATION ${game.operationStage + 1}`}</p>
            {game.phase === "lost" ? (
              <>
                <div className="failureCode"><small>FORWARD COMMAND</small><b>MISSION</b><strong>FAILED</strong><i>NO CARRIER</i></div>
                <p className="failureCause"><b>ORBIT-893 {"//"}</b> Shadow, respond. The command net is gone. Hostile forces destroyed Forward Command; without a construction yard, the theater cannot continue.</p>
                <div className="codecFailure"><span>SS</span><p><small>SHADOW SNAKE {"//"} SIGNAL LOST</small><b>THE BASE WAS THE MISSION.</b><em>Recover from the last secured operation, rebuild the perimeter, and cut the enemy response gate before the next siege wave.</em></p><span>893</span></div>
              </>
            ) : (
              <>
                <h2>{nextTheaterId(game.theaterId) ? `${activeTheater.title} is secure.` : "The order ends here."}</h2>
                <p>{activeTheater.victory}</p>
                {!nextTheaterId(game.theaterId) && <div className="campaignResolution"><small>THE INHERITANCE WAR · 1987–1990</small><b>Shadow Command survives only as the people, evidence, routes, and limits built across the campaign.</b><span>This is a complete campaign victory, not a hidden checkpoint. Return to Command Center to review the secured theaters, Doctrine, and campaign record—or replay any theater with a different strategy.</span></div>}
              </>
            )}
            <div className="rankBlock"><strong>{missionRank}</strong><span><b>{formatTime(game.elapsed)}</b><small>TIME</small></span><span><b>{game.detections}</b><small>ALERTS</small></span><span><b>{game.losses}</b><small>LOSSES</small></span><span><b>{game.staff}</b><small>RECOVERED</small></span></div>
            <div className="endActions">
              {game.phase === "lost" && <button className="primaryAction retryCheckpoint" onClick={retryLastOperation}><span>{game.operationStage > 0 ? `Retry Operation ${game.operationStage + 1}` : "Restart Operation 1"}</span><b>↻</b></button>}
              {game.phase === "won" && nextTheaterId(game.theaterId) && <button className="primaryAction" onClick={advanceToNextTheater}><span>Advance to {theaterFor(nextTheaterId(game.theaterId) as TheaterId).title}</span><b>›</b></button>}
              {game.phase === "won" && !nextTheaterId(game.theaterId) && <button className="primaryAction" onClick={() => restart("menu")}><span>Review completed campaign</span><b>›</b></button>}
              <button className={game.phase === "won" ? "secondaryAction" : "secondaryAction"} onClick={() => restart("playing")}><span>{game.phase === "won" ? "Run theater again" : "Restart full theater"}</span></button>
              <button className="secondaryAction" onClick={() => restart("menu")}>Command Center</button>
            </div>
          </section>
        </div>
      )}

      {helpOpen && (
        <div className="helpOverlay" role="dialog" aria-modal="true" aria-labelledby="manual-title">
          <section className="helpPanel">
            <button className="closeHelp" onClick={closeManual} aria-label="Close field manual">×</button>
            <p className="eyebrow">FIELD MANUAL {"//"} CORE LOOP</p>
            <h2 id="manual-title">Win the information war first.</h2>
            <div className="manualGrid">
              <article><b>00</b><span><strong>Follow the live strategy card</strong>The battlefield guide adapts to your current situation, highlights the next target or system, explains the payoff, and can select the right command element for you.</span></article>
              <article><b>01</b><span><strong>Select like an RTS</strong>Drag a box around units with a mouse, double-click a unit, tap a roster TYPE chip, or press T to select every matching unit. Use MULTI on touch, then SET Alpha, Bravo, or Charlie for instant recall and element filtering.</span></article>
              <article><b>02</b><span><strong>Choose posture</strong>Stealth is quiet and slow. Hold defends without chasing. Assault automatically closes and engages.</span></article>
              <article><b>03</b><span><strong>Control the economy</strong>Capture supply rings for baseline income, then build a Supply Depot and Recovery Mule. The Mule loads larger GMP shipments at controlled relays and only banks them after reaching home—escort it or lose the cargo.</span></article>
              <article><b>04</b><span><strong>Build a production ecosystem</strong>Infrastructure powers and funds the base; production opens infantry, vehicles, and prototypes; support preserves people and information; defenses shape enemy approaches. Every structure has a snapped footprint and three upgrade levels.</span></article>
              <article><b>05</b><span><strong>Interrupt the alarm</strong>A patrol sighting starts a visible transmission instead of an instant full alert. Break sight, sedate the caller, eliminate it, or jam hostile relays before ALARM reaches 100.</span></article>
              <article><b>06</b><span><strong>Use terrain and morale</strong>Hard cover cuts damage and suppression; concealment masks signatures; elevation improves vision and fire; hazards slow and expose. Sustained fire shakes, pins, and can break units until medics, hospitals, or time restore morale.</span></article>
              <article><b>07</b><span><strong>Stage a real breach</strong>Phased breach sends infiltrators immediately, assault four seconds later, and support at seven. Use element filters when you want to control each wave manually.</span></article>
              <article><b>08</b><span><strong>Develop the force</strong>Field R&amp;D buys theater upgrades with GMP. Campaign Doctrine is longer-form: operations and theaters earn Command XP, every 500 XP grants a Doctrine Point, and deeper tiers open strategic side-grades.</span></article>
              <article><b>09</b><span><strong>Read enemy doctrine</strong>Scout raids hunt sensors, saboteurs target power and logistics, assault groups attack production, and siege teams dismantle defenses. The raid clock names the next pattern.</span></article>
              <article><b>10</b><span><strong>Preserve veterans</strong>Surviving teams gain combat ranks, damage bonuses, and maximum health. Repair or salvage structures and cancel queues when the plan changes.</span></article>
            </div>
            <p className="manualTip"><b>The field is paused while this manual is open.</b> On mobile, TYPE selects every unit matching your current team and MULTI makes roster taps additive. On desktop, Shift-click adds units; Ctrl+1/2/3 assigns groups; 1/2/3 recalls them. A selects all, T selects the current type, G arms attack-move, X stops, F falls back, Z/C/V changes posture, and Space or P pauses.</p>
            <button className="primaryAction" onClick={closeManual}><span>Return to command</span><b>›</b></button>
          </section>
        </div>
      )}
    </main>
  );
}
