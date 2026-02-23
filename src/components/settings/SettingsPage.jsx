import { useState } from 'react';
import { Key, Bell, Palette, Database, Shield, Sun, Moon, Github, LogOut } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { ThemeSettings } from './ThemeSettings';
import { PasswordChange } from '../auth/PasswordChange';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

function Toggle({ on, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onChange}
      className="toggle" data-on={String(on)} />
  );
}

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { logout, getPassword } = useAuth();
  const { localCache, storageMode } = useData();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState({ push: true, streak: true, review: false });
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const toggleNotif = (key) => {
    const next = !notifications[key];
    setNotifications((prev) => ({ ...prev, [key]: next }));
    addToast(`${next ? 'Enabled' : 'Disabled'}: ${key === 'push' ? 'Push notifications' : key === 'streak' ? 'Streak alerts' : 'Weekly review reminder'}`, 'info');
  };

  const handleClearCache = () => {
    if (window.confirm('This will clear all local data. Are you sure?')) {
      localCache.clearAll();
      addToast('Local cache cleared. Refresh to start fresh.', 'success');
    }
  };

  const handleLogout = () => {
    logout();
    addToast('Logged out', 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold t-primary">Settings</h1>
        <p className="text-sm t-muted">Manage your Arc instance.</p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader title="Account" icon={Key} />
        <div className="space-y-2">
          <div className="surface-row">
            <div>
              <p className="text-sm t-secondary">Encryption Password</p>
              <p className="text-xs t-muted">AES-256-GCM via Web Crypto</p>
            </div>
            <Button variant="ghost" size="sm" icon={Shield}
              onClick={() => setShowPasswordChange(!showPasswordChange)}>
              {showPasswordChange ? 'Hide' : 'Change'}
            </Button>
          </div>
          <div className="surface-row">
            <div>
              <p className="text-sm t-secondary">Storage Mode</p>
              <p className="text-xs t-muted">
                {storageMode === 'dev' ? 'Dev server (./data/ files)' :
                 storageMode === 'github' ? 'GitHub repo (encrypted)' : 'Local only (localStorage)'}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              storageMode === 'dev' ? 'bg-amber-500/15 border border-amber-500/20 text-amber-400' :
              storageMode === 'github' ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400' :
              'bg-blue-500/15 border border-blue-500/20 text-blue-400'
            }`}>
              {storageMode === 'dev' ? 'Dev' : storageMode === 'github' ? 'GitHub' : 'Local'}
            </span>
          </div>
        </div>
      </Card>

      {showPasswordChange && <PasswordChange />}

      {/* Appearance */}
      <Card>
        <CardHeader title="Appearance" icon={Palette} />
        <div className="surface-row">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="h-4 w-4 text-purple-400" /> : <Sun className="h-4 w-4 text-amber-400" />}
            <div>
              <p className="text-sm t-secondary">Theme</p>
              <p className="text-xs t-muted">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
            </div>
          </div>
          <Toggle on={theme === 'dark'} onChange={toggleTheme} />
        </div>
      </Card>

      {/* Unlockable themes */}
      <ThemeSettings />

      {/* Notifications */}
      <Card>
        <CardHeader title="Notifications" icon={Bell} />
        <div className="space-y-2">
          {[
            { key: 'push', label: 'Push notifications', desc: 'Daily reminders' },
            { key: 'streak', label: 'Streak alerts', desc: 'When streak is at risk' },
            { key: 'review', label: 'Weekly review reminder', desc: 'Sunday evening' },
          ].map((item) => (
            <div key={item.key} className="surface-row">
              <div>
                <p className="text-sm t-secondary">{item.label}</p>
                <p className="text-xs t-muted">{item.desc}</p>
              </div>
              <Toggle on={notifications[item.key]} onChange={() => toggleNotif(item.key)} />
            </div>
          ))}
        </div>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader title="Data" icon={Database} />
        <div className="space-y-2">
          <Button variant="secondary" icon={Database} className="w-full justify-start"
            onClick={() => addToast('All data is auto-synced', 'success')}>
            Force sync all data
          </Button>
          <button onClick={handleClearCache}
            className="inline-flex w-full items-center justify-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/10 active:scale-[0.97]">
            <Shield className="h-4 w-4" />
            Clear all local data
          </button>
        </div>
      </Card>

      {/* Logout */}
      <Card>
        <button onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/5 active:scale-[0.97]">
          <LogOut className="h-4 w-4" />
          Lock App
        </button>
        <p className="text-[10px] t-faint text-center mt-1">Locks the app. Re-enter password to unlock. Data is not deleted.</p>
      </Card>
    </div>
  );
}
