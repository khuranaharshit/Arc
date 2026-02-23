/**
 * Wikipedia API wrapper for games — random articles from topic categories + mental model summaries.
 */
import * as wikiService from '../../services/wikipedia-api';
import { ConfigLoader } from '../../dao/ConfigLoader';

/**
 * Get a random "Did You Know" fact from configured wiki categories.
 */
export async function getRandomFact() {
  try {
    const cfg = await ConfigLoader.wikiCategories();
    const category = cfg.categories[Math.floor(Math.random() * cfg.categories.length)];
    const results = await wikiService.getRandomFromCategory(category, 3);
    if (results.length > 0) {
      return results[Math.floor(Math.random() * results.length)];
    }
    // Fallback to random article
    return await wikiService.getRandomArticle();
  } catch {
    return await wikiService.getRandomArticle();
  }
}

/**
 * Get a random mental model summary.
 */
export async function getRandomMentalModel() {
  const cfg = await ConfigLoader.mentalModels();
  const model = cfg.models[Math.floor(Math.random() * cfg.models.length)];
  const summary = await wikiService.getArticleSummary(model.wiki);
  return summary ? { name: model.name, ...summary } : { name: model.name, extract: '', url: '' };
}
