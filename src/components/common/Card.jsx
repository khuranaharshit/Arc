export function Card({ children, className = '', onClick, hover = false, glow = false }) {
  return (
    <div
      className={`${glow ? 'card-glow' : 'card'} ${hover ? 'cursor-pointer transition-all hover:scale-[1.02] hover:-translate-y-0.5' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-purple-400" />}
        <div>
          <h3 className="text-sm font-semibold text-white/90">{title}</h3>
          {subtitle && <p className="text-[11px] text-white/30">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
