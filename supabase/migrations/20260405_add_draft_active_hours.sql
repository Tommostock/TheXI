-- Add scheduled draft and active hours config to leagues
ALTER TABLE leagues
  ADD COLUMN IF NOT EXISTS draft_start_time timestamptz,
  ADD COLUMN IF NOT EXISTS draft_reminder_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS draft_active_start smallint NOT NULL DEFAULT 9,
  ADD COLUMN IF NOT EXISTS draft_active_end smallint NOT NULL DEFAULT 21,
  ADD COLUMN IF NOT EXISTS draft_pick_window_minutes smallint NOT NULL DEFAULT 16;

-- Add per-pick deadline tracking to draft_windows
ALTER TABLE draft_windows
  ADD COLUMN IF NOT EXISTS current_pick_deadline timestamptz;
