'use client'

import { useState } from 'react'

const TABS = [
  { id: 'browser', label: 'Browser' },
  { id: 'ai', label: 'AI Agent' },
  { id: 'developer', label: 'Developer' },
] as const

type TabId = (typeof TABS)[number]['id']

// ── Brand colors ──────────────────────────────────────────────
const C = {
  cream: '#FCF9F2',
  navy: '#16163D',
  rose: '#FF2A6D',
  muted: '#4A4A6A',
  label: '#8B8BA8',
  border: '#F0EDE4',
  borderStrong: '#E8E3D8',
} as const

// ── Checkmark list ────────────────────────────────────────────

function CheckmarkList() {
  const items = [
    'Same short link, two different rendering paths',
    'AI agents get clean YAML with no HTML/CSS noise',
    'Works with ChatGPT, Gemini, Claude, and all major crawlers',
    'Smart previews for sharing on Slack, email, and docs',
    'Private by default — nothing is public without you sending the link',
  ]
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 text-sm" style={{ color: C.muted }}>
          <span
            className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[14px] font-bold flex-shrink-0 text-white"
            style={{ background: C.rose }}
          >
            ✓
          </span>
          {item}
        </div>
      ))}
    </div>
  )
}

// ── Mockup: Browser card ──────────────────────────────────────

function BrowserMockup() {
  return (
    <div
      className="rounded-[20px] border overflow-hidden"
      style={{ background: '#FFFFFF', borderColor: C.border, boxShadow: '0 12px 40px rgba(22,22,61,0.08)' }}
    >
      <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ background: C.cream, borderColor: C.border }}>
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F56' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#27C93F' }} />
        <span className="flex-1 ml-2.5 px-3.5 py-1.5 rounded-full text-[11px] text-center border truncate"
          style={{ background: '#FFFFFF', borderColor: C.border, color: C.label }}>
          contxt.to/s/aK3mQ
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ background: 'rgba(255,42,109,0.06)', color: C.rose }}>
          Browser
        </span>
      </div>
      <div className="p-4 sm:p-5">
        <h4 className="font-heading text-[20px] font-bold leading-tight mb-2" style={{ color: C.navy }}>
          Product Design Sprint Retro — Q1 2026
        </h4>
        <p className="text-[13px] leading-relaxed mb-4" style={{ color: C.muted }}>
          We ran 3 design sprints this quarter. Key wins: the onboarding redesign tested at 87% usability (up from 62%). Key misses: the analytics dashboard overhaul needs another iteration.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t" style={{ borderColor: C.border }}>
          <span className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] text-[11px] font-semibold border"
            style={{ background: C.cream, borderColor: C.borderStrong, color: C.muted }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M22.281 2.719a3 3 0 0 0-3.04-.602L3.166 8.356a3 3 0 0 0-.16 5.528l6.047 3.14 3.142 6.046a3 3 0 0 0 5.528-.16l6.24-18.074a3 3 0 0 0-.602-3.04z"/></svg>
            Continue in ChatGPT
          </span>
          <span className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] text-[11px] font-semibold border"
            style={{ background: C.cream, borderColor: C.borderStrong, color: C.muted }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Continue in Gemini
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Mockup: AI Agent view ─────────────────────────────────────

function AIMockup() {
  return (
    <div className="rounded-[20px] overflow-hidden" style={{ boxShadow: '0 12px 40px rgba(22,22,61,0.08)' }}>
      <div className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ background: C.navy, borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F56' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#27C93F' }} />
        <span className="flex-1 ml-2.5 px-3.5 py-1.5 rounded-full text-center text-[10px] border truncate"
          style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
          contxt.to/s/aK3mQ (AI Agent)
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
          AI View
        </span>
      </div>
      <div className="p-4 sm:p-5 font-mono text-[12px] leading-[1.7] overflow-x-auto" style={{ background: '#1a1a2e' }}>
        <div style={{ color: '#6c6c8a' }}>{'─'.repeat(40)}</div>
        <div><span style={{ color: '#FF79C6' }}>name</span><span style={{ color: '#fff' }}>:</span> <span style={{ color: '#F1FA8C' }}>Product Design Sprint Retro — Q1 2026</span></div>
        <div><span style={{ color: '#FF79C6' }}>description</span><span style={{ color: '#fff' }}>:</span> <span style={{ color: '#F1FA8C' }}>&gt; Summary of 3 design sprints this quarter. Key</span></div>
        <div style={{ color: '#F1FA8C', paddingLeft: '13px' }}>wins: onboarding hit 87% usability.</div>
        <div style={{ color: '#6c6c8a' }}>{'─'.repeat(40)}</div>
        <div style={{ color: '#6c6c8a', margin: '6px 0' }}># AI reads this block as the full context body</div>
        <div><span style={{ color: '#6272A4' }}>We ran 3 design sprints this quarter. Key wins: the</span></div>
        <div><span style={{ color: '#6272A4' }}>onboarding redesign tested at 87% usability</span></div>
        <div><span style={{ color: '#6272A4' }}>(up from 62%). Key misses...</span></div>
        <div style={{ color: '#6c6c8a', marginTop: '6px' }}>{'─'.repeat(40)}</div>
        <div style={{ color: '#50FA7B', marginTop: '6px' }}># AI agents get structured YAML — parse with any YAML library</div>
      </div>
    </div>
  )
}

// ── Mockup: Developer view (curl demo) ───────────────────────

function DeveloperMockup() {
  return (
    <div className="rounded-[20px] overflow-hidden" style={{ boxShadow: '0 12px 40px rgba(22,22,61,0.08)' }}>
      <div className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ background: C.navy, borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F56' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#27C93F' }} />
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
          Terminal
        </span>
      </div>
      <div className="p-4 sm:p-5 font-mono text-[12px] leading-[1.7] overflow-x-auto" style={{ background: '#1a1a2e' }}>
        <div><span style={{ color: '#50FA7B' }}>$</span> <span style={{ color: '#fff' }}>curl -s https://contxt.to/s/aK3mQ</span></div>
        <div style={{ color: '#6c6c8a', margin: '6px 0' }}>{'─'.repeat(40)}</div>
        <div><span style={{ color: '#FF79C6' }}>name</span><span style={{ color: '#fff' }}>:</span> <span style={{ color: '#F1FA8C' }}>Product Design Sprint Retro — Q1 2026</span></div>
        <div><span style={{ color: '#FF79C6' }}>description</span><span style={{ color: '#fff' }}>:</span> <span style={{ color: '#F1FA8C' }}>&gt; Summary of 3 design sprints this quarter. Key</span></div>
        <div style={{ color: '#F1FA8C', paddingLeft: '13px' }}>wins: onboarding hit 87% usability.</div>
        <div style={{ color: '#6c6c8a' }}>{'─'.repeat(40)}</div>
        <div style={{ color: '#6272A4' }}>We ran 3 design sprints this quarter. Key wins: the</div>
        <div style={{ color: '#6272A4' }}>onboarding redesign tested at 87% usability</div>
        <div style={{ color: '#6272A4' }}>(up from 62%). Key misses...</div>
        <div style={{ color: '#6c6c8a', marginTop: '6px' }}>{'─'.repeat(40)}</div>
        <div style={{ color: '#50FA7B' }}># Same structured output as AI agents. One URL.</div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

export function TabbedExperience() {
  const [active, setActive] = useState<TabId>('browser')

  return (
    <div className="relative z-10 px-6 py-[80px]" style={{ background: '#F5F0E6' }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.label, letterSpacing: '0.12em' }}>
          The Experience
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-[60px] items-start mt-12">
          {/* Left: static content */}
          <div className="anim-up space-y-6" style={{ '--delay': '0.1s' } as React.CSSProperties}>
            <h2 className="font-heading font-bold leading-tight" style={{
              fontSize: 'clamp(32px, 3.5vw, 48px)',
              color: C.navy,
            }}>
              Your content,{' '}
              <em className="italic" style={{ color: C.rose }}>ready</em> for humans &amp; AI.
            </h2>
            <p className="text-[15px] leading-relaxed max-w-[420px]" style={{ color: C.muted }}>
              One link adapts to whoever opens it — a clean reading card for people,
              structured YAML for AI agents and curl. No copy-paste. No formatting.
            </p>
            <CheckmarkList />
          </div>

          {/* Right: tabs + mockup */}
          <div className="anim-up space-y-6" style={{ '--delay': '0.2s' } as React.CSSProperties}>
            {/* Tab pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-full border overflow-x-auto w-fit max-w-full"
              style={{ background: '#FFFFFF', borderColor: C.borderStrong, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className="flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-[13px] font-semibold border-none cursor-pointer transition-all font-sans whitespace-nowrap"
                  style={active === tab.id
                    ? { background: C.rose, color: '#fff', boxShadow: '0 2px 8px rgba(255,42,109,0.25)' }
                    : { background: 'transparent', color: C.muted }
                  }
                  onMouseEnter={(e) => {
                    if (active !== tab.id) e.currentTarget.style.color = C.rose
                  }}
                  onMouseLeave={(e) => {
                    if (active !== tab.id) e.currentTarget.style.color = C.muted
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Active mockup */}
            <div key={active}>
              {active === 'browser' && <BrowserMockup />}
              {active === 'ai' && <AIMockup />}
              {active === 'developer' && <DeveloperMockup />}
            </div>

            {/* Connector */}
            {active !== 'developer' && (
              <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1.5 text-xs font-medium" style={{ color: C.label }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: 'rgba(255,42,109,0.06)', color: C.rose }}>🌐</span>
                <svg width="40" height="2" className="hidden sm:block"><line x1="0" y1="1" x2="40" y2="1" stroke={C.borderStrong} strokeWidth="1" strokeDasharray="4 3"/></svg>
                <span className="font-semibold" style={{ color: C.rose }}>same link</span>
                <svg width="40" height="2" className="hidden sm:block"><line x1="0" y1="1" x2="40" y2="1" stroke={C.borderStrong} strokeWidth="1" strokeDasharray="4 3"/></svg>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: 'rgba(255,42,109,0.06)', color: C.rose }}>{'<'}/&gt;</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
