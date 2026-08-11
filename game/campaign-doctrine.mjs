/**
 * Data authority for the first three campaign chapters. The same theater
 * grammar drives the campaign menu, briefings, operation HUD, checkpoints,
 * terminal-state tests, and next-theater unlocks.
 */

export const CAMPAIGN_THEATERS = [
  {
    id: "sable-crown",
    act: "PROLOGUE",
    actTitle: "The Unwanted Son",
    year: 1987,
    location: "Barents Exclusion Zone",
    title: "Sable Crown",
    question: "Can Eli build anything without first proving the program wrong?",
    briefing: "A command imprint carrying Rotten Snake's ward authentication directs Shadow Command toward a black-program weapons test built around Eli's genetic signature.",
    biome: "SNOWBOUND ISLAND",
    doctrine: "Cipher Test Cell",
    finalTarget: "BASILISK REX",
    finalTargetClass: "metal-gear",
    finalUnitKind: "basilisk",
    victory: "BASILISK is disabled and David's signal points toward the survivors of Eli's failed island dream.",
    operations: [
      { name: "Foothold", verb: "Secure SUPPLY 01 and establish a defended Forward Command.", signal: "The test was waiting for Eli's signature." },
      { name: "Ghost Line", verb: "Take SUPPLY 02 and blind the plateau radar.", signal: "David's cipher carries a private ward memory." },
      { name: "Black Relay", verb: "Capture INTEL 03 and sever the response relays.", signal: "Cipher issued contradictory orders to both brothers." },
      { name: "Crown Fall", verb: "Break BASILISK's dependencies and seize the uplink.", signal: "David reaches Eli live—and ORBIT finds the trap geometry." },
    ],
  },
  {
    id: "harrow-spine",
    act: "ACT I",
    actTitle: "Kingdom of Flies",
    year: 1987,
    location: "Harrow Mountain Relay Belt",
    title: "Harrow Spine",
    question: "Can evidence liberate people if publishing it exposes their escape?",
    briefing: "Rotten Snake's route climbs through a wind-cut Cipher relay chain. Refugees move below the same antennas that can prove who armed Eli's failed kingdom.",
    biome: "WIND-CUT MOUNTAINS",
    doctrine: "Cipher Directorate",
    finalTarget: "DIRECTOR VOSS",
    finalTargetClass: "commander",
    finalUnitKind: "hunter",
    victory: "The mountain net falls. Tretij is alive, but the proof and the refugee route cannot both remain invisible.",
    operations: [
      { name: "White Noise", verb: "Establish a mountain FOB beneath the relay sweep.", signal: "A child-size heat trace shadows David's burst." },
      { name: "Dead Air", verb: "Cross the exposed shelf and blind long-range detection.", signal: "Tretij has been answering through weather interference." },
      { name: "The Listening Post", verb: "Sever the triangulation relays before the route is mapped.", signal: "The archive proves Cipher supplied both sides." },
      { name: "Open Secret", verb: "Take the evidence station and protect the evacuation lane.", signal: "Publishing now would authenticate the proof—and expose everyone below." },
      { name: "Windbreak", verb: "Defeat the field director without destroying the archive.", signal: "Rotten Snake asks Eli to trust the delay he engineered." },
    ],
  },
  {
    id: "st-heliot",
    act: "ACT I",
    actTitle: "Kingdom of Flies",
    year: 1987,
    location: "St. Heliot Freeport",
    title: "St. Heliot Freeport",
    question: "Is Shadow Command a rescue force, an army, or a state?",
    briefing: "Flooded workers and arms brokers share one failing grid. Every purchase strengthens the monopoly; every bombardment strands civilians behind the sea walls.",
    biome: "FLOODED ARMS MARKET",
    doctrine: "Freeport Consortium",
    finalTarget: "HARBOR MASTER RUSK",
    finalTargetClass: "commander",
    finalUnitKind: "hunter",
    victory: "The monopoly breaks. The workers now judge Shadow Command by who receives power, food, and a voice after the shooting stops.",
    operations: [
      { name: "Low Tide", verb: "Build above the flood line and restore a logistics berth.", signal: "David bought passage here with a promise made in Eli's name." },
      { name: "Black Market Current", verb: "Cut the radar auction and capture the civilian grid switch.", signal: "The same weapons invoice funded a refugee ferry." },
      { name: "Sea Wall", verb: "Sever mercenary relays without opening the drowned district.", signal: "Workers offer an inside route if Shadow shares command." },
      { name: "Open Port", verb: "Remove the Harbor Master and choose what controls the docks next.", signal: "David calls the public victory useful. Eli hears the word 'useful.'" },
    ],
  },
  {
    id: "kingdom-failed",
    act: "ACT I",
    actTitle: "Kingdom of Flies",
    year: 1987,
    location: "Mfinda Shipbreak Archipelago",
    title: "The Kingdom That Failed",
    question: "Is a country of soldiers liberation if its children cannot leave it?",
    briefing: "The remains of Eli's island dream have become a shipbreaking fortress. Children, scavengers, and Cipher salvage teams live inside the machinery of an unfinished war.",
    biome: "TROPICAL SHIPBREAK YARD",
    doctrine: "Orphaned Command Chain",
    finalTarget: "WARDEN KITE",
    finalTargetClass: "commander",
    finalUnitKind: "hunter",
    victory: "The siege ends without another child kingdom. Surviving people choose whether to join, leave, or testify; Eli does not choose for them.",
    operations: [
      { name: "Ashore", verb: "Land recovery crews and establish a repairable beachhead.", signal: "Eli's old command codes still open doors he never built." },
      { name: "Child Routes", verb: "Blind patrol radar and map the hidden evacuation tunnels.", signal: "The tunnels were designed to move weapons first, children second." },
      { name: "Scrap Memory", verb: "Sever salvage relays and recover the Sahelanthropus ledger.", signal: "Cipher itemized the failed kingdom as a controlled experiment." },
      { name: "No More Kings", verb: "Break the command yard while keeping evacuation power online.", signal: "Tretij refuses another home whose gates only open inward." },
      { name: "The Last Warden", verb: "Defeat Kite's compact guard and transfer authority to the survivors.", signal: "Rotten Snake preserved the chain as leverage. Eli decides who owns it." },
    ],
  },
  {
    id: "black-vault",
    act: "ACT II",
    actTitle: "Brother Signal",
    year: 1988,
    location: "Black Vault Subsurface Complex",
    title: "Black Vault",
    question: "Who owns the record of a life manufactured in secret?",
    briefing: "A buried clone archive opens only for ward biometrics. Power is scarce, corridors are identity-locked, and every recovered file can endanger a living subject.",
    biome: "SUBTERRANEAN ARCHIVE",
    doctrine: "Cipher Custodians",
    finalTarget: "CUSTODIAN ZERO",
    finalTargetClass: "commander",
    finalUnitKind: "hunter",
    victory: "EVA's records prove the ward engineered Eli and David's dependence, then taught them incompatible stories about what it meant.",
    operations: [
      { name: "Brownout", verb: "Establish emergency power without waking the whole vault.", signal: "David entered three weeks earlier and left the door repairable." },
      { name: "Identity Lock", verb: "Spoof the biometric radar and open the subject wing.", signal: "The file calls Rotten Snake a discarded control, not a fourth clone." },
      { name: "Chain of Custody", verb: "Take the archive nodes before custodians purge them.", signal: "The brothers' bond appears as a planned dependency and an unplanned loyalty." },
      { name: "The Redaction War", verb: "Hold the evidence floor while evacuation copies are prepared.", signal: "EVA warns that complete truth can still become a weapon against survivors." },
      { name: "Zero Knowledge", verb: "Defeat Custodian Zero and decide what leaves the vault.", signal: "David asks Eli to keep one page secret—for someone still alive." },
    ],
  },
  {
    id: "vostok-wound",
    act: "ACT II",
    actTitle: "Brother Signal",
    year: 1988,
    location: "Vostok Rail Corridor",
    title: "Vostok Wound",
    question: "Can the brothers choose each other after admitting the manipulation?",
    briefing: "A fortified train carries the genetic ledger through a frozen evacuation corridor. David's embedded contacts, civilians, and the evidence all move on different clocks.",
    biome: "FROZEN RAIL WAR",
    doctrine: "Armored Rail Directorate",
    finalTarget: "DIRECTORATE COMMAND ENGINE",
    finalTargetClass: "vehicle",
    finalUnitKind: "mantis",
    victory: "Eli and David reunite in person. Rotten Snake admits he used Sable Crown to force Eli onto the trail before Cipher could bury him.",
    operations: [
      { name: "Railhead", verb: "Deploy a mobile build radius and seize the first siding.", signal: "David's contacts are trapped aboard the rear cars." },
      { name: "Snowblind", verb: "Blind pursuit radar and escort the first evacuation column.", signal: "The ledger train is faster than the civilians it uses as cover." },
      { name: "Switchyard", verb: "Capture the junction relays and choose which train receives the clear line.", signal: "David chose the evidence route before knowing Eli was alive." },
      { name: "Bridge Cut", verb: "Hold the bridge controls while the final cars cross.", signal: "Rotten Snake offers his own position in exchange for the contacts." },
      { name: "Brother in the Wound", verb: "Disable the command engine and reach David before extraction closes.", signal: "David tells the truth without asking immediate forgiveness." },
    ],
  },
  {
    id: "caspian-wake",
    act: "ACT II",
    actTitle: "Brother Signal",
    year: 1988,
    location: "Caspian Mobile Exclusion",
    title: "Caspian Wake",
    question: "Can a refuge remain free if its safety depends on permanence?",
    briefing: "Shadow Command assembles an offshore refuge from modular platforms while hostile patrol craft test every supply lane and legal observers measure every shot.",
    biome: "OFFSHORE MODULAR BASE",
    doctrine: "Caspian Security Compact",
    finalTarget: "COMMODORE VARGA",
    finalTargetClass: "vehicle",
    finalUnitKind: "mantis",
    victory: "The first free-haven charter is written in infrastructure: permanent, mobile, or dispersed into protected routes. It is not named Outer Heaven.",
    operations: [
      { name: "First Platform", verb: "Assemble power, supply, and a defensible offshore command deck.", signal: "David arrives as a co-commander, not a radio ghost." },
      { name: "Wake Pattern", verb: "Blind patrol sensors and protect the first logistics flotilla.", signal: "The Compact offers recognition in exchange for command access." },
      { name: "Breakwater", verb: "Sever interdiction relays and link the civilian modules.", signal: "Wren's survivor network demands open exits before it commits." },
      { name: "Charter Fire", verb: "Hold the assembly platform while rival plans compete for power.", signal: "Eli and David issue different orders; neither is automatically supreme." },
      { name: "Open Water", verb: "Defeat Varga's compact command armor and keep the escape lanes open.", signal: "The brothers win together, then disagree about what victory must become." },
    ],
  },
  {
    id: "contract-coast",
    act: "ACT III",
    actTitle: "A Nation of Soldiers",
    year: 1989,
    location: "Contract Coast Merchant Belt",
    title: "Contract Coast",
    question: "Can a refuge protect a city without becoming its unelected government?",
    briefing: "A merchant city asks Shadow Command to hold its utilities while contractors, labor councils, and Cipher-backed security forces fight over who gets to define public order.",
    biome: "MERCHANT COAST CITY",
    doctrine: "War Economy Houses",
    finalTarget: "BROKER GENERAL SORN",
    finalTargetClass: "commander",
    finalUnitKind: "hunter",
    victory: "The city survives. Food, repair crews, and representation—not a flag—decide whether Shadow Command protected a refuge or occupied one.",
    operations: [
      { name: "Terms of Entry", verb: "Establish a coastal command net without seizing the civilian grid.", signal: "Every district received a different version of Shadow Command's contract." },
      { name: "Load Shedding", verb: "Restore the hospital and water circuits while hostile scouts map the outages.", signal: "The rolling blackout is a bidding tactic, not battle damage." },
      { name: "Picket Line", verb: "Open worker routes and disable the contractor response relays.", signal: "The labor council will help defend the city only if it retains command of its own people." },
      { name: "Three Fronts", verb: "Hold the port, utilities, and evacuation road against coordinated raids.", signal: "Rotten Snake wants the contract ledger exposed before the defense is secure." },
      { name: "House Account", verb: "Isolate Broker General Sorn and keep the civic network intact.", signal: "The Houses expected Eli to seize power because every other commander did." },
    ],
  },
  {
    id: "zanzibar-corridor",
    act: "ACT III",
    actTitle: "A Nation of Soldiers",
    year: 1989,
    location: "Zanzibar Mineral Corridor",
    title: "Zanzibar Corridor",
    question: "Who owns the ground when every army calls its supply line a necessity?",
    briefing: "A desert rail corridor carries the mineral supply that can feed tanks, reactors, or civilian reconstruction. Heat, distance, and salvage make logistics the real battlefield.",
    biome: "DESERT RAIL CORRIDOR",
    doctrine: "Mineral Security Brigade",
    finalTarget: "COMMAND CRAWLER KHAMSIN",
    finalTargetClass: "vehicle",
    finalUnitKind: "mantis",
    victory: "The corridor changes hands without becoming Shadow Command property. George's handlers answer by presenting managed order as the only alternative to Eli's uncertainty.",
    operations: [
      { name: "Heat Line", verb: "Deploy a shaded logistics chain before the first armored patrol arrives.", signal: "The concession map labels inhabited land as unused throughput." },
      { name: "Long Haul", verb: "Protect recovery convoys and blind the rail-control radar.", signal: "Cipher can starve either army without firing a shot." },
      { name: "Broken Gauge", verb: "Take the junction relays and reroute the mineral train.", signal: "Local assemblies offer guides, not ownership papers." },
      { name: "No Concession", verb: "Disable the command crawler and decide who can restart the line.", signal: "A sealed George file calls voluntary rule a temporary defect." },
    ],
  },
  {
    id: "perfect-son",
    act: "ACT III",
    actTitle: "A Nation of Soldiers",
    year: 1989,
    location: "Asterion Military Campus",
    title: "The Perfect Son",
    question: "Does engineered order become legitimate when it is more efficient than freedom?",
    briefing: "A white-room command campus trains officers against mirrored copies of Shadow Command doctrine. Its biometric systems are built around a future political heir, not a present commander.",
    biome: "BIOMETRIC WAR CAMPUS",
    doctrine: "Patriot Futures Office",
    finalTarget: "PREFECT AUREL",
    finalTargetClass: "commander",
    finalUnitKind: "hunter",
    victory: "The campus record is broken open. Its claim that Eli and Rotten Snake prove freedom creates chaos becomes a weapon only if the player leaves nobody alive to contradict it.",
    operations: [
      { name: "Mirror Drill", verb: "Establish a low-signature FOB against an enemy trained on your standard opening.", signal: "The campus has simulated Shadow Command for months." },
      { name: "Clean Room", verb: "Spoof the biometric sweep and extract coerced officer candidates.", signal: "The candidates are graded on obedience disguised as stability." },
      { name: "Counterself", verb: "Break the mirrored relay net while enemy squads imitate your formations.", signal: "Rotten Snake recognizes one exercise as a memory from the ward." },
      { name: "Future File", verb: "Secure the George record before the command staff can sanitize it.", signal: "The project does not predict a person; it prepares a role and calls the result inevitable." },
      { name: "Imperfect Victory", verb: "Defeat Prefect Aurel without erasing the people used to validate the program.", signal: "Eli can reject the file without making David accept his answer." },
    ],
  },
  {
    id: "fox-line",
    act: "ACT IV",
    actTitle: "The Inheritance War",
    year: 1990,
    location: "Fox Line Border Network",
    title: "Fox Line",
    question: "Can the brothers share a battlefield without turning trust into command?",
    briefing: "Cipher strikes a contested border network while Rotten Snake's Free Column enters from the opposite side. A temporary truce gives Eli and David one field—and two incompatible plans.",
    biome: "CONTESTED BORDER NETWORK",
    doctrine: "Cipher Counter-Command",
    finalTarget: "HANDLER CASSOWARY",
    finalTargetClass: "commander",
    finalUnitKind: "hunter",
    victory: "The border survives and the truce holds long enough to expose Cipher's custodians. Eli and David can no longer postpone what their shared command is doing to everyone below them.",
    operations: [
      { name: "Shared Frequency", verb: "Link two command zones without surrendering either force to the other.", signal: "David uses the ward phrase as authentication, then waits for Eli's consent." },
      { name: "False Uniforms", verb: "Identify disguised patrols and interrupt the orders splitting allied defenses.", signal: "Cipher's strongest weapon is a plausible order delivered at the right moment." },
      { name: "Two Snakes", verb: "Hold simultaneous sectors while severing the counter-command relays.", signal: "The brothers protect each other and still disagree over every acceptable loss." },
      { name: "The Fox Line", verb: "Remove Handler Cassowary and choose whether the truce survives victory.", signal: "Grey Fox leaves Eli a warning: loyalty is not the same as ownership." },
    ],
  },
  {
    id: "fathers-grave",
    act: "ACT IV",
    actTitle: "The Inheritance War",
    year: 1990,
    location: "Legacy Facility K-0",
    title: "Father's Grave",
    question: "What truth about a father is worth turning his surviving children into evidence?",
    briefing: "An abandoned Big Boss facility contains shifting archives, false command recordings, and weapon infrastructure claimed by every faction as proof of the same incompatible future.",
    biome: "UNDERGROUND LEGACY BASE",
    doctrine: "Legacy Recovery Office",
    finalTarget: "ARCHIVIST GOLGOTHA",
    finalTargetClass: "commander",
    finalUnitKind: "hunter",
    victory: "The brothers learn that Big Boss opposed becoming a template and still left systems others could inherit. The fact changes nothing unless they choose differently.",
    operations: [
      { name: "Dead Voice", verb: "Establish power while rejecting false command recordings that redirect your squads.", signal: "The voice is authentic material assembled into an order never given." },
      { name: "Inheritance Tax", verb: "Recover witnesses and cut the legacy-weapon production chain.", signal: "Every faction has already drafted the archive's conclusion." },
      { name: "Open Casket", verb: "Secure the provenance relays before the record fragments are rearranged again.", signal: "EVA can authenticate the source but refuses to own the survivors' testimony." },
      { name: "Father's Grave", verb: "Defeat Archivist Golgotha and decide what evidence can leave safely.", signal: "David asks whether destroying the myth requires one final spectacular lie." },
    ],
  },
  {
    id: "no-mans-haven",
    act: "ACT IV",
    actTitle: "The Inheritance War",
    year: 1990,
    location: "Shadow Command Regional Network",
    title: "No Man's Haven",
    question: "What must a military power give up to make its own permanent command unnecessary?",
    briefing: "Cipher withdrawal, retaliatory sabotage, and Rotten Snake's deterrence plan threaten every region Shadow Command altered. The final battle is a network of people, logistics, evidence, and weapons—not one throne.",
    biome: "MULTI-REGION ENDGAME",
    doctrine: "Retaliatory Command Network",
    finalTarget: "BASILISK RETALIATION CORE",
    finalTargetClass: "metal-gear",
    finalUnitKind: "basilisk",
    victory: "The retaliation network is resolved. Shadow Command's ending is determined by what remains able to function without Shadow Snake at the center.",
    operations: [
      { name: "Common Signal", verb: "Build accountable regional logistics before cutting Cipher's withdrawal command.", signal: "Every surviving assembly needs help; none agrees to become a subordinate base." },
      { name: "The Empty Throne", verb: "Defend assemblies, witnesses, and evacuation routes from competing succession plans.", signal: "Cipher, Rotten Snake, and George's file each offer Eli the role of necessary commander." },
      { name: "BASILISK FALL", verb: "Sever the launch, repair, targeting, and retaliation dependencies before confronting the core.", signal: "David can help dismantle the weapon or help Eli use it. Affection does not choose the answer." },
      { name: "After the Order", verb: "Secure the final command node and leave a structure that can survive victory.", signal: "No enemy remains large enough to make unity automatic." },
    ],
  },
];

export const CAMPAIGN_OPERATION_COUNT = CAMPAIGN_THEATERS.reduce(
  (total, theater) => total + theater.operations.length,
  0,
);

export const CAMPAIGN_ACTS = [...new Set(CAMPAIGN_THEATERS.map((theater) => theater.act))];

export const CAMPAIGN_CAST_BY_THEATER = {
  "sable-crown": ["Eli / Shadow Snake", "David / Rotten Snake", "Tretij Rebenok", "ORBIT-893"],
  "harrow-spine": ["Eli / Shadow Snake", "David / Rotten Snake", "Tretij Rebenok", "Grey Fox"],
  "st-heliot": ["Eli / Shadow Snake", "David / Rotten Snake", "Kazuhira Miller", "Hana Kovac / Wren"],
  "kingdom-failed": ["Eli / Shadow Snake", "David / Rotten Snake", "Tretij Rebenok", "Hana Kovac / Wren"],
  "black-vault": ["Eli / Shadow Snake", "David / Rotten Snake", "EVA", "Revolver Ocelot"],
  "vostok-wound": ["Eli / Shadow Snake", "David / Rotten Snake", "Grey Fox", "Kazuhira Miller"],
  "caspian-wake": ["Eli / Shadow Snake", "David / Rotten Snake", "Hana Kovac / Wren", "ORBIT-893"],
  "contract-coast": ["Eli / Shadow Snake", "David / Rotten Snake", "Hana Kovac / Wren", "Kazuhira Miller"],
  "zanzibar-corridor": ["Eli / Shadow Snake", "David / Rotten Snake", "Grey Fox", "Dr. Madnar"],
  "perfect-son": ["Eli / Shadow Snake", "David / Rotten Snake", "George / Solidus Snake", "Dr. Clark"],
  "fox-line": ["Eli / Shadow Snake", "David / Rotten Snake", "Grey Fox", "Revolver Ocelot"],
  "fathers-grave": ["Eli / Shadow Snake", "David / Rotten Snake", "EVA", "Big Boss archive"],
  "no-mans-haven": ["Eli / Shadow Snake", "David / Rotten Snake", "Hana Kovac / Wren", "Tretij Rebenok"],
};

export const THEATER_BY_ID = Object.fromEntries(CAMPAIGN_THEATERS.map((theater) => [theater.id, theater]));

export function nextTheaterId(theaterId) {
  const index = CAMPAIGN_THEATERS.findIndex((theater) => theater.id === theaterId);
  return index >= 0 && index < CAMPAIGN_THEATERS.length - 1 ? CAMPAIGN_THEATERS[index + 1].id : null;
}

/**
 * Variable-length theaters share the same opening grammar, but four-operation
 * theaters go directly from relays to the finale while five-operation theaters
 * insert a command-sector operation. Keeping that decision here prevents an
 * Act I theater from waiting on assets that were never spawned.
 */
export function campaignOperationRole(operationStage, operationCount) {
  const finalStage = operationCount - 1;
  if (operationStage === 0) return "foothold";
  if (operationStage === 1) return "radar";
  if (operationStage === 2) return "relays";
  if (operationStage === finalStage) return "finale";
  return "command";
}

export function mergeCampaignProgress(local = {}, incoming = {}) {
  const localUpdated = Number(local.updatedAt ?? 0);
  const incomingUpdated = Number(incoming.updatedAt ?? 0);
  const newest = incomingUpdated > localUpdated ? incoming : local;
  const completedSet = new Set([
    ...(Array.isArray(local.completedTheaterIds) ? local.completedTheaterIds : []),
    ...(Array.isArray(incoming.completedTheaterIds) ? incoming.completedTheaterIds : []),
  ]);
  const doctrineSet = new Set([
    ...(Array.isArray(local.unlockedDoctrine) ? local.unlockedDoctrine : []),
    ...(Array.isArray(incoming.unlockedDoctrine) ? incoming.unlockedDoctrine : []),
  ]);
  const completedTheaterIds = CAMPAIGN_THEATERS.map((theater) => theater.id).filter((id) => completedSet.has(id));
  const lifetimeKeys = ["commanderXp", "operationsCompleted", "deployments", "victories", "totalDetections", "totalLosses"];
  const merged = { ...local, ...newest, completedTheaterIds, unlockedDoctrine: [...doctrineSet] };
  for (const key of lifetimeKeys) merged[key] = Math.max(Number(local[key] ?? 0), Number(incoming[key] ?? 0));
  merged.completedTheaters = completedTheaterIds.length;
  merged.updatedAt = Math.max(localUpdated, incomingUpdated);
  return merged;
}

/** Generic terminal-state authority for every theater. */
export function evaluateTheaterGraph({ operationStage, operationCount, hqAlive, objectiveComplete, bossAlive, commandTargetOnline }) {
  if (!hqAlive) return { kind: "defeat", reason: "forward-command-destroyed" };
  const finalStage = operationCount - 1;
  if (operationStage < finalStage && objectiveComplete) {
    return { kind: "checkpoint", nextStage: operationStage + 1 };
  }
  if (operationStage === finalStage && !bossAlive && !commandTargetOnline) return { kind: "victory" };
  return { kind: "continue" };
}
