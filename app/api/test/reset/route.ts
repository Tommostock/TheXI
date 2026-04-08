import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TEST_LEAGUE_ID = '22222222-2222-2222-2222-222222222222'
const TOM_ID = '42c16e22-4291-4eaf-9bca-c4ff7fd2a727'
const DAVE_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
const JAKE_ID = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(request: Request) {
  if (request.headers.get('x-seed-secret') !== (process.env.SEED_SECRET || 'the-xi-seed-2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdmin()

  // Delete all existing test data (order matters for FK constraints)
  await supabase.from('activity_feed').delete().eq('league_id', TEST_LEAGUE_ID)
  await supabase.from('transfers').delete().eq('league_id', TEST_LEAGUE_ID)
  await supabase.from('match_events').delete().neq('id', '00000000-0000-0000-0000-000000000000') // delete all
  await supabase.from('scores').delete().eq('league_id', TEST_LEAGUE_ID)
  await supabase.from('squad_slots').delete().eq('league_id', TEST_LEAGUE_ID)
  await supabase.from('draft_picks').delete().eq('league_id', TEST_LEAGUE_ID)
  await supabase.from('draft_windows').delete().eq('league_id', TEST_LEAGUE_ID)
  await supabase.from('league_members').delete().eq('league_id', TEST_LEAGUE_ID)
  await supabase.from('leagues').delete().eq('id', TEST_LEAGUE_ID)

  // Also clean up the old test league
  await supabase.from('activity_feed').delete().eq('league_id', '11111111-1111-1111-1111-111111111111')
  await supabase.from('scores').delete().eq('league_id', '11111111-1111-1111-1111-111111111111')
  await supabase.from('squad_slots').delete().eq('league_id', '11111111-1111-1111-1111-111111111111')
  await supabase.from('draft_picks').delete().eq('league_id', '11111111-1111-1111-1111-111111111111')
  await supabase.from('draft_windows').delete().eq('league_id', '11111111-1111-1111-1111-111111111111')
  await supabase.from('league_members').delete().eq('league_id', '11111111-1111-1111-1111-111111111111')
  await supabase.from('leagues').delete().eq('id', '11111111-1111-1111-1111-111111111111')

  // Ensure bot users exist in auth.users
  for (const [userId, email] of [
    [TOM_ID, 'tom@thexi.test'],
    [DAVE_ID, 'dave@thexi.test'],
    [JAKE_ID, 'jake@thexi.test'],
  ] as [string, string][]) {
    const { data: existing } = await supabase.auth.admin.getUserById(userId)
    if (!existing?.user) {
      await supabase.auth.admin.createUser({
        user_id: userId,
        email,
        password: 'testpassword123',
        email_confirm: true,
      })
    }
  }

  // Reset all players to non-eliminated
  await supabase.from('players').update({ is_eliminated: false, eliminated_at: null }).neq('id', '00000000-0000-0000-0000-000000000000')

  // Create fresh test league
  const { error: leagueErr } = await supabase.from('leagues').insert({
    id: TEST_LEAGUE_ID,
    name: 'The XI Test League',
    invite_code: 'TEST01',
    created_by: TOM_ID,
    draft_status: 'pre_draft',
    draft_order: [],
    current_stage: 'pre_tournament',
  })

  if (leagueErr) return NextResponse.json({ error: `League: ${leagueErr.message}` }, { status: 500 })

  // Add 3 members
  const { error: membersErr } = await supabase.from('league_members').insert([
    { league_id: TEST_LEAGUE_ID, user_id: TOM_ID, display_name: 'Tom', formation: '4-3-3', team_name: '' },
    { league_id: TEST_LEAGUE_ID, user_id: DAVE_ID, display_name: 'Dave', formation: '4-4-2', team_name: '' },
    { league_id: TEST_LEAGUE_ID, user_id: JAKE_ID, display_name: 'Jake', formation: '4-3-3', team_name: '' },
  ])

  if (membersErr) return NextResponse.json({ error: `Members: ${membersErr.message}` }, { status: 500 })

  return NextResponse.json({
    message: 'Test environment reset successfully',
    league_id: TEST_LEAGUE_ID,
    members: ['Tom', 'Dave', 'Jake'],
    next_step: 'Go to /draft and click Start Draft',
  })
}
