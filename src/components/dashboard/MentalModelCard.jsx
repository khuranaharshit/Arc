import { Compass, ExternalLink } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';

// Mock — will be replaced by mental-models config + Wikipedia API
const MOCK_MODEL = {
  name: 'Inversion',
  summary:
    'Instead of thinking about how to achieve a goal, think about what would guarantee failure — then avoid those things. Charlie Munger: "All I want to know is where I\'m going to die, so I\'ll never go there."',
  wikiUrl: 'https://en.wikipedia.org/wiki/Inversion_(logic)',
};

export function MentalModelCard() {
  const model = MOCK_MODEL;

  return (
    <Card>
      <CardHeader title="Mental Model" icon={Compass} subtitle="Think better" />

      <h4 className="mb-1 text-sm font-bold text-slate-100">{model.name}</h4>
      <p className="text-xs leading-relaxed text-slate-400">{model.summary}</p>

      <a
        href={model.wikiUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-light"
      >
        Learn more
        <ExternalLink className="h-3 w-3" />
      </a>
    </Card>
  );
}
