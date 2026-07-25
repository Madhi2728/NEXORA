// Uses NLM's free RxNorm "Prescribe" API, which returns the curated set of
// ingredient/brand names meant for search-as-you-type boxes (the same
// endpoint RxNav's own site uses) -- not the full, noisier clinical-drug list.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours -- RxNorm updates monthly

let cache = { names: [], fetchedAt: 0 };

async function fetchDisplayNames() {
  const res = await fetch("https://rxnav.nlm.nih.gov/REST/Prescribe/displaynames.json");
  if (!res.ok) throw new Error(`RxNorm request failed: ${res.status}`);
  const data = await res.json();
  return data.displayTermsList?.term || [];
}

async function ensureCache() {
  const isStale = Date.now() - cache.fetchedAt > CACHE_TTL_MS;
  if (isStale || cache.names.length === 0) {
    try {
      cache.names = await fetchDisplayNames();
      cache.fetchedAt = Date.now();
      console.log(`RxNorm: cached ${cache.names.length} prescribable names.`);
    } catch (err) {
      console.error("RxNorm: failed to refresh name cache:", err.message);
      // Keep serving whatever is already cached (possibly empty) rather than failing requests.
    }
  }
}

/**
 * Returns up to `limit` RxNorm display names containing `query`
 * (case-insensitive substring match).
 */
async function searchNames(query, limit = 15) {
  await ensureCache();
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return cache.names.filter((n) => n.toLowerCase().includes(q)).slice(0, limit);
}

// Warms the cache at server startup so the first user search isn't slow.
function warmCache() {
  ensureCache().catch(() => {});
}

module.exports = { searchNames, warmCache };
