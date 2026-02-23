import { BarChart3, TrendingUp, Target, Layers } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

// Mock XP history
const xpHistory = Array.from({ length: 14 }, (_, i) => ({
  date: `Feb ${i + 10}`,
  xp: Math.floor(30 + Math.random() * 70),
}));

// Mock category balance
const categoryBalance = [
  { category: 'Body', xp: 45 },
  { category: 'Mind', xp: 68 },
  { category: 'Learn', xp: 32 },
  { category: 'Comm', xp: 18 },
  { category: 'Tech', xp: 55 },
  { category: 'Social', xp: 22 },
  { category: 'Focus', xp: 30 },
];

// Mock streak history
const streakHistory = [
  { period: 'Jan W1', days: 5 },
  { period: 'Jan W2', days: 7 },
  { period: 'Jan W3', days: 4 },
  { period: 'Jan W4', days: 7 },
  { period: 'Feb W1', days: 6 },
  { period: 'Feb W2', days: 7 },
  { period: 'Feb W3', days: 5 },
];

const customTooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '12px',
};

export function StatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Stats</h1>
        <p className="text-sm text-slate-400">Your growth in numbers.</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total XP', value: '1,247', icon: TrendingUp, color: 'text-violet-400' },
          { label: 'Current Streak', value: '14d', icon: Target, color: 'text-orange-400' },
          { label: 'Level', value: 'Lv.2', icon: Layers, color: 'text-blue-400' },
          { label: 'Activities', value: '89', icon: BarChart3, color: 'text-emerald-400' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-slate-400">{stat.label}</span>
              </div>
              <p className="mt-1 text-xl font-bold text-slate-100">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* XP Over Time */}
      <Card>
        <CardHeader title="XP Over Time" icon={TrendingUp} subtitle="Last 14 days" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={xpHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Line
                type="monotone"
                dataKey="xp"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Balance */}
        <Card>
          <CardHeader title="Category Balance" icon={Target} subtitle="XP distribution" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={categoryBalance}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar
                  dataKey="xp"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Streak History */}
        <Card>
          <CardHeader title="Streak History" icon={BarChart3} subtitle="Weekly streaks" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streakHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="days" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
