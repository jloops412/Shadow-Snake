# Shadow Snake: Command Rex — start here

## Current state

- **Playable build:** 1.9 candidate
- **Live site:** https://shadow-protocol-rts.woodwardwarrior.chatgpt.site
- **Current campaign content:** the complete storyboard is wired as one sequential 13-theater / 59-operation campaign from Sable Crown through No Man's Haven. Prologue, Acts I–IV, every checkpoint, every explicit victory/Forward Command defeat, every next-theater unlock, and the final campaign-resolution state share one authority. Each theater now has its named cast, field-scale commander/vehicle boss or declared Metal Gear-class finale, operation briefings, and a distinct strategic pressure rule. Bespoke terrain geometry, mission-specific interactive systems, and full character/sprite production remain the largest content targets; the campaign deliberately keeps the proven grid/battlefield grammar while end-to-end integrity is hardened.
- **Current product shell:** Command Center menu, local saves, optional account sync, profile stats, settings, and Doctrine progression.
- **Current strategy layer:** 13 buildable structures and 14 friendly force roles are organized into infrastructure, production, support, defense, combat, specialist, and vehicle branches. Supply Depots and Recovery Mules add a vulnerable map-based logistics loop; R&D Labs accelerate research; anti-armor nests, Jackal IFVs, and Mantis tanks deepen combined-arms counters. Captured supply/intelligence/command points now project their own 26m forward construction grids, so turrets, sensors, logistics, and full satellite bases may be built around secured territory without chaining back to Forward Command. Selecting a friendly facility, unit/element, or captured outpost opens a compact field-context surface with relevant maintenance, upgrade, posture, role-action, veterancy, fortification, rally, and system controls; the large deck is collapsed by default and reserved for planning/catalog work. A quick operation launchpad assigns available assets to Recon, Infiltrate, or Assault with role-appropriate postures and orders. Newly deployed covert/recon assets default to stealth, sustain/logistics assets to hold, and line/armor assets to assault; veterancy reduces real role cooldowns in addition to existing damage/integrity gains. Command fluency includes serializable queued waypoints, wedge/line/column/loose formations with continuous destinations, explicit focus fire, persistent guard areas, nearest-secure-outpost fallback, stack cycling, and a fixed two-row touch command cluster backed by a mobile command-deck sheet. All 59 operations resolve to one of ten mechanical mission families. Every theater has deterministic terrain, morale, interruptible alarms, and telegraphed raid doctrine. The visible 32×20 lattice governs construction, walls/gates and repair zones are mechanical, and structures may abut with connected foundations. The battlefield preserves the other art/grid work and uses complete fallbacks where raster exports are incomplete.
- **Current quality gate:** deterministic graphs cover all 59 operations, every checkpoint transition, every theater victory, every stage-specific explicit defeat, variable-length theater role routing, stale-profile progression merging, all 13 sequential unlocks, the terminal campaign result, free-form command destinations, operation-family modifiers, barrier detours, IFF gates, forced hostile breaching, repair scaling, captured-outpost build authority, role-default postures, phase asset assignment, veterancy progress, and cooldown scaling. Thirty-two pure checks pass with clean lint. Complete human-speed campaign endurance, the production checkpoint build, and a hands-on 390×844 pass remain verification gates because the current internal browser connection again could not attach to the healthy game preview.
- **Narrative production state:** the active private-development canon is the close 13-theater Shadow Snake continuity in `GAME_STORYBOARD.md`: Eli / Shadow Snake; David / Rotten Snake, his sworn clone-ward brother; Grey Fox, EVA, Kaz, Tretij, Big Boss, Cipher, and an original free-haven arc. Canonical David / Solid Snake, George / Solidus, Outer Heaven (1995), and later incidents are preserved hard stop-lines. Otacon and Drebin are accurately dated archive/coda presences, not 1987 support adults. The original Command Rex setting is a future public-adaptation reserve; CR-110 is parked and does not block Theater 2.

## Read in this order

1. `COMMAND_REX_START_HERE.md` — current state and non-negotiables.
2. `COMMAND_REX_BACKLOG.md` — ordered implementation work.
3. `COMMAND_REX_DECISIONS.md` — decisions that should not be silently reopened.
4. `GAME_STORYBOARD.md` — canonical campaign, gameplay, and content structure.
5. `COMMAND_REX_NOTES.md` — historical checkpoints and research notes.

## Non-negotiable design pillars

1. **C&C readability:** economy, production, power, base expansion, unit counters, defense, and battlefield control must be legible at a glance.
2. **Espionage consequence:** stealth, escalation, recovery, EW, information, identity, anti-war cost, and moral ambiguity must alter play rather than decorate it.
3. **Persistent command:** bases, veterans, casualties, infrastructure, research, and decisions persist through a theater.
4. **Two complete routes:** a theater always reaches an explicit victory or an explicit defeat. A checkpoint is never visually or mechanically confused with game over.
5. **Usability is not progression:** readable text, saves, touch parity, and core command tools are never unlocks.
6. **Close development; original presentation:** private development may use the active Eli/David storyline, but do not copy official art, music, logos, dialogue, UI, maps, or likenesses. Broad-release adaptation is a separate future decision, not a reason to dilute the current narrative.
7. **Survivable learning curve:** Guided and Standard may rescue Forward Command once per operation, but the reserve is visible, finite, and never replaces repair, defense, or a real defeat state.
8. **Economy lives on the map:** passive income keeps a run solvent, while larger gains require controlled territory, exposed recovery convoys, and infrastructure that the enemy can disrupt.
9. **Construction is an informed commitment:** selecting a build card never spends GMP. The player first sees exact cost, time, footprint, power, supply, outputs, prerequisites, unlocks, and tradeoffs, then deliberately fabricates and places it.
10. **Commands survive complexity:** direct orders replace by default; Queue/Shift appends a visible, save-safe plan; formations create distinct slots; focus, guard, fallback, and selection cycling stay available on touch and desktop.

## Definition of done for a gameplay slice

- Mouse, touch, and keyboard controls do not trigger accidental browser selection.
- Required text is readable at default settings on phone and desktop.
- The full mission-state graph is covered by automated checks.
- Victory, defeat, checkpoint, save, and resume paths are verified.
- Canonical records and the backlog are reconciled before the implementation is committed.
