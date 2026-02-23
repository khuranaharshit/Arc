import { Loader2 } from 'lucide-react';

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-slate-900">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-2 border-slate-700" />
        <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-primary" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-gradient">Arc</h2>
        <p className="mt-1 text-sm text-slate-400">{message}</p>
      </div>
    </div>
  );
}
