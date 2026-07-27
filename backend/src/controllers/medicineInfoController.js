const { searchDrugLabel } = require("../config/openFdaClient");
const MEDICINES = require("../data/medicineDatabase");

// GET /api/medicine-info?q=paracetamol
async function getMedicineInfo(req, res) {
  const q = (req.query.q || "").trim();
  if (!q) {
    return res.status(400).json({ message: "Provide a medicine name to search." });
  }

  // Check our small local list first for category (used for the icon) --
  // matches by name or alias, case-insensitive.
  const local = MEDICINES.find(
    (m) =>
      m.name.toLowerCase() === q.toLowerCase() ||
      m.aliases.some((a) => a.toLowerCase() === q.toLowerCase())
  );

  try {
    const label = await searchDrugLabel(local ? local.name : q);

    if (!label) {
      return res.status(404).json({
        message:
          "No FDA label data found for this medicine. It may not be an FDA-approved product (e.g. an India-only brand) or the name may need adjusting.",
        category: local?.category || null,
        commonUse: local?.commonUse || null,
      });
    }

    return res.json({
      ...label,
      category: local?.category || "tablet",
      source: "openFDA (U.S. FDA)",
    });
  } catch (err) {
    console.error("Medicine info lookup failed:", err.message);
    return res.status(500).json({ message: "Could not look up medicine info right now." });
  }
}

module.exports = { getMedicineInfo };
