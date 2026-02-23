import { Construction } from 'lucide-react';

export function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold t-primary">{title}</h1>
        <p className="text-sm t-muted">{description}</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--color-surface-row)' }}>
          {Icon ? <Icon className="h-8 w-8 t-faint" /> : <Construction className="h-8 w-8 t-faint" />}
        </div>
        <h3 className="mt-4 text-lg font-semibold t-tertiary">Coming Soon</h3>
        <p className="mt-1 max-w-xs text-center text-sm t-muted">
          This feature is being built. Check back after the next release.
        </p>
      </div>
    </div>
  );
}
