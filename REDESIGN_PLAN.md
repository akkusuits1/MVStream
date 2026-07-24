# MVStream Complete Redesign Plan

## Overview
Redesign MVStream with a modern, responsive, 3D/glassmorphism UI inspired by MoviesAnywhere, Netflix, Disney+, Apple TV+.

---

## 1. Design System

### 1.1 Color Palette
```css
:root {
  /* Core Brand */
  --brand-primary: #E50914;      /* Netflix red - primary actions */
  --brand-primary-dim: #B80710;  /* Hover state */
  --brand-secondary: #FF6B35;    /* Accent orange */
  
  /* Dark Theme Base */
  --bg-primary: #0A0A0A;         /* Near black */
  --bg-secondary: #141414;       /* Card backgrounds */
  --bg-tertiary: #1A1A1A;        /* Elevated surfaces */
  --bg-glass: rgba(20, 20, 20, 0.85); /* Glassmorphism base */
  --bg-glass-strong: rgba(26, 26, 26, 0.95);
  
  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #B3B3B3;
  --text-muted: #808080;
  --text-disabled: #4A4A4A;
  
  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.12);
  --border-strong: rgba(255, 255, 255, 0.2);
  
  /* Status */
  --success: #00D4AA;
  --warning: #FFB800;
  --error: #FF4757;
  --info: #00B4D8;
  
  /* Gradients */
  --gradient-hero: linear-gradient(180deg, rgba(10,10,10,0) 0%, #0A0A0A 100%);
  --gradient-card: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
  --gradient-brand: linear-gradient(135deg, #E50914 0%, #FF6B35 100%);
  --gradient-glass: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%);
}
```

### 1.2 Typography
```css
/* Font: Inter (modern, clean) + Poppins fallback */
--font-primary: 'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Inter', 'Poppins', sans-serif;

/* Scale */
--text-xs: 0.625rem;    /* 10px */
--text-sm: 0.75rem;     /* 12px */
--text-base: 0.875rem;  /* 14px */
--text-lg: 1rem;        /* 16px */
--text-xl: 1.125rem;    /* 18px */
--text-2xl: 1.25rem;    /* 20px */
--text-3xl: 1.5rem;     /* 24px */
--text-4xl: 2rem;       /* 32px */
--text-5xl: 3rem;       /* 48px */
--text-6xl: 4rem;       /* 64px */

/* Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### 1.3 Spacing System (8px base)
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
```

### 1.4 Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### 1.5 Shadows & 3D Effects
```css
/* Layered shadow system for depth */
--shadow-xs: 0 1px 2px rgba(0,0,0,0.3);
--shadow-sm: 0 2px 4px rgba(0,0,0,0.4);
--shadow-md: 0 4px 12px rgba(0,0,0,0.5);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.6);
--shadow-xl: 0 16px 48px rgba(0,0,0,0.7);
--shadow-2xl: 0 24px 64px rgba(0,0,0,0.8);

/* 3D Card hover effect */
--shadow-3d: 0 20px 60px -10px rgba(0,0,0,0.8), 
             0 10px 30px -5px rgba(0,0,0,0.6),
             inset 0 1px 0 rgba(255,255,255,0.1);

/* Glassmorphism */
--glass-blur: blur(20px);
--glass-blur-strong: blur(40px);
```

### 1.6 Transitions & Animation
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-bounce: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);

/* Stagger delays */
--stagger-1: 50ms;
--stagger-2: 100ms;
--stagger-3: 150ms;
--stagger-4: 200ms;
```

---

## 2. 3D & Glassmorphism Effects

### 2.1 Card 3D Transform (MoviesAnywhere style)
```css
.card-3d {
  transform-style: preserve-3d;
  perspective: 1000px;
  transition: transform var(--transition-slow), box-shadow var(--transition-slow);
}

.card-3d:hover {
  transform: translateY(-8px) rotateX(2deg) rotateY(-2deg);
  box-shadow: var(--shadow-3d);
}

.card-3d__inner {
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.card-3d__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity var(--transition-base);
  pointer-events: none;
  border-radius: inherit;
}

.card-3d:hover .card-3d__shine {
  opacity: 1;
}
```

### 2.2 Glassmorphism Panels
```css
.glass-panel {
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.glass-panel-strong {
  background: var(--bg-glass-strong);
  backdrop-filter: var(--glass-blur-strong);
  -webkit-backdrop-filter: var(--glass-blur-strong);
  border: 1px solid var(--border-default);
}
```

### 2.3 Hero Parallax & Depth Layers
```css
.hero {
  position: relative;
  overflow: hidden;
}

.hero__layer {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}

.hero__layer--back { transform: translateZ(-100px) scale(1.2); }
.hero__layer--mid { transform: translateZ(-50px) scale(1.1); }
.hero__layer--front { transform: translateZ(0); }
.hero__layer--content { transform: translateZ(50px); }
```

---

## 3. Component Architecture

### 3.1 Component Hierarchy
```
App
├── Layout
│   ├── Header (sticky, glassmorphism)
│   ├── NavBar (responsive, hamburger menu)
│   └── Footer
├── Pages
│   ├── HomePage
│   │   ├── HeroCarousel (3D parallax)
│   │   ├── SectionRow (multiple)
│   │   │   ├── SectionHeader
│   │   │   └── MovieGrid
│   │   └── ContinueWatching
│   ├── BrowsePage (Movies/Series)
│   │   ├── FilterBar
│   │   └── VirtualizedGrid
│   ├── SearchPage
│   │   ├── SearchInput (with suggestions)
│   │   └── SearchResults
│   ├── DetailsPage
│   │   ├── HeroBanner (with trailer)
│   │   ├── MetaInfo
│   │   ├── ActionButtons
│   │   ├── EpisodeList (for series)
│   │   └── RelatedContent
│   ├── PlayerPage
│   │   ├── VideoPlayer (Plyr + external)
│   │   ├── EpisodeSelector
│   │   └── NextEpisode
│   └── ProfilePage
├── Components
│   ├── MovieCard (3D, multiple variants)
│   ├── MovieCardSkeleton
│   ├── Button (variants: primary, secondary, ghost, icon)
│   ├── Input (search, auth forms)
│   ├── Modal (glassmorphism)
│   ├── Toast/Notification
│   ├── Dropdown
│   ├── Tabs
│   ├── Slider/Carousel
│   ├── RatingStars
│   ├── GenreChip
│   └── LoadingSpinner
├── Admin (separate route)
│   ├── AdminLayout
│   ├── Dashboard
│   ├── ContentManager
│   ├── UserManager
│   └── SettingsPanel
└── Providers
    ├── AuthProvider
    ├── DataProvider (Firebase)
    ├── ThemeProvider
    └── NotificationProvider
```

### 3.2 Movie Card Variants
```typescript
type CardVariant = 
  | 'hero'           // Large, hero carousel - 384x216 (16:9)
  | 'standard'       // Default grid - 192x288 (2:3 poster)
  | 'compact'        // Dense grid - 144x216 (2:3)
  | 'landscape'      // Continue watching - 320x180 (16:9)
  | 'mini';          // Tiny - 96x144 (2:3)

type CardStyle = '3d' | 'flat' | 'glass';
```

### 3.3 Responsive Grid System
```css
/* CSS Grid with auto-fit for true responsiveness */
.movie-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}

/* Breakpoint-specific columns */
@media (min-width: 640px)  { .movie-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 768px)  { .movie-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .movie-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 1280px) { .movie-grid { grid-template-columns: repeat(5, 1fr); } }
@media (min-width: 1536px) { .movie-grid { grid-template-columns: repeat(6, 1fr); } }
@media (min-width: 1920px) { .movie-grid { grid-template-columns: repeat(7, 1fr); } }

/* Variant-specific min widths */
.card-hero { min-width: 300px; }
.card-standard { min-width: 160px; }
.card-compact { min-width: 120px; }
.card-landscape { min-width: 280px; }
.card-mini { min-width: 80px; }
```

---

## 4. Responsive Breakpoints

```css
/* Mobile First */
--bp-xs: 320px;   /* Small phones */
--bp-sm: 480px;   /* Large phones */
--bp-md: 640px;   /* Small tablets */
--bp-lg: 768px;   /* Tablets */
--bp-xl: 1024px;  /* Small laptops */
--bp-2xl: 1280px; /* Laptops */
--bp-3xl: 1536px; /* Desktops */
--bp-4xl: 1920px; /* Large desktops */
--bp-5xl: 2560px; /* Ultra-wide */

/* Container max widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
--container-full: 100%;
```

---

## 5. Pages & Features Specification

### 5.1 Home Page
- **Hero Carousel**: Full-width, auto-play, 3D parallax depth layers, CTA buttons (Play, More Info)
- **Continue Watching**: Horizontal scroll, landscape cards with progress bars
- **Section Rows**: Genre-based, "Trending Now", "Top Rated", "New Releases", "Because You Watched"
- **Each Section**: Header (title + "See All" link) + responsive grid
- **Staggered Entrance Animations**: Cards fade in up with stagger delay

### 5.2 Browse Page (Movies/Series)
- **Filter Bar**: Sticky on scroll, glassmorphism
  - Genres (multi-select chips)
  - Sort (Popularity, Rating, Release Date, A-Z)
  - Year Range slider
  - Content Type (Movies/Series/Both)
- **Virtualized Grid**: For performance with large datasets
- **Infinite Scroll**: Load more on scroll
- **URL State**: Filters in query params for shareable URLs

### 5.3 Search Page
- **Search Input**: Centered, large, glassmorphism, real-time suggestions
- **Recent Searches**: Chips below input
- **Trending Searches**: Popular queries
- **Results**: Tabbed (Movies | Series | People), virtualized grid
- **Empty State**: Illustrative, helpful suggestions
- **Keyboard Navigation**: Arrow keys, Enter, Escape

### 5.4 Details Page
- **Hero Banner**: Full-width backdrop, gradient overlay, title, meta badges, rating, actions
- **Trailer Button**: Opens modal with YouTube embed
- **Action Buttons**: Play (primary), Add to Watchlist, Rate, Share
- **Meta Info**: Genre chips, Year, Duration/Seasons, Cast, Director
- **Synopsis**: Expandable text
- **Episode List** (Series): Season tabs, episode cards with thumbnails, numbers, titles, durations
- **Related Content**: Horizontal scroll section

### 5.5 Player Page
- **Video Player**: Plyr.js customized with brand colors
- **Quality Selector**: Auto, 1080p, 720p, 480p
- **Server Selection**: Dropdown with server names
- **External Player**: VLC/MX Player buttons
- **Episode Selector**: Side panel (desktop) / bottom sheet (mobile)
- **Next Episode**: Auto-play countdown toast
- **Keyboard Shortcuts**: Space (play/pause), Arrow keys (seek), F (fullscreen), M (mute)

### 5.6 Profile Page
- **User Avatar/Info**: Edit profile modal
- **Tabs**: Watchlist | Watch History | Continue Watching | Ratings
- **Grid View**: Switchable list/grid
- **Settings Link**: Navigate to settings

### 5.7 Settings Page
- **Account**: Email, password, delete account
- **Playback**: Auto-play next, quality default, subtitles default
- **Appearance**: Theme (Dark/Light/System), Reduced motion
- **Notifications**: Push, email preferences
- **Data**: Clear cache, export data
- **About**: Version, legal links

---

## 6. Admin Panel Redesign

### 6.1 Design Language
- Consistent with user app but more functional/data-dense
- Sidebar navigation (collapsible)
- Data tables with sorting, filtering, pagination
- Glassmorphism cards for stats
- Same 3D card effects for content preview

### 6.2 Pages
- **Dashboard**: Stats cards (Movies, Series, Users, Views), Chart.js views chart, Recent activity feed
- **Content Manager**: Unified table for Movies & Series, inline edit, bulk actions, TMDB fetch modal
- **Episode Manager**: Nested tree (Series → Seasons → Episodes), drag-drop reorder
- **Server Manager**: CRUD for streaming servers per episode/movie
- **User Manager**: Table with search, filter (role, status), bulk approve/ban
- **Categories Manager**: Drag-drop reorder, icon picker
- **Ad Manager**: Visual ad placement preview, zone ID management
- **Settings**: Maintenance toggle, TMDB key, Firebase config, Backup/Restore

---

## 7. Technical Architecture

### 7.1 Migration Strategy
```
Phase 1: Design System & Component Library
  - Create CSS custom properties (design tokens)
  - Build base components (Button, Card, Input, Modal, Grid)
  - Implement 3D/glassmorphism utilities
  - Set up build system (Vite + ES modules)

Phase 2: Core Layout & Navigation
  - Header, NavBar, Footer, Layout wrapper
  - Routing (Hash-based or History API)
  - Responsive breakpoints testing

Phase 3: Page Implementation (User App)
  - Home Page (Hero, Sections, Continue Watching)
  - Browse Page (Filters, Virtualized Grid)
  - Search Page (Suggestions, Results)
  - Details Page (Hero, Episodes, Related)
  - Player Page (Plyr integration, Episode selector)
  - Profile & Settings

Phase 4: Firebase Integration
  - Auth provider (login, register, logout, password reset)
  - Data provider (movies, series, categories, users)
  - Real-time listeners for live updates
  - Offline support with localStorage sync

Phase 5: Admin Panel
  - Admin layout with sidebar
  - Dashboard with charts
  - Content management (CRUD)
  - User management
  - Settings

Phase 6: Polish & Optimization
  - Animation refinements
  - Performance (lazy loading, virtualization, code splitting)
  - Accessibility (ARIA, keyboard nav, focus management)
  - Cross-browser testing
  - PWA features (service worker, manifest)
```

### 7.2 Recommended Tech Stack
- **Build**: Vite (fast, ES modules, HMR)
- **Language**: TypeScript (type safety for Firebase data)
- **CSS**: Vanilla CSS with Custom Properties (no framework needed)
- **Components**: Vanilla Web Components or lightweight library (Lit, Petite-Vue)
- **Routing**: Custom hash-based router (no dependencies)
- **State**: Simple pub/sub or signals (Preact signals, @preact/signals)
- **Firebase**: Modular SDK v9+
- **Charts**: Chart.js (already used)
- **Player**: Plyr.js (already used)
- **Icons**: FontAwesome (already used) or Lucide (lighter)
- **Fonts**: Inter (self-hosted or Google Fonts with preload)

### 7.3 File Structure
```
src/
├── index.html
├── admin.html
├── main.ts                 # App entry
├── admin-main.ts           # Admin entry
├── styles/
│   ├── tokens.css          # Design tokens (CSS custom props)
│   ├── reset.css           # Normalize
│   ├── globals.css         # Global styles
│   ├── components/         # Component styles
│   │   ├── button.css
│   │   ├── card.css
│   │   ├── modal.css
│   │   ├── grid.css
│   │   ├── header.css
│   │   ├── player.css
│   │   └── ...
│   └── utilities/
│       ├── 3d-effects.css
│       ├── glassmorphism.css
│       ├── animations.css
│       └── responsive.css
├── components/
│   ├── base/               # Primitive components
│   │   ├── Button.ts
│   │   ├── Input.ts
│   │   ├── Modal.ts
│   │   ├── Card.ts
│   │   └── ...
│   ├── composite/          # Composite components
│   │   ├── MovieCard.ts
│   │   ├── HeroCarousel.ts
│   │   ├── SectionRow.ts
│   │   ├── FilterBar.ts
│   │   ├── EpisodeList.ts
│   │   └── ...
│   └── layout/
│       ├── Header.ts
│       ├── NavBar.ts
│       ├── Footer.ts
│       └── Layout.ts
├── pages/
│   ├── HomePage.ts
│   ├── BrowsePage.ts
│   ├── SearchPage.ts
│   ├── DetailsPage.ts
│   ├── PlayerPage.ts
│   ├── ProfilePage.ts
│   └── SettingsPage.ts
├── admin/
│   ├── pages/
│   │   ├── DashboardPage.ts
│   │   ├── ContentPage.ts
│   │   ├── UsersPage.ts
│   │   └── SettingsPage.ts
│   └── components/
│       ├── DataTable.ts
│       ├── StatCard.ts
│       └── ...
├── core/
│   ├── router.ts
│   ├── store.ts
│   ├── events.ts
│   └── utils.ts
├── services/
│   ├── auth.ts
│   ├── firebase.ts
│   ├── tmdb.ts
│   ├── storage.ts
│   └── player.ts
├── types/
│   ├── movie.ts
│   ├── series.ts
│   ├── user.ts
│   └── api.ts
└── hooks/
    ├── useAuth.ts
    ├── useMovies.ts
    ├── useSearch.ts
    └── ...
```

---

## 8. Key Interactions & Animations

### 8.1 Page Transitions
```css
.page-transition {
  animation: pageEnter 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pageEnter {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-exit {
  animation: pageExit 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pageExit {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
}
```

### 8.2 Card Entrance Stagger
```css
.movie-grid .movie-card {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
  animation: cardEnter 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes cardEnter {
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Stagger via inline style: animation-delay: calc(var(--index) * 50ms) */
```

### 8.3 Hero Carousel Auto-play
- 5 second intervals
- Pause on hover/focus
- Keyboard navigation (arrows)
- Touch/swipe support
- Progress indicator

### 8.4 Micro-interactions
- Button: scale(0.98) on active, ripple effect
- Input: border color transition, label float
- Chip: checkmark animation on select
- Tab: sliding indicator
- Modal: backdrop blur in, scale up
- Toast: slide in from bottom-right, swipe to dismiss

---

## 9. Accessibility (WCAG 2.1 AA)

- Semantic HTML5 elements
- Focus visible states (2px solid brand-primary, offset 2px)
- Skip to main content link
- ARIA labels on icon buttons
- Live regions for toasts/notifications
- Keyboard navigation for all interactive elements
- Reduced motion support (`prefers-reduced-motion`)
- Color contrast ratios ≥ 4.5:1
- Touch targets ≥ 44x44px
- Screen reader tested (NVDA, VoiceOver)

---

## 10. Performance Targets

- **LCP** < 2.5s (hero image preload, critical CSS inline)
- **FID** < 100ms (minimal main thread work)
- **CLS** < 0.1 (aspect ratio boxes for images)
- **TTI** < 3.5s (code splitting, lazy loading)
- **Bundle Size** < 150KB gzipped (excluding Firebase, Chart.js, Plyr)
- **Lighthouse** > 90 all categories

---

## 11. Preservation Requirements

### Must Preserve from Current App:
- Firebase Auth (email/password)
- Firebase Realtime Database structure
- TMDB API integration
- Plyr.js video player with HLS support
- External player links (VLC, MX Player)
- Watchlist, Watch History, Continue Watching (localStorage)
- Ad system (Monetag/PropellerAds zones)
- Push notifications (service worker)
- Category filtering
- Search functionality
- Admin panel CRUD operations

### Enhanced in Redesign:
- Offline-first with Service Worker caching
- Real-time updates via Firebase listeners
- Virtualized grids for large datasets
- Better error boundaries & loading states
- Comprehensive keyboard navigation
- Theme persistence (dark/light/system)

---

## 12. Deliverables

1. **Design Token File** (`styles/tokens.css`) - All design decisions as CSS custom properties
2. **Component Library** - Reusable, documented components
3. **User App** - Complete responsive streaming app
4. **Admin Panel** - Complete management dashboard
5. **Documentation** - Component API, theming guide, contribution guide
6. **Build Config** - Vite config, TypeScript config, ESLint/Prettier

---

## 13. Timeline Estimate

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1: Design System | 1-2 weeks | Token system, base components |
| 2: Layout & Routing | 1 week | Shell, navigation, routing |
| 3: User Pages | 3-4 weeks | All 7 pages functional |
| 4: Firebase Integration | 1-2 weeks | Auth, data, real-time |
| 5: Admin Panel | 2-3 weeks | Dashboard, CRUD, settings |
| 6: Polish & Launch | 1-2 weeks | A11y, performance, PWA |
| **Total** | **9-14 weeks** | **Production-ready app** |

---

## 14. Next Steps

1. **Approve this plan** - Confirm direction, adjust scope
2. **Set up repo** - Initialize Vite + TypeScript + ESLint/Prettier
3. **Create design tokens** - Implement `tokens.css` with all custom properties
4. **Build component library** - Start with primitives (Button, Card, Input, Modal)
5. **Implement layout** - Header, NavBar, routing
6. **Iterate page by page** - Home → Browse → Search → Details → Player → Profile → Settings
7. **Admin panel** - Parallel or sequential
8. **Testing & launch** - Cross-browser, device testing, deploy

---

*This plan is a living document. Adjustments expected during implementation.*