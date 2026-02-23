import { Construction } from 'lucide-react';

export function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">{title}</h1>
        <p className="text-sm text-slate-400">{description}</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
          {Icon ? <Icon className="h-8 w-8 text-slate-500" /> : <Construction className="h-8 w-8 text-slate-500" />}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-300">Coming Soon</h3>
        <p className="mt-1 max-w-xs text-center text-sm text-slate-500">
          This feature is being built. Check back after the next release.
        </p>
      </div>
    </div>
  );
}
