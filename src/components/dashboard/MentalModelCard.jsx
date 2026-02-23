import { useState, useEffect, useCallback } from 'react';
import { Compass, ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { ConfigLoader } from '../../dao/ConfigLoader';

function pickRandom(arr, exclude = -1) {
  let idx;
  do { idx = Math.floor(Math.random() * arr.length); } while (idx === exclude && arr.length > 1);
  return idx;
}

export function MentalModelCard() {
  const [models, setModels] = useState([]);
  const [idx, setIdx] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ConfigLoader.mentalModels().then((cfg) => {
      setModels(cfg.models);
      // Pick a different one than DidYouKnow by offsetting
      const startIdx = Math.floor(Math.random() * cfg.models.length);
      setIdx(startIdx);
      if (cfg.models.length > 0) fetchSummary(cfg.models[startIdx]);
    });
  }, []);

  const fetchSummary = async (model) => {
    setLoading(true);
    setSummary(null);
    try {
      const resp = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${model.wiki}`);
      if (resp.ok) {
        const data = await resp.json();
        setSummary({
          name: model.name,
          extract: data.extract || 'No summary available.',
          url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${model.wiki}`,
        });
      } else {
        setSummary({ name: model.name, extract: 'Could not load summary.', url: `https://en.wikipedia.org/wiki/${model.wiki}` });
      }
    } catch {
      setSummary({ name: model.name, extract: 'Could not load summary — you may be offline.', url: `https://en.wikipedia.org/wiki/${model.wiki}` });
    }
    setLoading(false);
  };

  const refresh = useCallback(() => {
    if (models.length === 0) return;
    const newIdx = pickRandom(models, idx);
    setIdx(newIdx);
    fetchSummary(models[newIdx]);
  }, [models, idx]);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-indigo-500/8 blur-2xl" />
      <CardHeader title="Mental Model" icon={Compass} subtitle="Think better"
        action={
          <button onClick={refresh} className={`rounded-lg p-1.5 t-muted hover:t-secondary transition-colors ${loading ? 'animate-spin' : ''}`} title="Random model">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        }
      />
      {loading && !summary ? (
        <div className="py-4 text-center text-xs t-muted">Loading...</div>
      ) : summary ? (
        <>
          <h4 className="mb-1 text-sm font-bold t-primary">{summary.name}</h4>
          <p className="text-xs leading-relaxed t-tertiary line-clamp-4">{summary.extract}</p>
          <a href={summary.url} target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors">
            Learn more <ExternalLink className="h-3 w-3" />
          </a>
        </>
      ) : (
        <p className="text-xs t-muted">Loading model...</p>
      )}
    </Card>
  );
}
