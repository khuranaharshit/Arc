import { useState, useEffect } from 'react';
import { Lightbulb, CheckCircle, Circle, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { relativeDate } from '../../utils/dates';

export function InsightsDashboard() {
  const { localCache, syncEngine } = useData();
  const { addToast } = useToast();
  const [insightsData, setInsightsData] = useState(null);

  useEffect(() => {
    localCache.read('insights').then((d) => setInsightsData(d || { version: 1, imports: [] }));
  }, [localCache]);

  const toggleActedOn = async (importIdx, itemIdx) => {
    const data = { ...insightsData };
    const item = data.imports[importIdx]?.items[itemIdx];
    if (!item) return;
    item.acted_on = !item.acted_on;
    item.acted_on_date = item.acted_on ? new Date().toISOString().split('T')[0] : null;
    await localCache.write('insights', data);
    syncEngine.pushKey('insights').catch(() => {});
    setInsightsData({ ...data });
    if (item.acted_on) addToast('Insight marked as acted on!', 'success');
  };

  const deleteImport = async (importIdx) => {
    const data = { ...insightsData };
    data.imports.splice(importIdx, 1);
    await localCache.write('insights', data);
    syncEngine.pushKey('insights').catch(() => {});
    setInsightsData({ ...data });
    addToast('Import deleted', 'info');
  };

  if (!insightsData || insightsData.imports.length === 0) {
    return null; // Don't render if no imports
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold t-primary flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-400" /> Past Insights
      </h2>

      {[...insightsData.imports].reverse().map((imp, rawIdx) => {
        const importIdx = insightsData.imports.length - 1 - rawIdx;
        const acted = imp.items.filter((i) => i.acted_on).length;
        return (
          <Card key={imp.id}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs t-muted">{relativeDate(imp.imported_at.split('T')[0])}</span>
                <span className="mx-2 text-xs t-faint">•</span>
                <span className="text-xs t-muted">{imp.source}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={acted === imp.items.length ? 'success' : 'slate'}>{acted}/{imp.items.length}</Badge>
                <button onClick={() => deleteImport(importIdx)} className="t-faint hover:text-red-400 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {imp.items.map((item, itemIdx) => (
                <button key={item.id} onClick={() => toggleActedOn(importIdx, itemIdx)}
                  className="flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left transition-all surface-row">
                  {item.acted_on
                    ? <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    : <Circle className="h-4 w-4 t-faint shrink-0 mt-0.5" />
                  }
                  <span className={`text-xs ${item.acted_on ? 't-muted line-through' : 't-secondary'}`}>{item.text}</span>
                </button>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
