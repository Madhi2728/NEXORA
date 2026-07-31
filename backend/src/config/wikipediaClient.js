// Free, no API key. Used as a fallback when openFDA has no data for a drug
// (e.g. India-only brands) -- gives a general description, but NOT official
// dosage/warnings, since Wikipedia isn't a regulatory drug label source.
async function getSummary(term) {
  const q = term.trim();
  if (!q) return null;

  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "NexoraHealth/1.0 (educational demo project)" },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Wikipedia request failed: ${response.status}`);
  }

  const data = await response.json();

  // Skip disambiguation pages and non-article results -- not useful here.
  if (data.type === "disambiguation" || !data.extract) return null;

  return {
    title: data.title,
    extract: data.extract,
    pageUrl: data.content_urls?.desktop?.page || null,
  };
}

module.exports = { getSummary };
