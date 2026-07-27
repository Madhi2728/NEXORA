// Free, no API key required. Covers US-approved drugs only (FDA data), so
// India-only brands (e.g. "Meftal spas") won't be found here.
async function searchDrugLabel(term) {
  const q = term.trim();
  if (!q) return null;

  const query = encodeURIComponent(
    `openfda.brand_name:"${q}" openfda.generic_name:"${q}" openfda.substance_name:"${q}"`
  );
  const url = `https://api.fda.gov/drug/label.json?search=${query}&limit=1`;

  const response = await fetch(url);
  if (response.status === 404) return null; // openFDA returns 404 when nothing matches
  if (!response.ok) {
    throw new Error(`openFDA request failed: ${response.status}`);
  }

  const data = await response.json();
  const result = data.results?.[0];
  if (!result) return null;

  const firstOrNull = (arr) => (Array.isArray(arr) && arr.length ? arr[0] : null);

  return {
    brandName: firstOrNull(result.openfda?.brand_name),
    genericName: firstOrNull(result.openfda?.generic_name),
    manufacturer: firstOrNull(result.openfda?.manufacturer_name),
    purpose: firstOrNull(result.purpose) || firstOrNull(result.indications_and_usage),
    dosage: firstOrNull(result.dosage_and_administration),
    warnings: firstOrNull(result.warnings) || firstOrNull(result.warnings_and_cautions),
  };
}

module.exports = { searchDrugLabel };
