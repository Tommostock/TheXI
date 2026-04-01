# PROMPT.md — The XI Build Prompts

Use the following prompts in sequence with Claude Code. Each phase builds on the previous one. Complete and verify each phase before moving to the next. Reference CLAUDE.md and GDD.md throughout.

---

## Phase 1 — Project Setup and Database

```
Read CLAUDE.md and GDD.md in full before doing anything.

Set up a new Next.js project with TypeScript, Tailwind CSS, and the App Router. Initialise it as a PWA with a manifest.json and basic service worker.

Configure Supabase:
- Set up the Supabase client with environment variables
- Create all database tables as defined in the GDD Data Model section
- Enable Row Level Security on every table
- Set up Supabase Auth (email/password)
- Add Realtime subscriptions config

Create the CSS custom properties for the World Cup 2026 colour palette as defined in CLAUDE.md. Set up Tailwind to use these colours.

Create a basic app shell with bottom navigation (Dashboard, Draft, Squad, Leaderboard, Chat) using the tournament colour scheme. Dark background, no emojis, no gradients.

Do not add any game logic yet — this phase is infrastructure only.
```

---

## Phase 2 — Authentication and League System

```
Read CLAUDE.md and GDD.md for reference.

Build the authentication flow:
- Sign up / log in pages using Supabase Auth (email + password)
- Protected routes — redirect to login if not authenticated
- User display name setup on first login

Build the league system:
- Create League page: user enters a league name, system generates a unique invite code
- Join League page: user enters an invite code to join
- League lobby: shows all joined participants and their ready status
- Maximum 6 participants per league
- League creator can see the randomly generated draft order
- All league data stored in Supabase with Realtime subscriptions so all participants see updates live

No draft logic yet — just the league creation and joining flow.
```

---

## Phase 3 — Player Database Bootstrap

```
Read CLAUDE.md and GDD.md for reference.

Build the player data pipeline:
- Create a server-side script or Edge Function that fetches World Cup 2026 squad data from API-Football
- Map each player to one of four positions: GK, DEF, MID, ATT
- Store all players in the players table with: name, nation, nation_flag_url, position
- Include a fallback to use openfootball/worldcup.json from GitHub if API-Football budget is tight

Create a player browser component:
- Searchable by name
- Filterable by nation and position
- Shows player name, nation flag, and position
- This component will be reused in the draft board

Ensure the player data is accessible to all users via Supabase with appropriate RLS policies.
```

---

## Phase 4 — Draft System (Initial Draft)

```
Read CLAUDE.md and GDD.md for reference. Pay close attention to the Draft System section.

Build the initial draft flow:
- Snake draft with randomised order (set when league is created)
- 15 rounds, one pick per round per participant
- Enforce positional limits: 2 GK, 5 DEF, 5 MID, 3 ATT
- Show remaining positional slots during the draft (e.g. "2/5 Defenders")
- 6-hour async window per pick with a visible countdown timer
- When a participant confirms their pick, the window immediately opens for the next participant — do not wait for the timer
- If the timer expires, auto-pick a RANDOMLY selected available player in the required position (not the highest rated)
- Each drafted player is removed from the available pool for all other participants

Build the draft board screen:
- Grid showing all picks by round and participant
- Highlight the current picker and their countdown
- Integrate the player browser component from Phase 3
- Mark auto-picks with a visual indicator
- "Confirm pick" button

All draft data must be written to Supabase immediately and broadcast via Realtime so all participants see every pick as it happens.
```

---

## Phase 5 — Squad Management and Formations

```
Read CLAUDE.md and GDD.md for reference. Pay close attention to the Formations section.

Build the My Squad screen:
- Display the user's 15 drafted players
- Formation selector: 4-4-2, 4-3-3, 4-5-1
- Visual formation layout showing the starting XI in position
- Bench section below showing the 4 non-starting players
- Tap or drag to swap players between starting XI and bench (must respect formation positional requirements)
- Each player card shows: name, nation flag, position, points earned

Formation rules:
- 4-4-2: 1 GK, 4 DEF, 4 MID, 2 ATT
- 4-3-3: 1 GK, 4 DEF, 3 MID, 3 ATT
- 4-5-1: 1 GK, 4 DEF, 5 MID, 1 ATT
- Default to 4-4-2 if no formation is selected
- Formation changes are saved to Supabase immediately

Store starting XI vs bench status in the squad_slots table. All changes broadcast via Realtime.
```

---

## Phase 6 — Scoring Engine

```
Read CLAUDE.md and GDD.md for reference. Pay close attention to the Scoring System section.

Build the scoring engine as a server-side function (Supabase Edge Function or Vercel API route):

1. Poll API-Football for match events on World Cup match days:
   - Goals (with scorer), assists, cards, own goals, lineups, substitutions
   - Poll every 10–15 minutes during live matches
   - Final poll after full-time for complete data

2. Process events and calculate points:
   - Goal: +5
   - Assist: +3
   - Clean sheet (GK/DEF, 60+ mins): +3
   - Appearance 60+ mins: +2
   - Appearance under 60 mins: +1
   - Own goal: -2
   - Yellow card: -1
   - Red card: -3

3. Apply bench multiplier:
   - Starting XI players earn full points
   - Bench players earn 50% of all points, rounded down

4. Write match_events and update scores table
5. Generate activity feed entries for each scoring event (e.g. "Tom's Saka scored — +5 pts")
6. Broadcast updates via Supabase Realtime

Important:
- Appearance threshold uses regular 90-minute match time only (not extra time)
- Penalty shootout goals do not count
- Clean sheets only for GK and DEF who play 60+ minutes
- Own goals deduct from the participant who drafted that player
- Stay within the 100 requests/day API-Football limit
```

---

## Phase 7 — Draft Windows (Post-Stage Replacements)

```
Read CLAUDE.md and GDD.md for reference. Pay close attention to the Transfer Windows section.

Build the post-stage draft window system:

1. After each tournament stage completes (group stage, R32, R16, QF, SF), open a draft window
2. Mark eliminated nations' players as eliminated in the players table
3. Identify which participants have eliminated players in their squad

Draft window rules:
- Pick order follows the REVERSE of the current leaderboard (last place picks first)
- Each participant has 6 hours to replace eliminated players with available free agents
- Replacements must be the SAME POSITION as the dropped player
- Early confirmation immediately opens the window for the next participant
- Missed window: system auto-assigns a RANDOMLY selected available player in that position
- If a user does not manually replace an eliminated player, the system auto-assigns a random available player in the same position — no squad slot is ever left empty

4. Update squad_slots table with new players
5. Generate activity feed entries for all replacements
6. Broadcast all changes via Realtime

Track draft windows in the draft_windows table with status: pending, active, complete.
```

---

## Phase 8 — Leaderboard and Match Centre

```
Read CLAUDE.md and GDD.md for reference.

Build the Leaderboard screen:
- All league participants ranked by total points
- Each row: rank, display name, total points, points gained today
- #1 position highlighted with Trophy Gold
- Tappable rows to expand and see that participant's full squad and formation
- Tiebreaker display if tied (most goals, then assists, then fewest cards, then alphabetical)
- Live updates via Supabase Realtime

Build the Match Centre screen:
- List of today's World Cup matches with live scores
- Each match is tappable to show which drafted players are involved
- Per-player points breakdown within each match
- Visual indicators for goals, assists, cards, own goals
- Data pulled from the match_events table (populated by the scoring engine)
```

---

## Phase 9 — Activity Feed and Group Chat

```
Read CLAUDE.md and GDD.md for reference.

Build the Activity Feed screen:
- Real-time feed of all league events, newest first
- Event types: scoring events, draft picks, transfers, formation changes, auto-pick notifications
- Format examples:
  - "Tom's Bukayo Saka scored — +5 pts"
  - "Dave replaced Mbappe with Vinicius Jr"
  - "Sarah switched to 4-3-3"
  - "Mike missed the window — system picked randomly"
- Subscribe to the activity_feed table via Supabase Realtime

Build the Group Chat screen:
- Simple text-only chat for all league participants
- Messages stored in chat_messages table
- Persistent and scrollable, newest at bottom
- Display name and timestamp on each message
- No media uploads — text only
- Subscribe via Supabase Realtime for instant delivery
- No emojis in any UI elements (users can type what they want, but the UI itself uses no emojis)
```

---

## Phase 10 — Dashboard and Polish

```
Read CLAUDE.md and GDD.md for reference.

Build the Home Dashboard screen:
- Mini leaderboard (top 3 + current user position)
- Next match featuring one of the user's drafted players
- Current formation thumbnail
- Tournament progress indicator showing the current stage
- Quick links to activity feed and draft board
- Draft window alert banner when a window is active

Final polish:
- Verify all Supabase Realtime subscriptions work correctly — every user must see identical data at all times with zero discrepancies
- Test the full draft flow end-to-end (initial draft + post-stage windows)
- Test scoring engine with sample match data
- Verify auto-pick (random) works correctly for missed windows
- Verify eliminated player auto-replacement works
- Ensure all screens respect the World Cup 2026 colour palette
- Confirm zero emojis in any UI element
- Confirm the app is installable as a PWA on iOS and Android
- Add loading states and error handling on all screens
- Verify the app stays within the API-Football 100 requests/day limit
```

---

## Notes for Claude Code

- Always reference CLAUDE.md before starting any phase
- All game data must live in Supabase — never use localStorage for game state
- Never expose the API-Football key in client-side code
- All API-Football calls must be server-side (Edge Functions or API routes)
- Use Supabase Realtime on every table that affects what users see
- The colour palette must be consistent across every screen
- No emojis, no gradients, mobile-first throughout
- If you are unsure about a game rule, check the GDD
