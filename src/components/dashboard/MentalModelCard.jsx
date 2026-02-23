import { Compass, ExternalLink } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';

const MOCK_MODEL = {
  name: 'Inversion',
  summary:
    'Instead of thinking about how to achieve a goal, think about what would guarantee failure — then avoid those things. Charlie Munger: "All I want to know is where I\'m going to die, so I\'ll never go there."',
  wikiUrl: 'https://en.wikipedia.org/wiki/Inversion_(logic)',
};

export function MentalModelCard() {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-indigo-500/8 blur-2xl" />
      <CardHeader title="Mental Model" icon={Compass} subtitle="Think better" />
      <h4 className="mb-1 text-sm font-bold text-white/90">{MOCK_MODEL.name}</h4>
      <p className="text-xs leading-relaxed text-white/40">{MOCK_MODEL.summary}</p>
      <a
        href={MOCK_MODEL.wikiUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
      >
        Learn more <ExternalLink className="h-3 w-3" />
      </a>
    </Card>
  );
}
