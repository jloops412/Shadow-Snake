# Shadow Snake: Command Rex — Build 2.0 Gameplay / Map / UI Refoundation Plan

**Status:** Planning authority for the next implementation program  
**Date:** 2026-08-11  
**Proof slice:** Sable Crown — Operation 2: **GHOST LINE**  
**Scope:** gameplay architecture, map/grid/world design, mission/operation flow, traversal, HUD/menu UX, rendering, and art-production workflow.  
**Out of scope for this pass:** rewriting the campaign story, replacing the terminal-state authority, throwing away working simulation systems, or producing 59 bespoke maps before the core loop is fun.

---

## 1. Why this refoundation exists

Build 1.9 has accumulated many correct pieces: persistent theaters, reusable mission families, continuous unit movement, grid-based construction, captured-outpost build authority, terrain effects, alarms, morale, formations, contextual commands, and explicit victory/defeat. The problem is not a lack of systems. The problem is that they do not yet read or play as one coherent modern tactical-espionage RTS.

The next build must fix the player-facing loop rather than keep stacking systems onto the current presentation.

### Binding diagnosis

1. **Stealth is not currently the first-class default even though this is Metal Gear-led design.** Live strategy can push generic RTS opening behavior such as building a turret when the better default is recon, infiltration, information gathering, deception, or bypass.
2. **The 32×20 board is doing too many jobs at once.** It is construction lattice, barrier route helper, visual board, and implied map scale. That makes larger, richer terrain and traversal awkward.
3. **Maps are visually evocative but mechanically too shallow.** Current terrain zones are large rectangles layered over a painted map. They need to become authored terrain, routes, lanes, obstacles, cover, height, water, build plates, traversal links, and objective geometry.
4. **The UI exposes implementation state instead of player intent.** Too many panels/cards/stats compete at once. Menus and battlefield UI need progressive disclosure and stronger spatial consistency.
5. **`app/page.tsx` is a merge and iteration bottleneck.** Simulation wiring, menu shell, input, HUD, battlefield, and view state are too concentrated. Parallel agents will keep colliding until the presentation layer is decomposed.
6. **Artwork is being produced as isolated sprites/backgrounds instead of a reusable world kit.** Better art alone will not solve grid fit, structure joining, terrain transitions, camera consistency, or map authorship.

---

## 2. Design thesis

### 2.1 The game is a stealth-first RTS, not a conventional RTS wearing Metal Gear UI

The default problem-solving order is:

**observe → identify → infiltrate → manipulate → recover/extract → escalate only if chosen or forced**

Assault, base warfare, armor, turrets, and siege remain important. They are contingencies and strategic choices, not the mandatory first answer.

### 2.2 Buildings are griddy; troops are not imprisoned by the grid

The battlefield should have the clean strategic readability of lane/territory/tower-rush maps without turning movement into a lane-locked mobile game.

- Structures, walls, roads, bridges, deployables, and objective compounds obey authored cells/footprints.
- Infantry and vehicles move continuously in world space.
- Terrain and lanes influence path cost, visibility, noise, buildability, and tactics rather than forbidding all off-lane movement.
- The grid becomes most visible during construction, engineering, tactical-map planning, and selection—not as a permanent checkerboard over the art.

### 2.3 Maps are systems, not backgrounds

A map must answer these questions before art production begins:

- Where are the primary routes?
- Where are the stealth routes?
- What can be flanked, climbed, crossed, cut, powered, hacked, destroyed, repaired, or bridged?
- Where can a forward site become a meaningful satellite base?
- What does reconnaissance reveal that the player did not already know?
- What changes if the player stays quiet versus triggers full response?
- Where can an enemy patrol logically search after losing contact?

### 2.4 UI has three information depths

1. **Now:** persistent HUD — only information required to make the next battlefield decision.
2. **Do:** contextual commands — actions relevant to the selected unit/structure/place.
3. **Plan:** tactical map, construction, deployment, R&D, intel, doctrine, and deeper management panels.

No feature gets to create a permanent card just because it exists.

---

## 3. External design anchors

These are principles to learn from, not assets/UI/maps to copy.

### Metal Gear Solid V

Official Konami and PlayStation material emphasizes sprawling/open mission spaces, tactical freedom, Mother Base growth, Fulton recovery, resource/personnel collection, support teams, and a field map used for marks and landing zones.

Use that as the Metal Gear gameplay anchor:

- multiple infiltration routes;
- intel before force;
- recovered people/resources matter outside the immediate firefight;
- pre-mission insertion/support choices matter;
- base/support growth changes what is possible on the field.

References:
- https://www.konami.com/games/us/en/topics/34/
- https://www.konami.com/mg/mgs5/tpp/jp/base/mb_fob.php
- https://www.konami.com/mg/mgs5/tpp/jp/idroid/index.php
- https://www.playstation.com/en-us/games/metal-gear-solid-v-the-phantom-pain/

### Company of Heroes

The useful lesson is not WWII presentation. It is that territory, cover, front lines, destructible/alterable routes, and flanking make ordinary movement decisions tactical. Captured territory should pull players into the field rather than reward passive base turtling.

References:
- https://www.companyofheroes.com/en/post/art-authenticity-developer-diary
- https://sega.prezly.com/company-of-heroes-3-destruction-dev-diary
- https://www.companyofheroes.com/index.php/en/post/mission-alpha-coh-development-feedback
- https://www.gamedeveloper.com/design/on-company-of-heroes

### Command & Conquer / Tempest Rising / Age of Empires

Use classic RTS grammar for fast recognition: stable build categories, familiar selection/orders, compact command cards, grid-correlated hotkeys, readable production, and low-friction base construction. Tempest Rising is a current example of classic base RTS conventions carried into a modern presentation; Age of Empires' grid hotkey model reinforces consistent command placement.

References:
- https://store.steampowered.com/app/1486920/Tempest_Rising/
- https://www.ageofempires.com/learn-to-play/match-goals-aoe2/

### Death Stranding — subtle traversal influence only

The relevant idea is that difficult terrain becomes a planning problem that equipment can permanently or temporarily solve. Ladders, ropes, bridges, and route planning create player-authored traversal. Use this subtly; do not turn the game into a Death Stranding imitation.

Reference:
- https://deathstrandingpc.505games.com/en/death-stranding-directors-cut-beginners-guide/

---

## 4. Target end-to-end operation loop

Every operation should be able to express this loop even when some steps are short or optional.

### Step 1 — Brief / insertion plan

Player sees:
- known objective;
- known enemy capability, with uncertainty clearly marked;
- initial insertion choices;
- available support assets;
- optional recommended loadout/teams;
- terrain/weather notes that actually affect play.

Player chooses an intent, not a scripted build order.

### Step 2 — Recon

Recon is active gameplay.

Possible actions:
- send a scout/stealth element to an observation point;
- deploy a sensor;
- interrogate/recover a patrol;
- hack a camera/radar/relay;
- observe a route from elevation;
- use intel support to reveal a limited sector.

Recon can reveal:
- patrol routes;
- alarms/comms links;
- hidden entrances;
- power dependencies;
- objective variants;
- safe build plates;
- water/cliff traversal points;
- extraction/LZ options.

### Step 3 — Infiltrate / manipulate

The player should be able to win substantial portions of an operation by changing the system rather than killing everything.

Examples:
- open an IFF gate;
- cut power to cameras;
- spoof a sensor network;
- use concealment and elevation to bypass a strongpoint;
- recover an engineer with credentials;
- disable an alarm transmitter before it completes;
- route through a field-engineered crossing.

### Step 4 — Objective action

The objective can be captured, hacked, recovered, destroyed, authenticated, escorted, repaired, or isolated depending on operation family.

### Step 5 — Escalation, if chosen or forced

Alert does not mean the mission becomes invalid. It changes the battlefield:
- patrols become search teams;
- reserve routes activate;
- heavy defenses wake up;
- enemy logistics reinforce certain sectors;
- the player may choose to withdraw, re-hide, sabotage response systems, or commit assault assets.

The game should support recovering from suspicion/caution and, where plausible, dropping out of full contact after breaking the response network.

### Step 6 — Extract / consolidate

A successful objective is not always the end of player control. Some operations should require a short extraction/consolidation phase:
- reach LZ/exfil;
- recover target/personnel/cargo;
- hold a hacked uplink long enough to transmit;
- pull compromised units back to a safe forward site.

### Step 7 — Debrief and persistent consequence

Debrief should summarize player doctrine, not just score kills.

Track at minimum:
- detections;
- completed alarm transmissions;
- lethal eliminations;
- nonlethal recoveries;
- personnel/resources/vehicles recovered;
- infrastructure preserved/destroyed;
- optional intel secured;
- friendly losses/injuries;
- objective method;
- escalation tier reached.

---

## 5. Three-route mission doctrine

Every operation family should expose multiple viable methods wherever the fiction permits.

### GHOST route

Stealth / EW / deception / nonlethal / bypass.

Typical tools:
- Wraith, Ghost, Hacker, Specter;
- concealment;
- sensor spoof/jamming;
- tranquilize/recover;
- silent engineering crossing;
- alternate entrance;
- power/comms manipulation.

### CONTROL route

Territory / engineering / capture / logistics / network control.

Typical tools:
- capture forward nodes;
- build low-signature support;
- repair or restore systems;
- take a bridge/gate/relay intact;
- stage units from a forward site;
- use logistics to maintain a wider operation.

### FORCE route

Combined arms / breach / suppression / armor / siege.

Typical tools:
- assault infantry;
- anti-armor;
- vehicle support;
- turrets and perimeter defenses;
- demolition;
- focused attacks on enemy dependencies.

**Rule:** GHOST is the first suggested route for ordinary Metal Gear-style missions. CONTROL is the normal strategic expansion route. FORCE is always available when the mission fiction allows it, but the advisor must not teach the player that a turret is the universal opener.

---

## 6. Stealth rewards without turning stealth into a perfection test

A stealth-first game should reward stealth materially, but detection should create new play rather than force reloads.

### 6.1 Operation evaluation bands

Use independent accolades rather than one opaque score:

- **NO TRACE** — no completed alarm transmission;
- **GHOST** — objective completed with very low detection and no sustained alert;
- **MERCIFUL** — no lethal eliminations;
- **RECOVERY** — valuable personnel/resources extracted;
- **CLEAN HANDS** — critical infrastructure preserved;
- **INTELLIGENCE** — optional evidence/intel secured;
- **FIELDCRAFT** — alternate/traversal route used successfully.

These can contribute to an overall letter/rank later, but the actionable details remain visible.

### 6.2 Rewards

Stealth/precision bonuses can grant:
- additional GMP;
- research intel;
- personnel quality;
- lower enemy readiness in the next operation;
- an undiscovered forward route remaining usable;
- optional blueprint/support unlocks;
- narrative/state facts where appropriate.

Do not make stealth mandatory to finish the campaign. Reward it because it preserves options and reduces escalation.

---

## 7. Replace scripted live strategy with an adaptive advisor

The current `GuideStep` concept is too close to a tutorial script. Replace it with a pure `advisor-doctrine` system that ranks context-sensitive suggestions.

### Inputs

- operation family;
- current objective state;
- threat/security state;
- known vs unknown intel;
- available unit roles;
- selected player doctrine;
- build state;
- detected alarms/comms;
- terrain/traversal opportunities;
- current resource pressure;
- player behavior this operation.

### Output

At most three suggestions:

1. **Recommended** — usually the quietest high-value next action;
2. **Alternative** — different strategic route;
3. **Recovery** — how to stabilize if the player's current plan is failing.

Example for early GHOST LINE:

- Recommended: **Scout the radar rise** — Wraith/Specter can reveal relay coverage without triggering the perimeter.
- Alternative: **Spoof the outer sensor** — Hacker can create a low-signature opening.
- Recovery: **Secure the west supply node** — opens a forward support grid if the infiltration becomes prolonged.

There is no “build a turret” recommendation unless the actual field state makes perimeter defense useful.

### Hard rules

- Advisor suggestions never become hidden completion requirements.
- If the player already completed the objective by another method, the advisor immediately advances.
- If a recommended asset is dead/unavailable, choose another route.
- Guidance may be disabled without changing mission logic.

---

## 8. World/map architecture v2

### 8.1 Variable-size authored maps

Supersede the assumption that every battlefield is exactly a visible 32×20 board.

Target the first Sable Crown v2 map at **96×60 logical cells**. The map schema must allow other dimensions later.

This does not mean 5,760 visible squares. It means the world has enough addressable detail for:
- 1×1 personnel;
- multi-cell structures;
- narrow roads;
- meaningful water/cliff edges;
- cover lines;
- route junctions;
- building compounds;
- traversal devices;
- finer fog/intel reveal.

### 8.2 Coordinate model

Move map/gameplay geometry away from percentage-of-screen thinking.

Use:
- logical cell coordinates for authored map semantics;
- world coordinates for continuous unit positions;
- camera projection for screen coordinates.

The renderer is responsible for zoom/pan. Simulation should not care what percentage of the browser a unit occupies.

### 8.3 World layers

Each map owns these layers or equivalent compact representations:

1. **Ground visual** — snow, dirt, road, concrete, vegetation, shoreline, etc.
2. **Elevation** — discrete height band plus climbability.
3. **Navigation** — passability and movement cost by unit class.
4. **Buildability** — foundation quality and permitted footprint types.
5. **Cover** — directional hard/soft cover geometry.
6. **Concealment** — signature reduction and sight obstruction.
7. **Water** — dry / shallow / deep / current or equivalent.
8. **Noise** — quiet / normal / loud terrain contribution.
9. **Hazard** — ice, fire, electricity, contaminated ground, etc.
10. **Destructible/interactive** — walls, doors, fences, bridges, generators, lights, cameras.
11. **Intel/reveal** — what the player knows versus what exists.
12. **Ownership/sector** — control-point and forward-base authority.

The current broad theater terrain modifiers remain useful, but become defaults/material rules feeding these authored layers rather than three rectangles doing all terrain work.

---

## 9. Strategic lanes without lane-locked troops

A map should contain an authored route graph:

- **Primary route(s):** fast, obvious, vehicle-friendly, heavily observed.
- **Secondary route(s):** slower, less exposed, often infantry-friendly.
- **Infiltration route(s):** concealment, crawl gaps, ladders, drainage, water, roofline, maintenance corridors, etc.
- **Cross-links:** let the player switch plans instead of committing to one lane for the entire mission.

The route graph influences:
- default path cost;
- patrol design;
- enemy reinforcement logic;
- structure compounds;
- control-node placement;
- visual composition;
- advisor suggestions;
- minimap readability.

It does **not** hard-lock free movement where the actual terrain is traversable.

### Map-shape target

For the first refoundation slice, build roughly:
- 3 primary strategic corridors;
- 2–4 cross-links;
- 2 stealth-biased bypasses;
- 1 traversal route initially unavailable until recon/engineering;
- 4–7 meaningful control/utility nodes;
- 3 enemy compounds with distinct dependencies;
- at least 2 valid approaches to the main objective.

---

## 10. Fog, reveal, intel, and search behavior

### 10.1 Do not use artificial map locks as the default reveal mechanic

The player may know the broad terrain silhouette while lacking tactical information.

Separate:
- **terrain known**;
- **terrain currently visible**;
- **enemy last known**;
- **enemy currently observed**;
- **infrastructure identified**;
- **objective confirmed**.

### 10.2 Recon reveal

Recon actions should reveal specific information instead of simply removing a dark rectangle:
- patrol route segments;
- camera arcs;
- communications links;
- mine/hazard areas;
- power lines;
- secret routes;
- reinforcement entry points;
- objective subcomponents.

### 10.3 Search sectors

When contact is lost, hostiles search the last-known area and likely exits. They do not retain perfect omniscience.

Use:
- last known point;
- local sector graph;
- nearby route junctions;
- known player forward sites;
- alarm network state.

This gives map geometry real stealth value.

---

## 11. Pathfinding and movement

Do not replace continuous movement with tile hopping.

### 11.1 Preferred route stack

1. Attempt direct continuous route.
2. If the route intersects impassable terrain/barriers, query the world navigation graph.
3. Use shared route/flow data for groups where practical rather than independently searching the entire map for every unit.
4. Return continuous waypoints through the chosen corridor.
5. Local avoidance/formation code handles unit spacing.

The current barrier detour authority is a useful seed but must generalize beyond walls/gates.

### 11.2 Terrain costs

Pathfinding accounts for:
- unit class;
- water depth;
- slope/elevation;
- road bonus;
- concealment preference for stealth stance;
- hazard/noise cost;
- known enemy observation if the player enables cautious routing;
- player-created traversal links.

A stealth unit and a tank should not naturally pick the same route just because the geometric distance is shortest.

### 11.3 Path modes

Contextual route preference:
- **Fast** — shortest practical time;
- **Quiet** — minimize exposure/noise;
- **Safe** — avoid known threat arcs/hazards;
- **Direct** — player explicitly accepts risk.

These can later become modifier keys/command options; they do not need a large permanent UI.

---

## 12. Field engineering / traversal system

This is the subtle Death Stranding nod and an important Metal Gear-style systemic layer.

### First implementation set

#### Ladder
- infantry traversal across a short cliff/height edge;
- fast to deploy;
- visible and recoverable;
- may become a route usable by patrols if discovered.

#### Rope / anchor line
- infantry crossing for steep descent/ascent or short chasm;
- lower signature than a bridge;
- slower throughput;
- vulnerable to being cut/destroyed.

#### Portable bridge
- crosses narrow streams/gaps;
- supports infantry and possibly light vehicles by upgrade/variant;
- higher logistics cost and visual signature.

#### Breach / field opening
- engineer creates a controlled opening in fence/wall/blocked passage;
- louder than climbing/bypass;
- changes navigation graph persistently for the operation/theater when appropriate.

### Later possibilities

- pontoon/temporary vehicle bridge;
- cable traverse;
- amphibious/raft support;
- collapsible concealment screen;
- restored drawbridge or power-controlled gate.

### Core technical rule

A traversal device creates/removes a **navigation link**. Pathfinding, minimap, AI, saves, and objective logic consume the same link state.

---

## 13. Base building becomes a doctrine choice

Captured outposts already project construction authority. Keep that. Improve the tradeoff.

### 13.1 Low-signature field support

Examples:
- passive sensor;
- comm repeater/jammer;
- concealed supply cache;
- field aid post;
- recovery point;
- small generator/battery;
- temporary engineering equipment.

These support stealth/control play with limited detection footprint.

### 13.2 High-signature base infrastructure

Examples:
- turret/missile defense;
- vehicle fabrication;
- large supply depot;
- research/communications complex;
- heavy generator;
- repair bay.

These provide major capability but increase detectable **base signature / operational heat**.

### 13.3 Operational heat

Do not punish building arbitrarily. Make the tradeoff legible:
- more powered/high-profile infrastructure increases the enemy's ability to locate or prioritize the site;
- jamming/concealment/power discipline can reduce signature;
- captured territory and destroyed enemy intel networks can offset it.

This makes a heavy forward base a strategic choice instead of a universal opening.

---

## 14. MGSV-style recovery and support integration

The existing Recovery Mule/logistics loop is a strong base. Expand it toward a field-recovery ecosystem rather than ordinary resource harvesting.

### Recovery candidates

- personnel;
- weapons/components;
- vehicles;
- cargo/resources;
- intelligence media;
- specialist prisoners/defectors where story permits.

### Recovery methods

- physical mule/convoy;
- secured extraction zone;
- Fulton-style recovery when equipment/weather/security permits;
- vehicle tow/recovery for heavy assets.

### Persistent effect

Recovered assets feed:
- staff;
- R&D;
- support capability;
- theater logistics;
- optional personnel roster;
- intelligence.

This should eventually connect on-map play to a stronger Mother-Base-like strategic layer without requiring that entire layer to ship in Build 2.0.

---

## 15. Battlefield UI refoundation

### 15.1 Persistent HUD budget

The normal battlefield should reserve persistent space for only:

#### Top-left — mission intent
- current objective, 1–2 lines;
- optional objective count/indicator;
- click/tap expands mission details.

#### Top-center — threat state
- HIDDEN / SUSPICION / CAUTION / ALERT;
- alarm transmission progress only while relevant;
- compact weather/operation modifier when it matters.

#### Top-right — strategic resources
- GMP;
- power;
- supply;
- optional small income/signature indicator.

#### Bottom-left — minimap
- meaningful map, not decorative thumbnail;
- control nodes, known enemies, objectives, lanes/terrain hints;
- filters;
- expandable to tactical map.

#### Bottom-center/right — command strip
- selected entity/group identity;
- HP/status;
- stance;
- 3–6 highest-value contextual commands;
- stable hotkey positions;
- overflow only when necessary.

#### Right edge — transient only
- short event feed/toasts;
- no permanent card stack.

### 15.2 Contextual entity surface

Preserve the good direction from Build 1.9, but constrain it.

A selected field entity may show a small anchored label/ring with no more than roughly 3 immediate actions. The full action list belongs in the command strip/deep panel.

#### Unit selected

Show:
- stance;
- role action(s);
- rank/veterancy only if useful;
- fallback/guard when relevant.

#### Structure selected

Show:
- repair;
- upgrade;
- power/system toggle if applicable;
- salvage;
- production queue only for production structures.

#### Captured outpost selected

Show:
- fortify;
- rally;
- logistics;
- enter Build mode.

Do not open the giant planning deck merely because something was clicked.

### 15.3 Tactical map

Adopt a true expanded tactical map as a first-class control surface.

It should support:
- select units/groups;
- issue/queue move orders;
- inspect control/territory;
- inspect known patrols/threats;
- toggle intel/build/terrain layers;
- review operation plan;
- jump camera to alerts/objectives.

This is the natural home for “ops” planning and reduces HUD clutter.

---

## 16. Main menu / Command Center refoundation

The main menu should feel like a modern game shell, not a responsive website dashboard.

### Primary destinations

- Continue / current operation;
- Campaign;
- Command / personnel & deployment;
- R&D / Doctrine;
- Archive / intel;
- Settings.

Do not show all of them as equally loud cards simultaneously.

### Layout rules

- one primary panel at a time;
- persistent compact global nav;
- clear Back behavior;
- selected campaign/theater stays visible while browsing mission details;
- responsive safe-area container rather than absolute positioning tuned to one screen;
- use `clamp()`/container-query sizing and explicit density rules;
- ultrawide stretches world art, not text/card line lengths;
- portrait phone uses stacked navigation and bottom sheets, not a scaled desktop shell.

### Required test shapes

- 390×844 portrait phone;
- 1366×768 laptop;
- 1440×900 desktop;
- 1920×1080 desktop;
- 2560×1080 ultrawide.

This is a focused visual/interaction matrix, not a reason to run exhaustive tests after every tiny change.

---

## 17. Rendering architecture: React UI + dedicated battlefield renderer

### Recommendation

Keep React for application shell, accessible menus, HUD, settings, account/profile, and deep panels. Introduce a dedicated 2D battlefield renderer behind an adapter, with **PixiJS v8** as the preferred implementation target.

Why PixiJS rather than moving the entire game into Phaser or another full engine:
- the current game already has pure mission/campaign/simulation modules;
- PixiJS is a renderer, so it can replace DOM-heavy battlefield drawing without owning campaign/saves/UI;
- it is MIT/open source;
- current v8 supports high-performance sprite rendering and modern WebGL/WebGPU backends;
- official PixiJS guidance now includes AI-agent skills, useful for a multi-agent implementation workflow.

References:
- https://pixijs.com/
- https://pixijs.com/8.x/guides/concepts/performance-tips
- https://pixijs.com/blog/june-2026

### Migration rule

**No big-bang rewrite.**

1. Extract a renderer-neutral `BattlefieldViewModel` from current GameState.
2. Keep current DOM renderer available behind a feature flag during the spike.
3. Implement terrain/camera/sprite selection in Pixi first.
4. Move fog/effects/projectiles after interaction parity.
5. Keep React overlay for HUD/context/menus.
6. Delete old battlefield DOM only after input/save/selection parity.

---

## 18. Map authoring: Tiled JSON pipeline

Use **Tiled** as the preferred external map-authoring tool unless the spike discovers a blocking issue.

Why:
- variable/infinite maps;
- layered tile/object data;
- JSON export suited to browser JS;
- Wang/terrain sets for roads, shorelines, cliffs, and terrain transitions;
- object layers for control nodes, objectives, routes, patrol anchors, build plates, traversal sockets, and cover.

References:
- https://www.mapeditor.org/
- https://docs.mapeditor.org/en/latest/reference/json-map-format/

### Proposed authored layers

- Ground
- Roads
- Water
- Elevation / Cliffs
- Cover
- Concealment
- Buildability
- Hazards
- Interactives
- Objectives
- Control Nodes
- Patrol Anchors
- Reinforcement Entrances
- Traversal Sockets
- Art Props / Landmarks

Map parsing should normalize Tiled data into the pure `WorldMap` schema so simulation does not depend directly on the editor format.

---

## 19. Art-production bible

Before requesting another giant batch of images, produce one stable art bible and one working biome kit.

### 19.1 Camera and scale

- consistent top-down / elevated tactical camera;
- individual infantry occupy a 1×1 logical footprint and remain human scale;
- vehicles/structures declare multi-cell footprints;
- only declared Metal Gear-class threats receive intentionally huge silhouettes;
- character portrait art and battlefield miniature art are separate asset classes.

### 19.2 Terrain kit per biome

Each biome pack should include:
- base ground variants;
- road/path tiles;
- shoreline/water transitions;
- cliff/elevation transitions;
- concealment props;
- hard-cover props;
- hazards;
- fences/walls/gates;
- control-node language;
- 2–4 unique landmarks;
- decals/wear for variation.

### 19.3 Structures

Every structure asset ships with:
- declared footprint;
- occupancy mask if non-rectangular later;
- selection/hit footprint matching the visible art;
- clear entrance/facing where relevant;
- connection sockets for same-family neighbors;
- damaged/offline states where important.

The visible structure should fill most of its footprint. A 3×2 building cannot look like a 1×1 icon floating in six cells.

### 19.4 Units

Do not solve unit variety with recolors.

For the first polished set:
- distinct body/equipment silhouette;
- stable faction material language;
- at least facing-aware movement/idle presentation;
- restrained effects so selection/health/threat state remain legible.

### 19.5 Atlas workflow

Agents should deliver sprite atlases/tilesets with metadata, not ad hoc individual exports whose crop/scale has to be rediscovered in code.

---

## 20. Component / file-boundary refactor

The next integrator should break the presentation monolith before multiple UI/gameplay agents pile into it.

### Suggested boundaries

#### Pure game/world

- `game/world/world-map.mjs`
- `game/world/map-loader.mjs`
- `game/world/navigation.mjs`
- `game/world/traversal.mjs`
- `game/world/visibility.mjs`
- `game/world/cover.mjs`

#### Mission layer

- `game/mission/operation-contract.mjs`
- `game/mission/objective-state.mjs`
- `game/mission/advisor-doctrine.mjs`
- `game/mission/debrief.mjs`

Keep `campaign-doctrine.mjs` and terminal-state authority intact.

#### UI

- `app/game/GameShell.tsx`
- `app/game/BattlefieldViewport.tsx`
- `app/game/Hud.tsx`
- `app/game/CommandStrip.tsx`
- `app/game/ContextActions.tsx`
- `app/game/TacticalMap.tsx`
- `app/menu/CommandCenter.tsx`
- `app/menu/CampaignView.tsx`
- `app/menu/SettingsView.tsx`

#### Renderer

- `app/renderers/BattlefieldRenderer.ts`
- `app/renderers/PixiBattlefield.tsx`
- `app/renderers/battlefield-view-model.ts`

The exact names can change; the ownership boundaries should not.

---

## 21. Multi-agent work lanes

Parallel work only starts after shared contracts are defined.

### Lane A — World/map/navigation

Owns:
- `game/world/*`;
- map schema/loader;
- pathing;
- fog/reveal;
- Sable Crown v2 Tiled map data.

Must not rewrite HUD/menu.

### Lane B — Mission/stealth/advisor

Owns:
- mission contract/objective state;
- adaptive advisor;
- stealth accolades/debrief;
- operation route logic.

Must not own rendering.

### Lane C — UI/UX shell

Owns:
- main menu;
- HUD;
- command strip;
- tactical map UI;
- responsive interaction patterns.

Consumes view models; does not embed simulation rules.

### Lane D — Renderer/art integration

Owns:
- Pixi renderer;
- sprite/tileset loading;
- camera;
- selection hit areas;
- render effects;
- art bible enforcement.

Does not change terminal-state logic.

### Lane E — Traversal/base signature

Owns:
- field engineering;
- dynamic nav links;
- build signature/heat;
- traversal deployables.

### Integrator

Only the integrator should routinely touch:
- `app/page.tsx` during decomposition;
- save migration;
- cross-lane type contracts;
- canonical continuity docs.

This is specifically to reduce multi-agent merge churn.

---

## 22. Proof slice: GHOST LINE v2

Do not propagate the new architecture to all 59 operations first.

GHOST LINE becomes the acceptance slice because the current experience can strand a player there and because its name/theme should naturally prove stealth-first gameplay.

### Map target

- 96×60 logical cells;
- snow/rock/industrial Sable Crown language;
- three broad strategic corridors;
- radar/elevation route;
- concealment route;
- water or cliff traversal route using engineering;
- one enemy relay compound;
- one support/logistics compound;
- one main command/radar objective;
- at least two controlled forward sites.

### Required viable completion methods

#### Ghost completion

Player can complete the operation with starting covert assets plus earned/recovered support without building a turret and without destroying the entire enemy force.

#### Control completion

Player can capture forward sites, establish low-signature support, disable the network, and complete the objective through map control.

#### Force completion

Player can deliberately build/bring heavier assets, breach defenses, and finish through combat.

### Required failure/recovery behavior

- loss of one recommended specialist cannot deadlock the operation;
- advisor switches routes when assets are unavailable;
- missing one optional intel objective cannot block progress;
- alert escalation does not invalidate already completed objective steps;
- checkpoint/retry remains compatible with the existing mission graph.

---

## 23. Build 2.0 execution phases

### Phase 0 — Freeze the right things

Do not rewrite:
- campaign order/storyboard;
- terminal-state authority;
- existing production doctrine unless a dependency is required;
- save semantics without migration.

Snapshot Build 1.9 behavior as the compatibility baseline.

### Phase 1 — Presentation decomposition

Goal: remove `app/page.tsx` as the place every agent must edit.

Acceptance:
- menu shell, battlefield viewport, HUD, command strip, and deep panels have clear components;
- game state remains behaviorally equivalent;
- no aesthetic redesign required yet.

### Phase 2 — WorldMap + Sable Crown v2

Goal: variable-sized authored map with real terrain layers and route graph.

Acceptance:
- 96×60 map loads from authored data;
- continuous movement retained;
- construction snaps to logical cells;
- control/build authority works;
- cover/concealment/elevation/water affect play;
- minimap derives from map data.

### Phase 3 — Stealth-first mission contract + advisor

Goal: GHOST LINE can be completed quietly without scripted turret opening.

Acceptance:
- three-route doctrine exists;
- adaptive advisor never creates hidden prerequisites;
- stealth accolades and debrief metrics record actual play;
- Ghost/Control/Force routes all complete the same terminal graph.

### Phase 4 — UI/UX 2.0

Goal: modern compact RTS field UI and responsive Command Center.

Acceptance:
- persistent HUD respects the budget above;
- no permanent right-side card soup;
- entity selection gives compact contextual action;
- tactical map is useful for issuing orders;
- menu works at required screen shapes.

### Phase 5 — Traversal + base signature

Goal: terrain obstacles become player-solvable systems.

Acceptance:
- ladder, rope, portable bridge, and breach each create real navigation changes;
- water/cliff route in GHOST LINE can be solved with field engineering;
- low- vs high-signature construction affects enemy pressure visibly.

### Phase 6 — Pixi/art pipeline hardening

Goal: stable high-quality renderer/art workflow.

Acceptance:
- terrain/sprites use atlases/tilesets;
- selection hit areas cover full visible footprints;
- adjacent compatible structures visually join;
- human bosses remain human scale;
- terrain transitions no longer look like a single painted background with overlays.

### Phase 7 — Propagate, then expand content

Only after GHOST LINE passes:
- refit the remaining Sable Crown operations;
- then author Harrow Spine using the same map/mission grammar;
- then continue theater differentiation.

Do not make 59 bespoke implementations. Build data-driven map/operation contracts and reusable terrain kits.

---

## 24. Targeted quality gates

The user explicitly wants efficient testing. Do not turn every pass into a huge QA ritual.

### Every pure-system change

Run only relevant deterministic tests plus lint/build when required by the repo workflow.

### Every integration checkpoint

Perform one focused desktop interaction pass and one focused phone pass.

### Build 2.0 slice gate

At minimum verify:
- 1440×900 desktop full Ghost route;
- 390×844 phone critical commands and one operation segment;
- alternate Force route objective completion;
- checkpoint/save/reload after map/traversal changes;
- construction at original base and captured outpost;
- no turret required for GHOST LINE;
- no deadlock when a recommended stealth unit is absent.

### Performance budget

Use a dedicated benchmark scene rather than repeatedly testing the whole campaign.

Initial target:
- stable 60 FPS-class behavior on a normal desktop for the intended Sable Crown entity/prop budget;
- usable 30+ FPS-class behavior on phone hardware/browser class represented by the existing mobile target;
- profiling only when the target is missed.

Do not micro-optimize before the renderer/world slice exists.

---

## 25. Decisions this plan supersedes or refines

This is intentionally narrow.

### Superseded

- **Exact 32×20 board size as a permanent battlefield contract.** Build 2.0 uses variable map dimensions; first target is 96×60 logical cells.
- **Permanent visible square-grid presentation.** Grid semantics remain binding for structures, authored cells, and planning; visual grid is contextual.
- **Live strategy as a linear build/action script.** It becomes an adaptive advisor.

### Preserved

- continuous unit locomotion;
- explicit multi-cell hardware/structure footprints;
- full visible-footprint selection;
- captured-outpost forward construction authority;
- entity-context commands;
- campaign terminal-state authority;
- 13-theater/59-operation campaign structure;
- mission-family reuse rather than 59 forked simulations;
- role-appropriate default stances;
- persistent theater state;
- close Metal Gear-led private-development direction and existing IP guardrails.

---

## 26. Definition of success

Build 2.0 is successful when a player can open the game on a normal screen, understand where to go and what matters without reading a dashboard, enter GHOST LINE, scout a larger authored battlefield, discover multiple routes, cross a meaningful terrain obstacle, infiltrate and finish quietly without building a turret, receive a stealth/recovery-aware debrief, and also be able to replay the same operation by establishing a forward base or going loud.

At that point the project has a reusable gameplay foundation worth propagating across the campaign.

Until then, new theaters, more roster items, and more decorative screens are secondary.