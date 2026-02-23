import { Construction } from 'lucide-react';

export function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-sm text-white/30">{description}</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
          {Icon ? <Icon className="h-8 w-8 text-white/20" /> : <Construction className="h-8 w-8 text-white/20" />}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white/50">Coming Soon</h3>
        <p className="mt-1 max-w-xs text-center text-sm text-white/25">
          This feature is being built. Check back after the next release.
        </p>
      </div>
    </div>
  );
}
