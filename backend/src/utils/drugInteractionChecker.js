const MEDICINES = require("../data/medicineDatabase");
const INTERACTIONS = require("../data/drugInteractions");

// Resolves a user-typed name (could be a brand name/alias) to the canonical
// medicine name used in the interactions dataset, e.g. "Tylenol" -> "Paracetamol".
function resolveCanonicalName(rawName) {
  const lower = rawName.trim().toLowerCase();
  const match = MEDICINES.find(
    (m) => m.name.toLowerCase() === lower || m.aliases.some((a) => a.toLowerCase() === lower)
  );
  return match ? match.name : rawName.trim();
}

/**
 * Given a list of drug names (any casing, brand or generic), returns:
 * - normalizedDrugs: the canonical names actually used for checking
 * - unrecognized: input names that didn't match anything in our medicine list
 *   (interactions can't be checked for these since we don't have their aliases)
 * - interactions: any known interaction pairs found among the normalized list
 */
function checkInteractions(rawDrugNames) {
  const unrecognized = [];
  const normalizedSet = new Set();

  for (const raw of rawDrugNames) {
    if (!raw || !raw.trim()) continue;
    const canonical = resolveCanonicalName(raw);
    const isKnown = MEDICINES.some((m) => m.name === canonical);
    if (!isKnown) {
      unrecognized.push(raw.trim());
    }
    normalizedSet.add(canonical);
  }

  const normalizedDrugs = Array.from(normalizedSet);
  const interactions = [];

  for (let i = 0; i < normalizedDrugs.length; i++) {
    for (let j = i + 1; j < normalizedDrugs.length; j++) {
      const a = normalizedDrugs[i];
      const b = normalizedDrugs[j];
      const found = INTERACTIONS.find((entry) => {
        const [d1, d2] = entry.drugs;
        return (d1 === a && d2 === b) || (d1 === b && d2 === a);
      });
      if (found) {
        interactions.push({ drugs: [a, b], severity: found.severity, description: found.description });
      }
    }
  }

  return { normalizedDrugs, unrecognized, interactions };
}

module.exports = { checkInteractions };
