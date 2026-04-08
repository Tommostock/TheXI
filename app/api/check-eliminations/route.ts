import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkAndProcessEliminations } from '@/lib/tournament/eliminations'

/**
 * POST /api/check-eliminations
 *
 * Manually trigger elimination detection.
 * Also called automatically from the live-poll endpoint.
 *
 * Checks API-Football for completed tournament stages,
 * determines which nations are eliminated, and opens
 * replacement draft windows for all leagues.
 */

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('x-seed-secret')
  if (authHeader !== (process.env.SEED_SECRET || 'the-xi-seed-2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdmin()
  const result = await checkAndProcessEliminations(supabase)

  return NextResponse.json(result)
}
