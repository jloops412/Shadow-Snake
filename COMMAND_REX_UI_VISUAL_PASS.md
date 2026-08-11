# Shadow Snake: Command Rex — UI / UX / Visual Pass

**Status:** Next-agent handoff for the dedicated UI/UX + visual-improvement pass  
**Date:** 2026-08-11  
**Depends on:** `COMMAND_REX_REFOUNDATION_PLAN.md`

## Purpose

Turn the Build 2.0 refoundation into a concrete improvement pass focused on:
- stronger unit sprites;
- footprint-faithful buildings;
- same-family structure connection logic;
- visible upgrade states for units and structures;
- biome-rich, cohesive maps;
- responsive main shell / campaign / settings / battlefield HUD.

## Binding direction

The game should feel like a **cohesive modern tactical-espionage RTS**:
- Metal Gear mood, climate, and military-world identity;
- Command & Conquer readability and strategic clarity;
- modern compact RTS UI rather than card/stat soup.

Do **not** copy official franchise assets, maps, logos, likenesses, or menus.

## 1) Character sprite pass

Current strongest baselines such as **Wraith** and **Viper** set the quality floor for the whole roster.

Every unit should have:
- readable top-down silhouette;
- clear role expression;
- consistent faction material language;
- readable facing;
- distinct friendly vs hostile identity;
- visible selected/damaged/veteran/upgraded state.

Upgrade visibility can come from added gear, armor differences, sensor/antenna packages, backpack/loadout changes, markings, and restrained tech accents. The player should be able to tell that a unit is upgraded without opening a panel.

Hostile scout, guard, hunter, special-response, commander, and prototype roles must not be generic recolors. Human commanders remain human scale. Only declared Metal Gear-scale hardware receives intentionally enormous silhouettes.

## 2) Building / structure pass

### Footprint fidelity is mandatory

If a structure is 2×2, 2×3, 3×2, or 3×3, the art must visibly occupy that footprint. A 2×2 structure must not read like a 1×1 icon floating inside four cells. Full visible art remains selectable.

### Same-family structure merging

Adjacent compatible same-family buildings should connect into one larger installation when appropriate.

Examples:
- supply/storage → depot complex;
- barracks/personnel → connected quarters/training compound;
- power → shared conduits/substation zone;
- research/comms → antennas, pipes, shared pads, walkways.

Support at least standalone, left/right/top/bottom connection variants, corner treatments where needed, and an interior/fully-connected state. This may use socket metadata or autotiling-style adjacency logic.

### Upgrade visibility

Structure upgrades must be visibly noticeable through added roof hardware, stronger plating, extra tanks/vents/antennae/modules, expanded support dressing, and stronger command/sensor elements. If a level-3 building looks almost the same as level 1, the pass failed.

Where relevant, damaged, offline/unpowered, disabled, or hacked states also need legible visual treatment without excessive VFX.

## 3) Map / biome cohesion pass

Maps should feel like **specific military theaters**, not generic painted backdrops.

Per biome, deliver a terrain kit with:
- base ground materials;
- roads/paths;
- cliffs/elevation transitions;
- water/shore transitions;
- concealment props;
- hard-cover props;
- hazards;
- base/compound materials;
- landmark props.

### Immediate Sable Crown target

- cold, covert, militarized snow/ice/rock/industrial identity;
- route hierarchy readable at gameplay zoom;
- clear objective compounds;
- believable build plates;
- stealth-friendly concealment bands;
- water/cliff/gap areas that visually support traversal gameplay.

The mood can be Metal Gear-like, but tactical readability must remain closer to a strong Command & Conquer battlefield: paths, cover, build space, perimeter geometry, objectives, and engineering opportunities must read quickly.

## 4) Menu / shell / HUD pass

Main menu, campaign select, and settings must fit real screens cleanly and stop behaving like a web dashboard.

Required target sizes:
- 390×844 phone;
- 768×1024 tablet;
- 1366×768 laptop;
- 1440×900 desktop;
- 1920×1080 desktop;
- 2560×1080 ultrawide.

Implement the Build 2.0 **Now / Do / Plan** hierarchy:
- **Now:** objective, alert state, resources, minimap, current selection;
- **Do:** contextual field actions;
- **Plan:** tactical map, build, deploy, R&D, intel panels.

The pass is specifically meant to kill remaining menu/stat soup.

The Command Center should make Continue/Resume, Campaign, Command/Forces/Deployment, Doctrine/R&D, Archive/Intel, and Settings obvious without giving every destination equal visual weight.

## 5) Recommended implementation order

1. Main shell responsiveness.
2. Battlefield HUD cleanup.
3. Building footprint + adjacency/connection system.
4. Building upgrade-visibility pass.
5. Unit sprite-quality unification.
6. Biome / map visual-cohesion pass.

## 6) Acceptance criteria

### Units
- friendly roster quality is coherent;
- enemy roster is no longer noticeably worse;
- role silhouettes are readable;
- upgraded/veteran states are visible.

### Buildings
- structures visibly fill their declared footprints;
- adjacent same-family structures connect cleanly;
- upgraded buildings visibly change.

### Maps
- terrain kits feel location-specific and cohesive;
- Sable Crown feels both Metal Gear-like and C&C-readable;
- route/build/cover/objective readability improves.

### Menus/UI
- main shell, campaign select, and settings fit real screen classes properly;
- battlefield HUD is more compact and intuitive than Build 1.9.

## One-sentence directive

Make the game **look and feel like one cohesive tactical-espionage RTS product** through stronger sprites, footprint-faithful buildings, connected structure families, visibly upgraded assets, biome-rich maps, and fully responsive game-shell UI.