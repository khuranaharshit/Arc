const colorMap = {
  primary: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  danger: 'bg-red-500/15 text-red-300 border-red-500/20',
  info: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  pink: 'bg-pink-500/15 text-pink-300 border-pink-500/20',
  slate: 'bg-white/5 text-white/50 border-white/10',
};

export function Badge({ children, color = 'primary', icon: Icon, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${colorMap[color]} ${className}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
