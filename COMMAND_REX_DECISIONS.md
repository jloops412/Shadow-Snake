# Command Rex — decision log

## 2026-08-10 — Build 1.9 contextual command and territorial construction

- A captured control point is a forward base authority, not income-only decoration. Every player-owned supply, intelligence, or command node projects a 26m construction grid that can host defenses and a full satellite base without tracing adjacency back to Forward Command. Encrypted sectors and real footprint collisions remain hard placement rules.
- Entity selection owns immediate entity actions. Friendly facilities expose repair, upgrade, relevant system access, and salvage beside the facility; units/elements expose posture, role actions, veterancy effects, and fallback; captured outposts expose fortification, logistics, rally, and full-build entry. Selecting a facility no longer forces the permanent command deck open.
- The command deck defaults closed on desktop and phone. It remains the deliberate planning/catalog surface for squads, construction, force deployment, and R&D, while contextual commands and a quick phase rail handle frequent field decisions.
- Recon, Infiltrate, and Assault are executable operation phases. Each phase derives its roster from surviving available roles, selects those assets, applies a purpose-matched stance, and arms an explicit field order; missing assets disable that phase instead of inventing units.
- New unit posture is a role rule: covert/recon assets begin in stealth, medical/engineering/logistics assets hold, and line/armor assets assault. Rally routes preserve the role posture. Veterancy continues to add damage/integrity and now reduces the actual cooldown of role actions by six percent per rank.
- Fallback means nearest secure command, logistics, recovery, or captured outpost—not always the original headquarters.

## 2026-08-10 — Build 1.8 operation grammar and base warfare

- Every storyboard operation resolves to a reusable mechanical mission family. Mission copy selects foothold, recon, extraction, sabotage, convoy, defense, disclosure, reconstruction, hunt, or siege; the selected family changes real capture, hacking, detection, raid, logistics, contract, or sustain values.
- Mission families deepen a shared RTS rather than forking 59 bespoke simulations. Authored objective entities and map interactions may extend a family, but terminal-state authority remains centralized.
- Walls and gates are pathing rules, not decorative hit points. Ordinary unit orders stay continuous until a barrier interrupts the route; then a deterministic 32×20 navigation layer routes around it.
- A powered friendly gate is an IFF passage. Hostiles treat it as a closed barrier and route around or breach; a sealed line must create a reachable breach target rather than trapping the simulation.
- Repair Bays expose their actual radius and structure/vehicle restoration rates. Reconstruction mission doctrine and Preservation Doctrine multiply the same tested rates shown to the player.

## 2026-08-10 — Tactical causality and opponent doctrine

- Every theater owns one tested tactical profile without forking campaign terminal-state authority: weather/rule copy, three mechanical terrain zones, and a deterministic four-wave opponent doctrine cycle.
- Terrain must communicate its actual rule on the map. Hard cover reduces damage and suppression; concealment lowers signatures; elevation improves vision and outgoing fire; hazards slow and expose.
- Suppression is a recoverable morale system, not a cosmetic timer. Steady, shaken, pinned, and broken states alter fire cadence and locomotion; medics, hospitals, time out of combat, and cover preserve forces.
- A normal patrol sighting begins a visible, interruptible alarm transmission before full theater escalation. Breaking sight, disabling the caller, or jamming the network must matter. Radar and an already-completed alarm may still produce full response pressure.
- Enemy raids are readable plans: scouts attack sensors/intelligence, saboteurs attack power/logistics/research, assault groups attack production/command, and siege groups dismantle defenses. Conventional raids never spawn a Metal Gear-scale unit; those remain declared finale threats.

## 2026-08-10 — Continuity authority

- Use the dedicated `maintain-command-rex` skill for future Command Rex turns.
- Read `COMMAND_REX_START_HERE.md`, `COMMAND_REX_BACKLOG.md`, `COMMAND_REX_DECISIONS.md`, `GAME_STORYBOARD.md`, and `COMMAND_REX_NOTES.md` in that order before implementation.
- Keep the repository backlog authoritative; do not rely on chat memory.

## 2026-08-10 — Mission terminal states

- Forward Command destruction is the Prologue defeat condition.
- Operation completion creates a safe recoverable checkpoint: active raid contacts route, emergency crews restore a difficulty-scaled minimum of friendly structure health, and the next raid receives a grace window.
- A checkpoint must say which operation starts next. Operation 3 completion explicitly launches Operation 4, Crown Fall.
- Retry resumes the last secured operation; restart begins the entire theater again.
- The mission-state graph lives in `game/mission-graph.mjs` and must remain directly tested.

## 2026-08-10 — Failure presentation

- Defeat should evoke the unmistakable drama and signal-loss language of classic tactical espionage games while using original layout, dialogue, audio tones, and assets.
- The defeat UI must state the mechanical cause and recovery choices; atmosphere cannot obscure usability.

## 2026-08-10 — Unit and base variety

- “More content” means production roles and counters, not cosmetic variants.
- C&C supplies the strategic grammar: prerequisites, build queues, power, economy, scouting, infantry/vehicle/air counters, layered defense, and map control.
- Tactical espionage supplies the alternatives: infiltration, nonlethal recovery, EW, sabotage, deception, intelligence, specialist extraction, and consequences for escalation.
- Basic command fluency lands before the full roster so larger forces remain controllable.
- First roster expansion begins in the Prologue as a vertical slice; the complete initial roster unfolds across Act I.

## 2026-08-10 — Progression and accounts

- Doctrine unlocks new strategic options and combinations, not raw mandatory power.
- Saves, readable controls, accessibility, and essential commands are never gated.
- Device play remains viable without login; optional account sync preserves settings, profile, stats, and campaigns across devices.

## 2026-08-10 — Public narrative canon and IP boundary

- The public game is **Command Rex**, an original tactical-espionage RTS. It is not a continuation, restoration, or name-swapped edition of a pre-existing franchise.
- The durable public canon is Rex Ardent, Vale Veyr, the Grey Ark, Marshal Oris, the Ledger, and the Continuance Wars. The playable 1.0.1 draft’s direct-reference character names, labels, and BASILISK REX wording are legacy implementation debt.
- Inspiration may inform dramatic questions—inheritance, information control, war economies, deterrence, intention, and peace—but may not supply protected characters, chronology, dialogue, art, music, logos, level designs, or recognizably equivalent presentation.
- A public release does not rely on “getting away with it,” noncommercial intent, or an unrelated parody’s risk posture. Broad release or monetization requires CR-110 and qualified IP review.

## 2026-08-10 — Campaign scale and consequence model

- The full campaign target is one Prologue, four acts, an endgame, 13 persistent theaters, and approximately 59 operations. It is a production roadmap, not a commitment to build every map before gameplay gates pass.
- Each theater must have a distinct strategic problem, faction doctrine, decision, persistent payoff, and antagonist system. Harrow Spine is the first new-theater target after the Prologue gates and narrative migration.
- Narrative consequence is stored as facts about people, place, evidence, arms, bond, and authority. Do not add a good/evil meter or force endings through one final dialogue choice.

## 2026-08-10 — Active Shadow Snake development continuity

- This supersedes the **prototype-canon** portion of “Public narrative canon and IP boundary” above. The active private-development story is a deliberately close Metal Gear-adjacent alternate continuity, not the Rex Ardent / Vale Veyr adaptation track.
- Preserve **Eli / Shadow Snake** as the player commander and **David / Solid Snake** as his genuine brother and co-lead. **George Sears / Solidus Snake**, **Tretij Rebenok**, **EVA**, **Big Boss**, **Cipher / the Patriots**, and an earned **Outer Heaven** arc are active development ingredients.
- The campaign begins in 1987 after Eli’s MGSV-era escape and makes explicit AU departures. It does not claim to restore official cut content or silently overwrite franchise canon.
- The 13-theater / approximately 59-operation structure remains. Its active act spine is **The Unwanted Son → Kingdom of Flies → Brother Signal → A Nation of Soldiers → The Inheritance War**.
- CR-110 is a parked public-release adaptation gate. It must not block Prologue gameplay work or Harrow Spine preproduction. If broad distribution or monetization becomes the goal, create a deliberate save-safe adaptation branch and conduct the relevant review then.
- Keep original visual, audio, UI, map, dialogue, and likeness work even in the close-development build. This decision changes narrative direction, not the project’s asset-creation discipline.

## 2026-08-10 — Build 1.1 command survival and selection

- Same-type selection is a core command, not an unlock: double-click on desktop, TYPE on touch, roster type chips everywhere, and T on keyboard all recall every surviving friendly unit of the chosen type.
- Guided and Standard each receive one emergency Forward Command recovery per operation. The HUD shows whether the reserve is ready or spent; Hardline has no reserve; a second command loss is explicit defeat.
- Checkpoints must say “Level 1 continues,” name the newly unlocked operation, and require a visible field-reward choice to resume the same persistent theater.
- Structure footprints snap to an explicit grid and report occupied, locked, out-of-network, or valid placement before commitment. Barracks and other structures upgrade through three levels and unlock real production prerequisites.

## 2026-08-10 — Canon-bound Shadow Snake reconciliation

- This supersedes the narrative identity and chronology portions of “Active Shadow Snake development continuity.” **David is Rotten Snake, not Solid Snake.** He is Eli’s sworn brother from the wider clone-ward program, not a secret fourth Les Enfants Terribles clone and not a reassignment of canon David / Solid Snake.
- The playable campaign runs **1987–1990**. It uses the post-MGSV gap but must preserve the 1995 Outer Heaven Uprising and every later canonical incident as hard stop-lines. Shadow Command’s political arc is a free haven; it may not use or create the later name Outer Heaven.
- Grey Fox, EVA, Kaz, Ocelot, Dr. Clark, Sigint, Big Boss, and Dr. Madnar are the main era-appropriate legacy figures. Otacon and Drebin remain date-accurate archive/coda presences, not adult field-support characters. Future-era characters receive no anachronistic combat, romance, or radio roles.
- Hana Kovac / Wren is Eli’s original slow-burn love interest and independent survivor-route leader. The relationship can begin only in the 1990 adult chapter, never becomes a reward/hostage device, and must remain conditional on consent, shared authority, and Hana’s independent ability to leave.
- The Archive must distinguish recorded canon, unused draft material, character testimony, fan interpretation, and Command Rex additions. Episode 51 / Kingdom of the Flies is a prompt for questions, not a source of silently asserted canon.

## 2026-08-10 — Build 1.2 production doctrine

- The build sidebar uses stable strategic categories: infrastructure, production, support, and defense. The force sidebar uses combat, specialist, and vehicle categories. Categories clarify roles; they do not gate basic commands.
- Command & Conquer's refinery/harvester vulnerability becomes a Metal Gear-aligned recovery network: controlled relays are collection points, Recovery Mules carry GMP, and Supply Depots bank it. Cargo only becomes spendable after physical delivery and is lost with the convoy.
- Supply Depots expand supply and the base network; R&D Laboratories accelerate field research and gate prototype chassis; Anti-Armor Nests protect against vehicles and walkers. Infantry, vehicles, and structures now have an explicit first counter matrix rather than differing only by hit points.
- New content must strengthen a production branch or counter relationship. Do not resume undifferentiated unit/structure accumulation until command fluency, mobile play, and three viable Standard openings pass.

## 2026-08-10 — Build 1.3 campaign authority and boss scale

- Prologue, Act I, and Act II use one data-driven theater authority. Their 33 operation names, briefings, questions, final threats, checkpoints, victories, defeats, and sequential unlocks are not separate UI promises.
- Every theater final operation removes one final threat and secures one command target. Forward Command destruction remains the only base-loss terminal state; retry restores the current theater checkpoint and full restart preserves the selected theater.
- Human commanders and compact command vehicles remain field-scale boss units. Only a declared Metal Gear-class threat receives the oversized battlefield silhouette, and it appears only in a final operation.
- Selecting a structure card is informational and never spends GMP. A separate Fabricate action follows a pre-construction panel containing exact cost, build time, footprint, power, supply/output effects, prerequisites/unlocks, and tradeoffs.
- Build 1.3 proves campaign continuity before bespoke theater production. The seven theaters currently share the mature tactical map grammar; their unique terrain, weather, doctrine, encounters, and sprites must replace that temporary reuse without changing the terminal-state authority.

## 2026-08-10 — Tactical visual doctrine

- Units, enemy types, facilities, defenses, and prototypes use role-specific original vector silhouettes instead of re-tinted variants of a small sprite set. The same silhouette appears on the battlefield, the roster strip, and its production card so visual recognition transfers directly into command.
- The battlefield owns faction state: Shadow Command is phosphor green, Cipher is signal red, and offline is desaturated. The command deck owns category state: Grid & Logistics is gold, Production blue, Support & Intel teal, Defense red, Combat sand, Specialists cyan, and Vehicles olive. Do not use category color to override hostile/friendly state on the field.
- Future units and structures must have a unique silhouette plus one stable production category before they can be added. Inspiration from classic base RTS readability and tactical-espionage instrumentation does not permit copied game sprites, marks, UI, or designs.

## 2026-08-10 — Battlefield miniature presentation

- Battlefield art and command-deck symbols have distinct jobs. Map entities use physical, material-rich tactical miniatures; the roster, build catalog, force catalog, and category tabs retain concise glyphs for quick command recognition.
- The art direction is original late-Cold-War covert hardware plus readable base-building RTS silhouette grammar: olive/gunmetal Shadow Command kit with restrained cyan systems light; maroon/charcoal hostile security kit with red indicators; purposeful facilities that clearly express command, power, logistics, production, repair, sensors, and defense.
- Core allied personnel and common friendly field hardware ship as hand-painted production sheets. Every remaining present role has a unique original illustrated-vector fallback in the same material/shape language; no map entity reverts to a generic monoline icon or a recolor of another role.
- Character art must stay original even in close private continuity: no official likenesses, uniforms, insignia, logos, assets, or direct visual reconstructions. Tactical influence comes from readable equipment, posture, asymmetric gear, and stealth/warfare tension—not copied designs.
- This supersedes the earlier requirement that the exact same thin vector silhouette appear on both map and command deck. Role recognition transfers through a stable taxonomy and matching equipment language instead.

## 2026-08-10 — Build 1.4 progression merge and command plans

- Campaign completion is monotonic across device and account sources. Sync merges completed theater IDs and unlocked doctrine in campaign order; a stale remote profile may never relock a locally secured Act I theater.
- Operation role is derived from stage plus theater length. Four-operation theaters route directly from relays to the finale; five-operation theaters insert one command-sector operation. UI objectives, asset spawning, and terminal evaluation use that same role authority.
- Direct orders replace the active plan. Queue mode or desktop Shift appends serializable orders, and the next order promotes only after the current order completes. Save/checkpoint migration initializes older units with an empty queue.
- Wedge, line, column, and loose formations assign deterministic non-overlapping destinations. Focus fire concentrates the selected force, guard-area orders persist around a 12-meter anchor, fallback cancels the plan and returns to Forward Command, and NEXT/TAB cycles stacked friendly units.
- The painted-miniature handoff is an incremental field-art layer, not a declaration that the sprite backlog is finished. High-frequency roles may use original production sheets while unmigrated roles retain the original vector reserve; full sprite consistency remains a later pass.

## 2026-08-10 — Tactical grid and selection contract

- The battlefield is a visible 32×20 square-cell board. One-cell personnel are individual operatives, not abstract squads or stacked markers; vehicle, walker, and facility scale is communicated through explicit 2×1, 2×2, or 3×3 footprints.
- A map entity’s entire rendered footprint is its selectable hit target. Players must be able to select an operative, vehicle, or facility by clicking/tapping any visible part of it, rather than hunting for an icon-sized center point.
- New units must declare a footprint before shipping. Spawn placement resolves to an open grid cell; direct orders and formation destinations snap to board cells. Free motion remains allowed between tile centers so real-time combat and pathing retain their current behavior.

## 2026-08-10 — Build 1.5 complete campaign authority

- The full storyboard is now executable campaign data: 13 sequential theaters and 59 operations spanning Prologue and Acts I–IV. The campaign menu, briefings, checkpoints, bosses, victory/defeat states, next-theater unlocks, and final campaign resolution use that one ordered authority.
- Every theater declares a named cast and a strategic pressure rule that changes starting resources, passive income, raid cadence, detection, or hostile damage. Those modifiers create tactical identity without replacing the later requirement for bespoke maps and encounter systems.
- Tier 4 Doctrine choices are persistent campaign investments with field effects: Expeditionary Hub, Phantom Command, Armored Cadre, and Casualty Protocol change later theater openings. They remain side-grade strategy, not paid power or required usability.
- No Man's Haven is the terminal campaign theater. Its success reports campaign completion rather than another checkpoint. Intermediate commanders and command vehicles remain field-scale; declared Metal Gear-class targets alone use the large prototype footprint.

## 2026-08-10 — Build 1.6 mobile command and construction grammar

- Phone play uses an explicit device-width viewport. At 900px and below, the battlefield owns the screen, core commands stay in a fixed two-row thumb grid, and the full command deck opens as a dismissible bottom sheet rather than permanently shrinking the map. Compact layouts start with coach/objective detail and the deck collapsed; selection status, Orders/Pan, ALL/TYPE/group recall, centering, focus, guard, stop, fallback, and deck access remain immediately available.
- The final sentence of the earlier tactical-grid decision is superseded: spawn placement may resolve to an open cell, but direct unit orders and formation destinations are continuous coordinates. A unit footprint is a selection/occupancy scale, not a locomotion tile. Save migration no longer re-snaps deployed units.
- Construction still snaps to the visible 32×20 lattice. Exact edge contact is legal; same-kind structures, plus compatible wall/gate barrier pieces, expose connected edge foundations so adjacent placements read as one expandable complex.
- A raster sprite with a partial neighboring subject or incomplete crop does not ship on the field. The complete illustrated-vector reserve is the required fallback until a clean single-subject or cleanly partitioned production export exists.
