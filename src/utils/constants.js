// Storage keys
export const STORAGE_PREFIX = 'arc_data_';
export const META_PREFIX = 'arc_meta_';
export const TOKEN_KEY = 'arc_github_token';
export const USER_KEY = 'arc_github_user';
export const PASSWORD_KEY = 'arc_password';

// Category definitions with colors and icons
export const CATEGORIES = {
  body: { key: 'body', label: 'Body & Sleep', icon: 'HeartPulse', color: '#ef4444' },
  mind: { key: 'mind', label: 'Brain Sharpening', icon: 'Brain', color: '#8b5cf6' },
  learning: { key: 'learning', label: 'Learning', icon: 'BookOpen', color: '#3b82f6' },
  communication: {
    key: 'communication',
    label: 'Communication & Thinking',
    icon: 'MessageSquare',
    color: '#f59e0b',
  },
  technical: { key: 'technical', label: 'Technical & AI', icon: 'Code', color: '#10b981' },
  social: {
    key: 'social',
    label: 'Relationships & Presence',
    icon: 'Users',
    color: '#ec4899',
  },
  discipline: {
    key: 'discipline',
    label: 'Attention & Discipline',
    icon: 'Shield',
    color: '#6366f1',
  },
};

// Navigation items
export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/log', label: 'Log XP', icon: 'Plus' },
  { path: '/games', label: 'Games', icon: 'Gamepad2' },
  { path: '/stats', label: 'Stats', icon: 'BarChart3' },
  { path: '/review', label: 'Review', icon: 'ClipboardCheck' },
  { path: '/reading', label: 'Reading', icon: 'BookOpen' },
  { path: '/achievements', label: 'Achievements', icon: 'Trophy' },
  { path: '/tracking/habits', label: 'Habits', icon: 'CheckSquare', group: 'Tracking' },
  { path: '/tracking/mood', label: 'Mood', icon: 'Smile', group: 'Tracking' },
  { path: '/tracking/goals', label: 'Goals', icon: 'Target', group: 'Tracking' },
  { path: '/tracking/journal', label: 'Journal', icon: 'PenLine', group: 'Tracking' },
  { path: '/tracking/people', label: 'People', icon: 'Users', group: 'Tracking' },
  { path: '/tracking/finance', label: 'Finance', icon: 'Wallet', group: 'Tracking' },
  { path: '/tracking/travel', label: 'Travel', icon: 'Plane', group: 'Tracking' },
  { path: '/export', label: 'Export', icon: 'Download' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
];

// Bottom nav (mobile) — top 5 most-used
export const BOTTOM_NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'LayoutDashboard' },
  { path: '/log', label: 'Log', icon: 'Plus' },
  { path: '/games', label: 'Games', icon: 'Gamepad2' },
  { path: '/stats', label: 'Stats', icon: 'BarChart3' },
  { path: '/settings', label: 'More', icon: 'Menu' },
];

// Level names
export const LEVEL_NAMES = ['Starting', 'Building', 'Consistent', 'Sharp', 'Dangerous'];
