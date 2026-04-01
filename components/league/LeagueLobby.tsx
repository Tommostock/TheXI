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
        <span className="rounded-full bg-wc-blue/20 px-3 py-1 text-xs font-medium text-wc-blue">
          {league.draft_status === 'pre_draft' ? 'Pre-Draft' : league.draft_status}
        </span>
      </div>

      {/* Invite Code */}
      <div className="mt-4 rounded-lg border border-border bg-bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          Invite Code
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-2xl font-mono font-bold tracking-widest text-wc-gold">
            {league.invite_code}
          </span>
          <button
            onClick={copyCode}
            className="rounded-md border border-border p-2 text-text-secondary transition-colors hover:border-wc-teal hover:text-wc-teal"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <p className="mt-2 text-xs text-text-secondary">
          Share this code with your mates to join
        </p>
      </div>

      {/* Participants */}
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-text-secondary" />
          <h2 className="text-sm font-medium uppercase tracking-wider text-text-secondary">
            Participants ({members.length}/6)
          </h2>
        </div>

        <div className="mt-3 space-y-2">
          {members.map((member, index) => {
            const draftPosition = draftOrder.indexOf(member.user_id) + 1
            return (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-wc-blue text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="font-medium text-white">
                    {member.display_name}
                  </span>
                  {member.user_id === currentUserId && (
                    <span className="text-xs text-wc-teal">(You)</span>
                  )}
                  {member.user_id === league.created_by && (
                    <span className="text-xs text-wc-gold">Host</span>
                  )}
                </div>
                {isCreator && draftPosition > 0 && (
                  <span className="text-xs text-text-secondary">
                    Draft #{draftPosition}
                  </span>
                )}
              </div>
            )
          })}

          {members.length < 6 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-border px-4 py-3">
              <span className="text-sm text-text-muted">
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
            <Shuffle size={16} className="text-text-secondary" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Draft Order
            </h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {draftOrder.map((userId, index) => {
              const member = members.find((m) => m.user_id === userId)
              return (
                <div
                  key={userId}
                  className="flex items-center gap-2 rounded-full border border-border bg-bg-card px-3 py-1.5"
                >
                  <span className="text-xs font-bold text-wc-gold">
                    {index + 1}.
                  </span>
                  <span className="text-sm text-white">
                    {member?.display_name || 'Unknown'}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-text-secondary">
            Draft order will be randomised when the draft begins.
          </p>
        </div>
      )}

      {/* Start Draft Button (Creator only, pre-draft, 2+ members) */}
      {isCreator && league.draft_status === 'pre_draft' && members.length >= 2 && (
        <div className="mt-6">
          {startError && (
            <p className="mb-2 text-sm text-wc-crimson">{startError}</p>
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-wc-teal px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-wc-teal px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Play size={18} />
            Go to Draft Board
          </a>
        </div>
      )}
    </div>
  )
}
