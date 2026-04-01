# THE XI — Game Design Document

## Overview

**Name:** The XI
**Type:** World Cup 2026 Player Draft Game
**Platform:** Progressive Web App (iOS + Android)
**Stack:** Next.js + Supabase + Vercel
**Data Source:** API-Football (free tier — 100 requests/day)
**Cost to Run:** Zero. Free tier only across all services.
**Players:** 4–6 friends per private league

---

## Concept

The XI is a social World Cup draft game. Before the 2026 FIFA World Cup kicks off, you and your mates join a private league, draft a squad of real players from the tournament, choose a formation, and earn points based on what your players do on the pitch. A live leaderboard, activity feed, and group chat keep the banter flowing across every stage of the tournament.

---

## Core Loop

1. **Create or join a league** using a shareable invite code
2. **Draft your squad of 15 players** across four positions in an async snake draft
3. **Choose a formation** (4-4-2, 4-3-3, or 4-5-1) to set your starting XI
4. **Earn points automatically** as your players perform in real World Cup matches
5. **Track the leaderboard** and talk rubbish in the group chat
6. **Redraft after each stage** — new draft windows open after the group stage and each knockout round
7. **Winner is crowned** after the final

---

## Squad Structure

Each participant drafts a squad of **15 players** with the following positional requirements:

| Position | Slots |
|---|---|
| Goalkeeper | 2 |
| Defender | 5 |
| Midfielder | 5 |
| Attacker | 3 |
| **Total** | **15** |

During the draft, the player browser is filtered by these four positions. Each pick must fill a remaining squad slot — you cannot draft a 6th defender or a 4th attacker.

---

## Formations

After completing their draft, each participant selects a starting formation from the following options:

| Formation | GK | DEF | MID | ATT |
|---|---|---|---|---|
| 4-4-2 | 1 | 4 | 4 | 2 |
| 4-3-3 | 1 | 4 | 3 | 3 |
| 4-5-1 | 1 | 4 | 5 | 1 |

- The formation determines the **starting XI** — 11 players who earn full points
- The remaining 4 players sit on the **bench** and still earn points, but at a reduced rate (50% of all points, rounded down)
- Participants can change their formation and starting XI selection at any time between matches
- If a participant does not set a formation, the default is 4-4-2 with players auto-assigned by draft order

---

## Draft System

### Draft Windows

Drafts do not happen once — they occur at **multiple stages** of the tournament:

| Window | When It Opens | Purpose |
|---|---|---|
| **Initial Draft** | Before the tournament starts | Build your original 15-player squad |
| **Post-Group Stage Draft** | After all group stage matches are complete | Replace eliminated players and reshape your squad |
| **Post-Round of 32 Draft** | After the Round of 32 is complete | Replace eliminated players |
| **Post-Round of 16 Draft** | After the Round of 16 is complete | Replace eliminated players |
| **Post-Quarter-Finals Draft** | After the Quarter-Finals are complete | Replace eliminated players |
| **Post-Semi-Finals Draft** | After the Semi-Finals are complete | Final replacement window |

### How Each Draft Window Works

- During each window, participants can **replace any players whose nations have been eliminated** with available free agents still in the tournament
- Replacements must match the **same position** as the player being dropped (e.g. a knocked-out defender must be replaced with an available defender)
- **Pick order follows the current leaderboard in reverse** — last place picks first
- Each participant has a **6-hour async window** to make their picks when it is their turn
- **If a participant confirms their picks early**, the window immediately opens for the next participant — no need to wait for the timer to expire
- If a participant **misses the 6-hour window**, the system **auto-picks a randomly selected available player** in the required position (not the highest-rated — purely random)
- If a participant **does not replace an eliminated player at all**, the system **auto-assigns a randomly selected available player** in that position so no squad slot is left empty

### Initial Draft Format

- **Snake draft** — pick order reverses each round
- **15 rounds** — one player per round
- Picks must respect the positional limits (2 GK, 5 DEF, 5 MID, 3 ATT)
- **Draft order is randomised** when the league is created
- All participants can see the full draft order before the draft begins

### Draft Board

- Full grid showing all picks by round and participant
- Available player browser with search, nation filter, and position filter
- Countdown timer for the current pick
- "Your turn" alert state
- Visual indicator when a pick was auto-assigned

---

## Scoring System

Points are awarded automatically based on real match events pulled from the API-Football free tier.

### Points Table

| Event | Points |
|---|---|
| Goal scored | +5 |
| Assist | +3 |
| Clean sheet (GK/DEF only, must play 60+ mins) | +3 |
| Appearance (60+ minutes played) | +2 |
| Appearance (under 60 minutes played) | +1 |
| Own goal | -2 |
| Yellow card | -1 |
| Red card | -3 |

### Scoring Rules

- Points are calculated per match and added to the participant's total
- **Starting XI players** earn full points
- **Bench players** earn 50% of all points (rounded down)
- Only events during regular time and extra time count — **penalty shootout goals do not count**
- A player must feature in the match (start or come on as a sub) for any points to apply
- Clean sheets only apply to goalkeepers and defenders who play 60+ minutes
- Appearance points are based on total minutes in regular time (90 minutes) — extra time minutes do not count towards the 60-minute threshold
- Own goals result in -2 points for the player who scored them (awarded to whichever participant drafted that player)

### Tiebreakers

If two or more participants are tied on total points, the tie is broken by:
1. Most goals scored by drafted players
2. Most assists by drafted players
3. Fewest yellow and red cards by drafted players
4. Alphabetical by display name

---

## Screens

### 1. Home / Dashboard
- Current league standings (leaderboard)
- Next match featuring a drafted player
- Quick link to the activity feed
- Tournament progress indicator (group stage, R32, R16, QF, SF, F)
- Current formation display with starting XI

### 2. Draft Board
- Full grid showing all picks by round and participant
- Available player browser with search, nation filter, and position filter
- Positional slots remaining indicator (e.g. "2/5 Defenders picked")
- Countdown timer for the current pick
- "Your turn" alert state
- Auto-pick indicator for missed picks
- "Confirm picks" button that immediately advances to the next participant

### 3. My Squad
- Your 15 drafted players displayed in formation view
- Starting XI shown in their formation positions, bench shown below
- Each player card shows: name, nation flag, position, total points earned, and match-by-match breakdown
- Eliminated players are visually marked (greyed out with a strikethrough)
- Formation selector (4-4-2 / 4-3-3 / 4-5-1) with drag-and-drop or tap to swap players between starting XI and bench
- During draft windows, a "Replace" button appears on eliminated players

### 4. Leaderboard
- All participants ranked by total points
- Each row shows: rank, name, total points, points gained today, and current formation
- Tappable to expand and see that participant's full squad and formation

### 5. Activity Feed
- Real-time feed of scoring events: "Tom's Bukayo Saka scored — +5 pts"
- Draft window activity: "Dave replaced Mbappe with Vinicius Jr"
- Formation changes: "Sarah switched to 4-3-3"
- Draft picks during draft phases
- Auto-pick notifications: "Mike missed the window — system picked randomly"
- Sorted newest first

### 6. Group Chat
- Simple text chat for all league participants
- Persistent and scrollable
- Text only — no media uploads to keep it lightweight

### 7. Match Centre
- List of today's World Cup matches with scores
- Tappable to see which drafted players are involved and their events
- Points earned per player per match visible here

### 8. Create / Join League
- Create: generates a unique invite code, sets league name
- Join: enter an invite code to join an existing league
- League lobby shows all joined participants and draft status

---

## Visual Design

### Theme — World Cup 2026 Branding

The app takes direct inspiration from the FIFA World Cup 2026 brand identity, using the official tournament colour palette as its foundation.

### Colour Palette

| Role | Colour | Hex |
|---|---|---|
| Primary (backgrounds, headers) | Dark Charcoal | #1A1A2E |
| Secondary (cards, surfaces) | Deep Navy | #16213E |
| Accent Green | Tournament Green | #3CAC3B |
| Accent Blue | Tournament Blue | #2A398D |
| Accent Red | Tournament Red | #E61D25 |
| Highlight / Gold | Trophy Gold | #FFD700 |
| Text Primary | White | #FFFFFF |
| Text Secondary | Light Grey | #D1D4D1 |
| Muted / Disabled | Dark Grey | #474A4A |

### Usage
- **Tournament Green** (#3CAC3B) — primary action buttons, positive events (goals, points gained), active states
- **Tournament Blue** (#2A398D) — secondary elements, draft board headers, navigation accents
- **Tournament Red** (#E61D25) — negative events (cards, own goals, points lost), alerts, eliminations
- **Trophy Gold** (#FFD700) — leaderboard top position, winner highlights, tournament trophy references
- **Dark Charcoal / Deep Navy** — background layers creating depth
- **Light Grey** — secondary text, borders, subtle dividers

### Typography
- Clean sans-serif font (Inter or similar)
- Bold headings, regular body text
- Scores and points displayed in a prominent, slightly larger weight
- Tournament stage headers in uppercase

### Nation Flags
- Displayed alongside every player and team reference
- Small circular flag icons in squad views and draft board
- Larger flags on match centre cards

### Constraints
- **No emojis anywhere in the UI** — use icons and flag images only
- No gradients
- Minimal and functional — content-first layout
- Mobile-first responsive design optimised for phone screens
- Dark background base throughout

---

## Technical Architecture

### Frontend
- **Next.js** (React) hosted on **Vercel** (free tier)
- PWA with service worker for offline caching of static assets
- Installable on iOS and Android home screens
- Responsive mobile-first layout

### Backend / Database
- **Supabase** (free tier) for:
  - User authentication (magic link or email/password)
  - PostgreSQL database for all league, draft, squad, formation, and scoring data
  - **Realtime subscriptions** — all clients subscribe to the same data channels so every participant sees updates instantly with zero discrepancies
  - Row Level Security (RLS) to ensure users can only modify their own data

### Data Sync Strategy
- Supabase Realtime ensures all connected clients receive the same data at the same time
- When the scoring engine writes new points to the database, all participants see the update live
- Draft picks, formation changes, chat messages, and draft window actions are all broadcast via Realtime channels
- **No local-only state for any game data** — everything reads from and writes to Supabase as the single source of truth
- Optimistic UI updates with server confirmation to keep the experience fast

### API Integration (API-Football)
- **Free tier: 100 requests/day, no credit card required**
- A scheduled function (Supabase Edge Function or Vercel Cron) polls API-Football for match events on match days
- Polling strategy:
  - Check for live match events every 10–15 minutes during active matches
  - One final poll after each match to capture the complete event list (goals, assists, cards, own goals, lineups, minutes played)
  - On non-match days, minimal or zero API calls
- Match event data is written to Supabase and the scoring engine processes it against all leagues
- **Budget management:** with 3–4 matches per day during the group stage, polling every 15 minutes per match uses roughly 40–60 requests/day, well within the 100/day limit

### Player Data Bootstrap
- Before the tournament, populate the full player database using API-Football's squad endpoints
- This is a one-time bulk operation using a portion of the daily API budget over a few days
- Supplement with the free openfootball/worldcup.json GitHub dataset for fixtures and basic squad data
- Players are categorised into four positions: Goalkeeper, Defender, Midfielder, Attacker

---

## Data Model

### Tables

- **leagues** — id, name, invite_code, created_by, draft_status, draft_order (JSON array), current_stage, created_at
- **league_members** — id, league_id, user_id, display_name, formation (enum: 4-4-2 / 4-3-3 / 4-5-1), joined_at
- **players** — id, api_football_id, name, nation, nation_flag_url, position (enum: GK / DEF / MID / ATT), is_eliminated, eliminated_at
- **draft_picks** — id, league_id, user_id, player_id, round, pick_number, draft_window (enum: initial / post_groups / post_r32 / post_r16 / post_qf / post_sf), is_auto_pick, is_starting_xi, picked_at
- **squad_slots** — id, league_id, user_id, player_id, position, is_starting, updated_at
- **match_events** — id, match_id, player_id, event_type (enum: goal / assist / clean_sheet / own_goal / yellow / red / appearance_full / appearance_sub), minute, points_awarded, match_date
- **scores** — id, league_id, user_id, total_points, updated_at
- **transfers** — id, league_id, user_id, dropped_player_id, picked_player_id, draft_window, transferred_at, is_auto_pick
- **chat_messages** — id, league_id, user_id, message, sent_at
- **activity_feed** — id, league_id, event_type, description, user_id, player_id, created_at
- **draft_windows** — id, league_id, window_type, status (enum: pending / active / complete), opens_at, closes_at

---

## Edge Cases and Rules

- **Missed draft pick:** system auto-picks a **randomly selected** available player in the required position (not the highest-rated)
- **Non-replaced eliminated player:** system automatically assigns a **randomly selected** available player in the same position so no squad slot is left empty
- **Early pick confirmation:** when a participant confirms their draft picks before the 6-hour window expires, the window **immediately opens for the next participant**
- **Tie on points:** broken by most goals, then most assists, then fewest cards, then alphabetical
- **Player injured/withdrawn before tournament:** if a nation replaces a player in their official squad, the drafted version is flagged and the participant can swap during the next available draft window
- **Match abandoned:** follow official FIFA ruling on the result
- **Penalty shootout goals:** do not count for scoring — only events in regular and extra time
- **Player plays out of position:** clean sheet eligibility and positional classification based on the player's registered position in the API data
- **Bench player scoring:** all points earned by bench players are halved (rounded down) before being added to the participant's total
- **Appearance minutes:** based on regular 90-minute match time only — extra time minutes do not count towards the 60-minute appearance threshold
- **Formation not set:** defaults to 4-4-2 with players auto-assigned to starting XI by draft order

---

## Notifications

All notifications are delivered via the in-app activity feed only (no external push notification service) to keep costs at zero.

- "It's your turn to pick" — during any draft window
- "Draft window is now open" — after each tournament stage completes
- "[Name] confirmed their picks — you're up next" — when the previous participant confirms early
- "Match starting soon" — when a match features one of your drafted players
- "Auto-pick applied" — when the system randomly assigns a player due to a missed window
- "[Name] changed formation to 4-3-3" — formation change alerts

---

## Tournament Timeline

| Phase | Draft Activity | Scoring |
|---|---|---|
| **Pre-tournament** | Initial draft (15 players each) | — |
| **Group stage** | — | Points accumulate from all group matches |
| **Post-group stage** | Draft window opens — replace eliminated players | — |
| **Round of 32** | — | Points accumulate |
| **Post-R32** | Draft window opens | — |
| **Round of 16** | — | Points accumulate |
| **Post-R16** | Draft window opens | — |
| **Quarter-finals** | — | Points accumulate |
| **Post-QF** | Draft window opens | — |
| **Semi-finals** | — | Points accumulate |
| **Post-SF** | Final draft window opens | — |
| **Final** | — | Last points awarded, winner crowned |

---

## Out of Scope (V1)

- Paid tiers or monetisation
- Public/open leagues (V1 is private invite-only)
- Player trading between participants
- More than three formation options
- Push notifications via native APIs (would require a paid service)
- Desktop-optimised layout (mobile-first only for V1)
- Player images/headshots (use nation flags and position badges instead)

---

## Summary

The XI is a zero-cost, mobile-first PWA where 4–6 friends draft real World Cup 2026 players, build squads across four positions, choose formations, and compete on a shared leaderboard powered by live match data. Supabase Realtime ensures every participant always sees identical, up-to-date information with no discrepancies. Multiple draft windows throughout the tournament keep the game strategic and engaging from the group stage through to the final. The World Cup 2026 branded colour scheme with tournament greens, blues, reds, and trophy gold gives it an authentic match-day feel — no emojis, just clean football.
