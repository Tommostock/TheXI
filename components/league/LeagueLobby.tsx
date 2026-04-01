'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { startDraft } from '@/lib/draft/actions'
import { Copy, Check, Users, Shuffle, Play } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type League = Tables<'leagues'>
type LeagueMember = Tables<'league_members'>

export function LeagueLobby({
  league: initialLeague,
  members: initialMembers,
  currentUserId,
  isCreator,
}: {
  league: League
  members: LeagueMember[]
  currentUserId: string
  isCreator: boolean
}) {
  const router = useRouter()
  const [league, setLeague] = useState(initialLeague)
  const [members, setMembers] = useState(initialMembers)
  const [copied, setCopied] = useState(false)
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState('')

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to new members joining
    const membersChannel = supabase
      .channel(`league-members-${league.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'league_members',
          filter: `league_id=eq.${league.id}`,
        },
        (payload) => {
          setMembers((prev) => {
            if (prev.some((m) => m.id === (payload.new as LeagueMember).id)) return prev
            return [...prev, payload.new as LeagueMember]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leagues',
          filter: `id=eq.${league.id}`,
        },
        (payload) => {
          setLeague(payload.new as League)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(membersChannel)
    }
  }, [league.id])

  async function copyCode() {
    await navigator.clipboard.writeText(league.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const draftOrder = (league.draft_order as string[]) || []

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{league.name}</h1>
        <span className="rounded-full bg-tournament-blue/20 px-3 py-1 text-xs font-medium text-tournament-blue">
          {league.draft_status === 'pre_draft' ? 'Pre-Draft' : league.draft_status}
        </span>
      </div>

      {/* Invite Code */}
      <div className="mt-4 rounded-lg border border-dark-grey bg-deep-navy p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-light-grey">
          Invite Code
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-2xl font-mono font-bold tracking-widest text-trophy-gold">
            {league.invite_code}
          </span>
          <button
            onClick={copyCode}
            className="rounded-md border border-dark-grey p-2 text-light-grey transition-colors hover:border-tournament-green hover:text-tournament-green"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <p className="mt-2 text-xs text-light-grey">
          Share this code with your mates to join
        </p>
      </div>

      {/* Participants */}
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-light-grey" />
          <h2 className="text-sm font-medium uppercase tracking-wider text-light-grey">
            Participants ({members.length}/6)
          </h2>
        </div>

        <div className="mt-3 space-y-2">
          {members.map((member, index) => {
            const draftPosition = draftOrder.indexOf(member.user_id) + 1
            return (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-dark-grey bg-deep-navy px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-tournament-blue text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="font-medium text-white">
                    {member.display_name}
                  </span>
                  {member.user_id === currentUserId && (
                    <span className="text-xs text-tournament-green">(You)</span>
                  )}
                  {member.user_id === league.created_by && (
                    <span className="text-xs text-trophy-gold">Host</span>
                  )}
                </div>
                {isCreator && draftPosition > 0 && (
                  <span className="text-xs text-light-grey">
                    Draft #{draftPosition}
                  </span>
                )}
              </div>
            )
          })}

          {members.length < 6 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-dark-grey px-4 py-3">
              <span className="text-sm text-dark-grey">
                Waiting for {6 - members.length} more...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Draft Order (Creator only) */}
      {isCreator && members.length >= 2 && (
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <Shuffle size={16} className="text-light-grey" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-light-grey">
              Draft Order
            </h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {draftOrder.map((userId, index) => {
              const member = members.find((m) => m.user_id === userId)
              return (
                <div
                  key={userId}
                  className="flex items-center gap-2 rounded-full border border-dark-grey bg-deep-navy px-3 py-1.5"
                >
                  <span className="text-xs font-bold text-trophy-gold">
                    {index + 1}.
                  </span>
                  <span className="text-sm text-white">
                    {member?.display_name || 'Unknown'}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-light-grey">
            Draft order will be randomised when the draft begins.
          </p>
        </div>
      )}

      {/* Start Draft Button (Creator only, pre-draft, 2+ members) */}
      {isCreator && league.draft_status === 'pre_draft' && members.length >= 2 && (
        <div className="mt-6">
          {startError && (
            <p className="mb-2 text-sm text-tournament-red">{startError}</p>
          )}
          <button
            onClick={async () => {
              setStartError('')
              setStarting(true)
              const result = await startDraft(league.id)
              if (result.error) {
                setStartError(result.error)
                setStarting(false)
              } else {
                router.push(`/draft/${league.id}`)
              }
            }}
            disabled={starting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-tournament-green px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Play size={18} />
            {starting ? 'Starting Draft...' : 'Start Draft'}
          </button>
        </div>
      )}

      {/* Link to Draft (if in progress) */}
      {league.draft_status === 'in_progress' && (
        <div className="mt-6">
          <a
            href={`/draft/${league.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-tournament-green px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Play size={18} />
            Go to Draft Board
          </a>
        </div>
      )}
    </div>
  )
}
