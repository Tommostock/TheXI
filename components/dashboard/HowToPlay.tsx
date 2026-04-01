'use client'

import { useState } from 'react'
import { HelpCircle, X } from 'lucide-react'

export function HowToPlayButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:border-wc-blue hover:text-wc-blue"
        title="How To Play"
      >
        <HelpCircle size={16} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* Content */}
          <div className="relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border bg-bg-card p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display text-white">How To Play</h2>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 text-sm text-text-secondary leading-relaxed">
              {/* The Game */}
              <section>
                <h3 className="text-white font-medium mb-1.5">The Game</h3>
                <p>
                  The XI is a World Cup 2026 player draft game. You and your
                  mates each draft a squad of 15 real players, then earn points
                  based on how they perform in the actual tournament.
                </p>
              </section>

              {/* The Draft */}
              <section>
                <h3 className="text-white font-medium mb-1.5">The Draft</h3>
                <p>
                  Players are picked in a snake draft — the order reverses each
                  round. You have 15 rounds to build your squad:
                </p>
                <ul className="mt-2 space-y-1 text-xs text-text-muted">
                  <li className="flex gap-2"><span className="text-wc-purple font-bold">2</span> Goalkeepers</li>
                  <li className="flex gap-2"><span className="text-wc-blue font-bold">5</span> Defenders</li>
                  <li className="flex gap-2"><span className="text-wc-gold font-bold">5</span> Midfielders</li>
                  <li className="flex gap-2"><span className="text-wc-crimson font-bold">3</span> Attackers</li>
                </ul>
                <p className="mt-2">
                  Each player can only be drafted by one person — once they're
                  taken, they're gone.
                </p>
              </section>

              {/* Your Squad */}
              <section>
                <h3 className="text-white font-medium mb-1.5">Your Squad</h3>
                <p>
                  Pick a formation (4-4-2, 4-3-3, or 4-5-1) to set your Starting
                  XI. The remaining 4 players sit on your bench.
                </p>
                <p className="mt-1.5">
                  Starting players earn full points. Bench players earn
                  <span className="text-white font-medium"> 50% points</span> (rounded down).
                </p>
              </section>

              {/* Scoring */}
              <section>
                <h3 className="text-white font-medium mb-1.5">Scoring</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
                  <div className="flex justify-between"><span>Goal</span><span className="text-wc-green font-bold">+5</span></div>
                  <div className="flex justify-between"><span>Assist</span><span className="text-wc-green font-bold">+3</span></div>
                  <div className="flex justify-between"><span>Clean Sheet</span><span className="text-wc-green font-bold">+3</span></div>
                  <div className="flex justify-between"><span>Played 60+ mins</span><span className="text-wc-green font-bold">+2</span></div>
                  <div className="flex justify-between"><span>Played &lt;60 mins</span><span className="text-wc-green font-bold">+1</span></div>
                  <div className="flex justify-between"><span>Yellow Card</span><span className="text-wc-crimson font-bold">-1</span></div>
                  <div className="flex justify-between"><span>Red Card</span><span className="text-wc-crimson font-bold">-3</span></div>
                  <div className="flex justify-between"><span>Own Goal</span><span className="text-wc-crimson font-bold">-2</span></div>
                </div>
                <p className="mt-2 text-xs text-text-muted">
                  Clean sheets only count for GK and DEF who play 60+ minutes.
                  Penalty shootout goals do not count.
                </p>
              </section>

              {/* Eliminations */}
              <section>
                <h3 className="text-white font-medium mb-1.5">When Teams Get Knocked Out</h3>
                <p>
                  When a nation is eliminated, all their players are out too. A
                  draft window opens so you can replace eliminated players with
                  available ones from nations still in the tournament.
                </p>
                <p className="mt-1.5">
                  Pick order for replacements goes by reverse standings — the
                  person in last place picks first.
                </p>
              </section>

              {/* Winning */}
              <section>
                <h3 className="text-white font-medium mb-1.5">Winning</h3>
                <p>
                  The person with the most points when the final whistle blows
                  in the World Cup Final wins. Simple as that.
                </p>
              </section>

              {/* Contact */}
              <div className="rounded-lg border border-border bg-bg-surface p-3 text-center text-xs text-text-muted">
                Any questions? Get in touch with Tom.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
