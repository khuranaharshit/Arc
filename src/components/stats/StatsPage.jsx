import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, Layers } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useData } from '../../context/DataContext';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const tooltipStyle = {
  backgroundColor: '#131320', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px', color: '#e2e8f0', fontSize: '12px',
};

export function StatsPage() {
  const { activityDAO, streakDAO, levelDAO } = useData();
  const [totalXP, setTotalXP] = useState(0);
  const [totalActs, setTotalActs] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [xpHistory, setXpHistory] = useState([]);
  const [catBalance, setCatBalance] = useState([]);

  useEffect(() => {
    async function load() {
      setTotalXP(await activityDAO.getTotalXP());
      setTotalActs(await activityDAO.getTotalActivities());
      setStreak(await streakDAO.getCurrentStreak());
      const ld = await levelDAO.getLevelData();
      setLevel(ld.current_level);

      const hist = await activityDAO.getXPHistory(14);
      setXpHistory(hist.map((d) => ({ date: d.date.slice(5), xp: Math.round(d.xp) })));

      const cats = await activityDAO.getCategoryBreakdown(30);
      const labels = { body: 'Body', mind: 'Mind', learning: 'Learn', communication: 'Comm', technical: 'Tech', social: 'Social', discipline: 'Focus' };
      setCatBalance(Object.entries(labels).map(([k, v]) => ({ category: v, xp: Math.round(cats[k] || 0) })));
    }
    load();
  }, [activityDAO, streakDAO, levelDAO]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold t-primary">Stats</h1>
        <p className="text-sm t-muted">Your growth in numbers.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total XP', value: totalXP.toLocaleString(), icon: TrendingUp, gradient: 'from-purple-500 to-pink-500' },
          { label: 'Streak', value: `${streak}d`, icon: Target, gradient: 'from-orange-500 to-amber-500' },
          { label: 'Level', value: `Lv.${level}`, icon: Layers, gradient: 'from-blue-500 to-cyan-500' },
          { label: 'Activities', value: String(totalActs), icon: BarChart3, gradient: 'from-emerald-500 to-teal-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[11px] t-muted">{stat.label}</span>
              </div>
              <p className="text-xl font-extrabold t-primary">{stat.value}</p>
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
                <linearGradient id="xpG" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <Line type="monotone" dataKey="xp" stroke="url(#xpG)" strokeWidth={2.5}
                dot={{ fill: '#a855f7', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#ec4899' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader title="Category Balance" icon={Target} subtitle="Last 30 days" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={catBalance}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="category" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }} />
              <Radar dataKey="xp" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
