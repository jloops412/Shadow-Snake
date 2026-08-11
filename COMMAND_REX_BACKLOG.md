# Command Rex — ordered backlog

This is the execution authority. “Now” stays at five items or fewer. Each item has one status and acceptance criteria.

Build 2.0 is now the active implementation program. `COMMAND_REX_REFOUNDATION_PLAN.md` is the detailed design/technical authority for CR-117 through CR-121. It is intentionally a refoundation of presentation, maps, mission flow, stealth, traversal, and rendering on top of the working campaign/simulation authorities—not a ground-up rewrite.

## Now

### CR-117 — Build 2.0 presentation decomposition and renderer seam

- **Status:** Planned
- **Why:** `app/page.tsx` currently concentrates game state wiring, menu shell, input, battlefield presentation, and HUD. That makes UI/gameplay iteration and parallel-agent work collide in one file, while the DOM-heavy battlefield constrains richer maps.
- **Acceptance:** extract clear menu, game shell, battlefield viewport, HUD, command-strip, contextual-action, tactical-map, and deep-panel boundaries without changing campaign/save/terminal behavior; introduce a renderer-neutral `BattlefieldViewModel`; keep the current DOM battlefield available behind a compatibility path until selection/input/render parity is proven; React remains the accessible application/HUD layer and the battlefield renderer can be replaced independently.

### CR-118 — WorldMap/Grid v2 and GHOST LINE refoundation slice

- **Status:** Planned
- **Why:** the exact 32×20 visible board and broad rectangular terrain zones are too coarse for larger Metal Gear-style infiltration spaces, meaningful lanes, water/cliffs, richer compounds, and authored stealth routes.
- **Acceptance:** implement a variable-dimension `WorldMap` authority using logical cells plus continuous world coordinates; first Sable Crown v2 target is 96×60 logical cells; authored layers cover ground, elevation, navigation, buildability, cover, concealment, water, noise/hazards, interactives, intel/reveal, and control/ownership; construction and hardware footprints remain gridded while normal unit locomotion remains continuous; GHOST LINE contains roughly three strategic corridors, cross-links, stealth bypasses, at least one engineering traversal route, meaningful control/utility nodes, and multiple approaches to the objective; captured-outpost construction authority still works on the new map.

### CR-119 — Stealth-first mission contract, adaptive advisor, and debrief

- **Status:** Planned
- **Why:** live strategy currently behaves too much like a scripted RTS tutorial and can push a turret/build opening even when reconnaissance or infiltration should be the first Metal Gear answer.
- **Acceptance:** missions expose viable **Ghost / Control / Force** approaches wherever fiction permits; replace linear `GuideStep` behavior with a pure adaptive advisor that returns at most Recommended, Alternative, and Recovery suggestions based on current field state and never creates hidden prerequisites; ordinary operations recommend the quietest useful route first; GHOST LINE is completable without building a turret or destroying the entire enemy force; losing a recommended specialist cannot deadlock the mission; alert escalation preserves completed objective progress and can transition into search/recovery play where appropriate; debrief records actionable stealth/recovery consequences including detections, completed alarms, lethal/nonlethal outcomes, recoveries, infrastructure preservation, optional intel, friendly losses, objective method, and escalation reached; stealth/precision play earns material bonuses without becoming mandatory for campaign completion.

### CR-120 — Battlefield HUD and Command Center UI/UX 2.0

- **Status:** Planned
- **Why:** current play still reads as menu/stat/card soup, while the Command Center behaves too much like a responsive dashboard and does not compose cleanly across screen shapes.
- **Acceptance:** normal battlefield persistence is limited to compact mission intent, threat/alarm state, strategic resources, a meaningful minimap, selected-entity status, and a compact contextual command strip; no permanent right-side card stack; selected entities expose only immediate field actions while deeper management stays in deliberate planning surfaces; the expanded tactical map can inspect intel/control layers and issue/queue orders; the Command Center presents one primary panel at a time with clear global navigation/back behavior; layouts use safe-area/responsive density rules rather than one-screen absolute assumptions; focused interaction passes succeed at 390×844, 1366×768, 1440×900, 1920×1080, and 2560×1080 without mandatory controls overlapping or disappearing.

### CR-121 — Field engineering, traversal links, and operational signature

- **Status:** Planned
- **Why:** water, cliffs, gaps, and blocked routes should create Kojima-style planning opportunities rather than decorative dead space, while forward construction should support stealth/control play as well as heavy base warfare.
- **Acceptance:** ladder, rope/anchor, portable bridge, and controlled breach each create a real dynamic navigation link consumed by player pathfinding, hostile AI, minimap/tactical map, save/checkpoint state, and objective logic; GHOST LINE includes a meaningful water/cliff/gap route solvable through engineering rather than a hard wall; low-signature field support and high-signature base infrastructure have legible capability/signature tradeoffs; operational signature influences hostile discovery/priority without turning building into an arbitrary punishment; jamming, concealment, power discipline, territory control, or destruction of hostile intel can reduce that pressure.

## Carry-over verification after the refoundation seam

### CR-114 — Complete 13-theater terminal-state endurance

- **Status:** Verify — deterministic 59-operation transition, variable-stage, stale-profile merge, sequential-unlock, and campaign-resolution checks already pass; preserve them throughout Build 2.0 and complete targeted human-speed endurance before the refoundation slice is promoted.
- **Acceptance:** Prologue and Acts I–IV unlock sequentially; every 4–5-operation theater can only continue, checkpoint, win, or explicitly lose; victories expose Advance to Next Theater; No Man's Haven exposes explicit campaign completion; loss offers checkpoint retry/full restart/menu; refoundation work does not fork or silently replace this authority.

### CR-102 — Level 1 phone and desktop usability pass

- **Status:** Verify / Retest after CR-120
- **Acceptance:** retain touch/mouse/keyboard parity, no accidental browser selection, readable targets and commands, ALL/TYPE/group selection, centering, build placement, checkpoint/defeat/final-objective interaction; re-run the focused 390×844 and 1440×900 gates against UI/UX 2.0 rather than polishing the legacy card stack.

### CR-103 — Command fluency 1.1

- **Status:** Verify / Preserve through CR-117 and CR-120
- **Acceptance:** queued waypoints, formations, focus fire, guard area, fallback, type/group selection, and cycling continue to work through the renderer seam, compact command strip, and tactical map; do not regress free-form destinations into tile hopping.

### CR-104 — Prologue production roster vertical slice

- **Status:** Verify / Revalidate art and footprints after CR-118
- **Acceptance:** preserve production categories, economy convoy, prerequisites, power/supply pressure, upgrades, counters, and meaningful build choices; refit field art to the new world/grid and art-bible rules so structures fill their declared footprints, compatible neighbors connect, and map entities remain fully selectable across their visible art.

### CR-116 — Contextual command and captured-outpost construction

- **Status:** Verify / Preserve through CR-118 and CR-120
- **Acceptance:** every player-owned control point remains a valid forward construction authority; facility/unit/outpost actions remain contextual rather than forcing open a giant deck; role-default stances, phase asset assignment, veterancy effects, and nearest-secure fallback survive the new command strip/world model.

## Next

### CR-105 — Tactical causality 1.2 → authored terrain integration

- **Status:** Verify foundation / Refactor after CR-118
- **Why:** existing concealment, hard cover, elevation, hazards, morale, suppression, alarms, last-known state, and raid doctrine are valuable but currently hang from broad rectangular theater zones.
- **Acceptance:** preserve the existing mechanical effects while sourcing terrain/cover/visibility from authored WorldMap layers; readable directional cover, concealment, elevation, hazards, morale/suppression, interruptible alarms, search sectors, and last-known behavior all operate on actual map geometry.

### CR-115 — Storyboard theater differentiation

- **Status:** Paused behind CR-117 through CR-121 — campaign/story records remain live; mass bespoke-map production does not proceed until the GHOST LINE proof slice is fun and reusable.
- **Why:** a complete campaign graph is insufficient if every theater shares one map grammar, but authoring 59 levels before the refoundation proves itself would multiply rework.
- **Acceptance:** after the proof slice, each theater ships its biome, terrain rules, route grammar, objective interactions, opponent doctrine, boss dependencies, optional consequence, field dialogue, and balance profile through shared WorldMap/mission contracts without forking terminal-state authority.

### CR-107 — Base warfare and opponent doctrine 1.3 → WorldMap integration

- **Status:** Verify foundation / Integrate after CR-118 and CR-121
- **Acceptance:** walls/gates, IFF, repair zones, scout/sabotage/assault/siege raids, power/build networks, and breach behavior consume the same world navigation and operational-signature authorities as terrain and traversal.

### CR-108 — Prologue completion gate 2.0

- **Status:** Planned after CR-117 through CR-121
- **Acceptance:** GHOST LINE proves Ghost/Control/Force completion; remaining Sable Crown operations are refit to the same world/mission/UI grammar; three viable Standard openings remain solvent; consequence-aware debrief, save/resume, strategic BASILISK dependencies, and focused phone/tablet/desktop passes succeed.

### CR-106 — Full Act I force and base roster

- **Status:** Planned after the refoundation proof slice
- **Acceptance:** implement the Act I roster in `GAME_STORYBOARD.md` only after command/UI/world contracts are stable; every new role strengthens a production branch/counter relationship and ships with the new footprint/art/renderer metadata rather than adding more presentation debt.

### CR-109 — Theater 2 preproduction

- **Status:** Blocked by CR-117 through CR-121 and CR-108
- **Acceptance:** Harrow Spine becomes the first new-theater map authored with the proven WorldMap/route/traversal/mission/art pipeline; its wind-cut mountain biome, Cipher doctrine, five-operation mix, Kingdom-of-Flies decision, content budget, and technical slice are approved before full production.

## Later

- Named veteran roster, personnel injuries, memorial/history, and specialist recruitment.
- Deeper MGSV-style recovery ecosystem for personnel, vehicles, cargo, intelligence, and field support, building on Recovery Mules and extraction zones.
- More traversal/support options such as pontoon bridges, cable traversal, amphibious support, concealment screens, restored drawbridges, and powered infrastructure routes.
- Branching Eli / David-Rotten-Snake relationship facts carried by mechanics and mission composition.
- Revisit completed theaters in their final persistent state.
- Act II mobile-nation politics and faction trust.
- Act III shared battlefields commanded by rival brothers.
- Endgame outcomes driven by doctrine, people, deterrence, and the player’s treatment of David / Rotten Snake.
- Story-state implementation: people, place, evidence, arms, bond, and authority facts must alter missions without becoming a binary morality meter.

### CR-110 — Public-release adaptation gate

- **Status:** Parked — only activate for broad distribution or monetization.
- **Why:** private development uses the close Shadow Snake / Metal Gear-adjacent continuity by explicit direction. Public presentation will need its own deliberate, save-safe creative pass rather than an accidental series of renames.
- **Acceptance:** player-facing code, save-safe data identifiers, title/metadata, mission copy, unit/structure names, art direction, and marketing copy are adapted as one reviewed release branch; protected-term and visual-reference audits are clean; the existing campaign graph still proves explicit victory/defeat; the public package receives qualified IP review before broad distribution or monetization.

## Completed

- **CR-001 through CR-090:** Builds 0.7–1.0, summarized in `COMMAND_REX_NOTES.md`.
- **CR-100:** Dedicated `maintain-command-rex` continuity skill plus canonical record set.
- **CR-101:** Prologue terminal-state integrity: Operation 1 → boss → explicit victory/defeat, recovery, checkpoint retry, and full restart are deterministic and retained inside the generic campaign authority.
- **CR-111:** Initial narrative research and campaign-scale storyboard; superseded as active development canon by CR-112.
- **CR-112:** Superseded by CR-113. The first close-development continuity incorrectly assigned David the Solid Snake identity and let the story overtake the 1995 Outer Heaven chronology.
- **CR-113:** Canon-bound private continuity reconciled: Eli / Shadow Snake; David / Rotten Snake as a sworn clone-ward brother rather than the canon David / Solid Snake; a 1987–1990 campaign; a free-haven arc rather than a pre-1995 Outer Heaven; adult support led by Grey Fox, EVA, Kaz, and era-appropriate figures; Otacon/Drebin retained only in dated legacy roles; Hana Kovac / Wren established as Eli’s adult, agency-first love-interest arc. Public adaptation remains parked and does not block private gameplay development.
