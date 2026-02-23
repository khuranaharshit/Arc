import { Settings, Key, Bell, Palette, Link, Database, Shield } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Button } from '../common/Button';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Settings</h1>
        <p className="text-sm text-slate-400">Manage your Arc instance.</p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader title="Account" icon={Key} />
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2.5">
            <div>
              <p className="text-sm text-slate-200">GitHub Token</p>
              <p className="text-xs text-slate-500">Fine-grained PAT</p>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2.5">
            <div>
              <p className="text-sm text-slate-200">Encryption Password</p>
              <p className="text-xs text-slate-500">AES-256-GCM</p>
            </div>
            <Button variant="ghost" size="sm" icon={Shield}>
              Change
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader title="Notifications" icon={Bell} />
        <div className="space-y-3">
          {[
            { label: 'Push notifications', desc: 'Daily reminders', enabled: true },
            { label: 'Streak alerts', desc: 'When streak is at risk', enabled: true },
            { label: 'Weekly review reminder', desc: 'Sunday evening', enabled: false },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2.5"
            >
              <div>
                <p className="text-sm text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <button
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  item.enabled ? 'bg-primary' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    item.enabled ? 'left-[22px]' : 'left-0.5'
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
          <Button variant="secondary" icon={Database} className="w-full justify-start">
            Force sync all data
          </Button>
          <Button variant="secondary" icon={Link} className="w-full justify-start">
            Export data (JSON)
          </Button>
          <Button variant="danger" icon={Shield} className="w-full justify-start">
            Clear local cache
          </Button>
        </div>
      </Card>
    </div>
  );
}
