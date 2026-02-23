import { Lightbulb, ExternalLink } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';

// Mock — will be replaced by Wikipedia API
const MOCK_FACT = {
  title: 'Survivorship Bias',
  extract:
    'Survivorship bias is the logical error of concentrating on entities that passed a selection process while overlooking those that did not. This can lead to overly optimistic beliefs because failures are ignored.',
  url: 'https://en.wikipedia.org/wiki/Survivorship_bias',
};

export function DidYouKnow() {
  const fact = MOCK_FACT;

  return (
    <Card>
      <CardHeader title="Did You Know?" icon={Lightbulb} subtitle="Daily discovery" />

      <h4 className="mb-1 text-sm font-bold text-slate-100">{fact.title}</h4>
      <p className="text-xs leading-relaxed text-slate-400">{fact.extract}</p>

      <a
        href={fact.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-light"
      >
        Read more
        <ExternalLink className="h-3 w-3" />
      </a>
    </Card>
  );
}
