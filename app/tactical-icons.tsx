import type { ReactNode } from "react";

/**
 * Readable, original tactical glyphs for the command deck, roster, production
 * cards, and category tabs. Battlefield personnel and structures use the
 * richer miniature system in `tactical-sprites.tsx`; this layer remains the
 * concise command-language counterpart.
 *
 * The silhouettes communicate role first (C&C) while the surveillance,
 * comms, and covert motifs communicate the espionage layer (Metal Gear).
 * None reproduce franchise art, UI marks, or unit designs.
 */
export type TacticalIconKind = string;

function unitGlyph(kind: TacticalIconKind): ReactNode {
  switch (kind) {
    case "wraith": return <><path d="M25 53 29 32l7-11 7 11 4 21M29 32l-9 5m17-5 11 4M31 19l3-7 4 7-2 5h-5Z" /><path d="m17 38 11 3m19-2-10 3" /></>;
    case "viper": return <><path d="M21 53 26 31l7-10 8 10 4 22M26 31l-10 5m24-5 10 5M17 37l16 6 15-6" /><path d="m46 28 9 5-6 3" /></>;
    case "specter": return <><circle cx="32" cy="25" r="7" /><path d="M24 53 28 33h8l4 20M20 21c-6 4-6 12 0 16m24-16c6 4 6 12 0 16M15 17c-10 7-10 21 0 28m34-28c10 7 10 21 0 28" /></>;
    case "lancer": return <><path d="M22 53 27 31l7-10 8 10 4 22M27 31l-9 5m22-5 11 4" /><path d="m14 33 19-6 17 5-19 7Z M15 33l-5 4m39-5 6 3" /></>;
    case "medic": return <><path d="M23 53 28 32l5-10 7 10 4 21M28 32l-9 5m20-5 10 5" /><path d="M29 12h7v7h7v7h-7v7h-7v-7h-7v-7h7Z" /></>;
    case "engineer": return <><path d="M23 53 28 32l5-10 7 10 4 21M28 32l-9 5m20-5 10 5" /><path d="m18 14 6 6 8-8-5-5c5-2 10 3 8 8l-14 14c-5 2-10-3-8-8l5-5" /></>;
    case "ghost": return <><path d="M24 54 29 31l5-10 7 10 4 23M29 31l-10 5m21-5 11 4" /><path d="m12 28 34 5 8 5-38 1Z M16 29l-5 2m35 4 8 1" /></>;
    case "hacker": return <><circle cx="32" cy="23" r="7" /><path d="M24 54 28 34h8l4 20M21 20 13 16m30 4 8-4M22 34l-9 8m29-8 9 8" /><circle cx="11" cy="15" r="3" /><circle cx="53" cy="15" r="3" /><circle cx="11" cy="44" r="3" /><circle cx="53" cy="44" r="3" /></>;
    case "foxhound": return <><path d="M18 54 24 30l8-11 9 11 6 24M24 31l-11 5m29-5 11 4" /><path d="M11 33h20l11 6-18 6H11Z M38 35h15v7H38Z" /><path d="M27 16h10l3 8H24Z" /></>;
    case "guard": return <><path d="M24 54 28 32l5-10 7 10 4 22M28 32l-10 5m21-5 10 5" /><path d="M28 14h10l2 7H26Z M17 36l15 4 16-3" /></>;
    case "hunter": return <><path d="M19 54 24 30l9-12 9 12 5 24M24 30l-11 5m30-5 10 5" /><path d="M24 15h18l-2 10H26Z M12 34h19l17 6-22 6H12Z" /></>;
    case "raven": return <><path d="M32 25v18M19 30l13-5 13 5-13 5Z" /><path d="m18 29-8-7m9 14-9 7m35-14 9-7m-9 14 9 7" /><circle cx="10" cy="21" r="4" /><circle cx="10" cy="44" r="4" /><circle cx="54" cy="21" r="4" /><circle cx="54" cy="44" r="4" /><path d="M27 43h10l3 8H24Z" /></>;
    case "weasel": return <><path d="M13 42 19 31h25l8 11-5 9H17Z" /><path d="M23 31 29 23h10l5 8M15 42h37M20 51a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm25 0a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" /><path d="m39 29 12-5" /></>;
    case "mule": return <><path d="M11 43 17 31h23l5 12-4 9H16Z M40 34h11v15H40Z" /><path d="M20 31v-7h17v7M18 52a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm27 0a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM44 37h4m-4 5h4" /></>;
    case "jackal": return <><path d="M10 43 17 29h27l10 14-5 9H15Z" /><path d="M23 29v-6h16l6 6M18 52a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm29 0a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" /><path d="M31 28V17h9l3 11M33 17h12" /></>;
    case "mantis": return <><path d="M11 43 18 30h28l8 13-5 10H16Z" /><path d="M23 30V22h18l5 8M18 53h28M20 47h24M32 22V11h9l4 11M34 11h16" /><path d="m42 16 12-5" /></>;
    case "scout": return <><path d="M15 35 25 25h14l10 10-6 11H21Z" /><path d="M23 25 28 16h9l4 9M20 46l-5 5m29-5 5 5M20 35h24" /><circle cx="32" cy="35" r="6" /></>;
    case "basilisk": return <><path d="M13 48 18 28l10-9h13l10 9 5 20-8 8H21Z" /><path d="M22 28 17 13h10l7 11 6-11h10l-7 15M18 48l-7 7m37-7 7 7M28 20V8h8v12M21 40h22M29 33h12l7 6H23Z" /></>;
    default: return <><path d="M18 52 24 25h16l6 27ZM24 25l8-13 8 13M16 36h32" /><circle cx="32" cy="31" r="4" /></>;
  }
}

function structureGlyph(kind: TacticalIconKind): ReactNode {
  switch (kind) {
    case "hq": return <><path d="M10 51V29l10-9 6 5 6-13 7 13 6-5 9 9v22Z" /><path d="M18 51V36h9v15m10 0V33h9v18M32 14V5m-5 4 5-4 5 4" /></>;
    case "generator": return <><path d="M15 52V25l10-9h14l10 9v27Z" /><circle cx="32" cy="31" r="10" /><path d="M32 17v8m-9 6h7m4 0h7m-9 6v8" /></>;
    case "barracks": return <><path d="M10 52V26l10-11h24l10 11v26Z" /><path d="M19 52V37h10v15m7 0V33h10v19M10 26h44M16 21h32" /></>;
    case "vehicleBay": return <><path d="M8 52V23l12-9h25l11 9v29Z" /><path d="M15 52V32h34v20M15 28h34M24 32v20m16-20v20M44 18v-9" /></>;
    case "supplyDepot": return <><path d="M10 52V27l9-10h26l9 10v25Z" /><path d="M18 52V35h12v17m5-17h11v17M16 26h32" /><path d="M23 23h8v8h-8zm11 0h8v8h-8z" /></>;
    case "rdLab": return <><path d="M11 52V26l10-9h22l10 9v26Z" /><path d="M20 52V39h24v13M24 18v12m-5-5h10M35 19v9m-4 0h8" /><circle cx="42" cy="31" r="5" /></>;
    case "hospital": return <><path d="M10 52V27l10-10h24l10 10v25Z" /><path d="M19 52V36h10v16m7-16h9v16" /><path d="M28 18h8v6h6v8h-6v6h-8v-6h-6v-8h6Z" /></>;
    case "repairBay": return <><path d="M10 52V28l9-9h26l9 9v24Z" /><path d="M18 52V36h28v16M21 29h22" /><path d="m40 14 6 6-5 5 5 5-7 7-5-5-7 7-5-5 7-7-5-5 7-7 5 5Z" /></>;
    case "comms": return <><path d="M22 52h20M32 52V22m-9 30 9-30 9 30M32 22V8m-5 4 5-4 5 4" /><path d="M18 16c-7 7-7 17 0 24m28-24c7 7 7 17 0 24M12 10c-11 11-11 29 0 40m40-40c11 11 11 29 0 40" /></>;
    case "wall": return <><path d="M8 52V31h7v-8h8v8h8v-8h8v8h8v-8h7v8h7v21Z" /><path d="M8 42h48M18 52V42m14 10V42m14 10V42" /></>;
    case "gate": return <><path d="M7 52V20h16v32m18 0V20h16v32Z" /><path d="M23 52V34h18v18M7 20h16m18 0h16M28 43h8" /></>;
    case "sentry": return <><path d="M18 52h28l-4-14H22Z" /><path d="M27 38V25h10v13M24 25h16l5 6H19ZM32 25V14" /><circle cx="32" cy="12" r="3" /></>;
    case "missileNest": return <><path d="M17 52h30l-5-15H22Z" /><path d="m24 35 5-18 6 2-2 18m4-1 5-18 6 2-4 18M18 44h28" /></>;
    case "sensor": return <><path d="M17 52h30l-5-15H22Z" /><path d="M21 29c6-12 16-12 22 0-6 8-16 8-22 0Z" /><circle cx="32" cy="29" r="4" /><path d="M32 37v-8" /></>;
    case "enemyRadar": return <><path d="M17 52h30l-5-13H22Z" /><path d="M22 25c5-13 15-13 20 0-5 7-15 7-20 0Z" /><path d="M32 38V25m0-11V7m-5 3 5-3 5 3" /></>;
    case "enemyRelay": return <><path d="M17 52h30L43 17H21Z" /><path d="M25 17V9h14v8M23 29h18m-18 9h18m-18 9h18" /><circle cx="32" cy="9" r="3" /></>;
    case "enemyUplink": return <><path d="M11 52V28l9-9 6 5 6-14 7 14 6-5 8 9v24Z" /><path d="M22 52V35h9v17m8 0V31h8v21M32 10V4m-4 3 4-3 4 3" /></>;
    case "enemyTurret": return <><path d="M18 52h28l-4-14H22Z" /><path d="M24 38V26h16v12M20 27h25l6 6H14ZM34 26l12-10" /></>;
    case "enemyGate": return <><path d="M7 52V18h16v34m18 0V18h16v34Z" /><path d="M23 52V32h18v20M7 18h16m18 0h16M28 42h8M14 14h36" /></>;
    default: return <><path d="M12 52V24l10-10h20l10 10v28Z" /><path d="M20 52V34h24v18M18 25h28" /></>;
  }
}

function categoryGlyph(kind: TacticalIconKind): ReactNode {
  switch (kind) {
    case "infrastructure": return <><path d="M13 48h38M17 48V30h10v18m10 0V20h10v28M22 30v-8h20" /><path d="M32 10v10m-5-5 5-5 5 5" /></>;
    case "production": return <><path d="M10 50V24h28v26m0-16h12v16M17 24v-9h8v9m5 0v-13h9v13" /><path d="M16 50V39h8v11m9-11h8v11M41 34v-9h7v9" /></>;
    case "support": return <><path d="M32 54V24m-9 30 9-30 9 30M32 24V10m-6 5 6-5 6 5" /><path d="M17 19c-7 7-7 18 0 25m30-25c7 7 7 18 0 25" /></>;
    case "defense": return <><path d="M32 8 51 16v14c0 12-8 20-19 26C21 50 13 42 13 30V16Z" /><path d="m22 32 7 7 14-16" /></>;
    case "infantry": return <><path d="M23 54 28 31l5-10 7 10 4 23M28 31l-10 5m21-5 10 5" /><circle cx="33" cy="14" r="6" /></>;
    case "specialist": return <><circle cx="32" cy="25" r="8" /><path d="M24 54 28 35h8l4 19M17 23l8 3m14-3-7 3M16 15c-6 6-6 16 0 22m32-22c6 6 6 16 0 22" /></>;
    case "vehicle": return <><path d="M10 43 17 30h28l9 13-5 9H15Z" /><path d="M21 30v-7h18l5 7M18 52a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm29 0a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" /></>;
    default: return <circle cx="32" cy="32" r="16" />;
  }
}

export function TacticalIcon({ kind, className = "" }: { kind: TacticalIconKind; className?: string }) {
  const isCategory = ["infrastructure", "production", "support", "defense", "infantry", "specialist", "vehicle"].includes(kind);
  const isStructure = ["hq", "generator", "barracks", "vehicleBay", "supplyDepot", "rdLab", "hospital", "repairBay", "comms", "wall", "gate", "sentry", "missileNest", "sensor", "enemyRadar", "enemyRelay", "enemyUplink", "enemyTurret", "enemyGate"].includes(kind);
  return (
    <svg className={`tacticalIcon ${className}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <g className="tacticalIconFill" opacity=".18" fill="currentColor">{isCategory ? categoryGlyph(kind) : isStructure ? structureGlyph(kind) : unitGlyph(kind)}</g>
      <g>{isCategory ? categoryGlyph(kind) : isStructure ? structureGlyph(kind) : unitGlyph(kind)}</g>
    </svg>
  );
}
