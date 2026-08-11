# Command Rex — ordered backlog

This is the execution authority. “Now” stays at five items or fewer. Each item has one status and acceptance criteria.

Build 2.0 is the active implementation program. Use `COMMAND_REX_LORE_BOSS_PROGRESSION.md` for boss/lore chronology, `COMMAND_REX_REFOUNDATION_PLAN.md` for world/mission/render architecture, and `COMMAND_REX_UI_VISUAL_PASS.md` for the dedicated sprite/building/map/UI visual pass. This is a refoundation on top of the working campaign/simulation authorities, not a ground-up rewrite.

## Now

### CR-117 — Build 2.0 presentation decomposition and renderer seam

- **Status:** Planned
- **Why:** `app/page.tsx` concentrates game-state wiring, menu shell, input, battlefield presentation, and HUD, creating merge/iteration friction and constraining richer maps.
- **Acceptance:** extract clear menu, game shell, battlefield viewport, HUD, command-strip, contextual-action, tactical-map, and deep-panel boundaries without changing campaign/save/terminal behavior; introduce a renderer-neutral `BattlefieldViewModel`; retain the current battlefield behind a compatibility path until input/selection parity is proven.

### CR-118 — WorldMap/Grid v2 and GHOST LINE refoundation slice

- **Status:** Planned
- **Why:** the exact 32×20 board and broad rectangular terrain zones are too coarse for larger Metal Gear-style infiltration spaces, strategic corridors, water/cliffs, compounds, and authored stealth routes.
- **Acceptance:** implement variable-dimension `WorldMap` data using logical cells plus continuous world coordinates; first Sable Crown target is 96×60 logical cells; authored layers cover ground, elevation, navigation, buildability, cover, concealment, water, noise/hazards, interactives, intel/reveal, and control/ownership; construction/hardware remain gridded while units remain continuous; GHOST LINE has strategic corridors, cross-links, stealth bypasses, engineering traversal, meaningful control/utility nodes, and multiple approaches.

### CR-119 — Stealth-first mission contract, adaptive advisor, and debrief

- **Status:** Planned
- **Why:** live strategy behaves too much like a scripted RTS tutorial and may push turret/build openings when recon/infiltration should be the Metal Gear default.
- **Acceptance:** missions expose viable **Ghost / Control / Force** approaches where fiction permits; replace linear guide steps with an adaptive advisor offering at most Recommended, Alternative, and Recovery suggestions; GHOST LINE is completable without a turret or total enemy destruction; unavailable specialists cannot deadlock progress; alert preserves completed objective state; debrief records detection, completed alarms, lethal/nonlethal outcomes, recoveries, infrastructure preservation, optional intel, friendly losses, objective method, and escalation.

### CR-120 — Battlefield HUD, Command Center, sprites, structures, and visual cohesion 2.0

- **Status:** Planned — execution details in `COMMAND_REX_UI_VISUAL_PASS.md`
- **Why:** current play still reads as menu/stat/card soup; menus do not compose reliably across screen shapes; sprite/building/map art quality is inconsistent.
- **Acceptance:** implement Now/Do/Plan HUD hierarchy with no permanent right-side card soup; main shell/campaign/settings work at 390×844, 768×1024, 1366×768, 1440×900, 1920×1080, and 2560×1080; Wraith/Viper-quality art becomes the roster floor; hostile sprites become comparably readable; structures visibly fill declared footprints; compatible same-family neighbors connect; meaningful unit/structure upgrades are visually obvious; Sable Crown uses a cohesive cold covert terrain kit rather than background-only art.

### CR-122 — Lore provenance and boss escalation refit

- **Status:** Planned — **blocking content expansion**
- **Why:** Build 1.9 currently spends a Metal Gear-class `BASILISK REX` in Sable Crown even though actual REX belongs to the 2005 Shadow Moses era and the campaign runs 1987–1990. Boss scale also needs an earned progression from human specialists to vehicles/platforms to late strategic weapons and David/Rotten Snake.
- **Acceptance:** implement `COMMAND_REX_LORE_BOSS_PROGRESSION.md`; Sable Crown ends with a commander/light-Walker-Gear-scale encounter and contains no actual/faux REX or Metal Gear-class boss; actual REX is prohibited as a physical 1987–1990 campaign weapon; late Act IV alone may use a period-plausible Command Rex original strategic platform (`BASILISK` working identity, no `REX`); David / Rotten Snake cannot be a direct boss before Act IV/endgame; human bosses remain human scale; campaign data, objective copy, boss spawning/health UI, tests, and debriefs use the corrected classes while preserving terminal-state authority; new lore-heavy content receives provenance tags and respects Outer Heaven 1995, Zanzibar Land 1999, and Shadow Moses/REX 2005 hard stops; audit `Zanzibar Corridor` naming before production.

## Next

### CR-121 — Field engineering, traversal links, and operational signature

- **Status:** Planned after the core GHOST LINE world/mission seam is in place
- **Acceptance:** ladder, rope/anchor, portable bridge, and controlled breach create real dynamic navigation links used by player pathfinding, hostile AI, tactical map, save/checkpoint state, and objectives; GHOST LINE includes a meaningful terrain route solvable through engineering; low-signature field support and high-signature infrastructure have legible detection/pressure tradeoffs.

### CR-114 — Complete 13-theater terminal-state endurance

- **Status:** Verify / preserve throughout Build 2.0
- **Acceptance:** all 13 theaters retain sequential unlocks, explicit checkpoint/victory/defeat states, next-theater advancement, and final campaign completion; lore/boss/map refits do not fork the terminal authority.

### CR-102 — Level 1 phone and desktop usability pass

- **Status:** Verify / Retest after CR-120
- **Acceptance:** touch/mouse/keyboard parity, readable controls, ALL/TYPE/group selection, centering, build placement, checkpoint/defeat/final-objective interaction, and no accidental browser selection pass against UI/UX 2.0.

### CR-103 — Command fluency 1.1

- **Status:** Verify / Preserve through CR-117 and CR-120
- **Acceptance:** queued waypoints, formations, focus fire, guard area, fallback, type/group selection, and cycling continue to work through the renderer seam, compact command strip, and tactical map; do not regress continuous movement into tile hopping.

### CR-104 — Prologue production roster vertical slice

- **Status:** Verify / Revalidate visuals after CR-118 and CR-120
- **Acceptance:** preserve production categories, economy convoy, prerequisites, power/supply pressure, upgrades, counters, and meaningful build choices; every structure fills its footprint, compatible neighbors visually connect, upgrades read on-map, and entities remain fully selectable.

### CR-116 — Contextual command and captured-outpost construction

- **Status:** Verify / Preserve through CR-118 and CR-120
- **Acceptance:** every owned control point remains forward construction authority; facility/unit/outpost actions remain contextual; role-default stances, phase asset assignment, veterancy effects, and nearest-secure fallback survive the new UI/world model.

### CR-105 — Tactical causality 1.2 → authored terrain integration

- **Status:** Verify foundation / Refactor after CR-118
- **Acceptance:** existing concealment, hard cover, elevation, hazards, morale, suppression, alarms, search sectors, last-known state, and raid doctrine source their behavior from authored WorldMap geometry instead of broad rectangles.

### CR-115 — Storyboard theater differentiation

- **Status:** Paused behind CR-117, CR-118, CR-119, CR-120, CR-122 and the GHOST LINE proof gate
- **Acceptance:** after the proof slice, each theater ships its biome, route grammar, objective interactions, opponent doctrine, period/lore provenance, boss tier, optional consequence, field dialogue, and balance profile through shared contracts without forking terminal-state authority.

### CR-107 — Base warfare and opponent doctrine 1.3 → WorldMap integration

- **Status:** Verify foundation / Integrate after CR-118 and CR-121
- **Acceptance:** walls/gates, IFF, repair zones, scout/sabotage/assault/siege raids, power/build networks, and breach behavior consume shared world navigation and signature authorities.

### CR-108 — Prologue completion gate 2.0

- **Status:** Planned after CR-117/118/119/120/122 and CR-121
- **Acceptance:** GHOST LINE proves Ghost/Control/Force completion; Sable Crown contains no Metal Gear-scale finale; Crown Fall uses commander/light-walker boss grammar; remaining Sable Crown operations use the same world/mission/UI/lore rules; three viable Standard openings remain solvent; consequence-aware debrief, save/resume, and focused device passes succeed.

### CR-106 — Full Act I force and base roster

- **Status:** Planned after the refoundation proof slice
- **Acceptance:** implement the Act I roster only after command/UI/world/art/lore contracts are stable; every new role strengthens a production branch/counter relationship and carries footprint/sprite/provenance metadata where relevant.

### CR-109 — Theater 2 preproduction

- **Status:** Blocked by CR-117/118/119/120/122, CR-121, and CR-108
- **Acceptance:** Harrow Spine is the first new-theater map authored with the proven WorldMap/route/traversal/mission/art/lore pipeline; its wind-cut mountain biome, Cipher doctrine, five-operation mix, boss tier, content budget, and technical slice are approved before full production.

## Later

- Named veteran roster, personnel injuries, memorial/history, and specialist recruitment.
- Deeper MGSV-style recovery ecosystem for personnel, vehicles, cargo, intelligence, and field support.
- More traversal/support options such as pontoon bridges, cable traversal, amphibious support, concealment screens, restored drawbridges, and powered infrastructure routes.
- Branching Eli / David-Rotten-Snake relationship facts carried by mechanics and mission composition.
- Late Act IV period-plausible strategic-platform encounter followed by a David/Rotten-Snake command/rival payoff shaped by stored facts.
- Revisit completed theaters in their final persistent state.
- Endgame outcomes driven by doctrine, people, deterrence, and the player's treatment of David / Rotten Snake.
- Story-state implementation: people, place, evidence, arms, bond, and authority facts alter missions without becoming a binary morality meter.

### CR-110 — Public-release adaptation gate

- **Status:** Parked — only activate for broad distribution or monetization.
- **Acceptance:** player-facing code, save-safe identifiers, title/metadata, mission copy, unit/structure names, art direction, and marketing are adapted as one reviewed release branch; protected-term and visual-reference audits are clean; the campaign graph still proves explicit victory/defeat; qualified IP review precedes broad release.

## Completed

- **CR-001 through CR-090:** Builds 0.7–1.0, summarized in `COMMAND_REX_NOTES.md`.
- **CR-100:** Dedicated continuity skill plus canonical record set.
- **CR-101:** Prologue terminal-state integrity retained inside generic campaign authority.
- **CR-111:** Initial narrative research/campaign storyboard; superseded by later canon decisions.
- **CR-112:** Superseded identity/chronology draft.
- **CR-113:** Canon-bound private continuity reconciled: Eli / Shadow Snake; David / Rotten Snake as a sworn clone-ward brother rather than canonical Solid Snake; 1987–1990 campaign; free-haven arc; era-appropriate legacy cast; no pre-1995 Outer Heaven replacement.
