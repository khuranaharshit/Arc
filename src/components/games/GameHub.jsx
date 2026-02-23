import { useState } from 'react';
import { Gamepad2, Brain, Puzzle, Zap, Clock, Lock } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';

const TABS = [
  { key: 'practice', label: 'Practice', icon: Brain },
  { key: 'puzzles', label: 'Puzzles', icon: Puzzle },
  { key: 'speed', label: 'Speed', icon: Zap },
];

const GAMES = {
  practice: [
    { key: 'logical_deduction', name: 'Logical Deduction', desc: 'Constraint-based ranking puzzles', xp: '4-8', icon: '🧩' },
    { key: 'calibration', name: 'Calibration', desc: 'Test your confidence accuracy', xp: '3-5', icon: '🎯' },
    { key: 'fermi', name: 'Fermi Estimates', desc: 'Guess order-of-magnitude answers', xp: '3-5', icon: '📏' },
  ],
  puzzles: [
    { key: 'number_sequence', name: 'Number Sequences', desc: 'Find the pattern', xp: '6-10', icon: '🔢' },
    { key: 'estimation', name: 'Estimation', desc: 'Quick mental math', xp: '6-10', icon: '🧮' },
    { key: 'logic_riddle', name: 'Logic Riddles', desc: 'Classic brain teasers', xp: '6-10', icon: '💡' },
    { key: 'trivia', name: 'Trivia Quiz', desc: 'Test your knowledge', xp: '6-10', icon: '❓' },
  ],
  speed: [
    { key: 'memory_grid', name: 'Memory Grid', desc: 'Remember the pattern', xp: '5-12', icon: '🔲' },
    { key: 'probability_snap', name: 'Probability Snap', desc: 'Quick probability calls', xp: '5-12', icon: '🎲' },
    { key: 'speed_trivia', name: 'Speed Trivia', desc: 'Fast answers, bonus XP', xp: '5-12', icon: '⚡' },
  ],
};

export function GameHub() {
  const [activeTab, setActiveTab] = useState('practice');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Games</h1>
        <p className="text-sm text-slate-400">Sharpen your mind, earn XP.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-800/50 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
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
          <Card key={game.key} hover className="cursor-pointer">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{game.icon}</span>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-100">{game.name}</h3>
                <p className="mt-0.5 text-xs text-slate-400">{game.desc}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge color="primary" icon={Zap}>
                    {game.xp} XP
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
