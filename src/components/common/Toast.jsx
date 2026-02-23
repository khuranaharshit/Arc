import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X, Zap } from 'lucide-react';

const icons = { success: CheckCircle, error: AlertCircle, info: Info, xp: Zap };

const styles = {
  success: 'border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl',
  error: 'border-red-500/30 bg-red-500/10 backdrop-blur-xl',
  info: 'border-blue-500/30 bg-blue-500/10 backdrop-blur-xl',
  xp: 'border-purple-500/30 bg-purple-500/10 backdrop-blur-xl',
};

const iconColors = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  xp: 'text-purple-400',
};

export function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(true);
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl transition-all duration-300 ${styles[type]} ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      }`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${iconColors[type]}`} />
      <p className="flex-1 text-sm font-medium text-white/80">{message}</p>
      <button onClick={onClose} className="text-white/25 hover:text-white/50">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}
