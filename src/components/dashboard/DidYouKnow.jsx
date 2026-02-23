import { useState, useEffect, useCallback } from 'react';
import { Lightbulb, ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { ConfigLoader } from '../../dao/ConfigLoader';

function pickRandom(arr, exclude = -1) {
  let idx;
  do { idx = Math.floor(Math.random() * arr.length); } while (idx === exclude && arr.length > 1);
  return idx;
}

export function DidYouKnow() {
  const [models, setModels] = useState([]);
  const [idx, setIdx] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ConfigLoader.mentalModels().then((cfg) => {
      setModels(cfg.models);
      if (cfg.models.length > 0) fetchSummary(cfg.models[Math.floor(Math.random() * cfg.models.length)]);
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
          title: data.title || model.name,
          extract: data.extract || 'No summary available.',
          url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${model.wiki}`,
        });
      } else {
        setSummary({ title: model.name, extract: 'Could not load summary.', url: `https://en.wikipedia.org/wiki/${model.wiki}` });
      }
    } catch {
      setSummary({ title: model.name, extract: 'Could not load summary — you may be offline.', url: `https://en.wikipedia.org/wiki/${model.wiki}` });
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
      <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-amber-500/8 blur-2xl" />
      <CardHeader title="Did You Know?" icon={Lightbulb} subtitle="Daily discovery"
        action={
          <button onClick={refresh} className={`rounded-lg p-1.5 t-muted hover:t-secondary transition-colors ${loading ? 'animate-spin' : ''}`} title="Random topic">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        }
      />
      {loading && !summary ? (
        <div className="py-4 text-center text-xs t-muted">Loading...</div>
      ) : summary ? (
        <>
          <h4 className="mb-1 text-sm font-bold t-primary">{summary.title}</h4>
          <p className="text-xs leading-relaxed t-tertiary line-clamp-4">{summary.extract}</p>
          <a href={summary.url} target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors">
            Read more <ExternalLink className="h-3 w-3" />
          </a>
        </>
      ) : (
        <p className="text-xs t-muted">Loading knowledge...</p>
      )}
    </Card>
  );
}
