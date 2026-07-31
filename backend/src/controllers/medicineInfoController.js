const { searchDrugLabel } = require("../config/openFdaClient");
const wikipedia = require("../config/wikipediaClient");
const MEDICINES = require("../data/medicineDatabase");

// GET /api/medicine-info?q=paracetamol
async function getMedicineInfo(req, res) {
  const q = (req.query.q || "").trim();
  if (!q) {
    return res.status(400).json({ message: "Provide a medicine name to search." });
  }

  // Check our small local list first for category (used for the icon) and
  // to resolve brand names (e.g. Indian brands) to a generic name we can
  // look up elsewhere -- matches by name or alias, case-insensitive.
  const local = MEDICINES.find(
    (m) =>
      m.name.toLowerCase() === q.toLowerCase() ||
      m.aliases.some((a) => a.toLowerCase() === q.toLowerCase())
  );
  const resolvedName = local ? local.name : q;

  try {
    const label = await searchDrugLabel(resolvedName);

    if (label) {
      return res.json({
        ...label,
        category: local?.category || "tablet",
        source: "openFDA (U.S. FDA)",
      });
    }

    // openFDA has nothing (common for India-only brands/generics) -- fall
    // back to a general Wikipedia summary of the resolved (generic) name.
    // This won't have official dosage/warnings, just a general description.
    const wiki = await wikipedia.getSummary(resolvedName);

    if (wiki) {
      return res.json({
        brandName: local ? q : null,
        genericName: resolvedName,
        purpose: wiki.extract,
        dosage: null,
        warnings: null,
        category: local?.category || "tablet",
        source: `Wikipedia (${wiki.pageUrl || "en.wikipedia.org"})`,
        limitedInfo: true,
      });
    }

    // Neither source had anything.
    return res.status(404).json({
      message:
        "No information found for this medicine in either the FDA database or Wikipedia. The name may need adjusting, or this may be a less common product.",
      category: local?.category || null,
      commonUse: local?.commonUse || null,
    });
  } catch (err) {
    console.error("Medicine info lookup failed:", err.message);
    return res.status(500).json({ message: "Could not look up medicine info right now." });
  }
}

module.exports = { getMedicineInfo };
