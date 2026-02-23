# Arc — Gamified Personal Growth Tracker

A gamified personal growth tracker that runs entirely in your browser. PWA-enabled (installable on iOS/Android). Data encrypted and stored locally or synced to your own GitHub repo. Zero servers, zero accounts, zero cost.

## What It Does

- **Log activities** across 7 categories (Body, Mind, Learning, Communication, Technical, Social, Discipline) and earn XP
- **Streaks** with a two-day grace rule, milestone bonuses, and rest days
- **Levels** (Starting → Building → Consistent → Sharp → Dangerous) based on sustained weekly XP
- **17 achievements** unlocked automatically as you hit milestones
- **10 brain games** (number sequences, estimation, logic, probability, trivia, memory, Fermi estimates, calibration)
- **Daily quests** — 3 random activities each day, 1.5x bonus for completing all 3
- **Weekly challenges** and monthly **boss battles** with XP rewards
- **Weekly reviews** with 5-area scoring, past review history
- **12-book reading list** with progress tracking
- **7 tracking modules**: Habits, Mood, Goals, Journal, People, Finance, Travel
- **Skill tree** — RPG-style category progression (Novice → Legend)
- **8 unlockable themes** gated by achievements
- **Data export** (Markdown for LLM analysis, JSON for backup) + import insights back
- **Dashboard** with 12 live widgets including Wikipedia knowledge cards and daily nudges
- **Dark/light mode** with glassmorphism UI
- **Seasons** — quarterly level reset with legacy badges

## Quick Start (Local Development)

```bash
# Clone
git clone https://github.com/harshit/arc.git
cd arc

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:5173**. Click **Get Started**. Default password is `ArcAdmin123` — change it anytime in Settings.

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Vite dev server on :5173 |
| `npm run dev:storage` | Start local file storage server on :3001 (data saved to `./data/`) |
| `npm run dev:full` | Run both dev server and file storage together |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run tests with Vitest |

## Deploy to GitHub Pages (Self-Host)

This is a template repo. To use Arc with your own data:

### 1. Fork the repo

Click **Fork** on GitHub (or use the template button if available). Name it whatever you like (e.g. `my-arc`).

### 2. Enable GitHub Pages

In your fork: **Settings → Pages → Source → GitHub Actions**

### 3. Wait for deploy

The included GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically build and deploy on every push to `main`. Takes ~2 minutes.

### 4. Open your app

Visit `https://<your-username>.github.io/<repo-name>/`

### 5. Set up

- Click **Get Started** on first visit
- Default password: `ArcAdmin123`
- Change it in **Settings → Change Password**
- Start logging activities and earning XP

### Optional: GitHub Sync (encrypted cloud backup)

To sync your encrypted data to your GitHub repo (so you can recover on any device):

1. Create a **fine-grained Personal Access Token** at https://github.com/settings/personal-access-tokens/new
   - Repository access: **Only select repositories** → select your arc repo
   - Permissions: **Contents → Read and write** (only permission needed)
   - Expiration: **No expiration** (recommended)
2. Configure the token in Settings (GitHub sync feature coming in next release)

All data is encrypted with AES-256-GCM before being stored in the repo. Your password never leaves your browser.

## Customization

Edit the JSON files in `public/config/` to customize:

| File | What you can change |
|------|-------------------|
| `xp-menu.json` | Activities, XP values, categories |
| `achievements.json` | Achievement definitions and unlock conditions |
| `levels.json` | Level names and XP thresholds |
| `reading-list.json` | Your book list |
| `nudges.json` | Daily reflection questions |
| `streaks.json` | Streak bonuses and minimum daily XP |
| `links.json` | External tool links |
| `mental-models.json` | Mental models (fetched from Wikipedia) |
| `fermi-estimates.json` | Fermi estimation questions |
| `calibration.json` | True/false calibration questions |
| `classic-riddles.json` | Logic riddles |
| `wiki-categories.json` | Wikipedia topic categories for "Did You Know" |

Push changes → auto-deploys via GitHub Actions.

## Architecture

```
┌─────────────────────────────────────────────┐
│  UI Layer (51 React components)             │
│  Dashboard, Games, Activities, Tracking...  │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  DAO Layer (18 DAOs)                        │
│  Activity, Streak, Level, Achievement...    │
│  XP calculation, streak rules, level-up     │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Storage Layer                              │
│  ├── LocalCacheStorage (localStorage)       │
│  ├── GitHubStorage (encrypted, remote)      │
│  ├── DevStorage (local files, dev only)     │
│  └── SyncEngine (orchestrates sync)         │
└─────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite |
| UI | React 19 + Tailwind CSS 3 |
| Routing | React Router 7 |
| Icons | Lucide React |
| Charts | Recharts |
| Encryption | Web Crypto API (AES-256-GCM, PBKDF2) |
| PWA | vite-plugin-pwa |
| Testing | Vitest |

**No backend. No database. No paid services.**

## File Structure

```
arc/
├── .github/workflows/deploy.yml    # Auto-deploy to GitHub Pages
├── public/config/                  # 12 JSON config files
├── src/
│   ├── components/                 # 51 React components
│   ├── context/                    # Auth, Data, Theme, Toast providers
│   ├── dao/                        # 18 data access objects
│   ├── games/                      # Game engine + 6 generators + 2 API clients
│   ├── hooks/                      # 6 custom hooks
│   ├── services/                   # Encryption, Auth, GitHub API, Wikipedia API
│   ├── storage/                    # IStorage, LocalCache, GitHub, Dev, Sync
│   └── utils/                      # Constants, dates, XP helpers
├── dev-server.js                   # Local filesystem storage (dev only)
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## License

MIT
