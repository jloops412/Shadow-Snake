/**
 * Shared tactical-causality authority.
 *
 * The campaign already owns story, operation order, and terminal states. This
 * module gives each theater a deterministic field grammar without forking that
 * campaign graph: readable terrain, a repeatable enemy doctrine, and pure
 * morale/alarm rules that can be tested independently of React.
 */

const zone = (id, type, label, x, y, w, h) => ({ id, type, label, x, y, w, h });

export const THEATER_TACTICS = {
  "sable-crown": {
    weather: "Snow squalls · clean sight between gusts",
    rule: "Pine shadow conceals movement; ice berms provide hard cover.",
    raidCycle: ["scout", "assault", "sabotage", "siege"],
    zones: [
      zone("pine-shadow", "concealment", "PINE SHADOW", 17, 68, 19, 13),
      zone("ice-berm", "hard-cover", "ICE BERM", 39, 53, 18, 11),
      zone("radar-rise", "elevation", "RADAR RISE", 57, 38, 15, 9),
    ],
  },
  "harrow-spine": {
    weather: "Mountain storm · signatures collapse in the wind",
    rule: "Wind cuts conceal infantry; exposed ridges reward observers.",
    raidCycle: ["scout", "sabotage", "assault", "siege"],
    zones: [
      zone("wind-cut", "concealment", "WIND CUT", 13, 60, 22, 12),
      zone("stone-switchback", "hard-cover", "STONE SWITCHBACK", 40, 46, 21, 10),
      zone("knife-ridge", "elevation", "KNIFE RIDGE", 66, 27, 18, 9),
    ],
  },
  "st-heliot": {
    weather: "Coastal rain · civilians and mercenaries share the grid",
    rule: "Dense blocks provide cover while utility corridors expose movement.",
    raidCycle: ["sabotage", "scout", "assault", "sabotage"],
    zones: [
      zone("market-block", "hard-cover", "MARKET BLOCK", 19, 65, 20, 14),
      zone("utility-corridor", "hazard", "UTILITY CORRIDOR", 45, 49, 15, 17),
      zone("hotel-roofline", "elevation", "HOTEL ROOFLINE", 67, 29, 17, 11),
    ],
  },
  "kingdom-failed": {
    weather: "Salt fog · corroded wreckage breaks every approach",
    rule: "Ship hulks are hard cover; flooded slips slow heavy movement.",
    raidCycle: ["scout", "siege", "sabotage", "assault"],
    zones: [
      zone("hulk-yard", "hard-cover", "HULK YARD", 15, 70, 24, 12),
      zone("flooded-slip", "hazard", "FLOODED SLIP", 43, 51, 18, 14),
      zone("crane-gantry", "elevation", "CRANE GANTRY", 70, 24, 15, 10),
    ],
  },
  "black-vault": {
    weather: "Brownout · darkness favors quiet teams and passive sensors",
    rule: "Unpowered stacks conceal; live conduits slow and expose intruders.",
    raidCycle: ["sabotage", "scout", "sabotage", "assault"],
    zones: [
      zone("dark-stack", "concealment", "DARK STACK", 16, 63, 21, 15),
      zone("live-conduit", "hazard", "LIVE CONDUIT", 43, 47, 17, 13),
      zone("archive-overlook", "elevation", "ARCHIVE OVERLOOK", 69, 27, 16, 10),
    ],
  },
  "vostok-wound": {
    weather: "Whiteout bands · armored pursuit owns the open snow",
    rule: "Drifts conceal infantry; rail revetments blunt pursuit fire.",
    raidCycle: ["scout", "assault", "siege", "assault"],
    zones: [
      zone("snow-drift", "concealment", "SNOW DRIFT", 12, 66, 24, 12),
      zone("rail-revetment", "hard-cover", "RAIL REVETMENT", 42, 49, 22, 10),
      zone("signal-tower", "elevation", "SIGNAL TOWER", 73, 23, 14, 11),
    ],
  },
  "caspian-wake": {
    weather: "Sea haze · interdiction craft probe exposed logistics",
    rule: "Reed beds conceal light teams; tidal flats slow armor and convoys.",
    raidCycle: ["scout", "sabotage", "assault", "sabotage"],
    zones: [
      zone("reed-bed", "concealment", "REED BED", 15, 64, 23, 15),
      zone("tidal-flat", "hazard", "TIDAL FLAT", 44, 48, 20, 14),
      zone("derrick-deck", "elevation", "DERRICK DECK", 72, 25, 15, 11),
    ],
  },
  "contract-coast": {
    weather: "Humid night · contract forces attack multiple utilities",
    rule: "Service blocks provide cover; burning utilities punish static blobs.",
    raidCycle: ["sabotage", "assault", "sabotage", "siege"],
    zones: [
      zone("service-block", "hard-cover", "SERVICE BLOCK", 18, 67, 21, 13),
      zone("burning-utility", "hazard", "BURNING UTILITY", 45, 48, 18, 15),
      zone("port-control", "elevation", "PORT CONTROL", 70, 27, 16, 10),
    ],
  },
  "zanzibar-corridor": {
    weather: "Heat shimmer · long sight lines expose careless movement",
    rule: "Cuttings provide cover; hot ballast slows infantry off the rail road.",
    raidCycle: ["scout", "assault", "siege", "siege"],
    zones: [
      zone("rock-cut", "hard-cover", "ROCK CUT", 14, 63, 22, 12),
      zone("hot-ballast", "hazard", "HOT BALLAST", 42, 46, 22, 16),
      zone("water-tower", "elevation", "WATER TOWER", 72, 24, 14, 12),
    ],
  },
  "perfect-son": {
    weather: "Sterile daylight · mirrored doctrine anticipates standard routes",
    rule: "Training walls provide cover; biometric lanes expose repeated plans.",
    raidCycle: ["scout", "sabotage", "assault", "sabotage"],
    zones: [
      zone("training-wall", "hard-cover", "TRAINING WALL", 18, 64, 20, 13),
      zone("biometric-lane", "hazard", "BIOMETRIC LANE", 43, 46, 18, 17),
      zone("observer-gallery", "elevation", "OBSERVER GALLERY", 69, 26, 17, 11),
    ],
  },
  "fox-line": {
    weather: "Border smoke · shared fronts make identification unreliable",
    rule: "Trenches harden infantry; smoke lanes conceal flanking teams.",
    raidCycle: ["assault", "scout", "sabotage", "assault"],
    zones: [
      zone("forward-trench", "hard-cover", "FORWARD TRENCH", 14, 68, 25, 11),
      zone("smoke-lane", "concealment", "SMOKE LANE", 43, 50, 19, 13),
      zone("border-watch", "elevation", "BORDER WATCH", 71, 25, 16, 10),
    ],
  },
  "fathers-grave": {
    weather: "Underground dust · false traffic leaks through the archive",
    rule: "Vault ribs provide cover; collapsed corridors slow every chassis.",
    raidCycle: ["sabotage", "siege", "scout", "sabotage"],
    zones: [
      zone("vault-rib", "hard-cover", "VAULT RIB", 16, 66, 22, 13),
      zone("collapse", "hazard", "COLLAPSED CORRIDOR", 43, 48, 20, 14),
      zone("archive-bridge", "elevation", "ARCHIVE BRIDGE", 70, 26, 16, 11),
    ],
  },
  "no-mans-haven": {
    weather: "Retaliatory front · every regional network is under pressure",
    rule: "Assembly cover, evacuation concealment, and launch hazards overlap.",
    raidCycle: ["scout", "sabotage", "assault", "siege"],
    zones: [
      zone("assembly-barricade", "hard-cover", "ASSEMBLY BARRICADE", 14, 67, 24, 12),
      zone("evacuation-route", "concealment", "EVACUATION ROUTE", 42, 49, 20, 13),
      zone("launch-exclusion", "hazard", "LAUNCH EXCLUSION", 69, 25, 18, 13),
    ],
  },
};

const DEFAULT_TACTICS = THEATER_TACTICS["sable-crown"];

export function theaterTactics(theaterId) {
  return THEATER_TACTICS[theaterId] ?? DEFAULT_TACTICS;
}

export function terrainEffectAt(theaterId, point) {
  const match = theaterTactics(theaterId).zones.find((candidate) =>
    point.x >= candidate.x && point.x <= candidate.x + candidate.w &&
    point.y >= candidate.y && point.y <= candidate.y + candidate.h,
  );
  const base = {
    zone: match ?? null,
    damageTaken: 1,
    signature: 1,
    speed: 1,
    outgoingDamage: 1,
    vision: 1,
    suppressionTaken: 1,
  };
  if (!match) return base;
  if (match.type === "concealment") return { ...base, signature: 0.48, suppressionTaken: 0.82 };
  if (match.type === "hard-cover") return { ...base, damageTaken: 0.66, suppressionTaken: 0.5 };
  if (match.type === "elevation") return { ...base, outgoingDamage: 1.12, vision: 1.22 };
  if (match.type === "hazard") return { ...base, signature: 1.18, speed: 0.7, suppressionTaken: 1.12 };
  return base;
}

export function moraleBand(morale) {
  if (morale <= 15) return "broken";
  if (morale <= 34) return "pinned";
  if (morale <= 64) return "shaken";
  return "steady";
}

export function suppressionMoraleLoss(attackerKind, targetTerrainType) {
  const base = attackerKind === "foxhound" || attackerKind === "hunter" ? 18
    : attackerKind === "viper" || attackerKind === "jackal" ? 12
      : attackerKind === "mantis" || attackerKind === "lancer" ? 16
        : 7;
  return Math.round(base * (targetTerrainType === "hard-cover" ? 0.5 : targetTerrainType === "concealment" ? 0.82 : 1));
}

export function alarmBuildRate({ linked, sourceKind, difficulty }) {
  const difficultyRate = difficulty === "guided" ? 0.72 : difficulty === "hardline" ? 1.2 : 1;
  const sourceRate = sourceKind === "scout" ? 23 : sourceKind === "hunter" ? 17 : 14;
  return sourceRate * (linked ? 1 : 0.42) * difficultyRate;
}

export function raidDoctrineFor(theaterId, wave) {
  const cycle = theaterTactics(theaterId).raidCycle;
  return cycle[Math.max(0, wave - 1) % cycle.length];
}

export function raidComposition(doctrine, count, wave = 1) {
  const safeCount = Math.max(1, count);
  const tables = {
    scout: ["scout", "guard", "guard", "hunter"],
    sabotage: ["scout", "guard", "hunter", "guard"],
    assault: ["hunter", "guard", "hunter", "guard"],
    siege: ["hunter", "hunter", "guard", "scout"],
  };
  const table = tables[doctrine] ?? tables.assault;
  const offset = wave >= 4 && doctrine === "siege" ? 1 : 0;
  return Array.from({ length: safeCount }, (_, index) => table[(index + offset) % table.length]);
}
