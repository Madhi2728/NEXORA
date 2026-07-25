const MEDICINES = require("../data/medicineDatabase");
const rxnorm = require("../config/rxnormClient");
const { checkInteractions } = require("../utils/drugInteractionChecker");

// POST /api/drug-interactions/check   body: { drugs: ["Aspirin", "Warfarin"] }
function checkDrugInteractions(req, res) {
  const { drugs } = req.body;

  if (!Array.isArray(drugs) || drugs.length < 2) {
    return res.status(400).json({ message: "Provide at least two drug names to check." });
  }
  if (drugs.length > 15) {
    return res.status(400).json({ message: "Please check 15 drugs or fewer at a time." });
  }

  const result = checkInteractions(drugs);
  return res.json(result);
}

// GET /api/drug-interactions/medicines?q=searchTerm
// Merges our small local list (which has real interaction data) with the
// much larger live RxNorm name list (for broad name coverage/autocomplete).
async function listKnownMedicines(req, res) {
  const q = (req.query.q || "").trim();

  const localMatches = MEDICINES.filter((m) => {
    if (!q) return true;
    const lower = q.toLowerCase();
    return m.name.toLowerCase().includes(lower) || m.aliases.some((a) => a.toLowerCase().includes(lower));
  }).map((m) => ({ name: m.name, aliases: m.aliases, hasInteractionData: true }));

  if (!q) {
    // No query yet -- just return our curated list so the dropdown isn't empty on focus.
    return res.json({ medicines: localMatches });
  }

  let rxnormMatches = [];
  try {
    const names = await rxnorm.searchNames(q, 15);
    const localNamesLower = new Set(localMatches.map((m) => m.name.toLowerCase()));
    rxnormMatches = names
      .filter((n) => !localNamesLower.has(n.toLowerCase()))
      .map((n) => ({ name: n, aliases: [], hasInteractionData: false }));
  } catch (err) {
    console.error("RxNorm search failed:", err.message);
    // Fall through and just return local matches -- search still works, just narrower.
  }

  return res.json({ medicines: [...localMatches, ...rxnormMatches].slice(0, 20) });
}

module.exports = { checkDrugInteractions, listKnownMedicines };
