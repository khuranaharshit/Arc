import { BarChart3, TrendingUp, Target, Layers } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const xpHistory = Array.from({ length: 14 }, (_, i) => ({
  date: `Feb ${i + 10}`,
  xp: Math.floor(30 + Math.random() * 70),
}));

const categoryBalance = [
  { category: 'Body', xp: 45 }, { category: 'Mind', xp: 68 },
  { category: 'Learn', xp: 32 }, { category: 'Comm', xp: 18 },
  { category: 'Tech', xp: 55 }, { category: 'Social', xp: 22 },
  { category: 'Focus', xp: 30 },
];

const streakHistory = [
  { period: 'Jan W1', days: 5 }, { period: 'Jan W2', days: 7 },
  { period: 'Jan W3', days: 4 }, { period: 'Jan W4', days: 7 },
  { period: 'Feb W1', days: 6 }, { period: 'Feb W2', days: 7 },
  { period: 'Feb W3', days: 5 },
];

const tooltipStyle = {
  backgroundColor: '#131320',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  color: '#e2e8f0',
  fontSize: '12px',
};

export function StatsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Stats</h1>
        <p className="text-sm text-white/30">Your growth in numbers.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total XP', value: '1,247', icon: TrendingUp, gradient: 'from-purple-500 to-pink-500' },
          { label: 'Streak', value: '14d', icon: Target, gradient: 'from-orange-500 to-amber-500' },
          { label: 'Level', value: 'Lv.2', icon: Layers, gradient: 'from-blue-500 to-cyan-500' },
          { label: 'Activities', value: '89', icon: BarChart3, gradient: 'from-emerald-500 to-teal-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[11px] text-white/30">{stat.label}</span>
              </div>
              <p className="text-xl font-extrabold text-white">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader title="XP Over Time" icon={TrendingUp} subtitle="Last 14 days" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={xpHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <defs>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <Line type="monotone" dataKey="xp" stroke="url(#xpGradient)" strokeWidth={2.5}
                dot={{ fill: '#a855f7', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#ec4899' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Category Balance" icon={Target} subtitle="XP distribution" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={categoryBalance}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }} />
                <Radar dataKey="xp" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Streak History" icon={BarChart3} subtitle="Weekly streaks" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streakHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="period" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <defs>
                  <linearGradient id="streakGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <Bar dataKey="days" fill="url(#streakGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
