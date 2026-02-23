export function ProgressBar({
  value,
  max = 100,
  color = 'bg-primary',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  className = '',
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-slate-400">{label || `${value} / ${max}`}</span>
          <span className="font-mono font-medium text-slate-300">{pct}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-slate-700/50 ${heights[size]}`}>
        <div
          className={`${heights[size]} rounded-full ${color} ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
