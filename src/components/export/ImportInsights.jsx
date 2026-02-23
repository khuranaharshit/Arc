import { useState } from 'react';
import { Upload, FileText, Check } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export function ImportInsights() {
  const { localCache, syncEngine } = useData();
  const { addToast } = useToast();
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);

  const handleParse = () => {
    if (!text.trim()) return addToast('Paste your LLM analysis first', 'error');

    // Parse insight items from the text (look for bullet points or numbered items)
    const lines = text.split('\n').filter((l) => l.trim());
    const items = lines
      .filter((l) => /^[-•*\d]/.test(l.trim()))
      .map((l) => l.replace(/^[-•*\d.)\s]+/, '').trim())
      .filter((l) => l.length > 10);

    if (items.length === 0) {
      // Fallback: split by sentences
      const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 20);
      setParsed(sentences.slice(0, 10));
    } else {
      setParsed(items.slice(0, 20));
    }
  };

  const handleImport = async () => {
    if (!parsed || parsed.length === 0) return;

    const insightsData = await localCache.read('insights') || { version: 1, imports: [] };
    insightsData.imports.push({
      id: crypto.randomUUID(),
      imported_at: new Date().toISOString(),
      source: 'LLM analysis',
      items: parsed.map((text) => ({
        id: crypto.randomUUID(),
        text,
        category: 'pattern',
        acted_on: false,
        acted_on_date: null,
      })),
    });

    await localCache.write('insights', insightsData);
    syncEngine.pushKey('insights').catch(() => {});
    addToast(`Imported ${parsed.length} insights!`, 'success');
    setText('');
    setParsed(null);
  };

  return (
    <Card>
      <CardHeader title="Import Insights" icon={Upload} subtitle="Paste LLM analysis to track action items" />

      {!parsed ? (
        <>
          <textarea className="input-field min-h-[150px] resize-y text-xs" placeholder="Paste your ChatGPT/Claude analysis here..."
            value={text} onChange={(e) => setText(e.target.value)} />
          <button onClick={handleParse} className="btn-primary w-full mt-3">
            <FileText className="h-4 w-4" /> Parse Insights
          </button>
        </>
      ) : (
        <>
          <p className="text-xs t-muted mb-3">Found {parsed.length} insights. Review and import:</p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto mb-3">
            {parsed.map((item, i) => (
              <div key={i} className="surface-row text-xs t-secondary">{item}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setParsed(null)} className="btn-secondary flex-1">Back</button>
            <button onClick={handleImport} className="btn-primary flex-1">
              <Check className="h-4 w-4" /> Import {parsed.length} Insights
            </button>
          </div>
        </>
      )}
    </Card>
  );
}
