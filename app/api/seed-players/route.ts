import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { seedPlayers } from '@/lib/players/seed-data'

// Use service role for server-side seeding (bypasses RLS)
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    // Fall back to anon key — will work if RLS allows inserts
    return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  return createClient(url, serviceKey)
}

export async function POST(request: Request) {
  // Simple auth check — require a secret header
  const authHeader = request.headers.get('x-seed-secret')
  if (authHeader !== (process.env.SEED_SECRET || 'the-xi-seed-2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()

  // Check if players already exist
  const { count } = await supabase
    .from('players')
    .select('id', { count: 'exact', head: true })

  if (count && count > 0) {
    return NextResponse.json({
      message: `Players table already has ${count} players. Delete existing data first to re-seed.`,
      count,
    })
  }

  // Insert seed data in batches
  const players = seedPlayers()
  const batchSize = 100
  let inserted = 0

  for (let i = 0; i < players.length; i += batchSize) {
    const batch = players.slice(i, i + batchSize)
    const { error } = await supabase.from('players').insert(batch)
    if (error) {
      return NextResponse.json(
        { error: `Failed at batch ${i}: ${error.message}`, inserted },
        { status: 500 }
      )
    }
    inserted += batch.length
  }

  return NextResponse.json({
    message: `Successfully seeded ${inserted} players`,
    count: inserted,
  })
}
