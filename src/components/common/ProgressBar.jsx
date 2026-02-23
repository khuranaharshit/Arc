export function ProgressBar({
  value,
  max = 100,
  color = 'bg-purple-500',
  gradient,
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  className = '',
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  const barStyle = gradient
    ? `bg-gradient-to-r ${gradient}`
    : color;

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-white/40">{label || `${value} / ${max}`}</span>
          <span className="font-mono font-medium text-white/60">{pct}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-white/5 ${heights[size]}`}>
        <div
          className={`${heights[size]} rounded-full ${barStyle} ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
