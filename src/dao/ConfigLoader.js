/**
 * Loads config JSON files from /public/config/ with in-memory caching.
 */
const cache = {};

async function loadConfig(name) {
  if (cache[name]) return cache[name];
  const resp = await fetch(`${import.meta.env.BASE_URL}config/${name}.json`);
  if (!resp.ok) throw new Error(`Failed to load config: ${name}`);
  const data = await resp.json();
  cache[name] = data;
  return data;
}

export const ConfigLoader = {
  xpMenu: () => loadConfig('xp-menu'),
  levels: () => loadConfig('levels'),
  streaks: () => loadConfig('streaks'),
  achievements: () => loadConfig('achievements'),
  readingList: () => loadConfig('reading-list'),
  nudges: () => loadConfig('nudges'),
  links: () => loadConfig('links'),
  wikiCategories: () => loadConfig('wiki-categories'),
  mentalModels: () => loadConfig('mental-models'),
  fermiEstimates: () => loadConfig('fermi-estimates'),
  calibration: () => loadConfig('calibration'),
  classicRiddles: () => loadConfig('classic-riddles'),
  clearCache: () => { Object.keys(cache).forEach((k) => delete cache[k]); },
};
