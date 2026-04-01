'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Message = Tables<'chat_messages'>

export function GroupChat({
  leagueId,
  currentUserId,
  memberMap,
  initialMessages,
}: {
  leagueId: string
  currentUserId: string
  memberMap: Record<string, string>
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`chat-${leagueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `league_id=eq.${leagueId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [leagueId])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setInput('')
    setSending(true)

    const supabase = createClient()
    await supabase.from('chat_messages').insert({
      league_id: leagueId,
      user_id: currentUserId,
      message: text,
    })

    setSending(false)
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return 'Today'
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  // Group messages by date
  let lastDate = ''

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-dark-grey bg-deep-navy px-4 py-3">
        <h1 className="text-lg font-bold text-white">Group Chat</h1>
        <p className="text-xs text-light-grey">
          {Object.keys(memberMap).length} participants
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {messages.length === 0 && (
          <p className="py-12 text-center text-sm text-dark-grey">
            No messages yet. Start the conversation.
          </p>
        )}

        {messages.map((msg) => {
          const isMe = msg.user_id === currentUserId
          const msgDate = formatDate(msg.sent_at)
          const showDate = msgDate !== lastDate
          lastDate = msgDate

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="my-4 flex items-center gap-2">
                  <div className="flex-1 border-t border-dark-grey" />
                  <span className="text-xs text-dark-grey">{msgDate}</span>
                  <div className="flex-1 border-t border-dark-grey" />
                </div>
              )}
              <div
                className={`mb-2 flex ${
                  isMe ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    isMe
                      ? 'bg-tournament-green/20 text-white'
                      : 'bg-deep-navy text-white'
                  }`}
                >
                  {!isMe && (
                    <p className="mb-0.5 text-xs font-medium text-tournament-green">
                      {memberMap[msg.user_id] || 'Unknown'}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.message}</p>
                  <p
                    className={`mt-1 text-right text-[10px] ${
                      isMe ? 'text-tournament-green/50' : 'text-dark-grey'
                    }`}
                  >
                    {formatTime(msg.sent_at)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="shrink-0 border-t border-dark-grey bg-deep-navy p-3"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 rounded-lg border border-dark-grey bg-dark-charcoal px-3 py-2 text-sm text-white placeholder-dark-grey focus:border-tournament-green focus:outline-none focus:ring-1 focus:ring-tournament-green"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-tournament-green text-white transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
