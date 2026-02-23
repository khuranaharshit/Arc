import { useState } from 'react';
import { Settings, Key, Bell, Palette, Database, Shield, Sun, Moon } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState({
    push: true, streak: true, review: false,
  });

  const toggleNotif = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    addToast(`Notification ${notifications[key] ? 'disabled' : 'enabled'}`, 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-white/30">Manage your Arc instance.</p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader title="Account" icon={Key} />
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
            <div>
              <p className="text-sm text-white/70">GitHub Token</p>
              <p className="text-xs text-white/25">Fine-grained PAT</p>
            </div>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
            <div>
              <p className="text-sm text-white/70">Encryption Password</p>
              <p className="text-xs text-white/25">AES-256-GCM via Web Crypto</p>
            </div>
            <Button variant="ghost" size="sm" icon={Shield} onClick={() => addToast('Password change coming soon', 'info')}>
              Change
            </Button>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader title="Appearance" icon={Palette} />
        <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="h-4 w-4 text-purple-400" /> : <Sun className="h-4 w-4 text-amber-400" />}
            <div>
              <p className="text-sm text-white/70">Theme</p>
              <p className="text-xs text-white/25">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-purple-500' : 'bg-white/20'
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                theme === 'dark' ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader title="Notifications" icon={Bell} />
        <div className="space-y-2">
          {[
            { key: 'push', label: 'Push notifications', desc: 'Daily reminders' },
            { key: 'streak', label: 'Streak alerts', desc: 'When streak is at risk' },
            { key: 'review', label: 'Weekly review reminder', desc: 'Sunday evening' },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3"
            >
              <div>
                <p className="text-sm text-white/70">{item.label}</p>
                <p className="text-xs text-white/25">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleNotif(item.key)}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  notifications[item.key] ? 'bg-purple-500' : 'bg-white/10'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    notifications[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader title="Data" icon={Database} />
        <div className="space-y-2">
          <Button variant="secondary" icon={Database} className="w-full justify-start" onClick={() => addToast('Sync complete!', 'success')}>
            Force sync all data
          </Button>
          <Button variant="secondary" icon={Shield} className="w-full justify-start" onClick={() => addToast('Export coming soon', 'info')}>
            Export data (JSON)
          </Button>
          <button
            onClick={() => addToast('Cache cleared', 'success')}
            className="inline-flex w-full items-center justify-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/10 active:scale-[0.97]"
          >
            <Shield className="h-4 w-4" />
            Clear local cache
          </button>
        </div>
      </Card>
    </div>
  );
}
