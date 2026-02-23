import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Puzzle, Zap } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';

const TABS = [
  { key: 'practice', label: 'Practice', icon: Brain },
  { key: 'puzzles', label: 'Puzzles', icon: Puzzle },
  { key: 'speed', label: 'Speed', icon: Zap },
];

const GAMES = {
  practice: [
    { key: 'logical_deduction', name: 'Logical Deduction', desc: 'Constraint-based ranking puzzles', xp: '4-8', icon: '🧩', gradient: 'from-violet-500/20 to-purple-500/20' },
    { key: 'calibration', name: 'Calibration', desc: 'Test your confidence accuracy', xp: '3-5', icon: '🎯', gradient: 'from-cyan-500/20 to-blue-500/20' },
    { key: 'fermi', name: 'Fermi Estimates', desc: 'Guess order-of-magnitude answers', xp: '3-5', icon: '📏', gradient: 'from-amber-500/20 to-orange-500/20' },
  ],
  puzzles: [
    { key: 'number_sequence', name: 'Number Sequences', desc: 'Find the pattern', xp: '6-10', icon: '🔢', gradient: 'from-blue-500/20 to-indigo-500/20' },
    { key: 'estimation', name: 'Estimation', desc: 'Quick mental math', xp: '6-10', icon: '🧮', gradient: 'from-emerald-500/20 to-teal-500/20' },
    { key: 'logic_riddle', name: 'Logic Riddles', desc: 'Classic brain teasers', xp: '6-10', icon: '💡', gradient: 'from-yellow-500/20 to-amber-500/20' },
    { key: 'trivia', name: 'Trivia Quiz', desc: 'Test your knowledge', xp: '6-10', icon: '❓', gradient: 'from-pink-500/20 to-rose-500/20' },
  ],
  speed: [
    { key: 'memory_grid', name: 'Memory Grid', desc: 'Remember the pattern', xp: '5-12', icon: '🔲', gradient: 'from-purple-500/20 to-violet-500/20' },
    { key: 'probability_snap', name: 'Probability Snap', desc: 'Quick probability calls', xp: '5-12', icon: '🎲', gradient: 'from-rose-500/20 to-pink-500/20' },
    { key: 'speed_trivia', name: 'Speed Trivia', desc: 'Fast answers, bonus XP', xp: '5-12', icon: '⚡', gradient: 'from-orange-500/20 to-red-500/20' },
  ],
};

export function GameHub() {
  const [activeTab, setActiveTab] = useState('practice');
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Games</h1>
        <p className="text-sm text-white/30">Sharpen your mind, earn XP.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-white/[0.03] p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Game cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {GAMES[activeTab].map((game) => (
          <Card
            key={game.key}
            hover
            className={`cursor-pointer bg-gradient-to-br ${game.gradient}`}
            onClick={() => navigate(`/games/${game.key}`)}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{game.icon}</span>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white/90">{game.name}</h3>
                <p className="mt-0.5 text-xs text-white/40">{game.desc}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge color="primary" icon={Zap}>{game.xp} XP</Badge>
                  <span className="text-[10px] text-white/20">Tap to play</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
