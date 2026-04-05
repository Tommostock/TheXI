/**
 * Active Hours Draft Timing
 *
 * Draft pick timers only count down during active hours (default 9am–9pm).
 * Overnight the timer pauses and resumes at the next day's active start.
 *
 * Example: from=8:55pm, windowMinutes=16, activeStart=9, activeEnd=21
 *   → 5 active mins remain today (8:55pm–9:00pm)
 *   → 11 mins continue from 9:00am tomorrow
 *   → deadline = 9:11am next day
 */

export const DEFAULT_ACTIVE_START = 9    // 9am
export const DEFAULT_ACTIVE_END = 21     // 9pm
export const DEFAULT_PICK_WINDOW_MINUTES = 16

/**
 * Calculate the wall-clock deadline for a pick, counting only active hours.
 */
export function calculatePickDeadline(
  from: Date,
  windowMinutes: number,
  activeStart = DEFAULT_ACTIVE_START,
  activeEnd = DEFAULT_ACTIVE_END
): Date {
  let remaining = windowMinutes
  let cursor = new Date(from)

  // Snap cursor into the active window if outside it
  const cursorFractionalHour = cursor.getHours() + cursor.getMinutes() / 60 + cursor.getSeconds() / 3600
  if (cursorFractionalHour < activeStart) {
    cursor.setHours(activeStart, 0, 0, 0)
  } else if (cursorFractionalHour >= activeEnd) {
    cursor.setDate(cursor.getDate() + 1)
    cursor.setHours(activeStart, 0, 0, 0)
  }

  // Accumulate active minutes, skipping overnight gaps
  while (remaining > 0) {
    const endOfPeriod = new Date(cursor)
    endOfPeriod.setHours(activeEnd, 0, 0, 0)

    const minutesAvailable = Math.max(0, (endOfPeriod.getTime() - cursor.getTime()) / 60000)

    if (remaining <= minutesAvailable) {
      return new Date(cursor.getTime() + remaining * 60000)
    }

    remaining -= minutesAvailable
    cursor = new Date(cursor)
    cursor.setDate(cursor.getDate() + 1)
    cursor.setHours(activeStart, 0, 0, 0)
  }

  return cursor
}

/**
 * Returns true if the current time is past the deadline.
 */
export function isDeadlinePassed(deadline: Date | string): boolean {
  return new Date(deadline).getTime() <= Date.now()
}
