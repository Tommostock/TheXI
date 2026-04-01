# CLAUDE.md — The XI

## Project Summary

The XI is a World Cup 2026 player draft game built as a PWA. 4–6 friends join a private league, draft real players, choose formations, and earn points from live match events. Multiple draft windows keep the game active from the group stage through to the final.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL + Realtime + Auth + Edge Functions)
- **Hosting:** Vercel (free tier)
- **Data API:** API-Football via api-sports.io (free tier — 100 requests/day)
- **Supplementary data:** openfootball/worldcup.json (GitHub, public domain)

---

## Critical Constraints

### Cost
- **Everything must be free.** No paid APIs, no paid hosting, no paid services of any kind.
- Supabase free tier: 500MB database, 50k monthly active users, Realtime included
- Vercel free tier: 100GB bandwidth, serverless functions included
- API-Football free tier: 100 requests/day, all endpoints accessible

### Design
- **No emojis anywhere in the UI.** Use SVG icons and flag images only.
- **No gradients.** Flat colours from the World Cup 2026 palette.
- **Mobile-first.** All screens designed for phone viewports. No desktop-specific layouts in V1.
- **Dark background base** using #1A1A2E (Dark Charcoal) and #16213E (Deep Navy).

### Data Integrity
- **Supabase is the single source of truth.** No local-only state for any game data.
- **All clients must see identical data at all times.** Use Supabase Realtime subscriptions on all game-critical tables (scores, draft_picks, squad_slots, activity_feed, chat_messages, draft_windows).
- **Row Level Security (RLS) must be enabled** on all tables. Users can only modify their own squad, picks, and messages.

---

## Colour Palette (World Cup 2026 Branding)

```
--color-bg-primary: #1A1A2E       /* Dark Charcoal — main background */
--color-bg-secondary: #16213E     /* Deep Navy — cards, surfaces */
--color-accent-green: #3CAC3B     /* Tournament Green — actions, positive events */
--color-accent-blue: #2A398D      /* Tournament Blue — headers, navigation */
--color-accent-red: #E61D25       /* Tournament Red — negative events, alerts */
--color-gold: #FFD700             /* Trophy Gold — highlights, #1 position */
--color-text-primary: #FFFFFF     /* White — primary text */
--color-text-secondary: #D1D4D1   /* Light Grey — secondary text */
--color-muted: #474A4A            /* Dark Grey — disabled, muted elements */
```

---

## Project Structure

```
the-xi/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Auth pages (login, signup)
│   ├── dashboard/                # Home dashboard
│   ├── draft/                    # Draft board
│   ├── squad/                    # My squad + formation
│   ├── leaderboard/              # League standings
│   ├── feed/                     # Activity feed
│   ├── chat/                     # Group chat
│   ├── matches/                  # Match centre
│   └── league/                   # Create/join league
├── components/                   # Shared React components
│   ├── ui/                       # Base UI components
│   ├── draft/                    # Draft-specific components
│   ├── squad/                    # Squad and formation components
│   └── match/                    # Match-related components
├── lib/                          # Utilities and helpers
│   ├── supabase/                 # Supabase client, types, queries
│   ├── api-football/             # API-Football integration
│   ├── scoring/                  # Scoring engine logic
│   └── draft/                    # Draft logic (snake order, auto-pick)
├── types/                        # TypeScript type definitions
├── public/                       # Static assets (icons, flags)
└── supabase/
    └── migrations/               # Database migrations
```

---

## Database Tables

All tables live in Supabase PostgreSQL. Migrations go in `supabase/migrations/`.

- **leagues** — league config, invite codes, draft status, tournament stage
- **league_members** — participants, their chosen formation, display names
- **players** — all World Cup 2026 squad players (GK/DEF/MID/ATT), elimination status
- **draft_picks** — every pick across all draft windows, with auto-pick flag
- **squad_slots** — current squad state per user (which players, starting XI vs bench)
- **match_events** — goals, assists, cards, own goals, appearances from API-Football
- **scores** — aggregated point totals per user per league
- **transfers** — replacement picks made during draft windows
- **chat_messages** — group chat messages per league
- **activity_feed** — system-generated feed events
- **draft_windows** — tracks which draft windows are open/closed/complete

---

## Key Game Rules (Reference for Logic)

### Squad: 15 players
- 2 GK, 5 DEF, 5 MID, 3 ATT

### Formations: 4-4-2, 4-3-3, 4-5-1
- Starting XI = full points
- Bench (4 players) = 50% points, rounded down

### Draft Windows
- Initial (pre-tournament), Post-Groups, Post-R32, Post-R16, Post-QF, Post-SF
- 6-hour async window per participant
- Early confirmation immediately opens next participant's window
- Missed window = random auto-pick (not highest-rated)
- Non-replaced eliminated player = random auto-assignment in same position
- Replacement pick order = reverse leaderboard (last place first)

### Scoring
- Goal: +5, Assist: +3, Clean sheet: +3, Appearance 60+: +2, Appearance <60: +1
- Own goal: -2, Yellow: -1, Red: -3
- Penalty shootout goals do not count
- Clean sheets: GK/DEF only, 60+ mins played
- Appearance threshold: based on regular 90-min time only

### Tiebreakers
1. Most goals  2. Most assists  3. Fewest cards  4. Alphabetical

---

## API-Football Integration Notes

- **Base URL:** https://v3.football.api-sports.io/
- **Auth:** x-apisports-key header
- **Free tier:** 100 requests/day, all endpoints, current season only
- **Key endpoints:**
  - `/fixtures?league=1&season=2026` — World Cup fixtures
  - `/fixtures/events?fixture={id}` — match events (goals, cards, subs)
  - `/fixtures/lineups?fixture={id}` — starting lineups + subs
  - `/fixtures/statistics?fixture={id}` — match stats
  - `/players/squads?team={id}` — full squad list
- **Polling strategy:** every 10–15 mins during live matches, final poll after FT
- **Budget:** ~40–60 requests on busy match days, well within 100/day

---

## PWA Requirements

- `manifest.json` with app name "The XI", World Cup 2026 themed icons
- Service worker for offline caching of static assets (app shell, icons, flags)
- Installable on iOS (Add to Home Screen) and Android
- Viewport meta tag for mobile optimisation
- No desktop-specific breakpoints in V1

---

## Coding Conventions

- Use TypeScript strict mode
- Functional React components with hooks only (no class components)
- Use Supabase client from `@supabase/supabase-js`
- All database queries through typed helper functions in `lib/supabase/`
- Tailwind CSS only — no CSS modules, no styled-components
- Use CSS custom properties for the colour palette (defined above)
- All API-Football calls go through server-side functions only (never expose API key to client)
- Error boundaries on all major page components
- Loading states on all data-fetching components

---

## Things to Avoid

- Do not use any paid services or APIs
- Do not use emojis in any UI text, buttons, labels, or notifications
- Do not use gradients in any styling
- Do not store game state in localStorage or client-side only — always Supabase
- Do not expose the API-Football key in client-side code
- Do not build desktop-specific layouts
- Do not add player headshot images (use nation flags and position badges)
- Do not implement push notifications (would require a paid service)
