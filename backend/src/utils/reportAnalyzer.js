const LAB_TESTS = require("../data/labReferenceRanges");
const MEDICINES = require("../data/medicineDatabase");

function escapeRegex(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

/**
 * Scans OCR'd report text line-by-line for known lab test names, pulls the
 * first number on that line as the value, and flags it against a reference
 * range. This is a simple heuristic, not real clinical parsing -- reports
 * with unusual formatting may be missed or misread.
 */
function extractFindings(text) {
  const lines = text.split("\n");
  const findings = [];

  for (const line of lines) {
    for (const test of LAB_TESTS) {
      const names = [test.test, ...test.aliases].map(escapeRegex);
      const namePattern = new RegExp(`\\b(${names.join("|")})\\b`, "i");
      if (!namePattern.test(line)) continue;

      const valueMatch = line.match(/(-?\d+(\.\d+)?)/);
      if (!valueMatch) break;

      const value = parseFloat(valueMatch[1]);
      let status = "normal";
      if (test.low != null && value < test.low) status = "low";
      if (test.high != null && value > test.high) status = "high";

      findings.push({
        test: test.test,
        value,
        unit: test.unit,
        normalRange: `${test.low ?? "-"}–${test.high ?? "-"}`,
        status,
      });
      break; // one match per line is enough
    }
  }

  return findings;
}

/**
 * Scans OCR'd text for any known medicine name or alias (whole-word match),
 * returning the matched medicine records, deduplicated.
 */
function detectMedicines(text) {
  const found = [];
  const seen = new Set();

  for (const med of MEDICINES) {
    const names = [med.name, ...med.aliases].map(escapeRegex);
    const pattern = new RegExp(`\\b(${names.join("|")})\\b`, "i");
    if (pattern.test(text) && !seen.has(med.name)) {
      found.push(med);
      seen.add(med.name);
    }
  }

  return found;
}

module.exports = { extractFindings, detectMedicines };
