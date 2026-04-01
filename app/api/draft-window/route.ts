import { NextResponse } from 'next/server'
import {
  openDraftWindow,
  closeDraftWindow,
} from '@/lib/draft/windows'

/**
 * POST /api/draft-window
 *
 * Open or close a draft window.
 * Body: { action: 'open' | 'close', league_id, window_type, eliminated_nations? }
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('x-seed-secret')
  if (authHeader !== (process.env.SEED_SECRET || 'the-xi-seed-2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action, league_id, window_type, eliminated_nations } = body

  if (!action || !league_id || !window_type) {
    return NextResponse.json(
      { error: 'Missing required fields: action, league_id, window_type' },
      { status: 400 }
    )
  }

  if (action === 'open') {
    const result = await openDraftWindow(
      league_id,
      window_type,
      eliminated_nations || []
    )
    return NextResponse.json(result)
  }

  if (action === 'close') {
    const result = await closeDraftWindow(league_id, window_type)
    return NextResponse.json(result)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
