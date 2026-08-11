# Command Rex direction notes

## Build 1.9 candidate — contextual command and forward outposts

- Added `game/field-command.mjs` as the pure authority for captured-outpost construction sources, role-default stances, operation-phase asset matching, rank progress, and veterancy cooldown scaling.
- Every captured supply/intelligence/command point projects a visible 26m forward construction grid. Outpost authority overrides the old hostile-radius denial inside already unlocked territory, while encrypted regions, occupied footprints, and logistics-route clearance remain enforced.
- Selecting a friendly facility no longer forces the giant command deck open. Facilities, individual units/elements, and captured outposts now show compact in-field action surfaces for upgrades, repair, system access, salvage, stances, role abilities, rank effects, fortification, logistics, and rallying.
- The desktop command deck now defaults collapsed and can be opened deliberately for planning/catalog work. A quick phase rail plus the full Operation Launchpad turns Recon → Infiltrate → Assault into one-tap asset selection and a targeted field order.
- Newly created units default by role: covert/recon to stealth, sustain/logistics to hold, and line/armor to assault. Rally orders preserve those postures. Veteran ranks reduce real role-action cooldowns by six percent per rank, in addition to the existing damage and integrity gains.
- Fallback orders choose the nearest secure command, logistics, recovery, or captured outpost rather than always crossing the entire map to the original HQ.
- Thirty-two deterministic campaign, terminal-state, command, economy, tactical, operation, barrier, construction-authority, phase-assignment, stance, rank, and cooldown checks pass with clean lint. The healthy agent preview could not be reached by the browser connection, so rendered desktop/mobile interaction remains an honest verification boundary for the checkpoint.

## Build 1.8 candidate — operation grammar and functional base warfare

- Added `game/operation-doctrine.mjs`: every one of the 59 storyboard operations resolves to foothold, recon, extraction, sabotage, convoy, defense, disclosure, reconstruction, hunt, or siege. The operation family changes real capture, hacking, detection, raid timing, logistics yield, defense-contract, and sustain values and is visible in briefings/objective/field HUDs.
- Added `game/base-warfare.mjs`: continuous orders remain free-form, but a wall/gate intersection invokes deterministic grid routing. Powered player gates pass friendlies through IFF, stop hostiles, and sealed defensive lines produce a breach target instead of a pathing deadlock.
- Enemy raid doctrine preserves a barrier breach target until it is destroyed rather than retargeting through the wall every simulation tick.
- Repair Bay structure/vehicle rates are now one tested authority shared by simulation and selected-structure intelligence. Selected Repair Bays and Hospitals show their live zone; Walls and Gates explain their movement rule and powered gate state.
- Twenty-eight deterministic campaign, terminal-state, command, economy, tactical, operation-doctrine, and base-warfare checks plus lint and the verified production build pass. The internal game preview is healthy, but the cloud browser could not attach; 390×844 and human-speed wall/gate endurance remain honest verification boundaries.

## Build 1.3 candidate — Act I/II progression and construction intelligence

- Replaced the Prologue-only campaign assumption with `game/campaign-doctrine.mjs`, the shared authority for seven sequential theaters and 33 operations across the Prologue, Act I, and Act II.
- Four- and five-operation theaters now use the same checkpoint/victory/defeat graph. Five-operation theaters add a field-command breach before the final operation; the final operation alone spawns the named theater threat and command target.
- Campaign selection shows exact theater order, operation counts, biome, final threat, completion, availability, and lock state. Victory offers direct advancement to the next theater; replay and full restart preserve the selected theater; save migration defaults older saves to Sable Crown.
- Commanders and compact command vehicles retain near-unit battlefield scale. Only Metal Gear-class final threats use the oversized boss treatment.
- Structure cards are now inspection controls rather than purchase buttons. A separate intelligence panel shows exact GMP, construction time, grid footprint, power, supply/output effects, unlocks, prerequisites, and tradeoffs before Fabricate can spend resources.
- Desktop campaign/deploy/battlefield/structure-inspection interactions passed in the agent preview with no application errors. Deterministic campaign, Prologue, emergency-recovery, logistics, and counter tests pass. Full human-speed Act I/Act II endurance and dedicated phone-size interaction remain explicit verification gates.

## Build 1.4 tactical miniature pass

- Replaced the map-facing monoline glyph treatment with original tactical miniatures. The core eight Shadow Command specialist roles plus the present Guard/Hunter opponents use generated-and-reviewed painted assets; familiar field facilities use a matching command/power/barracks/vehicle/logistics/comms/defense hardware sheet. These assets are stored in `public/assets/*-sprites-v1.png` and rendered as true sprite crops by `app/tactical-sprites.tsx`.
- Every remaining present infantry, hostile, vehicle, defense, and special prototype role has a unique original painted-vector miniature in the same late-Cold-War covert/base-war visual grammar. Faction color, health, selection, facing, and order information retain priority over decorative art.
- Command-deck taxonomy remains stable: vector glyphs, full labels, and category accents are intentionally UI language rather than a second attempt at map art. This keeps the C&C-style build/read loop rapid while characters feel like people and machinery on the field.
- Agent preview verified the menu, campaign deploy flow, live battlefield, starter personnel, core structures, command deck, and console state with no app-source errors. Browser-extension metadata warnings are environment noise, not game errors.

## Build 1.2 visual-role pass

- Replaced the old five-image/recolor approach with original in-app vector sprites for every current friendly unit, hostile unit, buildable facility, hostile structure, defense, and the BASILISK prototype.
- Each role now has a shape grammar that reads before text: suppressed infiltrator, assault rifle, EW signal rings, anti-armor launcher, medic, engineer, sniper, hacker, heavy gunner, drones, logistics hauler, light scout car, IFV, tank, patrol, heavy response, and walker. Buildings follow the same C&C logic: command, power, barracks, vehicle fabrication, logistics, research, medical, repair, comms, wall/gate, defensive guns, sensors, and enemy command infrastructure.
- Construction/deployment categories now have standard icons, full labels, and fixed accents. Battlefield faction colors remain separate from those catalog accents to avoid ambiguous orders or targets.
- Build, artifact validation, and the full deterministic test suite pass. The agent preview server started, but cloud-browser control was unavailable in this session; a human phone/desktop readability pass remains a stated gate.

## Build 1.2 candidate — C&C production doctrine

- Reorganized construction into infrastructure, production, support, and defense tabs; reorganized deployment into combat, specialist, and vehicle tabs.
- Added Supply Depot, R&D Laboratory, and Anti-Armor Nest structures with footprints, power demand, prerequisites, three-level upgrades, and battlefield functions.
- Added autonomous Recovery Mule, Jackal IFV, and Mantis Tank roles. The Mule runs between controlled supply relays and a depot; GMP is credited only on return.
- Added a deterministic infantry/vehicle/structure counter matrix. Ghost and anti-personnel fire favor infantry; Lancer, Mantis, and Anti-Armor Nest favor vehicles, prototypes, and structures.
- Enemy raids now value exposed logistics, research, power, and production infrastructure instead of treating every building alike.
- Build, lint, full mission graph, logistics payout, and counter-role tests pass. Cloud-browser interaction was unavailable in this work session, so phone and full human-speed balance remain explicit verification gates.

## Build 1.1 candidate — base command and Level 1 survivability

- Added ALL/TYPE/group command parity: desktop double-click and T, touch TYPE, and always-visible roster type chips select every friendly unit of a matching type.
- Added visible Forward Command integrity and a deterministic once-per-operation emergency recovery on Guided/Standard. Hardline remains uncompromised; once the reserve is spent, Forward Command destruction reaches the explicit mission-failed state.
- Checkpoints now distinguish operation completion from theater completion with “Level 1 continues” and the next operation number.
- Browser-tested Barracks fabrication, a valid 3×2 snapped placement ghost, Barracks L1 → L2 upgrade completion, Vehicle Fabricator prerequisite unlock, Wraith training, and same-type selection across two Wraith teams.
- The expanded Prologue base/force slice includes ten buildable structures, eleven trainable friendly unit roles, three-level structure upgrades, infantry/vehicle channels, support networks, and save-shape compatibility.
- Kept `GAME_STORYBOARD.md` untouched during gameplay work; the parallel storyboard pass remains authoritative for narrative details.

## Narrative correction — canon-bound close-development continuity (2026-08-10)

- The previous active draft is superseded: **David is Rotten Snake, not Solid Snake**. He is Eli’s sworn clone-ward brother and co-lead, while canon David / Solid Snake remains distinct. This preserves the three-clone Les Enfants Terribles record rather than adding a secret fourth clone.
- `GAME_STORYBOARD.md` now bounds the private fan continuity to **1987–1990**, after Eli’s MGSV-era escape and before the 1995 Outer Heaven Uprising. Shadow Command builds a free haven, not a pre-1995 Outer Heaven.
- Grey Fox, EVA, Kaz, Ocelot, Dr. Clark, Sigint, Big Boss, and Madnar are the era-appropriate support/pressure cast. Otacon and Drebin are deliberately deferred to dated archival/coda use so they are not falsely written as adult teammates.
- Hana Kovac / Wren is Eli’s adult, slow-burn love interest and independent evacuation-network leader; she cannot be an instant romance, a hostage, or a player reward.
- The prior Rex Ardent / Vale Veyr / Grey Ark story remains a future public-adaptation reserve. CR-110 still does not block Theater 2. The campaign remains 13 theaters / roughly 59 operations, and the current four-operation Prologue graph remains unchanged.

## Build 1.0.1 checkpoint — mission integrity and failure

- The Prologue mission graph now has a single tested authority covering all four operation advances, victory, and Forward Command defeat.
- Operation transitions route active raid contacts, restore a difficulty-scaled defensive floor, extend the next raid window, and create a recoverable operation-start checkpoint.
- Operation 3 completion now explicitly says that Crown Fall/Operation 4 is beginning rather than resembling an ending.
- Forward Command loss now opens an original tactical-espionage “MISSION FAILED” signal-loss screen with cause, checkpoint retry, full restart, and Command Center options.
- `COMMAND_REX_START_HERE.md`, `COMMAND_REX_BACKLOG.md`, and `COMMAND_REX_DECISIONS.md` are now the canonical continuity records.
- The next content expansion is a Prologue roster vertical slice followed by the full Act I roster defined in `GAME_STORYBOARD.md`.

## Narrative research and original-public-canon draft — superseded 2026-08-10

- This was the original-public-canon approach: an original campaign plan using broad espionage-story questions while treating all direct references as migration debt. It is no longer the active development direction.
- Its reusable campaign systems remain useful: 13 persistent theaters, fact-based consequence, endings driven by play, and production gates. The Rex/Vale setting itself is now a future adaptation reserve.
- The current playable 1.0.1 Prologue remains mechanically valid. Its Eli, David, Shadow Snake, and BASILISK REX language is now active development canon, not legacy implementation debt.
- Research anchors remain useful as source separation: official history and archival material, the official MGS V nuclear-disarmament conditions, reporting on the omitted Episode 51, and the U.S. Copyright Office Fair Use Index.

## Narrative direction — pre-storyboard interim draft

The direct-reference terminology below anticipated the direction restored in the active 2026-08-10 development canon, but the detailed character roles and campaign structure in `GAME_STORYBOARD.md` now take precedence.

- The intended central character is Eli, framed as the supposedly inferior clone of Big Boss. His field identity and eventual title is **Shadow Snake**, following the clone-era naming pattern while remaining the original project's central identity.
- David and the other Les Enfants subjects may become playable commanders, rivals, allies, or campaign-perspective characters.
- Story now begins in a compact pre-mission dossier, but long cutscenes, lore codices, bosses, weapon catalogs, and additional levels still wait until the repeatable sandbox is consistently fun.
- Canon details are provisional until the dedicated narrative pass; do not build campaign logic around an unverified assumption.

## IP guardrail

- The current public-facing prototype remains an original tactical-espionage homage and does not use official character likenesses, logos, dialogue, music, or game assets.
- A private beta can experiment with the intended references, but privacy alone does not settle IP concerns. Before any wider release, use counsel-reviewed licensing or lightly re-authored identities, visual designs, and terminology while preserving the intended dramatic roles.

## Current gameplay doctrine

- Persistent mixed command groups should support full-squad movement and element-level control.
- Infiltration, assault, and support elements must be separable without dissolving the parent group.
- Technology upgrades belong in the R&D tree unless they create a physical deployable such as a drone, turret, sensor, or weapon platform.
- Support roles should change tactical endurance and decision-making, not merely add another combat marker.

## Build 0.7 checkpoint — complete

- Level 1 now has Guided, Standard, and Hardline pressure presets instead of one punishing opening.
- GMP is earned through base income, controlled relays, field caches, personnel recovery, hacks, target bounties, and raid-defense contracts.
- The opening strategy guide adapts across six mission phases and highlights the relevant target, unit, or production option.
- Alpha begins preselected, help pauses the simulation, and mobile MULTI selection makes additive unit control explicit.

## Build 0.8 checkpoint — Shadow Snake foundation

- Guided and Standard are materially less punishing: larger operating budgets, stronger stipends, later and more widely spaced raids, fewer early contacts, softer detection, and lower enemy damage.
- The abstract green/red counters are replaced by eight original illustrated tactical unit sprites with distinct silhouettes and role readability.
- The battlefield is now a much larger scrollable snow-island theater with an original 16:10 terrain painting, a lower-left FOB, center logistics zone, radar plateau, concealment lanes, and upper-right fortress.
- Desktop box selection joins touch MULTI, double-click type selection, persistent Alpha/Bravo/Charlie groups, and cohort filtering.
- The campaign opens with **The Unwanted Son**: Eli rejects the identity assigned by his creators, adopts **Shadow Snake**, and intercepts a genetic brother-signal embedded in a black-weapons command network.
- The first campaign spine is provisional: Prologue — The Unwanted Son; Act I — Brother Signal; Act II — A Nation of Soldiers; Act III — The Inheritance War.

## Build 0.9 checkpoint — persistent island theater

- Level 1 is now one persistent four-operation theater instead of a short linear raid: FOOTHOLD, GHOST LINE, BLACK RELAY, and CROWN FALL.
- Each operation expands the playable map, adds objectives and enemy infrastructure, pauses at a narrative checkpoint, and offers one honest strategic reward: GMP, a reinforcement, or battlefield intelligence.
- The player's FOB, structures, army, veterans, squads, research, staff, resources, and captured income persist across every operation on the map.
- Guided and Standard are calmer again: larger budgets, stronger stipends, lower hostile damage, fewer early raid contacts, and substantially wider raid windows.
- The theater culminates in BASILISK REX, an armored command prototype that gates the final uplink and rewards combined-arms counterplay.
- David's signal develops across play rather than a lore dump: Eli remembers his brother with genuine affection, hears David invite him forward, and ends the prologue with evidence that David may have authored the trap.
- Locked regions, adaptive operation objectives, map-expansion labels, boss health, checkpoint choices, and live strategy guidance make the long-form loop visible on mobile.

## Canon and Kojima doctrine for adaptation

Canon anchors verified against Konami's Metal Gear archive and the MGSV material:

- Eli is the young Liquid Snake, one of the Les Enfants Terribles clones, and leads child soldiers before clashing with Venom Snake.
- Eli escapes with Tretij Rebenok and Sahelanthropus; the unfinished Kingdom of the Flies material leaves the largest useful narrative gap between MGSV and the later Liquid Snake.
- Do not flatten Eli into “the evil clone.” His belief that he received inferior genes is the wound; the dramatic point is whether genes, labels, and inherited hatred actually determine a person.

Honor Kojima through design principles, not imitation:

1. **Anti-war and anti-nuclear consequence:** weapons and deterrence create systems of suffering; spectacle must not become uncomplicated military worship.
2. **Inheritance:** every act asks what is passed on—gene, meme, historical scene, intention/sense, peace, revenge, race, and the player's own doctrine.
3. **Free infiltration:** stealth is one valid strategy inside a broad possibility space, not a perfection test. Terrain, weather, equipment, and timing should support multiple plans.
4. **Home versus hostile territory:** the FOB is emotional and mechanical refuge, but its people and crises require player decisions rather than passive exposition.
5. **Ambiguity over clean morality:** antagonists have losses and convictions; victory may remove a target without ending the chain of revenge.
6. **Mechanics carry theme:** recruitment, recovery, escalation, casualties, deterrence, propaganda, and inherited technology must change play—not exist only in dialogue.
7. **Surprise and playfulness:** fourth-wall ideas, strange optional solutions, dark humor, nonlethal boss outcomes, and system interactions belong beside the political tragedy.

Fan-theory and wishlist inputs are inspiration, never canon:

- Resolve the emotional gap after Eli's escape without pretending to “restore” an official lost ending.
- Give Eli agency and an evolving ideology instead of using him only as connective tissue for later canon.
- Explore his bond with the psychic child as companionship, manipulation, mutual survival, and dangerous emotional amplification.
- Let the player build the proto-organization that eventually informs Eli's worldview, then confront whether it liberates soldiers or simply recreates the father's cage.
- Seed David as a distant signal/rival before making him a playable perspective; avoid rushing the brothers into a conventional good-versus-evil confrontation.

Primary research links:

- Konami Metal Gear archive: https://www.konami.com/mg/mc/s/media/mc1_sample_mgs_en.pdf
- Kojima on the thematic sequence: https://x.com/HIDEO_KOJIMA_EN/status/342798547168686080
- EA's C&C Remastered play guide: https://help.ea.com/en/articles/command-and-conquer/command-and-conquer-remastered/how-to-play/

## Next slice — make the persistent theater deeply replayable

Build 0.9 establishes the intended mission grammar. Do not add a second map until this theater feels consistently fun across multiple complete runs.

1. **Command fluency:** drag/box selection where supported, queued waypoints, clearer contextual commands, formation spacing, focus-fire and retreat behavior, and better touch parity.
2. **Stealth causality:** cover and concealment readability, search sectors, guard communication, detection memory, alarms that can be interrupted, and clearer nonlethal/recovery tradeoffs.
3. **Combat depth:** weapon roles, armor and penetration, suppression and morale, cover bonuses, friendly sustain, target priorities, and more legible damage feedback.
4. **Base warfare:** clearer build radius and power states, defensible placement choices, repair crews or repair zones, meaningful production dependencies, and enemy infrastructure counterplay.
5. **Opponent doctrine:** distinct scout, security, assault, and siege behaviors; raids should react to the player's exposed economy instead of simply pathing toward the FOB.
6. **Balance and UX gate:** Standard must support at least three viable openings, Guided must teach a first-time player without outside instructions, and every essential action must work clearly with touch or mouse.

7. **Theater pacing:** tune operation length, checkpoint rewards, boss durability, and raid escalation from real playthrough feedback; add save/resume only after the pacing is stable.
8. **Narrative consequence:** let nonlethal recovery, losses, infrastructure destruction, and chosen checkpoint rewards alter later dialogue and encounter composition without multiplying exposition.

After those gates feel solid, build Map 2 around the coordinates David supplies and introduce a distinct biome, enemy doctrine, mission set, and story choice rather than reskinning Map 1.

## Build 1.0 checkpoint — command center and campaign foundation

- Desktop drag selection now begins only from empty terrain after a deliberate movement threshold; clicking units, structures, nodes, caches, or controls no longer accidentally starts a selection box.
- Mobile play has explicit ORDERS and PAN MAP modes plus persistent quick access to all forces and Alpha/Bravo/Charlie groups.
- Critical HUD, objective, command-deck, button, and status text has a substantially larger baseline, with a separate Large-text setting.
- The title screen is now the persistent Command Center: Continue, Campaign, Doctrine, Profile, and Settings.
- Device saves preserve an active theater. Optional ChatGPT sign-in adds account-backed profile, settings, stats, and save synchronization.
- Campaign stats and non-exploitative Doctrine Points establish long-term progression. Doctrine unlocks strategic openings and side-grade capabilities, never basic usability.
- `GAME_STORYBOARD.md` is now the canonical campaign/game-structure plan. It defines the continuous theater grammar, Eli/David arc, mission types, progression rules, Prologue storyboard, and pre-Theater-2 production gates.

### Updated next focus

Build 1.1 is command fluency: queued waypoints, formation presets, focus fire, retreat/guard-area commands, touch-context command reduction, and stacked-unit selection priority. Do not start Theater 2 until the 1.1–1.4 gameplay gates in `GAME_STORYBOARD.md` are met.

## Build 1.4 checkpoint — progression resilience and command fluency

- Variable-length operation roles are now shared campaign authority: four-operation theaters go foothold → radar → relays → finale, while five-operation theaters insert command before the finale. This closes the Act I trap where a theater could wait on a command-sector asset it never spawned.
- Local and account-backed progress now merge completed theaters and doctrine instead of allowing a stale server response to replace local completion. Advancing from a victory also records the completed theater atomically before briefing the next one.
- Units carry serializable order queues. Queue/Shift appends, direct orders replace, completed orders promote the next waypoint, and checkpoint/save migration restores older units safely.
- Wedge, line, column, and loose formation placement, numbered queued-waypoint lines, focus fire, 12-meter guard areas, FOB fallback, NEXT/TAB cycling, and a scrollable mobile command rail complete the first command-fluency implementation.
- The incoming original painted-miniature handoff is active for its authored high-frequency roles/facilities. It remains a partial art pass; hostile and remaining roster consistency is intentionally deferred.
- Live field inspection caught sprite-sheet overflow that CSS clipping alone did not resolve. Painted sheets now use a nested 384×512 SVG cell viewport, so adjacent production cells cannot spill across the battlefield.
- Sixteen deterministic checks pass across campaign, variable-length roles, stale sync, commands, mission states, economy, counters, and preview metadata. Full lint passes. Human-speed Act I/II and 390×844 interaction remain the honest verification boundary.

## Build 1.4 grid-board correction

- Replaced the mismatched decorative grid/build grid with one 32×20 square-cell tactical board.
- Personnel now render and read as individual 1×1 operatives. Mules, wheeled vehicles, tanks, walkers, and facilities use visible multi-cell footprints; the Forward Command is a 3×3 base landmark.
- Structure and unit buttons now occupy their full visual footprint, so a click/tap on any part selects that entity. Existing saves snap their units, structures, nodes, and caches onto the board when resumed.
- Spawn placement uses the nearest open cell and formation destinations snap to deterministic grid slots. Lint, production build, deterministic suite, desktop grid inspection, full-footprint operative click, and Forward Command click were verified.

## Build 1.5 candidate — complete storyboard campaign shell

- Expanded the executable campaign authority from seven theaters / 33 operations to the complete 13-theater / 59-operation storyboard: Prologue, Acts I–IV, and No Man's Haven as the terminal endgame.
- Added all Act III and Act IV theaters with operation names, objectives, signals, victory copy, opponent doctrine, appropriately scaled theater bosses, and exact sequential unlocks.
- Added a campaign cast ledger to every theater so Eli / Shadow Snake, David / Rotten Snake, Wren, Tretij, Grey Fox, EVA, Kaz, Ocelot, Madnar, Dr. Clark, George, and the Big Boss archive appear within their era-appropriate ceilings.
- Added theater pressure profiles that materially change reserves, passive income, raid cadence, detection, and hostile damage while retaining Guided/Standard survivability.
- Added four persistent Tier 4 Doctrine upgrades with real deployment effects: forward stores, electronic blackout, veteran counter-force, and medical-recovery attachment.
- Added full-campaign scope/readability to the Command Center, operation tracks and cast to theater inspection, cast and pressure rules to briefings, biome palette differentiation, and an explicit final campaign-resolution screen.
- The 59-operation deterministic graph, all 13 sequential unlocks, explicit victory/defeat, build, lint, and desktop campaign-to-battlefield launch pass. Bespoke theater geometry, objective systems, full sprite consistency, human-speed endurance, and dedicated phone verification remain honest production targets.

## Build 1.6 candidate — mobile command and free-movement correction

- Added explicit device-width/cover viewport metadata so phones render the compact interface instead of shrinking the desktop command deck into an unreadable page.
- Rebuilt compact play around a full-screen battlefield, non-overlapping phone HUD lanes, a fixed six-column/two-row thumb command cluster, selection readout, explicit Order/Pan modes, group cycling, selection centering, and a scrim-backed bottom-sheet command deck. Armed abilities and ready build placement automatically return the player to the map.
- Unit orders and formation destinations now preserve free-form coordinates. The 32×20 grid remains authoritative for structure construction and readable hit footprints, while restored saves retain continuous unit positions.
- Exact-edge structure adjacency is legal. Same-kind facilities and compatible wall/gate pieces detect cardinal neighbors, remove the artificial seam, and render connection foundations in both the placement preview and completed base.
- Removed contaminated Guard/Hunter raster exports from live mapping because their source images include partial neighboring figures; their complete original vector miniatures remain active until clean production crops exist.
- Lint, the verified production artifact, and all 17 deterministic command/campaign/mission/economy/rendered-output checks pass, including the device-width viewport assertion. Hands-on 390×844 interaction remains the honest final usability gate.

## Build 1.7 candidate — tactical causality and readable opponent doctrine

- Added `game/tactical-doctrine.mjs` as a pure, save-safe authority for all 13 theater field profiles, terrain effects, morale bands, alarm rates, and deterministic raid cycles/compositions.
- Hard cover now reduces incoming damage and suppression; concealment lowers detection signature; elevation increases vision/outgoing damage; hazard zones slow and expose. Zones change by theater and state their rule directly on the map and briefing.
- Units now persist morale and visibly move through steady, shaken, pinned, and broken states. Fire cadence, movement, hospitals, medics, and time out of combat interact with morale.
- Patrol contacts now start an interruptible alarm uplink. Breaking sight, sedating/eliminating the caller, or degrading its communications can stop full escalation; the HUD and coach expose the exact window.
- Scout, sabotage, assault, and siege raids telegraph their doctrine, use theater-specific cycles, spawn deterministic conventional compositions, and prioritize sensors, infrastructure, production, or defenses accordingly. Metal Gear-class units remain finale-only.
- Added tactical-condition, alarm, last-known, morale, terrain, and raid-role feedback for desktop and the compact HUD. Older saves migrate missing morale/alarm state safely.
- Twenty pure deterministic tests and full lint pass. The internal game preview remained healthy but the current cloud browser could not attach; production checkpoint/build and user hands-on mobile/endurance testing remain the release boundary.
