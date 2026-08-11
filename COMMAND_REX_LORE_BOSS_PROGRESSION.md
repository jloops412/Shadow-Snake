# Shadow Snake: Command Rex — Lore Authority & Boss Progression

**Status:** Binding planning authority for boss escalation, canon/lore provenance, and Metal Gear-universe grounding  
**Date:** 2026-08-11  
**Scope:** 1987–1990 private-development campaign. This document supersedes the early-campaign `BASILISK REX` / immediate Metal Gear-class boss assumption wherever older storyboard or implementation text conflicts with it.

---

## 1. Immediate correction

The current Sable Crown implementation/storyboard ends the first theater with **BASILISK REX**, classified as Metal Gear-class. That is no longer acceptable.

There are two independent problems:

1. **Pacing:** a giant franchise-level war machine in the first theater spends the escalation curve before the campaign has earned it.
2. **Chronology:** actual **Metal Gear REX** belongs to the Shadow Moses / ArmsTech era around 2005. The active Command Rex campaign runs 1987–1990. Konami's own chronology places MGSV in 1984, the Outer Heaven incident in 1995, Zanzibar Land in 1999, and MGS/Shadow Moses in 2005.

### Binding rule

- **No actual Metal Gear REX, REX prototype, “REX-class,” or REX-named platform appears as a physical campaign weapon in 1987–1990.**
- Sable Crown ends with a human-scale / conventional-tech boss encounter.
- True giant strategic weapons appear only after the player has climbed a clear escalation ladder.
- David / Rotten Snake is a late-game emotional/rival payoff. He is not a first-act boss and should not be treated like one.

If a future project ever wants the actual 2005 REX, it belongs in a separately dated historical/coda context and must not rewrite Solid Snake's Shadow Moses role.

---

## 2. Lore-source authority

The project should feel deeply embedded in the Metal Gear universe without allowing lore drift to become accidental fan-fiction presented as fact.

### Tier A — Recorded canon / highest authority

Use first:
- released Kojima-led mainline games and their in-game events;
- Konami's official Metal Gear chronology/history pages;
- official screenplay/master books and official databases;
- official manuals and character/story pages where they do not conflict with later authoritative material.

Tier A controls chronology, character identity, alive/dead status, known organizations, known weapon development, and hard-stop incidents.

### Tier B — Official supplementary / creator-supported material

Use carefully:
- official art books;
- official strategy/collector material with production notes;
- creator interviews;
- official supplemental story material.

Tier B can clarify intent, visual language, unused concepts, and production history. It cannot silently overwrite released-game facts.

### Tier C — Unused / cut / unfinished material

Examples include the MGSV **Kingdom of the Flies / Phantom Episode** material.

Use as:
- a question generator;
- a source for unresolved pressures;
- visual/mechanical inspiration;
- evidence of an intended possibility.

Do **not** label it recorded canon unless an official timeline or later released work explicitly fixes the relevant event. Command Rex may bridge the gap, but must label its bridge as original development continuity.

### Tier D — Fandom / wiki / community interpretation

Fan wikis, long-form theory discussions, videos, and community timelines are useful indexes and hypothesis sources.

Use them to:
- locate obscure references;
- identify continuity disputes;
- find themes worth verifying;
- understand fan expectations.

Never let Tier D override Tier A/B. Any gameplay/story fact derived from fandom must either be verified upward or explicitly tagged **fan interpretation**.

### Tier E — Command Rex original bridge

Original characters, facilities, theaters, commanders, technologies, and events are allowed inside the 1987–1990 gap when they:
- do not block later canon;
- do not steal canonical characters' later achievements;
- do not pre-invent later famous technologies under another name;
- feel technologically and politically plausible for the period;
- are tagged as Command Rex additions in the Archive/design data.

---

## 3. Required provenance tags

Every new theater, major character, boss, superweapon, historical claim, or named organization should carry one or more development tags:

- `RECORDED_CANON`
- `OFFICIAL_SUPPLEMENT`
- `CUT_MATERIAL`
- `FAN_INTERPRETATION`
- `COMMAND_REX_ORIGINAL`

Recommended data shape:

```text
loreProvenance:
  anchors: [ ... ]
  status: COMMAND_REX_ORIGINAL
  hardStops: [ ... ]
  notes: ...
```

The player-facing Archive may translate those to friendlier labels already established in the storyboard: recorded canon, unused draft material, character testimony, fan interpretation, and Command Rex addition.

---

## 4. Technology hard stops for 1987–1990

### Allowed anchors

Period-appropriate technology can draw from:
- Peace Walker-era unmanned AI weapons and ZEKE lineage as historical precedent;
- MGSV Walker Gear / Soviet and Cipher field technology;
- Sahelanthropus as a 1984 historical/cut-material pressure point;
- conventional tanks, APCs, helicopters, patrol craft, radar, electronic warfare, field robotics, mines, anti-armor systems, and black-budget prototypes;
- early bipedal research concepts that do **not** preempt TX-55's 1995 role.

### Protected future developments

Do not preempt or duplicate:
- **TX-55 Metal Gear / Outer Heaven — 1995**;
- **Metal Gear D / Zanzibar Land — 1999**;
- **Metal Gear REX / Shadow Moses — 2005**;
- later RAY/Gekko/SOP-era technology.

Dr. Madnar can be an era-appropriate robotics figure, but Command Rex must not have him complete or field the canonical TX-55 before its later story.

### Sahelanthropus discipline

MGSV establishes Eli's connection to Sahelanthropus in 1984. The unfinished Kingdom of the Flies material depicts the machine being rendered inoperable and its remains recovered before the island is destroyed. Therefore:
- the actual Sahelanthropus should not simply reappear fully operational years later as a convenient boss;
- wreckage, research fragments, copied principles, conflicting records, or black-market salvage can influence later Command Rex systems if clearly tagged as an original bridge;
- any descendant system must look and play like a new period-specific design, not a renamed Sahelanthropus or future REX.

---

## 5. Boss-design grammar

Metal Gear bosses should test a **mechanic, character, or system**, not merely add HP.

A good boss should introduce or combine at least two of:
- stealth/search pressure;
- terrain mastery;
- sensor/EW manipulation;
- nonlethal option;
- command deception;
- escort/recovery tension;
- weak-point/dependency discovery;
- squad splitting;
- vehicle counterplay;
- base/logistics pressure;
- ethical/consequence choice.

### Boss size is semantic

- Human boss → human scale.
- Powered/exoskeleton specialist → modestly larger/readable equipment silhouette.
- Vehicle boss → vehicle scale.
- Walker/heavy platform → hardware scale.
- Metal Gear-scale → rare giant silhouette reserved for late strategic escalation.

Never enlarge a human boss simply because its HP is high.

---

## 6. Campaign boss escalation ladder

### Tier 0 — Mission threat, no boss
**When:** opening operations and some stealth missions.  
**Examples:** patrol commander, radar net, sniper overwatch, alarm chain, minefield, convoy, hostage/interrogation problem.

The player should learn that not every operation ends in a boss arena.

### Tier 1 — Elite human / specialist
**When:** Prologue and early Act I.  
**Scale:** one named operative or compact team.  
**Gameplay:** CQC, sniper duel, stealth hunt, EW duel, decoy/intelligence puzzle, nonlethal capture.

### Tier 2 — Human commander + conventional vehicle/system
**When:** Act I and Act II.  
**Scale:** tank/APC/gunship/patrol craft/armored train plus commander dependencies.  
**Gameplay:** isolate support, disable sensors, sabotage fuel/power, choose capture vs destruction.

### Tier 3 — Experimental walker / command platform
**When:** late Act II / Act III.  
**Scale:** larger than normal vehicles but still well below headline Metal Gear spectacle.  
**Gameplay:** multi-system weak points, EW, logistics, repair dependencies, changing route control.

### Tier 4 — Strategic superweapon / Metal Gear-adjacent original bridge
**When:** Act IV only.  
**Scale:** rare giant set piece.  
**Gameplay:** dismantle launch, targeting, power, repair, command, and retaliation networks before attacking the core.

This must be a period-plausible **Command Rex original**, not REX, TX-55, Metal Gear D, or a resurrected canonical machine.

### Tier 5 — Rival Snake / command confrontation
**When:** final or penultimate endgame only.  
**Scale:** human.  
**Gameplay:** doctrine versus doctrine; stealth, command, terrain, and prior relationships matter.

David / Rotten Snake belongs here. Depending stored facts, the confrontation may be:
- a duel;
- competing command zones;
- a forced temporary alliance followed by a choice;
- an interruptible confrontation where the real target is the deterrence system;
- a nonlethal resolution.

He is not merely “the final enemy.” The fight should express what the brothers became.

---

## 7. Corrected 13-theater boss curve

Names below are implementation working targets; existing useful names may remain where they fit.

### PROLOGUE — Sable Crown
**Old:** BASILISK REX / Metal Gear-class.  
**Replace with:** **Cipher Test Warden + Walker Gear security section**.  
**Class:** commander / light walker encounter.  
**Purpose:** prove stealth, alarm interruption, radar dependencies, and multiple approaches.  
**Rule:** GHOST LINE and Crown Fall must be completable without building a turret or fighting a giant machine.

The final theater encounter should feel like defeating the people running a black test site, not beating the franchise's biggest weapon in hour one.

### ACT I — Harrow Spine
**Target:** Director Voss.  
**Class:** elite field commander / EW hunter.  
**Purpose:** exposed terrain, long-range detection, archive preservation.

### ACT I — St. Heliot Freeport
**Target:** Harbor Master Rusk.  
**Class:** commander with dock defenses / patrol craft or armored harbor vehicle.  
**Purpose:** civilian infrastructure versus mercenary control; capture systems intact rather than flattening the port.

### ACT I — The Kingdom That Failed
**Target:** Warden Kite.  
**Class:** human commander + salvage-yard defense network.  
**Purpose:** evacuation and child-survivor routes.  
**Sahelanthropus:** wreckage/history can be a major environmental/lore landmark; it is not a functioning boss.

### ACT II — Black Vault
**Target:** Custodian Zero.  
**Class:** stealth/deception specialist.  
**Purpose:** biometric locks, false identity, archive purge, information warfare.  
**Boss grammar:** the challenge is finding the real target and preserving evidence, not DPS.

### ACT II — Vostok Wound
**Target:** Directorate Command Engine.  
**Class:** armored command train.  
**Purpose:** moving battlefield, switching rails, civilian/evidence route conflict, disable-not-destroy options.

### ACT II — Caspian Wake
**Target:** Commodore Varga.  
**Class:** patrol-command craft / offshore command vehicle.  
**Purpose:** modular base defense, sea-lane logistics, open evacuation routes.

### ACT III — Contract Coast
**Target:** Broker General Sorn.  
**Class:** human commander controlling contractor squads and utilities.  
**Purpose:** multi-front command and civilian system preservation.

### ACT III — Mineral Corridor
**Current naming audit:** `Zanzibar Corridor` should be reviewed because it risks confusing the 1989 theater with 1999 Zanzibar Land. Prefer a period/geographic name that can exist without preempting the later canonical incident.  
**Target:** Command Crawler Khamsin.  
**Class:** heavy command vehicle / Tier 3 prototype.  
**Purpose:** logistics, heat, long-route warfare, anti-armor escalation.

### ACT III — The Perfect Son
**Target:** Prefect Aurel + mirrored command cadre.  
**Class:** elite commander / doctrine mirror.  
**Purpose:** enemy predicts the player's standard formations/opening and forces adaptation.  
**George/Solidus:** records and a time-appropriate youth/ward connection only; do not turn him into the later president or a mature warlord.

### ACT IV — Fox Line
**Target:** Handler Cassowary.  
**Class:** elite counter-command specialist.  
**Purpose:** false orders, friendly identification, shared command with David, trust under pressure.

### ACT IV — Father's Grave
**Target:** Archivist Golgotha + legacy test platform.  
**Class:** commander plus first Tier-4-adjacent prototype.  
**Purpose:** provenance, false Big Boss orders, weapon-development lineage.  
**Technology rule:** the platform can foreshadow bipedal deterrence research but cannot be TX-55, REX, or a finished future Metal Gear.

### ACT IV — No Man's Haven
**Target A:** **BASILISK** — rename/remove `REX`.  
**Class:** strategic retaliation platform / Tier 4 Command Rex original.  
**Origin:** a black-budget synthesis of period-appropriate AI, walker, command, and recovered research principles. It must not duplicate a canonical later machine.  
**Gameplay:** sever launch, repair, power, targeting, command, and retaliation dependencies across the map.

**Target B:** **David / Rotten Snake** — Tier 5 rival confrontation near the true end.  
**Gameplay:** prior relationship, casualties, evidence choices, doctrine, and whether the player normalized deterrence should alter the encounter and available resolutions.

The emotional endgame should be **weapon system → brother/command confrontation → aftermath**, not “giant robot in level one, bigger giant robot later.”

---

## 8. Sable Crown revised pacing

### Operation 1 — Foothold
No boss. Establish fieldcraft, reconnaissance, recovery, and a minimal forward site. Heavy defense is optional.

### Operation 2 — GHOST LINE
No conventional boss. The enemy is the **sensor/alarm architecture** plus a mobile patrol leader. Quiet completion is the ideal first-route demonstration.

### Operation 3 — Black Relay
Tier-1 mini-boss: named EW/security specialist or compact Walker Gear patrol. The player learns to isolate a system rather than kill the whole base.

### Operation 4 — Crown Fall
Tier-1/2 final: **Cipher Test Warden** supported by Walker Gears / conventional defenses and the uplink network.

Possible solutions:
- Ghost: blind command, capture Warden, seize uplink;
- Control: capture nodes, cut reinforcement network, force surrender;
- Force: breach defenses and defeat the security section.

No Metal Gear-scale boss.

---

## 9. David / Rotten Snake progression

David must feel like a long-game relationship, not a mystery boss waiting behind every theater.

### Prologue
Presence through signal, evidence, and conflicting authentication. No physical boss fight.

### Act I
Indirect interventions. Some help, some manipulation. Eli learns David is shaping events but cannot yet resolve motive.

### Act II
Physical reunion / cooperation becomes possible. Their tactics diverge in actual play.

### Act III
Parallel command. David can become ally, rival, or destabilizing co-commander based on facts—not a binary morality meter.

### Act IV
Shared battlefields force the conflict into the open. Fox Line and Father's Grave prepare the final disagreement.

### Endgame
Only now does a direct David confrontation become appropriate. It must support lethal and nonlethal/command resolutions where story state permits.

---

## 10. Map and character grounding rule

“All based solidly in the Metal Gear universe” means every content agent should start from **era-appropriate franchise grammar** before inventing.

### Maps
For each theater define:
- canonical-era inspiration bundle;
- climate/geography;
- military/industrial architecture vocabulary;
- faction equipment level;
- stealth affordances;
- one or two subtle franchise echoes;
- explicit future-tech exclusions.

Use franchise locations as visual/mechanical reference where useful, but do not copy official level layouts.

### Characters
Every major character should define:
- canonical status or original status;
- age and location plausibility for 1987–1990;
- affiliations that do not contradict later canon;
- visual language appropriate to the era;
- hard-stop future events they must survive or avoid interfering with.

### Equipment
Every major weapon/vehicle/system should define:
- period technology anchor;
- faction source;
- whether it is canonical, supplementary, cut-material-inspired, or original;
- why it does not preempt later famous technology.

---

## 11. Work-agent implementation requirements

The work agent should not merely rename `BASILISK REX`.

It must:
1. refactor campaign data so Sable Crown's finale is commander/light-walker scale;
2. remove early Metal Gear-class spawning and giant boss presentation from Sable Crown;
3. reserve the `metal-gear`/strategic-superweapon class for late Act IV only;
4. rename endgame `BASILISK REX` to a non-REX period-plausible identity (`BASILISK` working name);
5. ensure David/Rotten Snake does not become a direct boss before Act IV/endgame;
6. preserve the existing 13-theater terminal-state authority and save progression;
7. update objective/briefing/debrief copy, tests, health-bar scale, sprites, and boss spawn logic accordingly;
8. add lore-provenance metadata or a parallel content ledger before adding new lore-heavy content;
9. audit confusing future-event names such as `Zanzibar Corridor` before expanding that theater;
10. keep all newly created art original while using era-appropriate Metal Gear visual grammar.

---

## 12. Acceptance gate

Before Build 2.0 propagates beyond Sable Crown:
- first theater contains no actual or faux REX;
- first theater contains no Metal Gear-scale boss;
- GHOST LINE has no boss-gated stealth deadlock;
- Crown Fall has Ghost / Control / Force solutions;
- bosses remain correctly scaled to what they physically are;
- every major lore addition is provenance-tagged;
- the campaign cannot produce actual REX before 2005 or TX-55 before its 1995 role;
- late-game superweapon and David progression are reserved and foreshadowed rather than spent early.

## Source anchors used for this correction

Primary authority:
- Konami Metal Gear Portal / official history chronology;
- official MGSV history and story material;
- official Metal Gear / Metal Gear Solid history pages;
- official Peace Walker material and Metal Gear retrospective material;
- official Master Collection Master Book / Database program as lore reference.

Secondary research aid:
- Metal Gear Wiki/Fandom for indexing disputed/cut details such as Kingdom of the Flies and technology chronology, always verified against higher-tier sources where the distinction matters.

---

## One-line rule

**Earn the giant machine. Earn the rival Snake. Never spend either in the tutorial theater.**