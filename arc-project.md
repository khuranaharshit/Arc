# Arc — Complete Engineering Specification

## 1. What Is Arc

A gamified personal growth tracker. Web app hosted on GitHub Pages. PWA-enabled (installable on iOS/Android). Data encrypted and stored in the user's own GitHub repo as JSON files. Open-source template — anyone can fork and self-host.

**Name:** Arc
**Template repo:** `arc` (public, open source — the app code)
**Instance repo:** `my-arc` (user's fork — app code + their encrypted data in `/data/`)

---

## 2. Tech Stack (Exact)

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| Build | Vite | ^6.x | Fast, modern, built-in React support |
| UI Framework | React | ^19.x | Component-based, large ecosystem |
| Routing | React Router | ^7.x | Client-side routing for SPA |
| Styling | Tailwind CSS | ^4.x | Utility-first, fast iteration, theming |
| Icons | Lucide React | ^0.400+ | Clean, consistent icon set |
| Encryption | Web Crypto API (window.crypto.subtle) | Native | Built into every modern browser. AES-256-GCM, PBKDF2, SHA-256. Zero npm packages. |
| HTTP | fetch API | Native | No axios needed |
| State | React Context + useReducer | Native | Simple, no Redux overhead |
| Charts | Recharts | ^2.x | Lightweight charting for trends |
| PWA | Vite PWA Plugin (vite-plugin-pwa) | ^0.20+ | Service worker + manifest generation |
| Linting | ESLint + Prettier | Latest | Code quality |
| Testing | Vitest | ^2.x | Vite-native testing |

**No backend. No database. No paid services. No OAuth. No Cloudflare. No third-party auth.**

---

## 2.5. Architecture Overview

### Architecture Decisions

| Decision | Choice | Details |
|----------|--------|---------|
| Hosting | GitHub Pages (free, public repo) | Static site served from user's repo. |
| Frontend | React + Vite + Tailwind CSS | SPA with client-side routing. |
| Auth | PAT (Personal Access Token) + encrypted repo backup | User generates fine-grained PAT once. PAT encrypted with password and backed up in public repo. On new device, password recovers PAT. Zero infrastructure. |
| Encryption | Password-based AES-256-GCM via Web Crypto API | Password → PBKDF2 key derivation → AES-256-GCM encryption. Password hash stored unencrypted in repo for verification. All other data encrypted. |
| Data persistence | Encrypted JSON files in user's GitHub repo via GitHub REST API | Each data entity = one encrypted JSON file in `/data/` directory. |
| Local cache | localStorage (decrypted data for fast UX) | Read/write is instant. Synced to GitHub periodically. |
| Sync | Write-through: every save immediately pushes to GitHub. Full pull on app load. Manual save button as fallback. No background polling. | Rate limit: 5,000 req/hr (authenticated). Typical usage ~150 calls/day. Not a concern. |
| Notifications | PWA service worker | Browser-native. Works on iOS 16.4+ and Android. No external push services. |
| External deps | None beyond npm packages for build | No servers, no APIs with keys, no paid services. Free APIs (Wikipedia, Open Trivia DB) used for content, no auth needed. |

### Two-Repo Model

```
TEMPLATE REPO (public, open source)        USER INSTANCE REPO (public, user's fork)
github.com/creator/arc                     github.com/user/my-arc
├── src/          (app code)               ├── src/          (same app code)
├── public/config (default config)         ├── public/config  (user can customize)
├── .github/      (deploy action)          ├── .github/       (auto-deploys)
└── (no /data/)                            └── /data/         (user's encrypted data)
                                               ├── profile.json
                                               ├── auth.enc.json   (encrypted PAT)
                                               ├── daily-log.json  (encrypted)
                                               ├── streaks.json    (encrypted)
                                               └── ... etc
```

- **Template repo:** App source code + default config. Anyone can fork.
- **Instance repo:** User's fork. Same code + their encrypted data in `/data/`. Hosted on their GitHub Pages.
- Users customize by editing config JSON files. Adding features = updating from template upstream.

### Layered Architecture

```
┌─────────────────────────────────────────────────────┐
│  UI Layer (React components)                        │
│  Dashboard, Games, Activities, Stats, Settings...   │
│  ONLY talks to DAO layer. Never touches storage.    │
└───────────────────┬─────────────────────────────────┘
                    │ uses
┌───────────────────▼─────────────────────────────────┐
│  DAO Layer (business logic)                         │
│  ActivityDAO, StreakDAO, LevelDAO, AchievementDAO...│
│  XP calculation, streak rules, level-up detection.  │
│  Reads/writes via Storage layer.                    │
└───────────────────┬─────────────────────────────────┘
                    │ uses
┌───────────────────▼─────────────────────────────────┐
│  Storage Layer                                      │
│  IStorage (interface): read / write / list / delete │
│  ├── LocalCacheStorage (localStorage, decrypted)    │
│  ├── GitHubStorage (GitHub API, encrypted)          │
│  └── SyncEngine (orchestrates local ↔ remote sync)  │
└─────────────────────────────────────────────────────┘
```

### Auth Flow (Summary)

**First time (2 min setup):**
1. User opens app → clicks "Get Started"
2. Generates fine-grained PAT on GitHub (app provides direct link + clear instructions)
3. Pastes PAT in app → app validates it against GitHub API
4. Sets encryption password → PAT encrypted and backed up in repo → data files initialized
5. Dashboard loads. Done.

**Returning (same device):** PAT + password cached in localStorage → auto-loads.

**Returning (new device / cache cleared):**
1. Enter GitHub username/repo + encryption password
2. App fetches encrypted PAT from public repo (no auth needed — it's public)
3. Decrypts PAT with password → validates → syncs all data → Dashboard loads

**PAT revoked (rare edge case):** App detects 401 → user enters password (to keep data decrypted) → guided to create new PAT → new PAT encrypted with existing password and saved. User should set PAT to **no expiration** during setup to avoid this entirely.

### Data Flow

```
┌──────────┐  instant read/write  ┌──────────────┐  encrypt + push   ┌────────────┐
│  UI      │ ◄──────────────────► │ localStorage  │ ────────────────► │ GitHub     │
│ (React)  │                      │ (decrypted)   │ ◄────────────────  │ Repo /data │
└──────────┘                      └──────────────┘  pull + decrypt    │ (encrypted)│
                                                                      └────────────┘

Sync: write-through (every save pushes immediately). Full pull on app load. No background polling.
New device: pull all from repo → decrypt → populate localStorage.
```

---

## 3. File Structure (Exact)

```
arc/
├── .github/
│   └── workflows/
│       └── deploy.yml                    # Build + deploy to GitHub Pages
├── public/
│   ├── config/
│   │   ├── xp-menu.json                 # Activities, XP values, categories
│   │   ├── achievements.json            # Achievement definitions + unlock conditions
│   │   ├── levels.json                  # Level thresholds
│   │   ├── reading-list.json            # Books with metadata
│   │   ├── nudges.json                  # Daily nudge questions
│   │   ├── links.json                   # External links (Apple Health, Brilliant, etc.)
│   │   ├── wiki-categories.json         # Wikipedia topic categories for "Did You Know?"
│   │   ├── mental-models.json           # Mental model name → Wikipedia article index
│   │   ├── fermi-estimates.json         # Fermi questions + answers + justifications
│   │   ├── calibration.json             # Calibration questions + true/false
│   │   ├── classic-riddles.json         # ~30-50 classic logic riddles
│   │   └── streaks.json                 # Streak bonus thresholds
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── apple-touch-icon.png
│   └── favicon.ico
├── src/
│   ├── services/
│   │   ├── encryption.js                # AES-256-GCM, PBKDF2, password hash
│   │   ├── auth.js                      # PAT-based auth + encrypted repo backup
│   │   ├── github-api.js                # GitHub REST API wrapper
│   │   └── wikipedia-api.js             # Wikipedia API wrapper
│   ├── storage/
│   │   ├── IStorage.js                  # Storage interface definition
│   │   ├── GitHubStorage.js             # Reads/writes encrypted JSON to GitHub repo
│   │   ├── LocalCacheStorage.js         # Reads/writes decrypted JSON to localStorage
│   │   └── SyncEngine.js               # Orchestrates sync between GitHub ↔ localStorage
│   ├── dao/
│   │   ├── BaseDAO.js                   # Base class with storage access
│   │   ├── ConfigLoader.js              # Loads /public/config/*.json files
│   │   ├── ActivityDAO.js               # Log activities, calculate XP
│   │   ├── StreakDAO.js                 # Streak tracking, two-day rule
│   │   ├── LevelDAO.js                 # Level progression
│   │   ├── AchievementDAO.js           # Achievement unlock detection
│   │   ├── ReviewDAO.js                # Weekly review CRUD
│   │   ├── ReadingListDAO.js           # Reading progress tracking
│   │   ├── HabitDAO.js                 # Binary habit tracking
│   │   ├── MoodDAO.js                  # Mood/energy log
│   │   ├── GoalDAO.js                  # Goals + milestones
│   │   ├── JournalDAO.js              # Journal entries
│   │   ├── PeopleDAO.js               # Relationship tracking
│   │   ├── FinanceDAO.js              # Finance pulse
│   │   ├── TravelDAO.js              # Travel log
│   │   └── ExportDAO.js               # Data export for LLM analysis
│   ├── games/
│   │   ├── GameEngine.js               # Common game logic (timer, scoring, XP award)
│   │   ├── generators/
│   │   │   ├── NumberSequence.js        # Generates number sequence puzzles
│   │   │   ├── EstimationGame.js        # Generates estimation problems
│   │   │   ├── MemoryGrid.js            # Generates memory grid challenges
│   │   │   ├── LogicalDeduction.js      # Generates constraint-based logic puzzles
│   │   │   ├── ProbabilitySnap.js       # Generates probability questions
│   │   │   └── FermiEngine.js           # Loads + serves Fermi estimates from config
│   │   └── api/
│   │       ├── TriviaAPI.js             # Open Trivia DB client
│   │       └── WikipediaAPI.js          # Wikipedia random article fetcher
│   ├── context/
│   │   ├── AuthContext.jsx              # Auth state (token, user, isAuthenticated)
│   │   ├── DataContext.jsx              # App data state (all DAOs, sync status)
│   │   └── ThemeContext.jsx             # Theme state (unlockable themes)
│   ├── hooks/
│   │   ├── useAuth.js                   # Auth hook (login, logout, token)
│   │   ├── useSync.js                   # Sync hook (sync status, manual sync trigger)
│   │   ├── useEncryption.js             # Encryption hook (encrypt, decrypt, password flows)
│   │   ├── useConfig.js                 # Config loader hook
│   │   ├── useNotifications.js          # PWA notification hook
│   │   └── useGame.js                   # Game session hook (start, submit, score)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx             # Main layout wrapper (sidebar + content)
│   │   │   ├── Sidebar.jsx              # Navigation sidebar
│   │   │   ├── Header.jsx               # Top bar (sync status, user avatar, settings)
│   │   │   ├── BottomNav.jsx            # Mobile bottom navigation
│   │   │   └── LoadingScreen.jsx        # Full-screen loading state
│   │   ├── auth/
│   │   │   ├── LoginScreen.jsx          # PAT setup wizard + returning user recovery
│   │   │   ├── PasswordSetup.jsx        # First-time password creation
│   │   │   ├── PasswordEntry.jsx        # Password entry on returning visits
│   │   │   └── PasswordChange.jsx       # Change password flow
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx            # Main dashboard page
│   │   │   ├── TodayXP.jsx             # Today's XP summary card
│   │   │   ├── StreakCard.jsx           # Current streak display
│   │   │   ├── LevelCard.jsx           # Current level + progress bar
│   │   │   ├── BrainBite.jsx           # Daily puzzle widget
│   │   │   ├── DidYouKnow.jsx          # Daily knowledge card
│   │   │   ├── CalibrationCard.jsx     # Daily calibration question
│   │   │   ├── MentalModelCard.jsx     # Mental model of the day
│   │   │   ├── RecentActivity.jsx      # Last 5 logged activities
│   │   │   └── QuickLog.jsx            # Quick activity log buttons
│   │   ├── activities/
│   │   │   ├── ActivityMenu.jsx         # Full XP menu with categories
│   │   │   ├── ActivityCard.jsx         # Single activity card
│   │   │   ├── LogActivityModal.jsx     # Modal for logging an activity
│   │   │   └── ActivityHistory.jsx      # Past activity log with filters
│   │   ├── games/
│   │   │   ├── GameHub.jsx              # Games section with Practice/Puzzles/Speed tabs
│   │   │   ├── GameCard.jsx             # Game selection card
│   │   │   ├── GameSession.jsx          # Active game session wrapper (timer, score)
│   │   │   ├── GameResult.jsx           # Post-game result + XP earned
│   │   │   ├── practice/
│   │   │   │   ├── LogicalDeductionGame.jsx
│   │   │   │   ├── CalibrationGame.jsx
│   │   │   │   └── FermiGame.jsx
│   │   │   ├── puzzles/
│   │   │   │   ├── NumberSequenceGame.jsx
│   │   │   │   ├── EstimationGameUI.jsx
│   │   │   │   ├── LogicRiddleGame.jsx
│   │   │   │   └── TriviaQuizGame.jsx
│   │   │   └── speed/
│   │   │       ├── MemoryGridGame.jsx
│   │   │       ├── ProbabilitySnapGame.jsx
│   │   │       └── SpeedTriviaGame.jsx
│   │   ├── achievements/
│   │   │   ├── AchievementList.jsx      # All achievements grid
│   │   │   ├── AchievementCard.jsx      # Single achievement (locked/unlocked)
│   │   │   └── AchievementToast.jsx     # Pop-up when achievement unlocked
│   │   ├── stats/
│   │   │   ├── StatsPage.jsx            # Overall stats page
│   │   │   ├── XPChart.jsx              # XP over time chart
│   │   │   ├── StreakChart.jsx          # Streak history chart
│   │   │   ├── CategoryBalance.jsx     # XP by category radar chart
│   │   │   └── CalibrationChart.jsx    # Calibration accuracy over time
│   │   ├── reviews/
│   │   │   ├── WeeklyReview.jsx         # Weekly review form
│   │   │   └── ReviewHistory.jsx        # Past reviews
│   │   ├── reading/
│   │   │   ├── ReadingList.jsx          # Reading list with progress
│   │   │   └── BookCard.jsx             # Single book card
│   │   ├── tracking/                     # R4 tracking modules
│   │   │   ├── HabitTracker.jsx
│   │   │   ├── MoodLogger.jsx
│   │   │   ├── GoalsBoard.jsx
│   │   │   ├── JournalPage.jsx
│   │   │   ├── PeoplePage.jsx
│   │   │   ├── FinancePulse.jsx
│   │   │   └── TravelLog.jsx
│   │   ├── export/
│   │   │   ├── ExportPage.jsx           # Export data for LLM
│   │   │   ├── ImportInsights.jsx       # Import LLM insights
│   │   │   └── InsightsDashboard.jsx   # View past insights
│   │   ├── settings/
│   │   │   ├── SettingsPage.jsx         # All settings
│   │   │   ├── NotificationSettings.jsx
│   │   │   └── ThemeSettings.jsx
│   │   └── common/
│   │       ├── Card.jsx                 # Reusable card component
│   │       ├── Modal.jsx                # Reusable modal
│   │       ├── Button.jsx               # Styled button variants
│   │       ├── ProgressBar.jsx          # Animated progress bar
│   │       ├── Badge.jsx                # Achievement/level badge
│   │       ├── Timer.jsx                # Countdown timer for games
│   │       ├── Toast.jsx                # Toast notification
│   │       └── ExternalLink.jsx         # Link button to external URL
│   ├── utils/
│   │   ├── constants.js                 # App-wide constants
│   │   ├── dates.js                     # Date utility functions
│   │   └── xp.js                        # XP calculation helpers
│   ├── App.jsx                          # Root component, routing, context providers
│   ├── main.jsx                         # Entry point, React DOM render
│   └── index.css                        # Tailwind imports + global styles
├── index.html                           # HTML entry point
├── vite.config.js                       # Vite configuration
├── tailwind.config.js                   # Tailwind configuration
├── postcss.config.js                    # PostCSS configuration
├── package.json                         # Dependencies + scripts
├── .eslintrc.cjs                        # ESLint config
├── .prettierrc                          # Prettier config
└── .gitignore
```

---

## 4. Data Models (Exact JSON Schemas)

All user data lives in `/data/` as encrypted JSON files. Below are the **decrypted** schemas.

### 4.1 `/data/profile.json`

```json
{
  "version": 1,
  "created_at": "2026-02-23T10:00:00Z",
  "password_hash": "<bcrypt hash of encryption password>",
  "password_salt": "<base64-encoded PBKDF2 salt>",
  "settings": {
    "theme": "default",
    "notifications_enabled": true,
    "notification_morning": "08:00",
    "notification_evening": "21:00",
    "timezone": "Asia/Kolkata",
    "week_start": "monday"
  },
  "github_owner": "harshit",
  "github_repo": "my-arc"
}
```

**Note:** `password_hash`, `password_salt`, `github_owner`, and `github_repo` are stored UNENCRYPTED in this file (needed to verify password and locate repo before decryption). All other fields (`settings`) are encrypted.

### 4.1.1 `/data/auth.enc.json`

This file stores the PAT encrypted with the user's password. It is the ONLY way to recover the PAT on a new device.

```json
{
  "version": 1,
  "encrypted_pat": "<base64-encoded AES-256-GCM ciphertext of the PAT>",
  "updated_at": "2026-02-23T10:00:00Z"
}
```

**Note:** This entire file is just the encrypted PAT. The file itself is NOT doubly encrypted — the `encrypted_pat` value is the AES-256-GCM ciphertext of the plaintext PAT string, encrypted using the key derived from the user's password + salt from `profile.json`. Anyone can read this file (public repo) but cannot decrypt it without the password.

**Recovery flow:** Fetch this file via `https://raw.githubusercontent.com/{owner}/{repo}/main/data/auth.enc.json` (no auth needed) → decrypt with password → get PAT.

### 4.2 `/data/daily-log.json`

```json
{
  "version": 1,
  "days": {
    "2026-02-23": {
      "activities": [
        {
          "id": "uuid-v4",
          "activity_key": "exercise_30min",
          "category": "body",
          "xp_base": 8,
          "xp_earned": 9.6,
          "multipliers": ["sleep_bonus"],
          "critical_hit": false,
          "timestamp": "2026-02-23T06:30:00Z",
          "notes": ""
        }
      ],
      "xp_total": 55,
      "xp_breakdown": {
        "body": 15,
        "mind": 20,
        "communication": 8,
        "technical": 4,
        "social": 5,
        "discipline": 3
      },
      "sleep_hours": 8,
      "sleep_multiplier_active": true,
      "combo_bonus": 10,
      "combo_categories": ["body", "mind", "social"],
      "quest_ids": ["q1", "q2", "q3"],
      "quests_completed": 2,
      "is_rest_day": false,
      "games_played": [
        {
          "game_type": "number_sequence",
          "section": "puzzles",
          "score": 4,
          "max_score": 5,
          "xp_earned": 6,
          "time_seconds": 120,
          "timestamp": "2026-02-23T07:00:00Z"
        }
      ]
    }
  }
}
```

### 4.3 `/data/streaks.json`

```json
{
  "version": 1,
  "current_streak": 14,
  "longest_streak": 30,
  "streak_start_date": "2026-02-09",
  "last_active_date": "2026-02-23",
  "streak_history": [
    {
      "start": "2026-01-01",
      "end": "2026-01-15",
      "length": 15
    }
  ],
  "bonuses_earned": [
    { "streak": 3, "xp": 5, "date": "2026-02-11" },
    { "streak": 7, "xp": 15, "date": "2026-02-15" },
    { "streak": 14, "xp": 30, "date": "2026-02-22" }
  ],
  "rest_days": ["2026-02-10"]
}
```

### 4.4 `/data/achievements.json`

```json
{
  "version": 1,
  "unlocked": [
    {
      "key": "first_blood",
      "unlocked_at": "2026-02-01T10:00:00Z",
      "xp_awarded": 10
    }
  ],
  "progress": {
    "bookworm_i": { "current": 0, "target": 1 },
    "logic_i": { "current": 7, "target": 10 },
    "writer_i": { "current": 2, "target": 4 }
  }
}
```

### 4.5 `/data/level.json`

```json
{
  "version": 1,
  "current_level": 2,
  "current_level_name": "Building",
  "weekly_xp_history": [
    { "week": "2026-W07", "xp": 85 },
    { "week": "2026-W08", "xp": 92 }
  ],
  "consecutive_weeks_at_target": 2,
  "level_up_history": [
    { "level": 2, "achieved_at": "2026-02-16T00:00:00Z" }
  ],
  "season": {
    "number": 1,
    "start_date": "2026-01-01",
    "legacy_badges": []
  }
}
```

### 4.6 `/data/reviews.json`

```json
{
  "version": 1,
  "reviews": [
    {
      "id": "uuid-v4",
      "week": "2026-W08",
      "date": "2026-02-23",
      "scores": {
        "health": 4,
        "focus": 3,
        "logic": 5,
        "learning": 4,
        "relationships": 3
      },
      "total_score": 19,
      "weekly_xp": 92,
      "win": "Solved 5 LeetCode problems",
      "fix": "Need to reduce screen time",
      "current_book": "Thinking, Fast and Slow",
      "book_progress": "Chapter 12"
    }
  ]
}
```

### 4.7 `/data/reading.json`

```json
{
  "version": 1,
  "books": [
    {
      "config_key": "deep_work",
      "status": "reading",
      "started_at": "2026-02-01",
      "finished_at": null,
      "progress_note": "Chapter 8",
      "rating": null
    }
  ]
}
```

### 4.8 `/data/habits.json` (R4)

```json
{
  "version": 1,
  "habit_definitions": [
    {
      "key": "drink_water",
      "label": "Drink 2L water",
      "icon": "droplet",
      "created_at": "2026-02-23"
    }
  ],
  "log": {
    "2026-02-23": {
      "drink_water": true,
      "meditate": false,
      "vitamins": true
    }
  }
}
```

### 4.9 `/data/mood.json` (R4)

```json
{
  "version": 1,
  "entries": [
    {
      "date": "2026-02-23",
      "mood": 4,
      "energy": 3,
      "note": "Felt productive but tired in the evening",
      "timestamp": "2026-02-23T21:00:00Z"
    }
  ]
}
```

### 4.10 `/data/goals.json` (R4)

```json
{
  "version": 1,
  "goals": [
    {
      "id": "uuid-v4",
      "title": "Ship side project",
      "quarter": "2026-Q1",
      "status": "in_progress",
      "milestones": [
        { "title": "Spec done", "completed": true, "xp_awarded": 15 },
        { "title": "MVP built", "completed": false, "xp_awarded": 0 },
        { "title": "Deployed", "completed": false, "xp_awarded": 0 }
      ],
      "created_at": "2026-01-15",
      "completed_at": null
    }
  ]
}
```

### 4.11 `/data/journal.json` (R4)

```json
{
  "version": 1,
  "entries": [
    {
      "id": "uuid-v4",
      "date": "2026-02-23",
      "text": "Feeling overwhelmed but also excited about building Arc...",
      "tags": ["reflection", "projects"],
      "timestamp": "2026-02-23T22:00:00Z"
    }
  ]
}
```

### 4.12 `/data/people.json` (R4)

```json
{
  "version": 1,
  "people": [
    {
      "id": "uuid-v4",
      "name": "Alice",
      "relationship": "close friend",
      "last_contacted": "2026-02-20",
      "birthday": "1995-06-15",
      "notes": "Loves hiking. Working at Google.",
      "tags": ["college", "tech"],
      "fun_facts": ["Can solve Rubik's cube in under a minute"]
    }
  ]
}
```

### 4.13 `/data/finance.json` (R4)

```json
{
  "version": 1,
  "snapshots": [
    {
      "month": "2026-02",
      "savings_goal": 50000,
      "savings_current": 32000,
      "financial_action": "Set up automated SIP",
      "future_goals": ["Emergency fund by June", "Investment portfolio review"],
      "notes": ""
    }
  ]
}
```

### 4.14 `/data/travel.json` (R4)

```json
{
  "version": 1,
  "trips": [
    {
      "id": "uuid-v4",
      "destination": "Manali",
      "start_date": "2026-03-15",
      "end_date": "2026-03-18",
      "status": "upcoming",
      "places": ["Solang Valley", "Old Manali"],
      "photo_album_url": "",
      "notes": "Pack warm clothes"
    }
  ]
}
```

### 4.15 `/data/insights.json` (R4)

```json
{
  "version": 1,
  "imports": [
    {
      "id": "uuid-v4",
      "imported_at": "2026-02-23T12:00:00Z",
      "source": "ChatGPT analysis",
      "items": [
        {
          "id": "uuid-v4",
          "text": "Your XP drops every Wednesday — consider scheduling a harder activity that day",
          "category": "pattern",
          "acted_on": false,
          "acted_on_date": null
        }
      ]
    }
  ]
}
```

### 4.16 `/data/calibration-history.json` (R4)

```json
{
  "version": 1,
  "responses": [
    {
      "question_key": "cal_001",
      "confidence": 80,
      "correct": true,
      "timestamp": "2026-02-23T07:00:00Z"
    }
  ],
  "accuracy_by_confidence": {
    "50": { "total": 10, "correct": 5 },
    "60": { "total": 8, "correct": 5 },
    "70": { "total": 12, "correct": 9 },
    "80": { "total": 15, "correct": 11 },
    "90": { "total": 6, "correct": 6 },
    "100": { "total": 3, "correct": 2 }
  }
}
```

---

## 5. Config Schemas (Exact)

These ship with the template. Users can customize by editing the JSON.

### 5.1 `/public/config/xp-menu.json`

```json
{
  "version": 1,
  "sleep_multiplier": 1.2,
  "sleep_threshold_hours": 8,
  "combo_threshold_categories": 3,
  "combo_bonus_xp": 10,
  "critical_hit_chance": 0.10,
  "critical_hit_multiplier": 2.0,
  "categories": [
    {
      "key": "body",
      "label": "Body & Sleep",
      "icon": "heart-pulse",
      "color": "#ef4444"
    },
    {
      "key": "mind",
      "label": "Brain Sharpening",
      "icon": "brain",
      "color": "#8b5cf6"
    },
    {
      "key": "learning",
      "label": "Learning",
      "icon": "book-open",
      "color": "#3b82f6"
    },
    {
      "key": "communication",
      "label": "Communication & Thinking",
      "icon": "message-square",
      "color": "#f59e0b"
    },
    {
      "key": "technical",
      "label": "Technical & AI",
      "icon": "code",
      "color": "#10b981"
    },
    {
      "key": "social",
      "label": "Relationships & Presence",
      "icon": "users",
      "color": "#ec4899"
    },
    {
      "key": "discipline",
      "label": "Attention & Discipline",
      "icon": "shield",
      "color": "#6366f1"
    }
  ],
  "activities": [
    {
      "key": "exercise_30min",
      "label": "Exercise (30+ min, real effort)",
      "category": "body",
      "xp": 8,
      "time_minutes": 30,
      "once_per_day": true
    },
    {
      "key": "walk_20min",
      "label": "Walk (20+ min, outdoors)",
      "category": "body",
      "xp": 4,
      "time_minutes": 20,
      "once_per_day": true
    },
    {
      "key": "sleep_8hrs",
      "label": "8 hrs sleep (tracked honestly)",
      "category": "body",
      "xp": 5,
      "time_minutes": null,
      "once_per_day": true,
      "triggers_sleep_multiplier": true
    },
    {
      "key": "no_phone_morning",
      "label": "No phone first 30 min of day",
      "category": "body",
      "xp": 3,
      "time_minutes": null,
      "once_per_day": true
    },
    {
      "key": "no_screens_bed",
      "label": "No screens 30 min before bed",
      "category": "body",
      "xp": 3,
      "time_minutes": null,
      "once_per_day": true
    },
    {
      "key": "brilliant_lesson",
      "label": "Brilliant.org lesson",
      "category": "mind",
      "xp": 6,
      "time_minutes": 15,
      "once_per_day": false
    },
    {
      "key": "leetcode_problem",
      "label": "1 LeetCode / Project Euler problem",
      "category": "mind",
      "xp": 8,
      "time_minutes": 30,
      "once_per_day": false
    },
    {
      "key": "chess_puzzles",
      "label": "Chess puzzle set (15+ min)",
      "category": "mind",
      "xp": 5,
      "time_minutes": 15,
      "once_per_day": false
    },
    {
      "key": "chess_game",
      "label": "Chess game + analyze afterward",
      "category": "mind",
      "xp": 8,
      "time_minutes": 30,
      "once_per_day": false
    },
    {
      "key": "fermi_estimate",
      "label": "Fermi estimate (guess → check)",
      "category": "mind",
      "xp": 3,
      "time_minutes": 5,
      "once_per_day": false
    },
    {
      "key": "new_concept",
      "label": "Learn 1 new concept (math, logic, CS)",
      "category": "mind",
      "xp": 6,
      "time_minutes": 20,
      "once_per_day": false
    },
    {
      "key": "audiobook_30min",
      "label": "Audiobook (30+ min)",
      "category": "learning",
      "xp": 5,
      "time_minutes": 30,
      "once_per_day": false
    },
    {
      "key": "read_book_20min",
      "label": "Read physical book (20+ min)",
      "category": "learning",
      "xp": 6,
      "time_minutes": 20,
      "once_per_day": false
    },
    {
      "key": "pg_essay",
      "label": "Read 1 Paul Graham essay",
      "category": "learning",
      "xp": 4,
      "time_minutes": 15,
      "once_per_day": false
    },
    {
      "key": "podcast",
      "label": "Podcast (Huberman, Lex, Farnam St)",
      "category": "learning",
      "xp": 3,
      "time_minutes": 30,
      "once_per_day": false
    },
    {
      "key": "finish_book",
      "label": "Finish a book",
      "category": "learning",
      "xp": 20,
      "time_minutes": null,
      "once_per_day": false
    },
    {
      "key": "write_publish",
      "label": "Write & publish something (any length)",
      "category": "communication",
      "xp": 12,
      "time_minutes": 45,
      "once_per_day": false
    },
    {
      "key": "journal_3sent",
      "label": "Journal (3+ sentences)",
      "category": "communication",
      "xp": 4,
      "time_minutes": 5,
      "once_per_day": true
    },
    {
      "key": "decision_journal",
      "label": "Decision journal entry",
      "category": "communication",
      "xp": 5,
      "time_minutes": 5,
      "once_per_day": false
    },
    {
      "key": "study_essay",
      "label": "Study a great essay/speech & note why it works",
      "category": "communication",
      "xp": 6,
      "time_minutes": 20,
      "once_per_day": false
    },
    {
      "key": "active_listening",
      "label": "Summarized someone's point before responding",
      "category": "communication",
      "xp": 3,
      "time_minutes": null,
      "once_per_day": false
    },
    {
      "key": "ai_real_problem",
      "label": "Used AI on a real problem (not trivial)",
      "category": "technical",
      "xp": 4,
      "time_minutes": 15,
      "once_per_day": false
    },
    {
      "key": "ai_error_caught",
      "label": "Caught an AI error before acting on it",
      "category": "technical",
      "xp": 6,
      "time_minutes": null,
      "once_per_day": false
    },
    {
      "key": "side_project",
      "label": "Side project work (30+ min)",
      "category": "technical",
      "xp": 8,
      "time_minutes": 30,
      "once_per_day": false
    },
    {
      "key": "shipped_something",
      "label": "Shipped something (project, feature, tool)",
      "category": "technical",
      "xp": 25,
      "time_minutes": null,
      "once_per_day": false
    },
    {
      "key": "family_time",
      "label": "Fully present family time (phone away, 1+ hr)",
      "category": "social",
      "xp": 6,
      "time_minutes": null,
      "once_per_day": true
    },
    {
      "key": "meaningful_conversation",
      "label": "Meaningful conversation with a close friend",
      "category": "social",
      "xp": 5,
      "time_minutes": null,
      "once_per_day": false
    },
    {
      "key": "helped_someone",
      "label": "Helped someone with nothing expected back",
      "category": "social",
      "xp": 5,
      "time_minutes": null,
      "once_per_day": false
    },
    {
      "key": "hard_conversation",
      "label": "Had a hard conversation you were avoiding",
      "category": "social",
      "xp": 10,
      "time_minutes": null,
      "once_per_day": false
    },
    {
      "key": "phone_drawer",
      "label": "Phone in drawer during 1 work block (1+ hr)",
      "category": "discipline",
      "xp": 4,
      "time_minutes": null,
      "once_per_day": false
    },
    {
      "key": "screen_time_low",
      "label": "Total screen time under 3 hrs (non-work)",
      "category": "discipline",
      "xp": 5,
      "time_minutes": null,
      "once_per_day": true
    },
    {
      "key": "no_social_media",
      "label": "No social media today",
      "category": "discipline",
      "xp": 5,
      "time_minutes": null,
      "once_per_day": true
    },
    {
      "key": "said_no",
      "label": "Said no to something that didn't matter",
      "category": "discipline",
      "xp": 3,
      "time_minutes": null,
      "once_per_day": false
    }
  ]
}
```

### 5.2 `/public/config/levels.json`

```json
{
  "version": 1,
  "levels": [
    { "level": 1, "name": "Starting", "weekly_xp": 50, "consecutive_weeks": 3 },
    { "level": 2, "name": "Building", "weekly_xp": 80, "consecutive_weeks": 3 },
    { "level": 3, "name": "Consistent", "weekly_xp": 120, "consecutive_weeks": 3 },
    { "level": 4, "name": "Sharp", "weekly_xp": 160, "consecutive_weeks": 3 },
    { "level": 5, "name": "Dangerous", "weekly_xp": 200, "consecutive_weeks": 4 }
  ]
}
```

### 5.3 `/public/config/streaks.json`

```json
{
  "version": 1,
  "min_daily_xp": 10,
  "two_day_rule": true,
  "bonuses": [
    { "days": 3, "xp": 5 },
    { "days": 7, "xp": 15 },
    { "days": 14, "xp": 30 },
    { "days": 30, "xp": 50, "achievement_key": "iron_mind" },
    { "days": 90, "xp": 100, "achievement_key": "diamond_mind" }
  ]
}
```

### 5.4 `/public/config/achievements.json`

```json
{
  "version": 1,
  "achievements": [
    {
      "key": "first_blood",
      "name": "First Blood",
      "description": "Hit 10 XP in a single day for the first time",
      "icon": "zap",
      "condition": { "type": "daily_xp_gte", "value": 10, "count": 1 }
    },
    {
      "key": "bookworm_i",
      "name": "Bookworm I",
      "description": "Finish your 1st book",
      "icon": "book",
      "condition": { "type": "activity_count", "activity_key": "finish_book", "value": 1 }
    },
    {
      "key": "bookworm_iii",
      "name": "Bookworm III",
      "description": "Finish 3 books",
      "icon": "book",
      "condition": { "type": "activity_count", "activity_key": "finish_book", "value": 3 }
    },
    {
      "key": "bookworm_xii",
      "name": "Bookworm XII",
      "description": "Finish 12 books",
      "icon": "library",
      "condition": { "type": "activity_count", "activity_key": "finish_book", "value": 12 }
    },
    {
      "key": "iron_mind",
      "name": "Iron Mind",
      "description": "30-day streak",
      "icon": "flame",
      "condition": { "type": "streak_gte", "value": 30 }
    },
    {
      "key": "diamond_mind",
      "name": "Diamond Mind",
      "description": "90-day streak",
      "icon": "diamond",
      "condition": { "type": "streak_gte", "value": 90 }
    },
    {
      "key": "logic_i",
      "name": "Logic I",
      "description": "Solve 10 LeetCode/Project Euler problems",
      "icon": "cpu",
      "condition": { "type": "activity_count", "activity_key": "leetcode_problem", "value": 10 }
    },
    {
      "key": "logic_iii",
      "name": "Logic III",
      "description": "Solve 50 problems",
      "icon": "cpu",
      "condition": { "type": "activity_count", "activity_key": "leetcode_problem", "value": 50 }
    },
    {
      "key": "builder",
      "name": "Builder",
      "description": "Ship 1 side project",
      "icon": "hammer",
      "condition": { "type": "activity_count", "activity_key": "shipped_something", "value": 1 }
    },
    {
      "key": "serial_builder",
      "name": "Serial Builder",
      "description": "Ship 3 side projects",
      "icon": "hammer",
      "condition": { "type": "activity_count", "activity_key": "shipped_something", "value": 3 }
    },
    {
      "key": "ai_skeptic",
      "name": "AI Skeptic",
      "description": "Catch 10 AI errors",
      "icon": "shield-alert",
      "condition": { "type": "activity_count", "activity_key": "ai_error_caught", "value": 10 }
    },
    {
      "key": "writer_i",
      "name": "Writer I",
      "description": "Publish 4 pieces",
      "icon": "pen-tool",
      "condition": { "type": "activity_count", "activity_key": "write_publish", "value": 4 }
    },
    {
      "key": "writer_iii",
      "name": "Writer III",
      "description": "Publish 12 pieces",
      "icon": "pen-tool",
      "condition": { "type": "activity_count", "activity_key": "write_publish", "value": 12 }
    },
    {
      "key": "ghost_mode",
      "name": "Ghost Mode",
      "description": "7 days with screen time under 2 hrs",
      "icon": "ghost",
      "condition": { "type": "consecutive_activity", "activity_key": "screen_time_low", "value": 7 }
    },
    {
      "key": "monk_mode",
      "name": "Monk Mode",
      "description": "30 days no social media",
      "icon": "eye-off",
      "condition": { "type": "consecutive_activity", "activity_key": "no_social_media", "value": 30 }
    },
    {
      "key": "level_5",
      "name": "Level 5",
      "description": "Sustain 200+ XP/week for 4 consecutive weeks",
      "icon": "crown",
      "condition": { "type": "level_gte", "value": 5 }
    },
    {
      "key": "year_one",
      "name": "Year One",
      "description": "Complete 52 weekly reviews",
      "icon": "calendar",
      "condition": { "type": "review_count", "value": 52 }
    }
  ]
}
```

### 5.5 `/public/config/reading-list.json`

```json
{
  "version": 1,
  "books": [
    { "key": "deep_work", "title": "Deep Work", "author": "Cal Newport", "order": 1, "audiobook": true, "url": "https://www.amazon.com/dp/1455586692" },
    { "key": "thinking_fast_slow", "title": "Thinking, Fast and Slow", "author": "Daniel Kahneman", "order": 2, "audiobook": true, "url": "https://www.amazon.com/dp/0374533555" },
    { "key": "scout_mindset", "title": "The Scout Mindset", "author": "Julia Galef", "order": 3, "audiobook": true, "url": "https://www.amazon.com/dp/0735217556" },
    { "key": "why_we_sleep", "title": "Why We Sleep", "author": "Matthew Walker", "order": 4, "audiobook": true, "url": "https://www.amazon.com/dp/1501144316" },
    { "key": "how_to_solve_it", "title": "How to Solve It", "author": "George Polya", "order": 5, "audiobook": false, "url": "https://www.amazon.com/dp/069116407X" },
    { "key": "never_split", "title": "Never Split the Difference", "author": "Chris Voss", "order": 6, "audiobook": true, "url": "https://www.amazon.com/dp/0062407805" },
    { "key": "superforecasting", "title": "Superforecasting", "author": "Philip Tetlock", "order": 7, "audiobook": true, "url": "https://www.amazon.com/dp/0804136718" },
    { "key": "poor_charlies", "title": "Poor Charlie's Almanack", "author": "Charlie Munger", "order": 8, "audiobook": false, "url": "https://www.amazon.com/dp/1578645018" },
    { "key": "antifragile", "title": "Antifragile", "author": "Nassim Taleb", "order": 9, "audiobook": true, "url": "https://www.amazon.com/dp/0812979680" },
    { "key": "outlive", "title": "Outlive", "author": "Peter Attia", "order": 10, "audiobook": true, "url": "https://www.amazon.com/dp/0593236599" },
    { "key": "range", "title": "Range", "author": "David Epstein", "order": 11, "audiobook": true, "url": "https://www.amazon.com/dp/0735214484" },
    { "key": "naval", "title": "The Almanack of Naval Ravikant", "author": "Eric Jorgenson", "order": 12, "audiobook": true, "url": "https://www.navalmanack.com" }
  ]
}
```

### 5.6 `/public/config/nudges.json`

```json
{
  "version": 1,
  "categories": {
    "cognitive": [
      "What's one thing I believed yesterday that might be wrong?",
      "If I had to bet money on my current project succeeding, what odds would I give? Why?",
      "What's a question I should be asking that I'm not?"
    ],
    "intentionality": [
      "What is the ONE thing that matters most today?",
      "What am I avoiding? Why?",
      "If today repeated for a year, where would I end up?"
    ],
    "empathy": [
      "Who in my life needs something from me that I haven't given?",
      "What would the person I disagree with say their strongest argument is?",
      "When did I last genuinely ask someone how they're doing and listen?"
    ],
    "ai_awareness": [
      "What did I use AI for yesterday? Did I verify the output?",
      "What's one thing I relied on AI for that I should be able to do myself?",
      "What's one thing I did manually that AI could have handled better?"
    ]
  },
  "daily_count": 2
}
```

### 5.7 `/public/config/links.json`

```json
{
  "version": 1,
  "links": [
    { "key": "apple_health", "label": "Health Activity - Apple", "url": "https://www.apple.com/health/", "icon": "heart", "category": "health" },
    { "key": "brilliant", "label": "Brilliant.org", "url": "https://brilliant.org", "icon": "brain", "category": "learning" },
    { "key": "lichess", "label": "Lichess", "url": "https://lichess.org", "icon": "trophy", "category": "games" },
    { "key": "leetcode", "label": "LeetCode", "url": "https://leetcode.com", "icon": "code", "category": "learning" },
    { "key": "project_euler", "label": "Project Euler", "url": "https://projecteuler.net", "icon": "calculator", "category": "learning" },
    { "key": "paul_graham", "label": "Paul Graham Essays", "url": "https://paulgraham.com", "icon": "book-open", "category": "reading" },
    { "key": "farnam_street", "label": "Farnam Street", "url": "https://fs.blog", "icon": "compass", "category": "reading" }
  ]
}
```

### 5.8 `/public/config/wiki-categories.json`

```json
{
  "version": 1,
  "categories": [
    "Cognitive_biases",
    "Psychological_theories",
    "Economic_theories",
    "Philosophical_concepts",
    "Mathematical_theorems",
    "Game_theory",
    "Decision_theory",
    "Behavioral_economics",
    "Social_psychology",
    "Artificial_intelligence",
    "History_of_science",
    "Stoicism",
    "Probability_theory",
    "Strategy",
    "Logical_fallacies",
    "Heuristics",
    "Mental_models",
    "Evolutionary_psychology",
    "Neuroscience",
    "Financial_economics"
  ]
}
```

### 5.9 `/public/config/mental-models.json`

Lightweight index only. Content fetched from Wikipedia at runtime.

```json
{
  "version": 1,
  "models": [
    { "name": "Survivorship Bias", "wiki": "Survivorship_bias" },
    { "name": "Dunning-Kruger Effect", "wiki": "Dunning–Kruger_effect" },
    { "name": "Sunk Cost Fallacy", "wiki": "Sunk_cost" },
    { "name": "Confirmation Bias", "wiki": "Confirmation_bias" },
    { "name": "First Principles Thinking", "wiki": "First_principle" },
    { "name": "Occam's Razor", "wiki": "Occam%27s_razor" },
    { "name": "Pareto Principle", "wiki": "Pareto_principle" },
    { "name": "Inversion", "wiki": "Inversion_(logic)" },
    { "name": "Second-Order Thinking", "wiki": "Second-order_thinking" },
    { "name": "Hanlon's Razor", "wiki": "Hanlon%27s_razor" },
    { "name": "Circle of Competence", "wiki": "Circle_of_competence" },
    { "name": "Availability Heuristic", "wiki": "Availability_heuristic" },
    { "name": "Anchoring Effect", "wiki": "Anchoring_(cognitive_bias)" },
    { "name": "Regression to the Mean", "wiki": "Regression_toward_the_mean" },
    { "name": "Bayes' Theorem", "wiki": "Bayes%27_theorem" },
    { "name": "Opportunity Cost", "wiki": "Opportunity_cost" },
    { "name": "Compounding", "wiki": "Compound_interest" },
    { "name": "Margin of Safety", "wiki": "Margin_of_safety" },
    { "name": "Antifragility", "wiki": "Antifragility" },
    { "name": "Lindy Effect", "wiki": "Lindy_effect" }
  ]
}
```

(Ship ~200 entries in v1. Above is a representative sample.)

### 5.10 `/public/config/fermi-estimates.json`

```json
{
  "version": 1,
  "estimates": [
    {
      "key": "fermi_001",
      "question": "How many flights take off globally per day?",
      "answer": "~100,000",
      "justification": "~4 billion passengers/year ÷ 365 days ÷ ~100 passengers/flight ≈ 110,000 flights/day. Actual: ~100,000.",
      "difficulty": 2
    },
    {
      "key": "fermi_002",
      "question": "How much does the atmosphere weigh?",
      "answer": "~5.15 × 10^18 kg",
      "justification": "Atmospheric pressure is ~101,325 Pa = 101,325 N/m². Earth's surface area ≈ 5.1 × 10^14 m². Weight = pressure × area ≈ 5.17 × 10^19 N → mass ≈ 5.15 × 10^18 kg.",
      "difficulty": 3
    }
  ]
}
```

(Ship ~100 estimates in v1.)

### 5.11 `/public/config/calibration.json`

```json
{
  "version": 1,
  "questions": [
    {
      "key": "cal_001",
      "statement": "The Great Wall of China is visible from space with the naked eye",
      "answer": false,
      "source": "NASA has confirmed it's not visible from low Earth orbit without aid"
    },
    {
      "key": "cal_002",
      "statement": "An octopus has three hearts",
      "answer": true,
      "source": "Two branchial hearts pump blood to the gills, one systemic heart pumps it to the body"
    }
  ]
}
```

(Ship ~200 questions in v1.)

### 5.12 `/public/config/classic-riddles.json`

```json
{
  "version": 1,
  "riddles": [
    {
      "key": "riddle_001",
      "type": "knights_and_knaves",
      "setup": "You meet two people at a fork. One always tells the truth, one always lies. You can ask ONE question to find the right path.",
      "question": "What question do you ask?",
      "answer": "Ask either: 'If I asked the other person which path is correct, what would they say?' Then take the opposite path.",
      "explanation": "Both liars and truth-tellers will point to the wrong path with this question. The liar lies about what the truth-teller would say. The truth-teller truthfully reports the liar's lie.",
      "difficulty": 2
    }
  ]
}
```

(Ship ~40 riddles in v1.)

---

## 6. Service Specifications

### 6.1 Encryption Service (`src/services/encryption.js`)

```
EXPORTS:
  - generateSalt() → base64 string (16 bytes random)
  - deriveKey(password, salt) → CryptoKey (PBKDF2, 100,000 iterations, SHA-256, AES-256-GCM key)
  - hashPassword(password) → { hash: string, salt: string }
      Uses PBKDF2 with separate salt for hash verification.
      hash = base64(PBKDF2(password, salt, 100000, SHA-256, 256 bits))
  - verifyPassword(password, storedHash, storedSalt) → boolean
  - encrypt(plaintext, password, salt) → base64 string
      1. deriveKey(password, salt) → key
      2. Generate random 12-byte IV
      3. AES-256-GCM encrypt
      4. Return base64(IV + ciphertext + authTag)
  - decrypt(ciphertext_b64, password, salt) → plaintext string
      1. Decode base64
      2. Extract IV (first 12 bytes), authTag (last 16 bytes), ciphertext (middle)
      3. deriveKey(password, salt) → key
      4. AES-256-GCM decrypt
      5. Return plaintext

IMPLEMENTATION NOTES:
  - All crypto via window.crypto.subtle (Web Crypto API)
  - PBKDF2 iterations: 100,000 (balance between security and UX)
  - IV: 12 bytes, random per encryption (never reuse)
  - Salt: 16 bytes, generated once per user, stored in profile.json
  - Password hash and salt stored UNENCRYPTED in profile.json (needed to verify before decryption)
  - All other data files are fully encrypted
```

### 6.2 Auth Service (`src/services/auth.js`)

```
AUTH MODEL: PAT (Personal Access Token) + encrypted backup in repo.

No OAuth. No Cloudflare Workers. No CORS proxies. No infrastructure.
PAT is generated once by the user, encrypted with their password, and backed up
in the public repo. On new device or cache clear, password recovers everything.

EXPORTS:
  - setupAuth(pat, password, salt, githubApi):
      1. Verify PAT works: GET https://api.github.com/user → if 401, PAT is invalid
      2. Verify PAT has repo scope: GET https://api.github.com/repos/{owner}/{repo}
      3. Encrypt PAT: encryption.encrypt(pat, password, salt) → encryptedPAT
      4. Store in repo: PUT /data/auth.enc.json → { encrypted_pat: encryptedPAT }
      5. Store in localStorage: "arc_github_token" = pat
      6. Return user info: { login, avatar_url, name }

  - recoverAuth(password, salt):
      Called when localStorage is empty but repo has data (new device / cache cleared).
      1. Fetch /data/auth.enc.json from PUBLIC repo (no auth needed — repo is public)
         GET https://raw.githubusercontent.com/{owner}/{repo}/main/data/auth.enc.json
      2. Decrypt: encryption.decrypt(encrypted_pat, password, salt) → pat
      3. Verify PAT still valid: GET https://api.github.com/user
      4. Store in localStorage
      5. Return user info

  - getUser(token) → { login, id, avatar_url, name }
      GET https://api.github.com/user
      Headers: Authorization: Bearer <token>

  - getToken() → string | null
      return localStorage.getItem("arc_github_token")

  - logout() → void
      Clears token and user from localStorage (PAT remains encrypted in repo for recovery)

  - isAuthenticated() → boolean
      return getToken() !== null

LOCAL STORAGE KEYS:
  - "arc_github_token": the PAT (plaintext in localStorage, which is fine — localStorage is per-origin)
  - "arc_github_user": cached user info JSON

PAT REQUIREMENTS (guide user to create):
  - Type: Fine-grained Personal Access Token
  - Resource owner: user's own account
  - Repository access: Only select repositories → select the my-arc repo
  - Permissions: Contents → Read and write (only permission needed)
  - Expiration: set to NO EXPIRATION (strongly recommended — avoids recovery hassle)
  - Generate URL: https://github.com/settings/personal-access-tokens/new

NO CORS ISSUES:
  All GitHub API calls (api.github.com) support CORS from browsers when authenticated.
  raw.githubusercontent.com also supports CORS for public repos.
  No proxy needed. Everything works client-side.
```

### 6.3 GitHub API Service (`src/services/github-api.js`)

```
CONSTRUCTOR:
  new GitHubAPI(token, owner, repo)

EXPORTS:
  - getFile(path) → { content: string, sha: string } | null
      GET /repos/{owner}/{repo}/contents/{path}
      Decodes base64 content
      Returns null if 404

  - putFile(path, content, sha, message) → { sha: string }
      PUT /repos/{owner}/{repo}/contents/{path}
      Body: { message, content: base64(content), sha (if updating) }
      If sha is null, creates new file
      Returns new sha

  - deleteFile(path, sha, message) → void
      DELETE /repos/{owner}/{repo}/contents/{path}

  - listFiles(path) → [{ name, path, sha }]
      GET /repos/{owner}/{repo}/contents/{path}
      Returns array of file entries

  - getRepo() → { full_name, default_branch, private }
      GET /repos/{owner}/{repo}
      Used to verify repo exists and user has access

BASE URL: https://api.github.com
HEADERS:
  Authorization: Bearer <token>
  Accept: application/vnd.github.v3+json
  X-GitHub-Api-Version: 2022-11-28

RATE LIMITS:
  Authenticated: 5,000 requests/hour
  Sufficient for single user (sync every 5 min = ~200 calls/day max)

ERROR HANDLING:
  - 401: Token expired → trigger re-auth
  - 403: Rate limited → back off, show user message
  - 404: File doesn't exist → return null (not error)
  - 409: Conflict (sha mismatch) → re-fetch, merge, retry
  - 422: Validation error → log and surface to user
```

### 6.4 Wikipedia API Service (`src/services/wikipedia-api.js`)

```
EXPORTS:
  - getRandomFromCategory(categoryName, count) → [{ title, extract, url }]
      GET https://en.wikipedia.org/w/api.php
      Params: action=query, generator=categorymembers, gcmtitle=Category:{categoryName},
              gcmlimit={count}, prop=extracts|info, exintro=true, explaintext=true,
              exsentences=3, inprop=url, format=json, origin=*

  - getArticleSummary(articleTitle) → { title, extract, url, thumbnail }
      GET https://en.wikipedia.org/api/rest_v1/page/summary/{articleTitle}
      Returns: { title, extract, content_urls.desktop.page, thumbnail.source }

  - getRandomArticle() → { title, extract, url }
      GET https://en.wikipedia.org/api/rest_v1/page/random/summary

CORS: Wikipedia API supports CORS (origin=* parameter). No proxy needed.
RATE LIMITS: None for reasonable usage. Cache responses in localStorage for 24 hours.
```

---

## 7. Storage Layer Specification

### 7.1 IStorage Interface (`src/storage/IStorage.js`)

```
INTERFACE IStorage:
  - async read(key) → object | null
      Reads a data entity by key (e.g., "daily-log", "streaks")
      Returns parsed JSON object, or null if not found

  - async write(key, data) → void
      Writes a data entity by key
      data is a plain JS object, serialized to JSON internally

  - async delete(key) → void
      Deletes a data entity by key

  - async list() → string[]
      Returns all stored keys

  - async exists(key) → boolean
      Returns whether a key exists
```

### 7.2 LocalCacheStorage (`src/storage/LocalCacheStorage.js`)

```
IMPLEMENTS: IStorage
PREFIX: "arc_data_"

read(key):
  value = localStorage.getItem("arc_data_" + key)
  return value ? JSON.parse(value) : null

write(key, data):
  localStorage.setItem("arc_data_" + key, JSON.stringify(data))
  localStorage.setItem("arc_meta_" + key, JSON.stringify({ updated_at: new Date().toISOString() }))

delete(key):
  localStorage.removeItem("arc_data_" + key)
  localStorage.removeItem("arc_meta_" + key)

list():
  return Object.keys(localStorage)
    .filter(k => k.startsWith("arc_data_"))
    .map(k => k.replace("arc_data_", ""))

exists(key):
  return localStorage.getItem("arc_data_" + key) !== null

getMetadata(key):
  meta = localStorage.getItem("arc_meta_" + key)
  return meta ? JSON.parse(meta) : null
```

### 7.3 GitHubStorage (`src/storage/GitHubStorage.js`)

```
IMPLEMENTS: IStorage
DEPENDS ON: GitHubAPI, EncryptionService

CONSTRUCTOR:
  new GitHubStorage(githubApi, encryption, password, salt)

INTERNAL STATE:
  - shaCache: { [key]: sha }  — tracks file SHAs for conflict-free updates

read(key):
  result = await githubApi.getFile("data/" + key + ".json")
  if (!result) return null
  shaCache[key] = result.sha
  decrypted = await encryption.decrypt(result.content, password, salt)
  return JSON.parse(decrypted)

write(key, data):
  plaintext = JSON.stringify(data, null, 2)
  encrypted = await encryption.encrypt(plaintext, password, salt)
  result = await githubApi.putFile(
    "data/" + key + ".json",
    encrypted,
    shaCache[key] || null,
    "arc: update " + key
  )
  shaCache[key] = result.sha

delete(key):
  if (shaCache[key]) {
    await githubApi.deleteFile("data/" + key + ".json", shaCache[key], "arc: delete " + key)
    delete shaCache[key]
  }

list():
  files = await githubApi.listFiles("data/")
  return files.map(f => f.name.replace(".json", ""))

exists(key):
  result = await githubApi.getFile("data/" + key + ".json")
  return result !== null

SPECIAL: readProfile() — reads profile.json partially unencrypted
  The password_hash and password_salt fields in profile.json are stored as plaintext
  within the JSON (not the whole file encrypted). This allows password verification
  before the encryption key is available.

  Format of profile.json on disk:
  {
    "password_hash": "...",
    "password_salt": "...",
    "encrypted_data": "<base64 encrypted JSON of the rest of the profile>"
  }
```

### 7.4 SyncEngine (`src/storage/SyncEngine.js`)

```
CONSTRUCTOR:
  new SyncEngine(localCache, githubStorage)

STATE:
  - syncStatus: "idle" | "syncing" | "error"
  - failedKeys: Set<string>  — keys that failed to push (e.g., offline)

METHODS:
  - async pushKey(key):
      Write-through: immediately pushes a single key to GitHub.
      Called by BaseDAO.saveData() after every write.
      syncStatus = "syncing"
      try:
        data = localCache.read(key)
        await githubStorage.write(key, data)
        failedKeys.delete(key)
        syncStatus = "idle"
      catch (error):
        failedKeys.add(key)  — retry on next manual save or app reload
        syncStatus = "error"

  - async retryFailed():
      Retries all keys in failedKeys. Called on manual save button press.
      for (key of failedKeys):
        data = localCache.read(key)
        await githubStorage.write(key, data)
        failedKeys.delete(key)

  - async fullPull():
      Pull ALL data from GitHub to localStorage.
      Called on app load (every time the app opens).
      remoteKeys = await githubStorage.list()
      for (key of remoteKeys):
        remoteData = await githubStorage.read(key)
        localCache.write(key, remoteData)

  - async fullPush():
      Push ALL localStorage data to GitHub.
      Called on manual "save all" button or password change.
      keys = localCache.list()
      for (key of keys):
        data = localCache.read(key)
        await githubStorage.write(key, data)

SYNC MODEL:
  - Write-through: every DAO save → pushKey() → immediate GitHub push
  - On app load: fullPull() → get latest from repo
  - No background polling. No intervals. No timers.
  - If push fails (offline): key added to failedKeys, retried on manual save or next app load
  - Rate limit: 5,000 req/hr authenticated. Typical usage ~150 calls/day. Not a concern.

CONFLICT RESOLUTION:
  - Last-write-wins with SHA tracking
  - Single user system, conflicts only if two browser tabs push simultaneously
  - On SHA conflict (409): re-fetch remote SHA, retry push with updated SHA
```

---

## 8. DAO Layer Specification

### 8.1 BaseDAO (`src/dao/BaseDAO.js`)

```
CONSTRUCTOR:
  new BaseDAO(localCache, syncEngine, storageKey)

METHODS:
  - async getData():
      return await localCache.read(storageKey) || getDefaultData()

  - async saveData(data):
      await localCache.write(storageKey, data)
      await syncEngine.pushKey(storageKey)  // immediate push to GitHub

  - getDefaultData():
      Abstract — each DAO returns its empty default schema
```

### 8.2 ActivityDAO (`src/dao/ActivityDAO.js`)

```
EXTENDS: BaseDAO (storageKey: "daily-log")

METHODS:
  - async logActivity(activityKey, config, notes):
      1. Get today's date string (YYYY-MM-DD)
      2. Load daily-log data
      3. Find activity definition in config.activities by activityKey
      4. Calculate XP:
         a. base_xp = activity.xp
         b. Check sleep_multiplier: if today has sleep_8hrs logged, multiply by config.sleep_multiplier
         c. Check critical_hit: Math.random() < config.critical_hit_chance → multiply by config.critical_hit_multiplier
         d. xp_earned = base_xp * multipliers
      5. Check once_per_day: if activity.once_per_day and already logged today, reject
      6. Append to today's activities array
      7. Recalculate today's xp_total and xp_breakdown
      8. Check combo: if activities span >= combo_threshold_categories unique categories, add combo_bonus_xp
      9. Save data
      10. Return { xp_earned, critical_hit, combo_triggered }

  - async getTodayXP() → number

  - async getTodayActivities() → Activity[]

  - async getXPHistory(days) → [{ date, xp }]

  - async getCategoryBreakdown(days) → { [category]: total_xp }

  - async getActivityCount(activityKey) → number (all time)
```

### 8.3 StreakDAO (`src/dao/StreakDAO.js`)

```
EXTENDS: BaseDAO (storageKey: "streaks")

METHODS:
  - async updateStreak(todayXP, streakConfig):
      1. Get today's date
      2. If todayXP >= streakConfig.min_daily_xp:
         a. If last_active_date is yesterday: current_streak++
         b. If last_active_date is today: no change
         c. If last_active_date is >1 day ago:
            - If two_day_rule and last_active_date is 2 days ago: streak broken, reset to 1
            - Else: reset to 1
         d. Update last_active_date = today
         e. Check streak bonuses: for each bonus in streakConfig.bonuses, if current_streak == bonus.days, award XP
         f. Update longest_streak if current > longest
      3. Save data
      4. Return { current_streak, bonus_earned }

  - async getCurrentStreak() → number

  - async getLongestStreak() → number

  - async markRestDay(date):
      Add date to rest_days array. Streak pauses (last_active_date not updated, but streak not broken).

  - async isStreakAlive() → boolean
```

### 8.4 LevelDAO, AchievementDAO, ReviewDAO, ReadingListDAO

(Follow same pattern as above. Each extends BaseDAO with domain-specific methods. Full method signatures omitted for brevity but follow the data schemas in Section 4.)

---

## 9. Auth Flow (Step-by-Step)

### 9.1 First-Time User

```
1. User opens app (my-arc.github.io)
2. App shows landing page: app name, description, "Get Started" button
3. User clicks "Get Started"
4. App shows setup wizard:
   Step 1: "Create a Personal Access Token"
     - Link to https://github.com/settings/personal-access-tokens/new
     - Instructions: select your my-arc repo, give Contents read/write permission
     - Paste field for the token
   Step 2: "Set your encryption password"
     - Password field (min 8 chars, confirmed twice)
     - Warning: "Remember this password. It cannot be recovered."
5. User pastes PAT → app validates:
   a. GET https://api.github.com/user (verify PAT works) → get { login, avatar_url }
   b. GET https://api.github.com/repos/{owner}/{repo} (verify repo access)
   c. If either fails → show error with guidance
6. User enters password → app:
   a. Generates salt (16 bytes random)
   b. Hashes password: hashPassword(password) → { hash, salt }
   c. Encrypts PAT: encrypt(pat, password, salt) → encrypted_pat
   d. Creates /data/profile.json → { password_hash, password_salt, encrypted_data: encrypt(settings, password, salt) }
   e. Creates /data/auth.enc.json → { encrypted_pat }
   f. Creates empty data files (daily-log.json, streaks.json, etc.) encrypted with password
   g. Pushes all to repo
   h. Stores PAT + password in localStorage
7. App loads → Dashboard (empty, ready to use)
```

### 9.2 Returning User (Same Device)

```
1. User opens app
2. App checks localStorage for PAT + password
3. If both present:
   a. Verify PAT: call getUser(token). If 401 → PAT expired/revoked → show re-auth screen
   b. Use cached password to decrypt data from localStorage cache
   c. Load app → Dashboard
4. If PAT present but no password:
   a. Show PasswordEntry screen
   b. User enters password → verify against profile.json hash → decrypt → load
5. If neither: show first-time setup (or recovery flow if repo has data)
```

### 9.3 Returning User (New Device or Cache Cleared)

```
1. User opens app on new device (or after clearing browser data)
2. No localStorage data
3. App shows: "Welcome back" with two fields:
   a. GitHub username / repo name (e.g., "harshit/my-arc")
   b. Encryption password
4. App fetches (NO auth needed — public repo):
   a. https://raw.githubusercontent.com/{owner}/{repo}/main/data/profile.json
      → reads password_hash + password_salt (stored unencrypted)
   b. Verifies entered password against hash
   c. https://raw.githubusercontent.com/{owner}/{repo}/main/data/auth.enc.json
      → decrypts encrypted_pat using password
5. Validates recovered PAT: GET https://api.github.com/user
   - If 401: PAT expired/revoked → guide user to create new PAT
   - If success: continue
6. Stores PAT + password in localStorage
7. Pulls all encrypted data from repo → decrypts → caches in localStorage
8. App loads → Dashboard with all data synced
```

### 9.4 PAT Expired or Revoked

```
1. App detects 401 from GitHub API during any operation
2. Shows: "Your GitHub token has expired. Please create a new one."
   - Link to https://github.com/settings/personal-access-tokens/new
   - Paste field for new PAT
3. User pastes new PAT → app validates
4. App re-encrypts new PAT with existing password + salt
5. Pushes updated /data/auth.enc.json to repo
6. Resumes normal operation
```

### 9.5 Password Change

```
1. User navigates to Settings → Change Password
2. Enter current password → verified against stored hash
3. Enter new password (min 8 chars, confirmed twice)
4. App:
   a. Generates new salt
   b. Reads ALL data files from localStorage (already decrypted)
   c. Re-encrypts ALL data with new password + new salt (including PAT in auth.enc.json)
   d. Updates profile.json with new hash + salt
   e. Pushes all updated files to GitHub
   f. Updates localStorage with new password
5. Done. All data now encrypted with new password.
```

---

## 10. Game Engine Specification

### 10.1 GameEngine (`src/games/GameEngine.js`)

```
Manages a game session: timing, scoring, XP calculation.

STATE:
  - gameType: string
  - section: "practice" | "puzzles" | "speed"
  - isTimerEnabled: boolean
  - timeLimit: number (seconds) | null
  - timeElapsed: number (seconds)
  - score: number
  - maxScore: number
  - questions: Question[]
  - currentQuestionIndex: number
  - status: "ready" | "playing" | "finished"

METHODS:
  - start(questions, options):
      Set questions, reset score, start timer if enabled

  - submitAnswer(answer):
      Check answer against current question
      Update score
      Advance to next question or finish

  - skip():
      Advance without scoring

  - finish():
      Stop timer
      Calculate XP: baseXP * (score/maxScore) * difficultyMultiplier
      Return { score, maxScore, timeElapsed, xpEarned }

  - getTimeRemaining():
      If timed: timeLimit - timeElapsed
      Else: null

XP CALCULATION:
  - Practice games: 4-8 XP per session
  - Puzzle games: 6-10 XP per session
  - Speed games: 5-12 XP per session (bonus for speed)
  - XP scales with score/maxScore ratio and difficulty level
```

### 10.2 Generators

Each generator exports a `generate(difficulty)` function returning a Question object:

```
Question {
  prompt: string          — what to show the user
  options: string[] | null — multiple choice options (null for free input)
  answer: string | number  — correct answer
  explanation: string      — shown after answering
  difficulty: 1-5
}
```

**NumberSequence.js:**
  - Generates sequences with hidden rules (arithmetic, geometric, Fibonacci-like, polynomial)
  - Difficulty 1: simple arithmetic (2, 4, 6, 8, ?)
  - Difficulty 5: compound rules (each term = sum of previous two + 3)

**EstimationGame.js:**
  - Generates multiplication/division of large numbers
  - Shows 4 options at different orders of magnitude
  - Difficulty scales by number size and operation complexity

**MemoryGrid.js:**
  - Generates NxN grid of random numbers/colors
  - Flash time decreases with difficulty (5s → 2s)
  - Grid size increases with difficulty (3x3 → 6x6)
  - Returns grid + hidden positions to recall

**LogicalDeduction.js:**
  - Generates constraint sets: "A > B", "C < A", "B > D"
  - Asks: "Rank from highest to lowest"
  - Difficulty scales by number of entities and constraints
  - Validates that constraints have a unique solution

**ProbabilitySnap.js:**
  - Generates probability scenarios: coins, dice, cards, combinatorics
  - Difficulty 1: "Flip 1 coin, P(heads)?"
  - Difficulty 5: "Draw 2 cards without replacement, P(both red)?"

---

## 11. PWA Specification

### 11.1 Manifest (`public/manifest.json`)

```json
{
  "name": "Arc — Growth Tracker",
  "short_name": "Arc",
  "description": "Gamified personal growth tracker",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#8b5cf6",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
  ]
}
```

### 11.2 Service Worker (via vite-plugin-pwa)

```
CACHING STRATEGY:
  - App shell (HTML, JS, CSS, icons): Cache-first (precache on install)
  - Config files: Stale-while-revalidate (serve cached, update in background)
  - API calls (GitHub, Wikipedia): Network-first with fallback to cache
  - Images: Cache-first

NOTIFICATIONS:
  - On app load: check if user has logged XP today
    - If not, and time > notification_morning setting: show notification "Time to earn some XP!"
  - On streak about to break (no XP yesterday and today): show "Your streak is at risk!"
  - Periodic sync (if supported): check daily even when app is closed
  - User can disable all notifications in Settings

iOS NOTES:
  - Service worker supported in Safari 16.4+ when added to Home Screen
  - Push notifications supported in Safari 16.4+ (Home Screen PWA only)
  - Must request notification permission explicitly
  - Periodic Background Sync not supported on iOS — use in-app checks instead
```

---

## 12. GitHub Actions Deploy Pipeline

### `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

---

## 13. UI Specification

### 13.1 Color Scheme (Dark Theme Default)

```
Background:       #0f172a (slate-900)
Surface:          #1e293b (slate-800)
Surface Elevated: #334155 (slate-700)
Primary:          #8b5cf6 (violet-500)
Primary Hover:    #7c3aed (violet-600)
Success:          #10b981 (emerald-500)
Warning:          #f59e0b (amber-500)
Danger:           #ef4444 (red-500)
Text Primary:     #f8fafc (slate-50)
Text Secondary:   #94a3b8 (slate-400)
Text Muted:       #64748b (slate-500)
```

### 13.2 Layout

```
DESKTOP (>768px):
┌──────────────────────────────────────────────────┐
│ Header (sync status, user avatar, settings gear) │
├────────────┬─────────────────────────────────────┤
│            │                                     │
│  Sidebar   │        Main Content                 │
│  (nav)     │        (pages render here)          │
│            │                                     │
│ Dashboard  │                                     │
│ Log XP     │                                     │
│ Games      │                                     │
│ Stats      │                                     │
│ Review     │                                     │
│ Reading    │                                     │
│ Tracking ▸ │                                     │
│ Export     │                                     │
│ Settings   │                                     │
│            │                                     │
└────────────┴─────────────────────────────────────┘

MOBILE (<768px):
┌──────────────────────────────┐
│ Header (hamburger, sync, ⚙) │
├──────────────────────────────┤
│                              │
│       Main Content           │
│       (full width)           │
│                              │
│                              │
├──────────────────────────────┤
│ Bottom Nav (5 icons)         │
│ Home | Log | Games | Stats | │
│                       More   │
└──────────────────────────────┘
```

### 13.3 Key Pages

**Dashboard:** Cards grid — TodayXP, StreakCard, LevelCard, BrainBite, DidYouKnow, CalibrationCard, MentalModelCard, RecentActivity, QuickLog.

**Log XP:** Category tabs at top. Activity cards below. Tap to log. Shows today's running total and category breakdown.

**Games Hub:** Three tabs — Practice, Puzzles, Speed. Game cards with difficulty indicator, best score, XP potential. Tap to start session.

**Stats:** Charts — XP over time (line), category balance (radar), streak history (bar), calibration accuracy (scatter). Date range selector.

**Settings:** Password change, notification preferences, theme selection, external links, sync status, data management (export/import).

---

## 14. Routing

```
/                   → Dashboard
/log                → Log XP (Activity Menu)
/games              → Games Hub
/games/:gameType    → Active Game Session
/stats              → Stats Page
/review             → Weekly Review
/reading            → Reading List
/tracking/habits    → Habit Tracker
/tracking/mood      → Mood Logger
/tracking/goals     → Goals Board
/tracking/journal   → Journal
/tracking/people    → People Page
/tracking/finance   → Finance Pulse
/tracking/travel    → Travel Log
/achievements       → Achievements Grid
/export             → Export / Import / Insights
/settings           → Settings Page
/login              → Login Screen (unauthenticated only)
```

---

## 15. Setup Instructions (For Users Who Fork)

```
1. Fork this repo to your GitHub account (click "Fork" button)
2. In your fork: Settings → Pages → Source: "GitHub Actions"
3. Wait for the first deploy to complete (~2 min)
4. Open your app at: https://<your-username>.github.io/<repo-name>/
5. Click "Get Started"
6. Create a fine-grained PAT on GitHub (app provides direct link + instructions)
7. Paste PAT in app + set your encryption password (REMEMBER THIS — it cannot be recovered)
8. Start using Arc!

Optional customization:
  - Edit /public/config/xp-menu.json to customize activities and XP values
  - Edit /public/config/achievements.json to add/modify achievements
  - Edit /public/config/reading-list.json to set your reading list
  - Push changes → auto-deploys via GitHub Actions
```

---

## 16. Release Plan (Detailed Tasks)

### R0 — Foundation

| # | Task | Files | Depends On | Details |
|---|------|-------|------------|---------|
| 1 | Init Vite + React project | package.json, vite.config.js, index.html, src/main.jsx, src/App.jsx | — | `npm create vite@latest . -- --template react`, install deps |
| 2 | Add Tailwind CSS | tailwind.config.js, postcss.config.js, src/index.css | 1 | Install tailwindcss, postcss, autoprefixer. Configure content paths. |
| 3 | Add vite-plugin-pwa | vite.config.js, public/manifest.json, public/icons/ | 1 | Install vite-plugin-pwa. Configure manifest, icons, service worker strategy. |
| 4 | Add GitHub Actions deploy | .github/workflows/deploy.yml | 1 | Copy deploy.yml from Section 12. |
| 5 | Create config JSON files | public/config/*.json | — | All 12 config files from Section 5. |
| 6 | Encryption service | src/services/encryption.js | — | Implement per Section 6.1. Unit test with Vitest. |
| 7 | GitHub API service | src/services/github-api.js | — | Implement per Section 6.3. |
| 8 | Auth service | src/services/auth.js | 6, 7 | PAT setup, validation, encrypted backup, recovery. Per Section 6.2. |
| 9 | Wikipedia API service | src/services/wikipedia-api.js | — | Implement per Section 6.4. |
| 10 | IStorage interface | src/storage/IStorage.js | — | Define interface per Section 7.1. |
| 11 | LocalCacheStorage | src/storage/LocalCacheStorage.js | 10 | Implement per Section 7.2. |
| 12 | GitHubStorage | src/storage/GitHubStorage.js | 6, 7, 10 | Implement per Section 7.3. |
| 13 | SyncEngine | src/storage/SyncEngine.js | 11, 12 | Implement per Section 7.4. |
| 14 | BaseDAO + ConfigLoader | src/dao/BaseDAO.js, src/dao/ConfigLoader.js | 11, 13 | Base class per Section 8.1. ConfigLoader fetches /public/config/ files. |
| 15 | Auth context + hook | src/context/AuthContext.jsx, src/hooks/useAuth.js | 8 | React context for auth state. Login/logout flow. |
| 16 | Data context + hook | src/context/DataContext.jsx, src/hooks/useSync.js, src/hooks/useEncryption.js | 6, 13, 14 | React context for app data. Sync hook. Encryption hook. |
| 17 | Common UI components | src/components/common/*.jsx | 2 | Card, Modal, Button, ProgressBar, Badge, Timer, Toast, ExternalLink. |
| 18 | Layout components | src/components/layout/*.jsx | 2, 17 | AppShell, Sidebar, Header, BottomNav, LoadingScreen. |
| 19 | Setup/login screen | src/components/auth/LoginScreen.jsx | 15 | PAT entry wizard + returning user recovery flow. Per Section 9.1, 9.3. |
| 20 | Password setup screen | src/components/auth/PasswordSetup.jsx | 15, 16 | First-time password creation per Section 9.1 steps 12-15. |
| 21 | Password entry screen | src/components/auth/PasswordEntry.jsx | 15, 16 | Returning user password prompt per Section 9.2-9.3. |
| 22 | Password change screen | src/components/auth/PasswordChange.jsx | 16 | Per Section 9.4. |
| 23 | App routing | src/App.jsx | 15, 16, 18 | React Router setup per Section 14. Auth guards (redirect to /login if not authenticated). |
| 24 | Empty dashboard | src/components/dashboard/Dashboard.jsx | 17, 18 | Placeholder dashboard with layout grid. |
| 25 | Settings page | src/components/settings/SettingsPage.jsx | 17, 22 | Password change, notification prefs, theme, links. |
| 26 | Utility functions | src/utils/*.js | — | Constants, date helpers, XP calculation helpers. |

**R0 Done When:** `npm run build` succeeds. App deploys to GitHub Pages. User can login with GitHub, set password, see empty dashboard. Data syncs. PWA installable. Password change works.

### R1 — Core Game

| # | Task | Files | Details |
|---|------|-------|---------|
| 27 | ActivityDAO | src/dao/ActivityDAO.js | Per Section 8.2. All XP calculation logic. |
| 28 | StreakDAO | src/dao/StreakDAO.js | Per Section 8.3. Two-day rule, rest days, bonuses. |
| 29 | LevelDAO | src/dao/LevelDAO.js | Level progression, weekly XP tracking, level-up detection. |
| 30 | AchievementDAO | src/dao/AchievementDAO.js | Check all conditions from achievements.json after each activity log. |
| 31 | Activity menu UI | src/components/activities/ActivityMenu.jsx, ActivityCard.jsx | Category tabs, activity cards with XP values, log buttons. |
| 32 | Log activity modal | src/components/activities/LogActivityModal.jsx | Tap activity → confirm → XP awarded with animation. Critical hit animation. |
| 33 | Activity history | src/components/activities/ActivityHistory.jsx | Past activities with date filter, search. |
| 34 | Dashboard widgets | src/components/dashboard/TodayXP.jsx, StreakCard.jsx, LevelCard.jsx, RecentActivity.jsx, QuickLog.jsx | Live data from DAOs. Animated. |
| 35 | Achievement list | src/components/achievements/AchievementList.jsx, AchievementCard.jsx | Grid of locked/unlocked achievements. |
| 36 | Achievement toast | src/components/achievements/AchievementToast.jsx | Pop-up animation when achievement unlocked. |
| 37 | XP chart | src/components/stats/XPChart.jsx | Line chart of daily XP over time (Recharts). |
| 38 | Category balance | src/components/stats/CategoryBalance.jsx | Radar chart of XP by category. |
| 39 | Streak chart | src/components/stats/StreakChart.jsx | Bar chart of streak history. |
| 40 | UI polish | All | Animations (Framer Motion or CSS), transitions, hover states, gamification feel (XP pop, level-up screen, streak fire). |

### R2 — Reviews & Content

| # | Task | Files | Details |
|---|------|-------|---------|
| 41 | ReviewDAO | src/dao/ReviewDAO.js | CRUD for weekly reviews. |
| 42 | ReadingListDAO | src/dao/ReadingListDAO.js | Track book status, progress, rating. |
| 43 | Weekly review form | src/components/reviews/WeeklyReview.jsx | 5 scoring categories, win, fix, book progress. Per growth-action-plan.md. |
| 44 | Review history | src/components/reviews/ReviewHistory.jsx | Past reviews, score trend chart. |
| 45 | Reading list UI | src/components/reading/ReadingList.jsx, BookCard.jsx | List from config, progress tracking, audiobook badge, external buy link. |
| 46 | Daily nudge display | src/components/dashboard/NudgeCard.jsx | Random nudge from config, rotates daily. |
| 47 | External links page | src/components/settings/ExternalLinks.jsx or in sidebar | Buttons linking to Apple Health, Brilliant, Lichess, etc. |

### R3 — PWA & Notifications

| # | Task | Files | Details |
|---|------|-------|---------|
| 48 | Service worker offline | vite.config.js (PWA plugin config) | Precache app shell. Network-first for API. Offline fallback page. |
| 49 | Notification permission | src/hooks/useNotifications.js | Request permission on first use. Respect user preference. |
| 50 | Daily nudge notification | src/hooks/useNotifications.js | On app load: if no XP today and past morning time → show notification. |
| 51 | Streak risk notification | src/hooks/useNotifications.js | If no XP yesterday and no XP today → "Your streak is at risk!" |
| 52 | Notification settings | src/components/settings/NotificationSettings.jsx | Enable/disable, morning/evening time pickers. |
| 53 | iOS verification | Manual testing | Test Add to Home Screen, notifications, offline on iOS Safari 16.4+. |
| 54 | Android verification | Manual testing | Test install prompt, notifications, offline on Chrome Android. |

### R4 — Expanded Tracking & Gamification

| # | Task | Files | Details |
|---|------|-------|---------|
| 55 | HabitDAO + UI | src/dao/HabitDAO.js, src/components/tracking/HabitTracker.jsx | Binary toggles, custom habits, per-habit streaks. |
| 56 | MoodDAO + UI | src/dao/MoodDAO.js, src/components/tracking/MoodLogger.jsx | 1-5 tap, emoji scale, trend chart. |
| 57 | GoalDAO + UI | src/dao/GoalDAO.js, src/components/tracking/GoalsBoard.jsx | Quarterly goals, milestones, progress bars, XP on milestone completion. |
| 58 | JournalDAO + UI | src/dao/JournalDAO.js, src/components/tracking/JournalPage.jsx | Free-form text, tags, search, encrypted. |
| 59 | PeopleDAO + UI | src/dao/PeopleDAO.js, src/components/tracking/PeoplePage.jsx | Name, last contacted, birthday, notes, fun tags/facts. |
| 60 | FinanceDAO + UI | src/dao/FinanceDAO.js, src/components/tracking/FinancePulse.jsx | Monthly snapshot, savings goal bar, future goals list. |
| 61 | TravelDAO + UI | src/dao/TravelDAO.js, src/components/tracking/TravelLog.jsx | Trips, places, status, photo links. |
| 62 | Skill tree data + UI | src/components/stats/SkillTree.jsx | RPG-style visual tree per category. XP fills branches. |
| 63 | Daily quests | src/dao/QuestDAO.js, dashboard widget | Generate 3 random from XP menu. 1.5x bonus for all 3. |
| 64 | Combo system | ActivityDAO update | Detect 3+ categories in a day → award combo_bonus_xp. |
| 65 | Rest days | StreakDAO update, UI toggle | Mark rest day, pause streak. |
| 66 | Weekly challenges | Config-driven, dashboard widget | Auto-generate or read from config. Badge on completion. |
| 67 | Boss battles | Config-driven, monthly challenge UI | Hard multi-day challenge. Unique achievement. |
| 68 | Seasons | LevelDAO update | Quarterly reset, legacy badge. |
| 69 | Critical hits | ActivityDAO update | Already in XP calc spec. Add animation. |
| 70 | Unlockable themes | ThemeContext, Settings | Map achievements → themes. Apply CSS variables. |
| 71 | Game engine | src/games/GameEngine.js | Per Section 10.1. |
| 72 | Number sequence generator | src/games/generators/NumberSequence.js | Per Section 10.2. |
| 73 | Estimation game generator | src/games/generators/EstimationGame.js | 4 options, difficulty scaling. |
| 74 | Memory grid generator | src/games/generators/MemoryGrid.js | Grid flash + recall. |
| 75 | Logical deduction generator | src/games/generators/LogicalDeduction.js | Constraint puzzles, unique solution validation. |
| 76 | Probability snap generator | src/games/generators/ProbabilitySnap.js | Coin/dice/card probability. |
| 77 | Fermi engine | src/games/generators/FermiEngine.js | Load from config, serve randomly. |
| 78 | Trivia API client | src/games/api/TriviaAPI.js | Open Trivia DB integration. |
| 79 | Wikipedia API client | src/games/api/WikipediaAPI.js | Random category article + mental model summaries. |
| 80 | Game hub UI | src/components/games/GameHub.jsx | 3-tab layout (Practice, Puzzles, Speed). Game cards. |
| 81 | Game session UI | src/components/games/GameSession.jsx | Timer, score, question display, answer input. |
| 82 | Game result UI | src/components/games/GameResult.jsx | Score summary, XP earned, play again. |
| 83 | Individual game UIs | src/components/games/practice/*.jsx, puzzles/*.jsx, speed/*.jsx | UI for each of the 9 game types. |
| 84 | Dashboard brain bite | src/components/dashboard/BrainBite.jsx | Daily puzzle widget, random game type. |
| 85 | Dashboard did you know | src/components/dashboard/DidYouKnow.jsx | Wikipedia random article from topic category. |
| 86 | Dashboard calibration | src/components/dashboard/CalibrationCard.jsx | Statement + confidence slider. |
| 87 | Dashboard mental model | src/components/dashboard/MentalModelCard.jsx | Name + Wikipedia summary + link. |
| 88 | Calibration accuracy chart | src/components/stats/CalibrationChart.jsx | Scatter: expected vs actual accuracy. |
| 89 | ExportDAO + UI | src/dao/ExportDAO.js, src/components/export/ExportPage.jsx | Dump all data to Markdown + JSON. |
| 90 | Import insights UI | src/components/export/ImportInsights.jsx | Upload file → parse → display action items. |
| 91 | Insights dashboard | src/components/export/InsightsDashboard.jsx | Past imports, act-on checkboxes. |

---

## 17. Discussion Log

### 2026-02-23 — Initial Design Session

1. Growth plan designed (8 pillars, XP game, streaks, achievements, reading list)
2. Decided on web app hosted on GitHub Pages
3. Auth: PAT-based + encrypted backup in repo (zero infrastructure)
4. Encryption: password-based AES-256-GCM, hash in repo, change-password in-app
5. Data: encrypted JSON in public repo, localStorage cache, auto-sync
6. Architecture: DAO layer + Storage layer (IStorage interface), extensible
7. Two-repo model: template repo (open source) + instance repo (user's fork with data)
8. Release plan: R0 → R1 → R2 → R3 → R4 → R5
9. PWA confirmed working on iOS 16.4+ and Android
10. Service worker = browser-native JS, no VM or server cost
11. Name: **Arc**

### 2026-02-23 — R4 Scope & Brain Games

- Tracking modules: Habits, Mood, Goals, Journal, People, Finance, Travel
- Gamification: Skill Trees, Daily Quests, Combos, Rest Days, Challenges, Boss Battles, Seasons, Critical Hits, Themes
- Brain games: 3 sections (Practice, Puzzles, Speed Practice). ALL support optional timer. Sections differ by FOCUS.
- Content strategy: client-side generation + free APIs (Open Trivia DB, Numbers API, Wikipedia) + curated lightweight indexes
- "Did You Know?": Wikipedia API from topic categories. Zero hand-written content.
- Mental Models: lightweight config index (name → wiki article). Content fetched live.
- Fermi estimates + Calibration questions: curated in config (quality matters for explanations).
- Logic riddles: generated + Open Trivia DB + small classic seed (~40).
- Data export: structured Markdown + JSON for LLM analysis. Import insights back as trackable items.
### 2026-02-23 — Auth Redesign: OAuth → PAT

**Problem:** OAuth web flow requires client_secret, which requires a backend (Cloudflare Worker). Device Flow has CORS issues requiring a proxy. Both add infrastructure the user doesn't want.

**Solution:** PAT-based auth with encrypted repo backup.
- User generates a fine-grained PAT once (scoped to their repo, contents:write only)
- PAT encrypted with user's password, stored in /data/auth.enc.json in the public repo
- On new device / cache cleared: fetch encrypted PAT from public repo (no auth needed), decrypt with password → PAT recovered
- Zero infrastructure. Zero CORS issues. Zero OAuth complexity.
- Only downside vs OAuth: 2-minute PAT setup (with guided instructions in-app)

**Lesson:** Should have solved the "cache clearing" concern with encrypted backup instead of jumping to OAuth. The encrypted backup makes PAT strictly better for this use case.

### Principles

- Prefer APIs and generation over config wherever possible.
- Config = lightweight indexes or high-quality items where explanation quality matters.
- Never hand-write large content banks.
- DAO layer + Storage layer separation. UI never touches Storage directly.
- All games support optional timer. Sections differ by focus, not by timing.
