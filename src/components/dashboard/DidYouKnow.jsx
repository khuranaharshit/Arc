import { Lightbulb, ExternalLink } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';

const MOCK_FACT = {
  title: 'Survivorship Bias',
  extract:
    'Survivorship bias is the logical error of concentrating on entities that passed a selection process while overlooking those that did not. This can lead to overly optimistic beliefs because failures are ignored.',
  url: 'https://en.wikipedia.org/wiki/Survivorship_bias',
};

export function DidYouKnow() {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-amber-500/8 blur-2xl" />
      <CardHeader title="Did You Know?" icon={Lightbulb} subtitle="Daily discovery" />
      <h4 className="mb-1 text-sm font-bold text-white/90">{MOCK_FACT.title}</h4>
      <p className="text-xs leading-relaxed text-white/40">{MOCK_FACT.extract}</p>
      <a
        href={MOCK_FACT.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
      >
        Read more <ExternalLink className="h-3 w-3" />
      </a>
    </Card>
  );
}
