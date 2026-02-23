import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

export function ExternalLink({ href, children, icon: Icon, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-surface px-3 py-2 text-sm text-slate-300 transition-all hover:border-slate-500 hover:bg-surface-elevated hover:text-slate-100 ${className}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
      <ExternalLinkIcon className="h-3 w-3 text-slate-500" />
    </a>
  );
}
