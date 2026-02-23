/**
 * Wikipedia API service — fetches articles, summaries, and category members.
 * CORS supported via origin=* parameter. No proxy needed.
 * Cache responses in localStorage for 24 hours.
 */

const CACHE_PREFIX = 'arc_wiki_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCached(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(CACHE_PREFIX + key); return null; }
    return data;
  } catch { return null; }
}

function setCache(key, data) {
  try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

/**
 * Get random articles from a Wikipedia category.
 * @returns {Promise<{title, extract, url}[]>}
 */
export async function getRandomFromCategory(categoryName, count = 5) {
  const cacheKey = `cat_${categoryName}_${count}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    action: 'query',
    generator: 'categorymembers',
    gcmtitle: `Category:${categoryName}`,
    gcmlimit: String(count),
    prop: 'extracts|info',
    exintro: 'true',
    explaintext: 'true',
    exsentences: '3',
    inprop: 'url',
    format: 'json',
    origin: '*',
  });

  const resp = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
  if (!resp.ok) return [];

  const json = await resp.json();
  const pages = json.query?.pages || {};
  const results = Object.values(pages).map((p) => ({
    title: p.title,
    extract: p.extract || '',
    url: p.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,
  }));

  setCache(cacheKey, results);
  return results;
}

/**
 * Get summary of a specific article by title.
 * @returns {Promise<{title, extract, url, thumbnail?}>}
 */
export async function getArticleSummary(articleTitle) {
  const cacheKey = `sum_${articleTitle}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const resp = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(articleTitle)}`);
  if (!resp.ok) return null;

  const data = await resp.json();
  const result = {
    title: data.title,
    extract: data.extract,
    url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(articleTitle)}`,
    thumbnail: data.thumbnail?.source || null,
  };

  setCache(cacheKey, result);
  return result;
}

/**
 * Get a random article summary.
 * @returns {Promise<{title, extract, url}>}
 */
export async function getRandomArticle() {
  const resp = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
  if (!resp.ok) return null;

  const data = await resp.json();
  return {
    title: data.title,
    extract: data.extract,
    url: data.content_urls?.desktop?.page || '',
  };
}
