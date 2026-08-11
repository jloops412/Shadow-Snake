# Command Rex — ordered backlog

This is the execution authority. “Now” stays at five items or fewer. Each item has one status and acceptance criteria.

## Now

### CR-114 — Complete 13-theater terminal-state endurance

- **Status:** Verify — all 59 transitions, variable-length stage roles, stale-profile completion merging, 13 sequential unlocks, and final-campaign resolution pass deterministically; normal-speed endurance runs remain
- **Why:** The campaign previously stopped at or before Act I even though later acts appeared in the menu.
- **Acceptance:** Prologue and Acts I–IV unlock sequentially; each 4–5-operation theater can only continue, checkpoint, win, or explicitly lose; theater victories expose Advance to Next Theater; No Man's Haven exposes an explicit campaign completion; loss offers checkpoint retry/full restart/menu; one normal run from each act reaches its final results screen without hidden intervention.

### CR-102 — Level 1 phone and desktop usability pass

- **Status:** Verify — device viewport, phone HUD lanes, fixed touch controls, mobile command sheet, and desktop interaction pass are implemented; hands-on 390×844 endurance remains
- **Why:** tiny tactical labels and browser text selection interfere with command input.
- **Acceptance:** no accidental text highlighting in playable/menu surfaces; the phone uses the real device viewport rather than a scaled desktop canvas; default mobile command text and targets remain readable/tappable; objective, raid, alert, selection, and command surfaces do not overlap; touch Orders/Pan, ALL/TYPE/group selection, centering, build placement, checkpoint, defeat retry, and final objective work at 390×844; the command deck opens as a dismissible bottom sheet; desktop selection, same-type recall, and right-click orders work at 1440×900.

### CR-103 — Command fluency 1.1

- **Status:** Verify — all command tools implemented; hands-on desktop/phone endurance remains
- **Why:** larger armies need reliable coordination before adding many more production choices.
- **Acceptance:** direct ALL/TYPE selection, serialized queued waypoints with numbered map visualization, wedge/line/column/loose spacing around continuous free-form destinations, explicit focus fire, FOB fallback, persistent guard-area behavior, NEXT/TAB stacked cycling, and low-friction touch equivalents. Deterministic queue/formation checks pass; verify the combined surface in the 390×844 run.

### CR-104 — Prologue production roster vertical slice

- **Status:** Verify — categorized roster, structures, upgrades, economy convoy, first counter pass, and visual-role pass implemented; hands-on balance remains
- **Why:** the player needs a genuine base-and-army sandbox with tactical-espionage alternatives.
- **Acceptance:** the field catalog visibly separates infrastructure, production, support, defense, combat, specialists, and vehicles; each category has a stable icon/accent; each present unit, enemy, facility, defense, and prototype has a distinct complete map miniature paired to a stable roster/catalog glyph for the same role (never a generic recolor or partial neighboring image); the tactical board keeps readable 1×1 personnel and explicit multi-cell hardware hit footprints while unit movement remains continuous; construction alone snaps to the visible 32×20 lattice; exact-edge building placement is legal and same-family neighbors visibly connect; Supply Depot/Recovery Mule logistics can produce and lose GMP on the map; advanced structures and units have prerequisites, costs, power/supply pressure, upgrade value, and counter roles; at least three Standard openings remain solvent.

### CR-116 — Contextual command and captured-outpost construction

- **Status:** Verify — captured points project forward construction grids; contextual facility/unit/outpost actions, role defaults, veterancy cooldowns, and three-phase operation launch controls are implemented; hands-on desktop/phone interaction remains
- **Why:** base expansion and unit command should happen at the selected thing, not through a permanent giant menu or an arbitrary Forward Command-only radius.
- **Acceptance:** every player-owned control point visibly permits valid turret/sensor/support/base placement inside its 26m grid while encrypted territory and occupied footprints remain blocked; selecting a facility exposes repair/upgrade/system/salvage beside it without opening the full deck; selecting an individual unit exposes posture, role actions, real rank effects, and next-rank progress; Recon/Infiltrate/Assault selects every available matched asset, assigns the intended posture, and arms a clear field order; new units keep role-appropriate defaults even when sent to a rally point; desktop and 390×844 interaction do not obscure the selected entity or mandatory HUD controls.

## Next

### CR-105 — Tactical causality 1.2

- **Status:** Verify — mechanical theater terrain, cover/concealment/elevation/hazards, morale/suppression bands, interruptible patrol alarms, last-known feedback, and the first infantry/armor/structure counter matrix are delivered; hands-on balance and authored search-sector geometry remain
- **Why:** unit variety only matters if cover, armor, detection, morale, and communications produce different decisions.
- **Acceptance:** readable hard cover/concealment; armor and penetration; suppression/morale; interruptible alarms and guard communication; visible search sectors and last-known state.

### CR-115 — Storyboard theater differentiation

- **Status:** In progress — all 13 theater records, casts, bosses, pressure modifiers, briefings, victory/defeat routes, campaign unlocks, terrain/weather, raid cycles, and ten mechanical mission families are live across all 59 operations; bespoke full-map geometry and authored objective entities/interactions remain
- **Why:** A complete campaign graph is necessary but insufficient if every level still feels like Sable Crown with different words.
- **Acceptance:** each theater ships its storyboard biome, terrain rules, objective interactions, opponent doctrine, boss dependencies, optional consequence, field dialogue, and balance profile without forking the terminal-state authority; every map preserves the construction lattice, continuous unit movement, and full-footprint selection contract.

### CR-106 — Full Act I force and base roster

- **Status:** Planned
- **Acceptance:** implement the Act I roster in `GAME_STORYBOARD.md` across infantry, specialists, vehicles, aircraft/support, defenses, logistics, and espionage infrastructure; retain side-grade roles and combined-arms counters; new roles ship with a unique field/catalog/roster silhouette and an assigned strategic category rather than recycling an existing sprite by recolor.

### CR-107 — Base warfare and opponent doctrine 1.3

- **Status:** Verify — raid doctrines telegraph and prioritize distinct networks; repair coverage is mechanical and visible; walls redirect movement; powered IFF gates pass friendlies and stop hostiles; sealed lines force hostile breaching. Hands-on wall/gate endurance and deeper layered power/build networks remain
- **Acceptance:** layered power/build networks, repair zones, walls/gates, multiple production channels, and distinct scout, sabotage, assault, and siege raids.

### CR-108 — Prologue completion gate 1.4

- **Status:** Planned
- **Acceptance:** three viable Standard openings; consequence-aware debrief; save/resume endurance; strategic BASILISK dependencies; full phone/tablet/desktop pass.

### CR-109 — Theater 2 preproduction

- **Status:** Blocked by CR-103 through CR-108
- **Acceptance:** Harrow Spine has its wind-cut mountain biome, Cipher Directorate doctrine, five-operation mission mix, Kingdom-of-Flies decision, content budget, and technical slice approved before production; no new map starts before CR-103 through CR-108 are satisfied. The public adaptation gate is not a blocker for private development.

## Later

- Named veteran roster, personnel injuries, memorial/history, and specialist recruitment.
- Branching Eli / David-Rotten-Snake relationship facts carried by mechanics and mission composition.
- Revisit completed theaters in their final persistent state.
- Act II mobile-nation politics and faction trust.
- Act III shared battlefields commanded by rival brothers.
- Endgame outcomes driven by doctrine, people, deterrence, and the player’s treatment of David / Rotten Snake.
- Story-state implementation: people, place, evidence, arms, bond, and authority facts must alter missions without becoming a binary morality meter.

### CR-110 — Public-release adaptation gate

- **Status:** Parked — only activate for broad distribution or monetization.
- **Why:** private development uses the close Shadow Snake / Metal Gear-adjacent continuity by explicit direction. Public presentation will need its own deliberate, save-safe creative pass rather than an accidental series of renames.
- **Acceptance:** player-facing code, save-safe data identifiers, title/metadata, mission copy, unit/structure names, art direction, and marketing copy are adapted as one reviewed release branch; protected-term and visual-reference audits are clean; the existing Prologue graph still proves Op 1 → Op 4 → explicit victory/defeat; the public package receives qualified IP review before broad distribution or monetization.

## Completed

- **CR-001 through CR-090:** Builds 0.7–1.0, summarized in `COMMAND_REX_NOTES.md`.
- **CR-100:** Dedicated `maintain-command-rex` continuity skill plus canonical record set.
- **CR-101:** Prologue terminal-state integrity: Operation 1 → boss → explicit victory/defeat, recovery, checkpoint retry, and full restart are deterministic and retained inside the new generic campaign authority.
- **CR-111:** Initial narrative research and campaign-scale storyboard; superseded as active development canon by CR-112.
- **CR-112:** Superseded by CR-113. The first close-development continuity incorrectly assigned David the Solid Snake identity and let the story overtake the 1995 Outer Heaven chronology.
- **CR-113:** Canon-bound private continuity reconciled: Eli / Shadow Snake; David / Rotten Snake as a sworn clone-ward brother rather than the canon David / Solid Snake; a 1987–1990 campaign; a free-haven arc rather than a pre-1995 Outer Heaven; adult support led by Grey Fox, EVA, Kaz, and era-appropriate figures; Otacon/Drebin retained only in dated legacy roles; Hana Kovac / Wren established as Eli’s adult, agency-first love-interest arc. Public adaptation remains parked and does not block Theater 2.
