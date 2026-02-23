import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { ImportInsights } from './ImportInsights';
import { InsightsDashboard } from './InsightsDashboard';
import { ExportDAO } from '../../dao/ExportDAO';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export function ExportPage() {
  const data = useData();
  const { addToast } = useToast();
  const [exportText, setExportText] = useState(null);
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState('markdown');

  const exportDAO = new ExportDAO(data);

  const generateExport = async () => {
    if (format === 'json') {
      const json = await exportDAO.generateJSON();
      setExportText(JSON.stringify(json, null, 2));
    } else {
      setExportText(await exportDAO.generateMarkdown());
    }
    addToast('Export generated!', 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    addToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = format === 'json' ? 'json' : 'md';
    const type = format === 'json' ? 'application/json' : 'text/markdown';
    const blob = new Blob([exportText], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arc-export-${new Date().toISOString().split('T')[0]}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Downloaded!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold t-primary">Export & Insights</h1>
        <p className="text-sm t-muted">Export data for analysis. Import insights back.</p>
      </div>

      {/* Export */}
      <Card>
        <CardHeader title="Generate Export" icon={Download} subtitle="For LLM analysis or backup" />
        <div className="flex gap-2 mb-4">
          {['markdown', 'json'].map((f) => (
            <button key={f} onClick={() => setFormat(f)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
                format === f ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 't-muted'
              }`}
              style={format !== f ? { background: 'var(--color-surface-row)' } : {}}>
              {f === 'markdown' ? 'Markdown (LLM)' : 'JSON (Data)'}
            </button>
          ))}
        </div>
        <button onClick={generateExport} className="btn-primary w-full">
          <Download className="h-4 w-4" /> Generate Export
        </button>
      </Card>

      {exportText && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold t-primary">Preview</h3>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="btn-ghost text-xs">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={handleDownload} className="btn-ghost text-xs">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          </div>
          <pre className="max-h-72 overflow-auto rounded-xl p-4 text-xs font-mono t-tertiary whitespace-pre-wrap"
            style={{ background: 'var(--color-surface-row)' }}>
            {exportText.slice(0, 2000)}{exportText.length > 2000 ? '\n\n... (truncated)' : ''}
          </pre>
        </Card>
      )}

      {/* Import */}
      <ImportInsights />

      {/* Past insights */}
      <InsightsDashboard />
    </div>
  );
}
