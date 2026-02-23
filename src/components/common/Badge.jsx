const colorMap = {
  primary: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  danger: 'bg-red-500/20 text-red-300 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  slate: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

export function Badge({ children, color = 'primary', icon: Icon, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${colorMap[color]} ${className}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
