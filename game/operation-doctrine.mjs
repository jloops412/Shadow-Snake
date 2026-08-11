/**
 * Reusable operation grammar. Storyboard copy selects a mission family, and
 * that family changes simulation values instead of remaining briefing flavor.
 */

export const OPERATION_PROFILES = Object.freeze({
  foothold: { label: "FOOTHOLD", rule: "Secure territory and establish a defensible production network.", captureRate: 1.12, hackRate: 1, detectionPressure: 1, raidPace: 1, logisticsYield: 1, defenseContract: 1, sustainRate: 1 },
  recon: { label: "RECON", rule: "Low-signature scouting and sensor disruption reduce the response window.", captureRate: 1, hackRate: 1.12, detectionPressure: 0.82, raidPace: 1.08, logisticsYield: 1, defenseContract: 1, sustainRate: 1 },
  extraction: { label: "EXTRACTION", rule: "Recovery and survivor routes matter more than target destruction.", captureRate: 1.08, hackRate: 1, detectionPressure: 0.92, raidPace: 1, logisticsYield: 1, defenseContract: 1, sustainRate: 1.25 },
  sabotage: { label: "SABOTAGE", rule: "Hacking and demolition break infrastructure faster, but expose the force.", captureRate: 1, hackRate: 1.28, detectionPressure: 1.06, raidPace: 1, logisticsYield: 1, defenseContract: 1, sustainRate: 1 },
  convoy: { label: "CONVOY", rule: "Protected logistics runs deliver larger field loads while routes remain contested.", captureRate: 1, hackRate: 1, detectionPressure: 1, raidPace: 0.94, logisticsYield: 1.3, defenseContract: 1, sustainRate: 1.08 },
  defense: { label: "DEFENSE", rule: "Counter-raids arrive faster and pay stronger perimeter contracts when repelled.", captureRate: 1, hackRate: 1, detectionPressure: 1, raidPace: 0.78, logisticsYield: 1, defenseContract: 1.3, sustainRate: 1.12 },
  disclosure: { label: "DISCLOSURE", rule: "Secure command nodes and preserve the network long enough to authenticate evidence.", captureRate: 1.2, hackRate: 1.18, detectionPressure: 1.04, raidPace: 0.9, logisticsYield: 1, defenseContract: 1.12, sustainRate: 1 },
  reconstruction: { label: "RECONSTRUCTION", rule: "Power, repair coverage, and intact infrastructure determine success.", captureRate: 1, hackRate: 1, detectionPressure: 0.96, raidPace: 0.92, logisticsYield: 1.12, defenseContract: 1.08, sustainRate: 1.35 },
  hunt: { label: "HUNT", rule: "Isolate a field-scale commander or vehicle before committing the finishing force.", captureRate: 1, hackRate: 1.08, detectionPressure: 1.08, raidPace: 0.9, logisticsYield: 1, defenseContract: 1.08, sustainRate: 1 },
  siege: { label: "SIEGE", rule: "Sever power, targeting, repair, and reinforcement dependencies before the Metal Gear-class core.", captureRate: 1, hackRate: 1.2, detectionPressure: 1.1, raidPace: 0.84, logisticsYield: 1, defenseContract: 1.12, sustainRate: 1.08 },
});

function textFor(operation = {}) {
  return `${operation.name ?? ""} ${operation.verb ?? ""}`.toLowerCase();
}

export function operationTypeFor({ operation = {}, operationStage = 0, operationCount = 4, finalTargetClass = "commander" }) {
  const finalStage = operationCount - 1;
  if (operationStage === finalStage) return finalTargetClass === "metal-gear" ? "siege" : "hunt";
  const text = textFor(operation);
  if (/evacuat|extract|survivor|witness|child route|contacts|subject wing/.test(text)) return "extraction";
  if (/convoy|flotilla|train|cars cross|logistics lane|long haul|railhead|supply line/.test(text)) return "convoy";
  if (/hold|defend|three fronts|shared control|simultaneous sector|protect .*road|protect .*lane/.test(text)) return "defense";
  if (/evidence|archive|record|proof|publish|redaction|provenance|ledger|file/.test(text)) return "disclosure";
  if (/restore|repair|power|grid|reconstruct|utilities|hospital|water circuit/.test(text)) return "reconstruction";
  if (/blind|radar|sensor|spoof|identify|map .*route|listening post|snowblind|clean room/.test(text)) return "recon";
  if (/sever|disable|break|cut|interdict|relay|command chain/.test(text)) return "sabotage";
  if (operationStage === 0) return "foothold";
  if (operationStage === 1) return "recon";
  if (operationStage === 2) return "sabotage";
  return "defense";
}

export function operationDoctrine(input) {
  const type = operationTypeFor(input);
  return { type, ...OPERATION_PROFILES[type] };
}
