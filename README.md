# MVStream

A modern movie and series streaming platform built with TypeScript, Vite, and vanilla DOM manipulation. Features a Netflix-inspired UI with dark/light themes, glassmorphism design, and responsive mobile-first layout.

**Live Demo:** [https://akkusuits1.github.io/MVStream/](https://akkusuits1.github.io/MVStream/)

---

## Features

### Core Streaming
- **Hero Scroller** — Auto-rotating featured content carousel with smooth transitions, centered slider indicators, and dynamic action buttons
- **Video Player** — Plyr-based player with HLS stream support, keyboard shortcuts, picture-in-picture, AirPlay, captions, quality settings, and playback speed control
- **Multi-Server Support** — Switch between multiple streaming servers with quality labels (4K, FHD, HD, SD); automatically selects the best available server
- **Continue Watching** — Tracks playback progress and resumes where you left off
- **External Player Launch** — Open streams in VLC, MX Player, or system default player

### Content Discovery
- **Browse Movies & Series** — Grid view with category filtering and sorting
- **Search** — Real-time multi-search across movies, series, and people via TMDB API
- **Details Pages** — Rich movie/series detail views with backdrop hero, cast, genres, ratings, trailers, and season/episode listings for series
- **Trending & Recommendations** — Trending content sections and similar title suggestions

### User Experience
- **Dark/Light Theme** — Toggle between themes with persistent preference saved to localStorage
- **Glassmorphism UI** — Modern frosted glass effects on header, navigation, and cards
- **Responsive Design** — Mobile-first layout with bottom navigation bar on mobile, slide-out hamburger menu
- **Smooth Animations** — Page transitions, card hover effects, and scroll-triggered animations
- **Toast Notifications** — Non-intrusive feedback messages

### User Account
- **Firebase Authentication** — Email/password login and registration
- **User Profiles** — Display name and avatar management
- **Watchlist** — Save movies and series for later
- **Favorites** — Mark and browse favorite content

### Admin Panel
- **Separate Build** — Dedicated admin dashboard (`npm run build:admin`)
- **Content Management** — Add, edit, and delete movies and series
- **Analytics Dashboard** — View counts and usage statistics via Chart.js
- **User Management** — Manage user accounts and roles
- **Settings** — Application configuration including maintenance mode

### Technical
- **Progressive Web App** — Installable with offline support via vite-plugin-pwa and Workbox
- **Firebase Realtime Database** — Live data sync for content, users, and settings
- **TMDB Integration** — Movie posters, backdrops, cast info, trailers, and metadata from The Movie Database
- **Maintenance Mode** — Admin-toggleable maintenance page
- **Zero Framework** — Pure vanilla TypeScript with custom `h()` DOM helper (no React, Vue, or Angular)

---

## Tech Stack

| Category | Technology |
|---|---|
| Language | TypeScript 5.5 |
| Build Tool | Vite 5.3 |
| UI | Vanilla DOM + custom `h()` helper |
| Styling | CSS Custom Properties, Glassmorphism |
| Icons | Lucide Static 0.447 |
| Fonts | Inter (Google Fonts) |
| Auth | Firebase Auth 10.12 |
| Database | Firebase Realtime Database |
| Video Player | Plyr 3.7 |
| Charts | Chart.js 4.4 |
| PWA | vite-plugin-pwa + Workbox |
| External API | The Movie Database (TMDB) API |
| Linting | ESLint + Prettier |
| CI/CD | GitHub Actions to GitHub Pages |

---

## Project Structure

```
MVStream/
├── index.html                  # Main app entry (SPA)
├── admin.html                  # Admin panel entry
├── vite.config.ts              # Vite config with PWA, path aliases
├── tsconfig.json               # TypeScript config
├── package.json
├── public/                     # Static assets (favicon, icons)
├── src/
│   ├── main.ts                 # App bootstrap, router, lazy page loading
│   ├── admin/
│   │   └── main.ts             # Admin panel entry
│   ├── core/
│   │   ├── router.ts           # Hash-based SPA router with params and guards
│   │   ├── store.ts            # Reactive Store<T> with subscribe/set/get
│   │   ├── events.ts           # Custom event bus
│   │   └── utils.ts            # h(), $(), tmdbImage(), and helpers
│   ├── components/
│   │   └── layout/
│   │       ├── Header.ts       # Navigation, theme toggle, profile dropdown
│   │       ├── Footer.ts       # Site footer
│   │       ├── MobileNav.ts    # Bottom navigation bar (mobile)
│   │       └── Toast.ts        # Toast notification system
│   ├── pages/
│   │   ├── HomePage.ts         # Hero scroller + trending content sections
│   │   ├── BrowsePage.ts       # Movie/series grid with filters
│   │   ├── SearchPage.ts       # Multi-search with results grid
│   │   ├── DetailsPage.ts      # Movie/series detail view with seasons
│   │   ├── PlayerPage.ts       # Video player with server switching
│   │   ├── ProfilePage.ts      # User profile management
│   │   ├── SettingsPage.ts     # App settings
│   │   ├── PrivacyPage.ts      # Privacy policy
│   │   ├── AboutPage.ts        # About page
│   │   └── HelpPage.ts         # Help/FAQ page
│   ├── services/
│   │   ├── firebase.ts         # Firebase initialization and config
│   │   ├── auth.ts             # Authentication (login, register, logout)
│   │   ├── tmdb.ts             # TMDB API client and data transformers
│   │   ├── player.ts           # Plyr integration, progress tracking
│   │   ├── storage.ts          # LocalStorage helpers (watchlist, favorites)
│   │   └── index.ts            # Service exports
│   ├── hooks/
│   │   ├── useAuth.ts          # Auth state hook
│   │   ├── useMovies.ts        # Movies data hook
│   │   ├── useSearch.ts        # Search hook
│   │   └── useSettings.ts      # Settings hook
│   ├── types/
│   │   ├── movie.ts            # Movie, Series, Season, Episode types
│   │   ├── user.ts             # User profile types
│   │   ├── api.ts              # TMDB API response types
│   │   └── index.ts            # Type exports
│   ├── utils/
│   │   ├── constants.ts        # App constants
│   │   └── helpers.ts          # Data fetching with Firebase null guards
│   └── styles/
│       ├── tokens.css          # Design tokens (colors, spacing, typography)
│       ├── reset.css           # CSS reset
│       ├── globals.css         # Global component styles
│       └── utilities/
│           ├── animations.css  # Keyframe animations
│           ├── glassmorphism.css # Glass effect utilities
│           ├── responsive.css  # Responsive breakpoint helpers
│           └── 3d-effects.css  # 3D transform effects
├── .github/
│   └── workflows/
│       └── build.yml           # CI/CD: build and deploy to GitHub Pages
└── dist/                       # Production build output
```

---

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- A [Firebase](https://console.firebase.google.com/) project (optional, app runs without it)
- A [TMDB](https://www.themoviedb.org/settings/api) API key (optional, for search and metadata)

### Installation

```bash
# Clone the repository
git clone https://github.com/akkusuits1/MVStream.git
cd MVStream

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Firebase (optional, app degrades gracefully without these)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# TMDB API (for search and metadata)
VITE_TMDB_API_KEY=
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
```

> **Note:** The app works without Firebase. Content is loaded from the database when configured, otherwise uses demo data. If Firebase env vars are missing, auth features are disabled gracefully.

### Development

```bash
npm run dev          # Start dev server on http://localhost:3000
```

### Build

```bash
npm run build        # Build main app to dist/
npm run build:admin  # Build admin panel to dist-admin/
npm run preview      # Preview production build
```

### Code Quality

```bash
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint issues
npm run format       # Prettier format
npm run format:check # Check formatting
npm run typecheck    # TypeScript type check
```

---

## Deployment

The app is deployed automatically to **GitHub Pages** via GitHub Actions.

- **Workflow:** `.github/workflows/build.yml`
- **Trigger:** Push to `main` branch or manual workflow dispatch
- **Output:** [https://akkusuits1.github.io/MVStream/](https://akkusuits1.github.io/MVStream/)

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `FIREBASE_API_KEY` | Firebase API key |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `FIREBASE_DATABASE_URL` | Firebase Realtime Database URL |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `FIREBASE_APP_ID` | Firebase app ID |
| `TMDB_API_KEY` | TMDB API key |

---

## Design System

### Tokens

All visual properties are defined as CSS custom properties in `src/styles/tokens.css`:

- **Colors** — Brand palette (red/orange gradient), status colors, text hierarchy
- **Spacing** — 8px base grid system (`--space-1` through `--space-32`)
- **Typography** — Inter font, rem-based scale from 10px to 64px
- **Shadows** — Layered depth system from `--shadow-xs` to `--shadow-3d`
- **Glass Effects** — Blur, opacity, and border tokens for glassmorphism
- **Transitions** — Easing curves and duration tokens
- **Z-Index** — Consistent stacking context scale

### Themes

- **Dark** (default) — Dark backgrounds with subtle glass overlays
- **Light** — Light backgrounds with adjusted shadows and borders
- Toggle via header button; preference persists in localStorage

### Responsive Breakpoints

| Token | Width | Target |
|---|---|---|
| `--bp-xs` | 320px | Small phones |
| `--bp-sm` | 480px | Large phones |
| `--bp-md` | 640px | Small tablets |
| `--bp-lg` | 768px | Tablets |
| `--bp-xl` | 1024px | Small desktops |
| `--bp-2xl` | 1280px | Desktops |
| `--bp-3xl` | 1536px | Large desktops |

---

## Path Aliases

Configured in both `tsconfig.json` and `vite.config.ts`:

| Alias | Path |
|---|---|
| `@/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@pages/*` | `src/pages/*` |
| `@admin/*` | `src/admin/*` |
| `@core/*` | `src/core/*` |
| `@services/*` | `src/services/*` |
| `@styles/*` | `src/styles/*` |
| `@types` | `src/types/index.ts` |
| `@hooks/*` | `src/hooks/*` |
| `@utils/*` | `src/utils/*` |

---

## License

This project is for educational purposes. All content is provided by non-affiliated third parties via the TMDB API. MVStream does not host or store any media files on its servers.

---

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) — Movie and TV show data
- [Plyr](https://plyr.io/) — Media player
- [Lucide](https://lucide.dev/) — Icon set
- [Firebase](https://firebase.google.com/) — Authentication and database
- [Vite](https://vitejs.dev/) — Build tool
- [Inter](https://rsms.me/inter/) — Type family
