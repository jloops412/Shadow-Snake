import type { ReactNode } from "react";

/**
 * Battlefield art is intentionally different from the thin command-deck
 * glyphs.  These are compact, painted-vector "miniatures": enough material,
 * equipment and pose to feel like real field personnel, while remaining
 * unmistakable when they are 40–60px tall on a phone.
 *
 * They are original designs.  The visual language is late-Cold-War covert
 * hardware + readable real-time-strategy silhouettes; it does not reproduce
 * an existing game's characters, vehicles, insignia, or architecture.
 */

type Team = "player" | "enemy";

type Palette = {
  cloth: string;
  armor: string;
  shadow: string;
  metal: string;
  accent: string;
  glow: string;
  trim: string;
};

const PALETTES: Record<Team, Palette> = {
  player: {
    cloth: "#66784e",
    armor: "#2c3c2d",
    shadow: "#101814",
    metal: "#9ca999",
    accent: "#b9c278",
    glow: "#72e2cb",
    trim: "#c2aa69",
  },
  enemy: {
    cloth: "#7b4043",
    armor: "#381d26",
    shadow: "#160d13",
    metal: "#aaa2a0",
    accent: "#d88a70",
    glow: "#f05e50",
    trim: "#b7865e",
  },
};

const VEHICLES = new Set(["raven", "weasel", "mule", "jackal", "mantis", "scout", "basilisk"]);
const STRUCTURES = new Set([
  "hq", "generator", "barracks", "vehicleBay", "supplyDepot", "rdLab", "hospital", "repairBay", "comms",
  "wall", "gate", "sentry", "missileNest", "sensor", "enemyRadar", "enemyRelay", "enemyUplink", "enemyTurret", "enemyGate",
]);

function Dot({ x, y, color, r = 2 }: { x: number; y: number; color: string; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={color} />;
}

function SoldierFrame({ palette, equipment }: { palette: Palette; equipment: ReactNode }) {
  return (
    <>
      <ellipse cx="50" cy="79" rx="22" ry="7" fill={palette.shadow} opacity=".75" />
      <path d="m36 79 5-29 9-9 10 9 7 29-10 5-7-11-7 11Z" fill={palette.cloth} stroke={palette.shadow} strokeWidth="3" strokeLinejoin="round" />
      <path d="m39 51 11-8 12 8 3 20-15 3-14-4Z" fill={palette.armor} stroke={palette.shadow} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="m43 54 14 0m-15 8 16 0m-4 9v8" stroke={palette.metal} strokeWidth="2" opacity=".58" />
      <path d="m42 50-11 13 5 5 10-8m16-10 11 13-5 5-9-8" fill="none" stroke={palette.cloth} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 39q1-15 12-15t12 15v8H38Z" fill={palette.armor} stroke={palette.shadow} strokeWidth="3" strokeLinejoin="round" />
      <path d="M42 35h16l-2 6H43Z" fill={palette.metal} opacity=".85" />
      <path d="M45 28h10" stroke={palette.trim} strokeWidth="3" strokeLinecap="round" />
      {equipment}
    </>
  );
}

function InfantrySprite({ kind, palette }: { kind: string; palette: Palette }) {
  const rifle = <><path d="m55 55 27-20 4 5-25 23Z" fill={palette.shadow} stroke={palette.metal} strokeWidth="2" /><path d="m72 42 11-10" stroke={palette.metal} strokeWidth="2" /><Dot x={60} y={52} color={palette.glow} r={1.5} /></>;
  switch (kind) {
    case "wraith":
      return <SoldierFrame palette={palette} equipment={<><path d="M35 29q15-19 30 0l-4 10H39Z" fill={palette.shadow} /><path d="m42 39 24 17-5 6-25-14Z" fill={palette.shadow} stroke={palette.metal} strokeWidth="2" /><path d="m62 56 18 4" stroke={palette.metal} strokeWidth="2" /><Dot x={48} y={35} color={palette.glow} /></>} />;
    case "viper":
      return <SoldierFrame palette={palette} equipment={<><path d="M35 29h30l-5 12H40Z" fill={palette.armor} /><path d="m52 54 28-23 5 5-27 26Z" fill={palette.shadow} stroke={palette.metal} strokeWidth="2" /><path d="m73 41 13-11" stroke={palette.metal} strokeWidth="2" /><Dot x={60} y={54} color={palette.glow} /></>} />;
    case "specter":
      return <SoldierFrame palette={palette} equipment={<><path d="M30 47 19 36l-2-16 12 8 8 16Z" fill={palette.metal} stroke={palette.shadow} strokeWidth="2" /><path d="M21 23c-8 8-8 18 0 26m4-30c-11 11-11 25 0 36" fill="none" stroke={palette.glow} strokeWidth="2" /><path d="m54 57 21-14 4 5-20 17Z" fill={palette.shadow} stroke={palette.metal} strokeWidth="2" /><Dot x={22} y={31} color={palette.glow} /></>} />;
    case "lancer":
      return <SoldierFrame palette={palette} equipment={<><path d="m41 53 33-23 10 12-34 25Z" fill={palette.metal} stroke={palette.shadow} strokeWidth="3" /><path d="m72 30 12-8 6 8-11 12Z" fill={palette.accent} stroke={palette.shadow} strokeWidth="2" /><path d="m44 57 20-14" stroke={palette.glow} strokeWidth="2" /></>} />;
    case "medic":
      return <SoldierFrame palette={palette} equipment={<><path d="M62 58 78 53l8 10-18 9Z" fill={palette.metal} stroke={palette.shadow} strokeWidth="2" /><path d="M76 57v10m-5-5h10" stroke={palette.glow} strokeWidth="3" /><path d="M46 55h9m-4-5v10" stroke={palette.glow} strokeWidth="3" /></>} />;
    case "engineer":
      return <SoldierFrame palette={palette} equipment={<><path d="m63 53 15-17 6 6-17 17Z" fill={palette.metal} stroke={palette.shadow} strokeWidth="2" /><path d="m75 33 12-10m-13 11 8 8" stroke={palette.metal} strokeWidth="5" strokeLinecap="round" /><path d="M35 58 23 66l7 12 13-10Z" fill={palette.trim} stroke={palette.shadow} strokeWidth="2" /></>} />;
    case "ghost":
      return <SoldierFrame palette={palette} equipment={<><path d="M32 39q18-15 36 0l8 35-17 7-9-13-11 13-16-7Z" fill={palette.shadow} opacity=".92" /><path d="m40 55 36-18 4 5-33 23Z" fill={palette.metal} stroke={palette.shadow} strokeWidth="2" /><circle cx="68" cy="43" r="4" fill={palette.glow} /><path d="M39 36h22" stroke={palette.trim} strokeWidth="2" /></>} />;
    case "hacker":
      return <SoldierFrame palette={palette} equipment={<><path d="M21 52h22v17H21Z" fill={palette.metal} stroke={palette.shadow} strokeWidth="2" /><path d="m24 56 15 0m-15 5 9 0" stroke={palette.glow} strokeWidth="2" /><path d="m59 55 17-18 5 5-15 20Z" fill={palette.shadow} stroke={palette.metal} strokeWidth="2" /><Dot x={27} y={56} color={palette.glow} r={1.2} /></>} />;
    case "foxhound":
      return <SoldierFrame palette={palette} equipment={<><path d="M33 30h34l-4 16H38Z" fill={palette.armor} stroke={palette.shadow} strokeWidth="3" /><path d="m44 58 34-18 7 10-35 20Z" fill={palette.shadow} stroke={palette.metal} strokeWidth="3" /><path d="m73 45 14-7" stroke={palette.metal} strokeWidth="4" /><Dot x={57} y={58} color={palette.glow} r={2} /></>} />;
    case "guard":
      return <SoldierFrame palette={palette} equipment={rifle} />;
    case "hunter":
      return <SoldierFrame palette={palette} equipment={<><path d="M32 29h36l-4 17H36Z" fill={palette.armor} stroke={palette.shadow} strokeWidth="3" /><path d="m50 55 30-16 6 8-30 20Z" fill={palette.shadow} stroke={palette.metal} strokeWidth="3" /><Dot x={61} y={54} color={palette.glow} r={2} /></>} />;
    default:
      return <SoldierFrame palette={palette} equipment={rifle} />;
  }
}

function VehicleSprite({ kind, palette }: { kind: string; palette: Palette }) {
  if (kind === "raven" || kind === "scout") {
    return <><ellipse cx="50" cy="70" rx="30" ry="8" fill={palette.shadow} opacity=".72" /><path d="m50 22 14 17 24 6-15 12 9 20-23-10-9 12-9-12-23 10 9-20-15-12 24-6Z" fill={palette.armor} stroke={palette.shadow} strokeWidth="3" strokeLinejoin="round" /><path d="m50 34 7 16-7 12-7-12Z" fill={palette.metal} /><circle cx="50" cy="48" r="5" fill={palette.glow} /><path d="M24 47h52M34 57l-8 13m40-13 8 13" stroke={palette.accent} strokeWidth="2" /></>;
  }
  if (kind === "basilisk") {
    return <><ellipse cx="50" cy="83" rx="38" ry="9" fill={palette.shadow} opacity=".82" /><path d="M22 74 27 38l14-15h18l15 15 5 36-13 9H35Z" fill={palette.armor} stroke={palette.shadow} strokeWidth="4" strokeLinejoin="round" /><path d="m31 39-11-23 17 5 13 16 13-16 17-5-11 23" fill={palette.metal} stroke={palette.shadow} strokeWidth="3" /><path d="M38 52h24l13 12-13 8H38L25 64Z" fill={palette.shadow} stroke={palette.metal} strokeWidth="2" /><path d="m50 52 0-34 8 0 0 34" fill={palette.metal} stroke={palette.shadow} strokeWidth="2" /><path d="M28 74 13 86m59-12 15 12" stroke={palette.metal} strokeWidth="6" strokeLinecap="round" /><Dot x={50} y={64} color={palette.glow} r={4} /><Dot x={38} y={45} color={palette.glow} r={2} /><Dot x={62} y={45} color={palette.glow} r={2} /></>;
  }
  if (kind === "mule") {
    return <><ellipse cx="50" cy="78" rx="32" ry="8" fill={palette.shadow} opacity=".76" /><path d="M16 60 28 43h35l17 17-8 16H25Z" fill={palette.cloth} stroke={palette.shadow} strokeWidth="3" /><path d="M23 54h29v18H23Zm33-7h14v25H56Z" fill={palette.metal} stroke={palette.shadow} strokeWidth="2" /><path d="M29 50v-9h24v9" stroke={palette.accent} strokeWidth="3" /><circle cx="29" cy="77" r="8" fill={palette.shadow} stroke={palette.metal} strokeWidth="3" /><circle cx="66" cy="77" r="8" fill={palette.shadow} stroke={palette.metal} strokeWidth="3" /><Dot x={65} y={55} color={palette.glow} /></>;
  }
  const heavy = kind === "mantis";
  const ifv = kind === "jackal";
  return <><ellipse cx="50" cy="80" rx={heavy ? 38 : 34} ry="9" fill={palette.shadow} opacity=".78" /><path d={heavy ? "M14 68 27 43h46l13 25-10 13H24Z" : "M17 67 28 45h42l13 22-9 13H25Z"} fill={palette.cloth} stroke={palette.shadow} strokeWidth="3" strokeLinejoin="round" /><path d={heavy ? "M31 44 39 29h24l10 15Z" : "M34 45 41 32h19l10 13Z"} fill={palette.armor} stroke={palette.shadow} strokeWidth="3" /><path d={heavy ? "m51 33 24-17 5 7-23 19Z" : "m51 39 21-13 5 6-22 15Z"} fill={palette.metal} stroke={palette.shadow} strokeWidth="2" /><path d="M27 69h47M30 76h40" stroke={palette.metal} strokeWidth="3" opacity=".72" /><circle cx="28" cy="80" r="7" fill={palette.shadow} stroke={palette.metal} strokeWidth="3" /><circle cx="71" cy="80" r="7" fill={palette.shadow} stroke={palette.metal} strokeWidth="3" />{ifv && <><path d="M33 38 24 25h12l7 12" fill={palette.armor} stroke={palette.shadow} strokeWidth="2" /><Dot x={28} y={30} color={palette.glow} /></>}<Dot x={43} y={50} color={palette.glow} /></>;
}

function StructureSprite({ kind, palette }: { kind: string; palette: Palette }) {
  const enemy = kind.startsWith("enemy");
  const roof = enemy ? palette.armor : palette.cloth;
  if (kind === "wall") return <><ellipse cx="50" cy="75" rx="40" ry="8" fill={palette.shadow} opacity=".7" /><path d="M10 67V43h12V32h14v11h14V32h14v11h14V32h12v35Z" fill={roof} stroke={palette.shadow} strokeWidth="3" /><path d="M10 58h80M28 43v24m22-24v24m22-24v24" stroke={palette.metal} strokeWidth="2" /></>;
  if (kind === "gate" || kind === "enemyGate") return <><ellipse cx="50" cy="76" rx="39" ry="8" fill={palette.shadow} opacity=".72" /><path d="M10 71V31h26v40m28 0V31h26v40Z" fill={roof} stroke={palette.shadow} strokeWidth="3" /><path d="M36 71V48h28v23M10 42h26m28 0h26" stroke={palette.metal} strokeWidth="3" /><Dot x={25} y={37} color={palette.glow} /><Dot x={75} y={37} color={palette.glow} /></>;
  if (kind === "comms" || kind === "enemyRelay" || kind === "enemyRadar") return <><ellipse cx="50" cy="79" rx="27" ry="7" fill={palette.shadow} opacity=".72" /><path d="M28 75h44L64 50H36Z" fill={roof} stroke={palette.shadow} strokeWidth="3" /><path d="M50 53V13m-16 62 16-22 16 22M40 32l10-19 10 19" fill="none" stroke={palette.metal} strokeWidth="4" strokeLinejoin="round" />{kind === "enemyRadar" ? <><path d="M31 28q19-16 38 0-19 16-38 0Z" fill={palette.armor} stroke={palette.shadow} strokeWidth="2" /><Dot x={50} y={28} color={palette.glow} r={3} /></> : <><path d="M30 22c-12 10-12 25 0 35m40-35c12 10 12 25 0 35" fill="none" stroke={palette.glow} strokeWidth="2" /><Dot x={50} y={15} color={palette.glow} r={2.5} /></>}</>;
  if (kind === "sentry" || kind === "enemyTurret" || kind === "missileNest" || kind === "sensor") return <><ellipse cx="50" cy="78" rx="28" ry="7" fill={palette.shadow} opacity=".72" /><path d="M25 74 31 54h38l6 20Z" fill={roof} stroke={palette.shadow} strokeWidth="3" /><path d="M39 54V38h22v16" fill={palette.armor} stroke={palette.shadow} strokeWidth="2" />{kind === "missileNest" ? <><path d="m38 41 9-24 8 3-5 24m7-3 9-24 8 3-7 25" fill={palette.metal} stroke={palette.shadow} strokeWidth="2" /></> : kind === "sensor" ? <><path d="M34 36q16-16 32 0-16 13-32 0Z" fill={palette.metal} stroke={palette.shadow} strokeWidth="2" /><Dot x={50} y={36} color={palette.glow} r={3} /></> : <><path d="m53 39 28-17 5 7-28 19Z" fill={palette.metal} stroke={palette.shadow} strokeWidth="2" /><Dot x={56} y={47} color={palette.glow} /></>}</>;
  if (kind === "generator") return <><ellipse cx="50" cy="80" rx="34" ry="8" fill={palette.shadow} opacity=".72" /><path d="M18 72V38l15-13h34l15 13v34Z" fill={roof} stroke={palette.shadow} strokeWidth="3" /><circle cx="50" cy="50" r="17" fill={palette.armor} stroke={palette.metal} strokeWidth="3" /><path d="m50 34 5 13-5 0 5 17-12-18 5 0Z" fill={palette.glow} /><path d="M29 72V60h15v12m12 0V57h15v15" stroke={palette.metal} strokeWidth="3" /></>;
  if (kind === "hospital") return <><ellipse cx="50" cy="80" rx="37" ry="8" fill={palette.shadow} opacity=".72" /><path d="M13 73V37l15-14h44l15 14v36Z" fill={roof} stroke={palette.shadow} strokeWidth="3" /><path d="M28 73V54h18v19m10 0V52h16v21" stroke={palette.metal} strokeWidth="3" /><path d="M45 30h10v8h8v10h-8v8H45v-8h-8V38h8Z" fill={palette.glow} /></>;
  if (kind === "repairBay" || kind === "vehicleBay") return <><ellipse cx="50" cy="80" rx="39" ry="8" fill={palette.shadow} opacity=".75" /><path d="M10 74V36l16-15h48l16 15v38Z" fill={roof} stroke={palette.shadow} strokeWidth="3" /><path d="M18 74V50h64v24M20 42h60M32 50v24m36-24v24" stroke={palette.metal} strokeWidth="3" />{kind === "repairBay" ? <path d="m62 28 13 13-9 9 9 9-15 15-9-9-15 15-9-9 15-15-9-9 15-15 9 9Z" fill={palette.glow} opacity=".9" /> : <><path d="M30 30v15m12-18v18m12-18v18m12-15v15" stroke={palette.glow} strokeWidth="3" /><path d="M46 58h20l7 11H40Z" fill={palette.armor} stroke={palette.shadow} strokeWidth="2" /></>}</>;
  if (kind === "supplyDepot") return <><ellipse cx="50" cy="80" rx="39" ry="8" fill={palette.shadow} opacity=".74" /><path d="M12 74V39l13-14h50l13 14v35Z" fill={roof} stroke={palette.shadow} strokeWidth="3" /><path d="M22 74V53h22v21m12-21h22v21" stroke={palette.metal} strokeWidth="3" /><path d="M26 34h15v12H26Zm32 0h15v12H58Z" fill={palette.armor} stroke={palette.metal} strokeWidth="2" /><Dot x={33} y={40} color={palette.glow} /><Dot x={65} y={40} color={palette.glow} /></>;
  if (kind === "rdLab") return <><ellipse cx="50" cy="80" rx="36" ry="8" fill={palette.shadow} opacity=".72" /><path d="M14 73V38l15-14h42l15 14v35Z" fill={roof} stroke={palette.shadow} strokeWidth="3" /><path d="M25 73V53h50v20M31 32v22m-8-11h16m22-10v20m-6-11h12" stroke={palette.metal} strokeWidth="3" /><circle cx="67" cy="48" r="7" fill={palette.glow} opacity=".9" /></>;
  if (kind === "hq" || kind === "enemyUplink") return <><ellipse cx="50" cy="81" rx="41" ry="9" fill={palette.shadow} opacity=".8" /><path d="M9 74V37l15-13 10 7 16-20 16 20 10-7 15 13v37Z" fill={roof} stroke={palette.shadow} strokeWidth="4" strokeLinejoin="round" /><path d="M20 74V54h18v20m24 0V50h18v24M50 11v27m-9-8 9-19 9 19" stroke={palette.metal} strokeWidth="3" /><path d="M50 11V5" stroke={palette.glow} strokeWidth="4" /><Dot x={50} y={5} color={palette.glow} r={3} /></>;
  if (kind === "enemyRelay") return <></>;
  // Barracks and the default field facility share a low, functional silhouette.
  return <><ellipse cx="50" cy="80" rx="39" ry="8" fill={palette.shadow} opacity=".72" /><path d="M11 73V39l16-17h46l16 17v34Z" fill={roof} stroke={palette.shadow} strokeWidth="3" /><path d="M20 73V54h20v19m19 0V49h21v24M14 39h72M24 31h52" stroke={palette.metal} strokeWidth="3" /><path d="M45 25h10v13H45Z" fill={palette.accent} opacity=".9" /></>;
}

// A small set of the highest-frequency roles uses the hand-painted production
// sheets.  The rest retain the same illustrated material language via the
// vector miniatures above, so every current and future role remains legible
// even before it receives a bespoke raster revision.
const PAINTED_SPRITES: Record<string, { source: string; index: number }> = {
  wraith: { source: "/assets/allied-infantry-sprites-v1.png", index: 0 },
  viper: { source: "/assets/allied-infantry-sprites-v1.png", index: 1 },
  specter: { source: "/assets/allied-infantry-sprites-v1.png", index: 2 },
  lancer: { source: "/assets/allied-infantry-sprites-v1.png", index: 3 },
  medic: { source: "/assets/allied-infantry-sprites-v1.png", index: 4 },
  engineer: { source: "/assets/allied-infantry-sprites-v1.png", index: 5 },
  ghost: { source: "/assets/allied-infantry-sprites-v1.png", index: 6 },
  hacker: { source: "/assets/allied-infantry-sprites-v1.png", index: 7 },
  hq: { source: "/assets/field-hardware-sprites-v1.png", index: 0 },
  generator: { source: "/assets/field-hardware-sprites-v1.png", index: 1 },
  barracks: { source: "/assets/field-hardware-sprites-v1.png", index: 2 },
  vehicleBay: { source: "/assets/field-hardware-sprites-v1.png", index: 3 },
  supplyDepot: { source: "/assets/field-hardware-sprites-v1.png", index: 4 },
  comms: { source: "/assets/field-hardware-sprites-v1.png", index: 5 },
  sentry: { source: "/assets/field-hardware-sprites-v1.png", index: 6 },
  jackal: { source: "/assets/field-hardware-sprites-v1.png", index: 7 },
};

// The first hostile raster exports contain partial neighboring figures at
// their sheet edges. Keep the complete illustrated-vector guard and hunter
// miniatures live until clean single-subject production crops replace them.

function PaintedSprite({ source, index }: { source: string; index: number }) {
  if (source.includes("hostile-")) {
    return <image href={source} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet" />;
  }
  // Allied and hardware sheets are 1536×1024, authored as a clean 4×2 grid.
  // A nested viewport creates a hard 384×512 crop; translating the full sheet
  // alone can leak adjacent cells under browser SVG overflow rules.
  const column = index % 4;
  const row = Math.floor(index / 4);
  return (
    <svg x="0" y="0" width="100" height="100" viewBox={`${column * 384} ${row * 512} 384 512`} overflow="hidden">
      <image href={source} x="0" y="0" width="1536" height="1024" preserveAspectRatio="none" />
    </svg>
  );
}

export function TacticalSprite({ kind, team, className = "" }: { kind: string; team: Team; className?: string }) {
  const palette = PALETTES[team];
  const painted = PAINTED_SPRITES[kind];
  const content = painted
    ? <PaintedSprite source={painted.source} index={painted.index} />
    : STRUCTURES.has(kind)
      ? <StructureSprite kind={kind} palette={palette} />
      : VEHICLES.has(kind)
        ? <VehicleSprite kind={kind} palette={palette} />
        : <InfantrySprite kind={kind} palette={palette} />;
  const type = STRUCTURES.has(kind) ? "structure" : VEHICLES.has(kind) ? "vehicle" : "infantry";
  return (
    <svg className={`tacticalSprite ${type} ${className}`} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      {content}
    </svg>
  );
}
