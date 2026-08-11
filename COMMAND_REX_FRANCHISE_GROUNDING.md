# Shadow Snake: Command Rex — Metal Gear Franchise Grounding Matrix

**Status:** Content-planning authority for maps, characters, factions, technology, tone, Easter eggs, and future agent research  
**Date:** 2026-08-11  
**Playable window:** 1987–1990

This document operationalizes the requirement that the game feel **solidly inside the Metal Gear universe** while preserving chronology and clearly labeling fan/original bridges.

---

## 1. Core grounding rule

Every map, character, unit, structure, weapon, boss, menu concept, mission mechanic, and lore beat should begin with a Metal Gear-era anchor.

That does **not** mean copying an official asset or recreating an official level. It means understanding the franchise grammar first:
- stealth before brute force;
- military hardware with plausible period lineage;
- espionage information as a weapon;
- bases/logistics/recovery that matter mechanically;
- bosses with character/mechanical identity;
- nuclear/deterrence technology treated as consequence, not power fantasy;
- strange humor and optional solutions beside serious political themes;
- environments that feel geographically and politically specific.

Original additions then bridge the 1987–1990 gap without stealing later canon.

---

## 2. Source classes

Use the provenance classes in `COMMAND_REX_LORE_BOSS_PROGRESSION.md`:
- `RECORDED_CANON`
- `OFFICIAL_SUPPLEMENT`
- `CUT_MATERIAL`
- `FAN_INTERPRETATION`
- `COMMAND_REX_ORIGINAL`

### Research order for agents

1. Konami official chronology / official game history.
2. Released Kojima-led mainline game material appropriate to the subject.
3. Official Master Books, databases, manuals, scripts, art books, and creator-supported supplemental material.
4. Cut/unused material, explicitly labeled.
5. Fan wikis/community only as an index or interpretation source, then verify upward.

Do not use a fan wiki as the only support for a material chronology decision if a primary source exists.

---

## 3. Time-safe inspiration rule

Later Metal Gear games are valuable design references but cannot back-port their technology/history automatically.

Use two separate labels:

### `ERA_ANCHOR`
The thing actually exists or is historically established by 1987–1990.

### `VISUAL_MECHANICAL_REFERENCE_ONLY`
A later game may inspire mood, readability, encounter structure, UI compactness, boss pacing, or map composition, but its later technology/events do not exist early.

Example: Shadow Moses is an excellent **snow/industrial stealth-map reference**, but Metal Gear REX, Soliton radar implementation, Genome Soldiers, and 2005 Shadow Moses events are not available in 1987.

---

## 4. Franchise-wide gameplay anchors

### Metal Gear / Metal Gear 2
Use for:
- infiltration of military compounds;
- guards, keys/credentials, prisons, vents/alternate routes;
- radio/intel support;
- sabotage of a weapon system;
- scarcity and deliberate route planning;
- military-base readability.

Hard stop:
- Outer Heaven's 1995 incident and TX-55 role remain future history;
- Zanzibar Land's 1999 incident and Metal Gear D remain future history.

### Metal Gear Solid
Use for:
- boss escalation rhythm;
- snow/industrial atmosphere as visual reference;
- surveillance, security systems, identity, nuclear black-site tension;
- human specialists preceding the giant weapon payoff.

Hard stop:
- Shadow Moses is 2005;
- actual Metal Gear REX and its ArmsTech/Otacon development belong to that era.

### Metal Gear Solid 2
Use as later-era mechanical/structural reference for:
- layered facility traversal;
- alarms/search behavior;
- information manipulation;
- interconnected platforms and infrastructure.

Hard stop:
- Big Shell/Arsenal events and later technology stay future.

### Metal Gear Solid 3
Use strongly for:
- Cold War military architecture;
- jungle/mountain terrain;
- survival/fieldcraft;
- specialist boss identity;
- Soviet facilities and communications infrastructure;
- camouflage/concealment thinking.

### Peace Walker
Use strongly for:
- Mother Base growth;
- Fulton/recovery lineage;
- recruitment and R&D feedback loops;
- AI weapon/deterrence themes;
- mission-based deployment;
- conventional vehicle encounters escalating into unusual strategic machines.

### Ground Zeroes / MGSV
Use most heavily as the immediate era foundation:
- black sites;
- open infiltration spaces;
- Afghanistan/Africa military geography;
- Mother Base/FOB systems;
- Fulton extraction/recovery;
- support deployment;
- Walker Gear and field robotics;
- adaptable stealth/lethal mission solutions;
- patrols, marking/intel, routes, weather, and time-of-day thinking;
- Eli, Tretij, Ocelot, Kaz, Cipher/XOF aftermath, and Sahelanthropus history.

### MGS4 / later games
Use only as `VISUAL_MECHANICAL_REFERENCE_ONLY` for:
- war-economy themes;
- PMC faction readability;
- battlefield layering;
- late-series UI/tech spectacle concepts.

Do not back-port SOP/nanomachines/Gekko/RAY-era technology.

---

## 5. Theater grounding matrix

### Sable Crown — 1987 Barents Exclusion Zone
**Core Metal Gear anchors:** Ground Zeroes black-site grammar; MGSV Soviet/Cipher field infrastructure; MGS snow/industrial mood as visual reference only.  
**Map language:** snow, rock, radar plateau, hardened black site, maintenance corridors, communications masts, cold-water obstacles, generator yards, concealed pine/ice routes.  
**Gameplay:** recon, radar blindness, alarm interruption, Walker Gear security, alternate approaches.  
**Boss ceiling:** commander + light Walker Gear security.  
**Forbidden:** REX, Genome Soldiers, 2005 Shadow Moses tech, giant Metal Gear finale.

### Harrow Spine — 1987 mountain relay belt
**Anchors:** MGS3 Soviet mountain/communications grammar; MGSV Afghanistan mountain outposts.  
**Map language:** switchbacks, exposed ridges, radio towers, tunnels, snow/wind channels, observation posts.  
**Gameplay:** long-range detection, vertical route choice, weather concealment, evidence preservation.  
**Boss:** human EW/field commander.

### St. Heliot Freeport — 1987 coastal arms market
**Anchors:** MGSV Africa/mercenary logistics; later Big Shell/PMC material only as structural/thematic reference.  
**Map language:** docks, warehouses, cranes, fuel lines, civilian utilities, sea walls, patrol craft.  
**Gameplay:** civilian grid versus mercenary control, capture systems intact, flooded/blocked routes.  
**Boss:** harbor commander + conventional command craft/vehicle.

### The Kingdom That Failed — 1987 Central African shipbreak/island aftermath
**Anchors:** MGSV Africa; Eli/Tretij; `CUT_MATERIAL` Kingdom of the Flies pressure.  
**Map language:** tropical wreckage, salt water, salvage, child-survivor routes, improvised defenses.  
**Gameplay:** recovery, evacuation, booby traps, salvage, conflicting testimony.  
**Sahelanthropus rule:** wreckage/history may be a landmark; no convenient fully operational resurrection.  
**Boss:** human warden / salvage defense network.

### Black Vault — 1988 buried archive
**Anchors:** Cipher/Patriots secrecy; MGS3/Peace Walker research-facility grammar; MGSV black programs.  
**Later reference only:** Arsenal/Shadow Moses information-control atmosphere.  
**Map language:** identity locks, backup generators, records vaults, server/communications rooms appropriate to 1988, sealed laboratories.  
**Gameplay:** provenance, spoofing, purges, false identities, low-power routing.  
**Boss:** deception/security specialist, not a giant machine.

### Vostok Wound — 1988 armored rail corridor
**Anchors:** Soviet/Central Asian military logistics; MGSV convoy logic; classic Metal Gear moving-infrastructure sabotage.  
**Map language:** rail yards, bridges, snow corridors, switching stations, armored cars, civilian evacuation trains.  
**Gameplay:** route switching, escort, disable-not-destroy, moving objective.  
**Boss:** armored command train.

### Caspian Wake — 1988 offshore modular refuge
**Anchors:** Peace Walker/MGSV Mother Base and FOB grammar.  
**Map language:** modular platforms, cranes, generators, sea lanes, logistics decks, landing zones.  
**Gameplay:** base assembly, supply vulnerability, patrol interdiction, evacuation access.  
**Boss:** conventional patrol/command craft.  
**Hard stop:** the refuge is not named Outer Heaven.

### Contract Coast — 1989 merchant/PMC city
**Anchors:** mercenary economy themes already present across the saga; MGSV contractors/war economy roots.  
**Later reference only:** MGS4 PMC readability and urban battlefield layering.  
**Map language:** port utilities, markets, civic infrastructure, security compounds, industrial blocks.  
**Gameplay:** utilities, labor/civilian control, multi-front defense, contracts.  
**Boss:** human broker-general and layered contractor command.

### Mineral Corridor — 1989 desert rail/logistics theater
**Current name warning:** audit `Zanzibar Corridor`; it risks implying/preempting 1999 Zanzibar Land.  
**Anchors:** MGSV desert logistics; classic Metal Gear fortress supply chains.  
**Map language:** desert rail, mines, processing yards, water points, salvage, long convoy routes.  
**Gameplay:** heat, logistics, anti-armor, resource ownership.  
**Boss:** heavy command crawler / Tier-3 platform.  
**Hard stop:** do not create Zanzibar Land or Metal Gear D early.

### The Perfect Son — 1989 military research/training campus
**Anchors:** Les Enfants Terribles history; Cipher/Patriots human experimentation; MGS3/Peace Walker research culture.  
**Map language:** training grounds, biometric checkpoints appropriate to period tech, labs, records, command simulation spaces.  
**Gameplay:** enemy mirrors player doctrine and predictable openings.  
**George/Solidus rule:** time-appropriate youth/record only; no future presidency or adult warlord role.

### Fox Line — 1990 contested border network
**Anchors:** Grey Fox/FOXHOUND lineage; classic Metal Gear infiltration and false-command pressure.  
**Map language:** border posts, trenches, smoke, radio networks, mixed uniforms, checkpoints.  
**Gameplay:** identification, false orders, two command zones, trust.  
**Boss:** elite counter-command handler.  
**David:** active co-commander/rival pressure, but final direct confrontation still waits.

### Father's Grave — 1990 legacy facility
**Anchors:** Big Boss's MGS3 → Peace Walker → MGSV institutional legacy; old MSF/Diamond Dogs technology and records.  
**Map language:** abandoned hardened base, archived command rooms, old workshops, sealed weapon-development bays, false recordings.  
**Gameplay:** provenance, legacy, misleading orders, early bipedal research foreshadow.  
**Boss:** archivist + period-plausible original test platform.  
**Hard stop:** no finished TX-55, REX, Metal Gear D, or resurrection of dead characters.

### No Man's Haven — 1990 endgame network
**Anchors:** Mother Base/FOB logistics; deterrence themes from Peace Walker/MGSV; future Outer Heaven shadow as theme only.  
**Map language:** multiple connected regional nodes rather than one magical fortress; evacuation, command, repair, launch, and evidence systems.  
**Gameplay:** dismantle retaliation dependencies, preserve communities, command decentralization.  
**Boss A:** late strategic platform `BASILISK` working identity — `COMMAND_REX_ORIGINAL`, no REX name, no later canonical model theft.  
**Boss B:** David / Rotten Snake command/rival confrontation shaped by campaign facts.  
**Ending rule:** Shadow Command's outcome must leave 1995 Outer Heaven and later canon intact.

---

## 6. Character grounding matrix

### Eli / Shadow Snake
**Status:** canon Eli/Liquid + Command Rex field identity.  
**Anchor:** MGSV Eli, child-soldier leadership, hatred of inherited identity, Tretij connection.  
**Hard stop:** must remain compatible with his later Liquid Snake path.

### David / Rotten Snake
**Status:** `COMMAND_REX_ORIGINAL`.  
**Rule:** sworn clone-ward brother, not canonical David/Solid Snake and not a fourth Les Enfants Terribles clone.  
**Use:** co-lead/rival whose late conflict grows from campaign facts.  
**Hard stop:** never steal Solid Snake's later biography.

### Tretij Rebenok
**Status:** canon.  
**Anchor:** MGSV Third Child / Eli connection.  
**Rule:** not a disposable magic weapon; his age, vulnerability, agency, and later identity remain respected.

### Grey Fox / Frank Jaeger
**Status:** canon.  
**Use:** elite operative/mentor and future-pressure character.  
**Hard stop:** no Cyborg Ninja form before the later Zanzibar-era events that lead to it; must survive into his established future.

### Kazuhira Miller
**Status:** canon.  
**Use:** logistics/training/survival contact.  
**Rule:** independent interests; not permanent tutorial narrator.

### Revolver Ocelot
**Status:** canon.  
**Use:** unreliable intelligence, manipulation, counter-intelligence.  
**Rule:** useful truths always need provenance; do not flatten him into generic villain/support.

### EVA
**Status:** canon.  
**Use:** archive/origin-record pressure and survivor ethics.  
**Hard stop:** preserve later survival/history.

### Dr. Clark / Para-Medic
**Status:** canon.  
**Use:** genetics/medical program history where time-appropriate.  
**Rule:** do not make every original experiment secretly hers without evidence.

### Sigint / Donald Anderson
**Status:** canon.  
**Use:** systems/intelligence lineage where appropriate.  
**Hard stop:** preserve later DARPA/Shadow Moses role.

### Dr. Madnar
**Status:** canon.  
**Use:** robotics lineage/technical pressure.  
**Hard stop:** no completed canonical TX-55 before 1995.

### Big Boss
**Status:** canon, alive in the period but deliberately distant from the campaign's center.  
**Use:** contested archive, institutional shadow, conflicting loyalties.  
**Rule:** do not turn him into a surprise resurrection/final boss or overwrite his later Outer Heaven role.

### Otacon / Hal Emmerich
**Status:** canon child during this period.  
**Rule:** archive/coda/family context only; not adult engineer/support operative and absolutely not REX developer yet.

### Drebin
**Status:** later-era character.  
**Rule:** no adult field-support role in 1987–1990.

---

## 7. Unit/structure grounding rule

Before shipping a new unit or structure, answer:
1. What Metal Gear-era function does it fulfill?
2. What 1987–1990 technology supports it?
3. Which faction built/uses it?
4. Is it canon, supplement, cut-inspired, fan interpretation, or original?
5. Does it accidentally pre-invent a famous later system?
6. Does its visual design fit the same camera/material/biome bible?

### Friendly examples

- Wraith/Viper/Specter/Lancer/etc. may remain original role names, but their equipment and tactics should derive from period special-operations, MGSV field gear, EW, recovery, and combined-arms grammar.
- Recovery systems should visibly descend from Peace Walker/MGSV extraction/logistics concepts rather than generic RTS harvesting.
- Defensive structures should look like plausible field fortifications/black-site equipment, not fantasy tower-defense turrets.

---

## 8. Easter eggs and fandom

Fandom knowledge is valuable when it adds recognition without creating false canon.

Good uses:
- subtle item descriptions;
- radio jokes;
- cardboard-box-like absurd solutions expressed originally;
- names of optional operations that echo franchise themes;
- disputed archive annotations showing multiple interpretations;
- environmental references to well-known motifs.

Bad uses:
- treating a theory as historical fact;
- resurrecting or relocating characters because a wiki speculation is convenient;
- importing later technology because fans recognize it;
- recreating famous scenes/levels directly.

---

## 9. Work-agent research requirement

When an implementation task touches a named canonical character, major weapon, historical event, or future hard stop, the work agent should verify the relevant primary/official source before coding the content.

For purely original UI, generic terrain props, or already-established internal systems, do not waste tokens re-researching lore that cannot affect the answer.

---

## One-line rule

**Metal Gear first, Command Rex bridge second: borrow the franchise's logic deeply, but never steal a later character's achievement or a future weapon's place in history.**