'use client'

import { useState, useEffect, useRef } from 'react'
import { TabbedExperience } from './tabbed-experience'
import { Logo } from '@/components/shared/logo'

export function LandingBrowser() {
  return (
    <main>
      <LandingContent />
    </main>
  )
}

function LandingContent() {
  const [content, setContent] = useState('')
  const [pending, setPending] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    slug: string
    claimToken: string
    url: string
    title: string
    summary: string
    body: string
  } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [emailValue, setEmailValue] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [baseUrl, setBaseUrl] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setBaseUrl(window.location.origin) }, [])
  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(session => { if (session?.user) setLoggedIn(true) })
      .catch(() => {})
  }, [])

  // Scroll observer for animations
  useEffect(() => {
    if (!mounted) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.anim-up').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [mounted, result])

  // Mobile scroll: when result changes, scroll to tool card
  useEffect(() => {
    if (result && window.innerWidth < 1024) {
      areaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  const charCount = content.length

  async function handleCreate() {
    const text = content.trim()
    if (!text) {
      textareaRef.current?.focus()
      return
    }
    if (text.length < 10) {
      setError('Content must be at least 10 characters')
      return
    }
    if (text.length > 50000) {
      setError('Content must be under 50000 characters')
      return
    }

    setPending(true)
    setGenerating(true)
    setError(null)

    try {
      // Step 1: Generate metadata
      const metaRes = await fetch('/api/generate-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })

      if (!metaRes.ok) throw new Error('Failed to generate metadata')

      const meta = await metaRes.json()
      setGenerating(false)

      // Step 2: Create context
      const ctxRes = await fetch('/api/contexts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: meta.title,
          summary: meta.summary,
          content: text,
          tags: [],
        }),
      })

      if (!ctxRes.ok) {
        let msg = 'Failed to create'
        try {
          const err = await ctxRes.json()
          msg = err.error || msg
        } catch { /* body empty, use default */ }
        throw new Error(msg)
      }

      const ctx = await ctxRes.json()
      setContent('')
      setResult({
        slug: ctx.slug,
        claimToken: ctx.claimToken || '',
        url: ctx.url,
        title: meta.title,
        summary: meta.summary,
        body: text.length > 200 ? text.substring(0, 197) + '...' : text,
      })
      setShowModal(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setPending(false)
      setGenerating(false)
    }
  }

  async function copyLink() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = result.url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault()
    if (!emailValue || !result) return
    setClaimError(null)
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: result.slug, token: result.claimToken, email: emailValue }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setEmailSent(true)
    } catch {
      setClaimError('Could not save right now')
    }
  }

  return (
    <>
      {/* Ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ background: '#FCF9F2' }}>
        <div className="absolute w-[500px] h-[500px] top-[-200px] right-[-100px] rounded-full opacity-30"
          style={{ background: 'rgba(255, 42, 109, 0.08)', filter: 'blur(80px)' }} />
        <div className="absolute w-[400px] h-[400px] bottom-[200px] left-[-150px] rounded-full opacity-30"
          style={{ background: 'rgba(255, 201, 64, 0.12)', filter: 'blur(80px)' }} />
        <div className="absolute w-[300px] h-[300px] bottom-[-100px] right-[20%] rounded-full opacity-30"
          style={{ background: 'rgba(255, 42, 109, 0.05)', filter: 'blur(80px)' }} />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 border-b"
        style={{
          background: 'rgba(252, 249, 242, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: '#F0EDE4',
        }}>
        <Logo href="/" />
        <div className="flex items-center gap-4">
          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-8">
            <a href="#how" className="text-sm font-medium no-underline transition-colors" style={{ color: '#4A4A6A' }}
              onClick={(e) => { e.preventDefault(); document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }) }}>
              How It Works
            </a>
            <a href="#use" className="text-sm font-medium no-underline transition-colors" style={{ color: '#4A4A6A' }}
              onClick={(e) => { e.preventDefault(); document.getElementById('use')?.scrollIntoView({ behavior: 'smooth' }) }}>
              Use Cases
            </a>
            {!loggedIn && (
              <a href="/auth/signin"
                className="text-sm font-medium no-underline transition-colors"
                style={{ color: '#8B8BA8' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#FF2A6D' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#8B8BA8' }}>
                Sign in
              </a>
            )}
            {loggedIn && (
              <a href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold border-none cursor-pointer transition-all no-underline"
                style={{ background: '#FF2A6D', color: '#fff', boxShadow: '0 2px 8px rgba(255, 42, 109, 0.2)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#E61D5C'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 42, 109, 0.3)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FF2A6D'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 42, 109, 0.2)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Dashboard
              </a>
            )}
          </div>

          {/* Mobile: hamburger */}
          <div className="sm:hidden relative">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#F0EDE4] text-[#4A4A6A] hover:bg-[#F5F0E6] transition-all cursor-pointer"
              aria-label="Menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>

            {mobileOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-44 rounded-xl border shadow-lg z-50 overflow-hidden"
                style={{
                  background: '#FFFFFF',
                  borderColor: '#F0EDE4',
                  boxShadow: '0 12px 40px rgba(22, 22, 61, 0.15)',
                }}
              >
                <a href="#how"
                  className="block px-4 py-3 text-sm font-medium no-underline transition-colors"
                  style={{ color: '#4A4A6A', borderBottom: '1px solid #F0EDE4' }}
                  onClick={(e) => { e.preventDefault(); document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }); setMobileOpen(false) }}>
                  How It Works
                </a>
                <a href="#use"
                  className="block px-4 py-3 text-sm font-medium no-underline transition-colors"
                  style={{ color: '#4A4A6A', borderBottom: '1px solid #F0EDE4' }}
                  onClick={(e) => { e.preventDefault(); document.getElementById('use')?.scrollIntoView({ behavior: 'smooth' }); setMobileOpen(false) }}>
                  Use Cases
                </a>
                {!loggedIn ? (
                  <a href="/auth/signin"
                    className="block px-4 py-3 text-sm font-semibold no-underline transition-colors"
                    style={{ color: '#FF2A6D' }}
                    onClick={() => setMobileOpen(false)}>
                    Sign in
                  </a>
                ) : (
                  <a href="/dashboard"
                    className="block px-4 py-3 text-sm font-semibold no-underline transition-colors flex items-center gap-2"
                    style={{ color: '#FF2A6D' }}
                    onClick={() => setMobileOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    Dashboard
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Mobile: compact dashboard button when logged in (always visible even with menu) */}
          {loggedIn && (
            <a href="/dashboard"
              className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border-none cursor-pointer transition-all no-underline"
              style={{ background: '#FF2A6D', color: '#fff' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </a>
          )}
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 min-h-screen flex flex-col px-6 pt-[110px] pb-10 font-sans">
        <div className="w-full max-w-[1200px] mx-auto grid lg:grid-cols-[1fr_480px] gap-12 items-center"
          style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.3s' }}>

          {/* Left: Headline */}
          <div className="anim-up" style={{ '--delay': '0.15s' } as React.CSSProperties}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-6 border"
              style={{ color: '#4A4A6A', borderColor: '#E8E3D8', background: 'rgba(255, 42, 109, 0.03)', letterSpacing: '0.06em' }}>
              <span className="w-[5px] h-[5px] rounded-full animate-pulse" style={{ background: '#FF2A6D' }} />
              AI-READY KNOWLEDGE SHARING
            </div>

            <h1 className="font-heading font-bold leading-[1.08] mb-[18px]"
              style={{ fontSize: 'clamp(42px, 4.8vw, 66px)', color: '#16163D' }}>
              One link.<br />
              <em className="italic not-italic" style={{ color: '#FF2A6D', fontStyle: 'italic' }}>Infinite AI conversations.</em>
            </h1>

            <p className="text-base leading-relaxed mb-8" style={{
              fontSize: 'clamp(15px, 1.1vw, 18px)',
              color: '#4A4A6A',
              maxWidth: 420,
              lineHeight: 1.7,
            }}>
              Drop your notes, research, or meeting recap into Contxt. Get a link that anyone can open — and instantly continue the conversation in ChatGPT, Gemini, or Claude. No signup. No copy-paste. No friction.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-5">
              <div className="flex items-center gap-3 text-sm" style={{ color: '#4A4A6A' }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                  style={{ background: 'rgba(255, 42, 109, 0.06)', color: '#4A4A6A' }}>
                  ⚡
                </span>
                Zero friction — paste and share
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: '#4A4A6A' }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                  style={{ background: 'rgba(255, 42, 109, 0.06)', color: '#4A4A6A' }}>
                  🤖
                </span>
                Continue in any AI
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: '#4A4A6A' }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                  style={{ background: 'rgba(255, 42, 109, 0.06)', color: '#4A4A6A' }}>
                  🔒
                </span>
                Private by default
              </div>
            </div>
          </div>

          {/* Right: Tool Card */}
          <div ref={areaRef} id="tool" className="anim-up" style={{ '--delay': '0.3s' } as React.CSSProperties}>
            <div className="rounded-[20px] border shadow-lg overflow-hidden relative"
              style={{
                background: '#FFFFFF',
                borderColor: '#F0EDE4',
                boxShadow: '0 12px 40px rgba(22, 22, 61, 0.08)',
              }}>
              {/* Accent bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: 'linear-gradient(90deg, #FF2A6D, transparent 60%)' }} />

              <div className="p-6 sm:p-7 font-sans">

                {/* Preview block — always visible */}
                <div className="transition-all duration-500">
                  <div className="p-5 rounded-[10px] border" style={{ background: '#FCF9F2', borderColor: '#F0EDE4' }}>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
                      style={{ background: 'rgba(255, 42, 109, 0.06)', color: '#FF2A6D', letterSpacing: '0.06em' }}>
                      💡 Try This Prompt
                    </span>
                    <div className="text-[17px] font-bold leading-tight mb-1.5" style={{ color: '#16163D' }}>
                      Share AI Chat → One Link
                    </div>
                    <div className="text-[13px] leading-relaxed mb-4" style={{ color: '#8B8BA8' }}>
                      Paste into ChatGPT / Gemini and tap Continue:
                      <code className="block text-[13px] leading-relaxed font-medium p-2.5 mt-2 rounded-[8px] border"
                        style={{
                          background: 'rgba(255, 42, 109, 0.06)',
                          color: '#FF2A6D',
                          borderColor: 'rgba(255, 42, 109, 0.1)',
                        }}>
                        {`read ${baseUrl} and shorten this chat and create a shareable link`}
                      </code>
                    </div>
                    <div className="flex gap-2">
                      <a href={`https://chatgpt.com/?q=${encodeURIComponent('read ' + baseUrl + ' and shorten this chat and create a shareable link')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[14px] text-[13px] font-semibold border no-underline cursor-pointer transition-all font-inherit"
                        style={{ background: '#FFFFFF', borderColor: '#E8E3D8', color: '#4A4A6A' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF2A6D'; e.currentTarget.style.color = '#FF2A6D'; e.currentTarget.style.background = 'rgba(255, 42, 109, 0.06)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8E3D8'; e.currentTarget.style.color = '#4A4A6A'; e.currentTarget.style.background = '#FFFFFF' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.281 2.719a3 3 0 0 0-3.04-.602L3.166 8.356a3 3 0 0 0-.16 5.528l6.047 3.14 3.142 6.046a3 3 0 0 0 5.528-.16l6.24-18.074a3 3 0 0 0-.602-3.04z" />
                        </svg>
                        Continue in ChatGPT
                      </a>
                      <a href={`https://gemini.google.com/?q=${encodeURIComponent('read ' + baseUrl + ' and shorten this chat and create a shareable link')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[14px] text-[13px] font-semibold border no-underline cursor-pointer transition-all font-inherit"
                        style={{ background: '#FFFFFF', borderColor: '#E8E3D8', color: '#4A4A6A' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF2A6D'; e.currentTarget.style.color = '#FF2A6D'; e.currentTarget.style.background = 'rgba(255, 42, 109, 0.06)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8E3D8'; e.currentTarget.style.color = '#4A4A6A'; e.currentTarget.style.background = '#FFFFFF' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        Continue in Gemini
                      </a>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px" style={{ background: '#F0EDE4' }} />
                  <span className="text-xs font-medium whitespace-nowrap" style={{ color: '#8B8BA8' }}>or paste manually</span>
                  <div className="flex-1 h-px" style={{ background: '#F0EDE4' }} />
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your knowledge here..."
                  maxLength={50000}
                  rows={3}
                  className="w-full p-3.5 rounded-[10px] text-sm leading-relaxed outline-none resize-y transition-all font-inherit"
                  style={{
                    background: '#FCF9F2',
                    border: '1px solid #E8E3D8',
                    color: '#16163D',
                    minHeight: 70,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#FF2A6D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 42, 109, 0.12)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#E8E3D8'; e.currentTarget.style.boxShadow = 'none' }}
                />

                {/* Input bar */}
                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCreate}
                      disabled={pending || generating || !content.trim()}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[14px] font-semibold border-none cursor-pointer transition-all font-inherit disabled:cursor-not-allowed"
                      style={{
                        background: '#FF2A6D',
                        color: '#fff',
                        boxShadow: '0 4px 16px rgba(255, 42, 109, 0.25)',
                        opacity: pending || generating || !content.trim() ? 0.4 : 1,
                      }}
                      onMouseEnter={(e) => { if (!pending && !generating && !!content.trim()) { e.currentTarget.style.background = '#E61D5C'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(255, 42, 109, 0.35)' } }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#FF2A6D'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 42, 109, 0.25)' } }
                    >
                      {generating ? (
                        <>
                          <span className="inline-block w-[18px] h-[18px] border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                          Generating...
                        </>
                      ) : pending ? (
                        <>
                          <span className="inline-block w-[18px] h-[18px] border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                          Creating...
                        </>
                      ) : (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                          Create
                        </>
                      )}
                    </button>
                    <span className="text-[11px] font-medium hidden sm:inline" style={{ color: '#8B8BA8' }}>
                      Free. No signup.
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <a href="https://contxt.to/s/contxt-Tmuyc" target="_blank" rel="noopener noreferrer"
                      className="text-xs font-medium no-underline transition-colors hidden sm:inline"
                      style={{ color: '#4A4A6A' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#FF2A6D' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#4A4A6A' }}>
                      See an example →
                    </a>
                    <span className="text-xs font-medium" style={{
                      color: charCount > 4500 ? '#FF2A6D' : '#8B8BA8',
                    }}>
                      {charCount} / 50000
                    </span>
                  </div>
                </div>

                {error && (
                  <p className="text-xs mt-2" style={{ color: '#FF2A6D' }}>{error}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ AI LOGOS ═══ */}
        <div className="w-full max-w-[1200px] mx-auto mt-16 sm:mt-20">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-8 text-center" style={{ color: '#C4C0B6', letterSpacing: '0.14em' }}>
            Works with every major AI
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
            {[
              { name: 'ChatGPT', file: 'chatgpt.svg', h: 32 },
              { name: 'Claude', file: 'claude.svg', h: 20 },
              { name: 'Gemini', file: 'gemini.svg', h: 26 },
              { name: 'DeepSeek', file: 'deepseek.svg', h: 26 },
              { name: 'Grok', file: 'grok.svg', h: 30 },
            ].map(({ name, file, h }) => (
              <div key={name} style={{ filter: 'grayscale(1)', opacity: 0.55 }}>
                <img src={`/logos/${file}`} alt={name} style={{ height: h, width: 'auto', maxWidth: 130 }} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RESULT MODAL ═══ */}
      {showModal && result && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          style={{ background: 'rgba(22, 22, 61, 0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={() => { setShowModal(false) }}
        >
          <div
            className="relative w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-[20px] border shadow-2xl"
            style={{ background: '#FFFFFF', borderColor: '#F0EDE4', boxShadow: '0 32px 80px rgba(22, 22, 61, 0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px]"
              style={{ background: 'linear-gradient(90deg, #FF2A6D, transparent 60%)' }} />

            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border transition-all cursor-pointer"
              style={{ background: '#FCF9F2', borderColor: '#F0EDE4', color: '#4A4A6A' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FF2A6D'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#FF2A6D' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FCF9F2'; e.currentTarget.style.color = '#4A4A6A'; e.currentTarget.style.borderColor = '#F0EDE4' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="p-7 sm:p-10 font-sans">
              {/* Success badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255, 42, 109, 0.08)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF2A6D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-[15px] font-semibold" style={{ color: '#16163D' }}>Link created successfully</span>
              </div>

              {/* Link row */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-[10px] mb-5 border"
                style={{ background: 'rgba(255, 42, 109, 0.06)', borderColor: 'rgba(255, 42, 109, 0.1)' }}>
                <span className="flex-1 text-[15px] font-semibold min-w-0 truncate" style={{ color: '#FF2A6D' }}>
                  {result.url}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <a href={result.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-[12px] font-semibold no-underline cursor-pointer transition-all font-inherit"
                    style={{ background: '#FFFFFF', borderColor: '#E8E3D8', color: '#4A4A6A' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF2A6D'; e.currentTarget.style.color = '#FF2A6D' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8E3D8'; e.currentTarget.style.color = '#4A4A6A' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Open
                  </a>
                  <button onClick={() => setShowQR(!showQR)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-[12px] font-semibold cursor-pointer transition-all font-inherit"
                    style={{ background: showQR ? 'rgba(255,42,109,0.08)' : '#FFFFFF', borderColor: showQR ? '#FF2A6D' : '#E8E3D8', color: showQR ? '#FF2A6D' : '#4A4A6A' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="4" height="4" rx="1" />
                      <line x1="9" y1="14" x2="14" y2="9" />
                      <line x1="9" y1="16" x2="16" y2="9" />
                    </svg>
                    QR
                  </button>
                  <button onClick={copyLink}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-[12px] font-semibold cursor-pointer whitespace-nowrap transition-all font-inherit ${copied ? 'text-white' : ''}`}
                    style={copied ? { background: '#FF2A6D', borderColor: '#FF2A6D' } : { background: '#FFFFFF', borderColor: '#E8E3D8', color: '#4A4A6A' }}
                    onMouseEnter={(e) => { if (!copied) { e.currentTarget.style.borderColor = '#FF2A6D'; e.currentTarget.style.color = '#FF2A6D' } }}
                    onMouseLeave={(e) => { if (!copied) { e.currentTarget.style.borderColor = '#E8E3D8'; e.currentTarget.style.color = '#4A4A6A' } }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {showQR && (
                <div className="flex justify-center mb-5 p-4 rounded-[10px] border"
                  style={{ background: '#FCF9F2', borderColor: '#F0EDE4' }}>
                  <img src={`/api/qr?url=${encodeURIComponent(result.url)}`} alt="QR Code" width={130} height={130} className="block" style={{ imageRendering: 'pixelated' }} />
                </div>
              )}

              {/* Preview */}
              <div className="p-5 sm:p-6 rounded-[10px] border mb-5" style={{ background: '#FCF9F2', borderColor: '#F0EDE4' }}>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
                  style={{ background: 'rgba(255, 42, 109, 0.06)', color: '#FF2A6D', letterSpacing: '0.06em' }}>
                  ✨ Your Link Preview
                </span>
                <div className="text-[19px] font-bold leading-tight mb-2" style={{ color: '#16163D' }}>
                  {result.title}
                </div>
                <div className="text-[14px] leading-relaxed" style={{ color: '#8B8BA8' }}>
                  {result.summary}
                </div>
              </div>

              {/* Email claim — only for guests */}
              {loggedIn ? (
                <div className="p-5 rounded-[10px] border text-center"
                  style={{ background: 'rgba(255,42,109,0.03)', borderColor: '#F0EDE4' }}>
                  <span className="text-[14px] font-medium" style={{ color: '#4A4A6A' }}>
                    ✅ Saved to your account —{' '}
                    <a href="/dashboard" className="font-semibold no-underline transition-colors"
                      style={{ color: '#FF2A6D' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#E61D5C' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#FF2A6D' }}>
                      manage in Dashboard →
                    </a>
                  </span>
                </div>
              ) : !emailSent ? (
                  <form onSubmit={handleClaim} className="p-5 rounded-[10px] border"
                    style={{ background: '#FFFFFF', borderColor: '#F0EDE4' }}>
                    <div className="text-[13px] font-medium mb-3" style={{ color: '#4A4A6A' }}>
                      ✉️ Track visits, manage, and edit your links later
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="email" value={emailValue}
                        onChange={(e) => { setEmailValue(e.target.value); setClaimError(null) }}
                        placeholder="your@email.com" required
                        className="flex-1 px-3.5 py-2.5 rounded-[10px] border text-[13px] outline-none transition-all font-inherit"
                        style={{ background: '#FCF9F2', borderColor: '#E8E3D8', color: '#16163D' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#FF2A6D' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#E8E3D8' }}
                      />
                      <button type="submit"
                        className="px-5 py-2.5 rounded-[12px] border-none text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-all font-inherit text-white"
                        style={{ background: '#FF2A6D' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#E61D5C' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#FF2A6D' }}
                      >
                        Save
                      </button>
                    </div>
                  {claimError && <p className="text-[11px] mt-1.5" style={{ color: '#FF2A6D' }}>{claimError}</p>}
                </form>
              ) : (
                <div className="p-5 rounded-[10px] border text-center"
                  style={{ background: 'rgba(255, 42, 109, 0.03)', borderColor: '#F0EDE4' }}>
                  <span className="text-[14px] font-medium" style={{ color: '#4A4A6A' }}>
                    ✅ We&apos;ll notify you at <strong style={{ color: '#16163D' }}>{emailValue}</strong> when this link is visited.
                  </span>
                </div>
              )}

              {/* Close button at bottom */}
              <div className="mt-6 text-center">
                <button onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-full border text-[13px] font-semibold cursor-pointer transition-all font-inherit"
                  style={{ background: '#FFFFFF', borderColor: '#E8E3D8', color: '#4A4A6A' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF2A6D'; e.currentTarget.style.color = '#FF2A6D' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8E3D8'; e.currentTarget.style.color = '#4A4A6A' }}
                >
                  Create another link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ═══ HOW IT WORKS ═══ */}
      <div className="relative z-10 h-px max-w-[1200px] mx-auto"
        style={{ background: 'linear-gradient(90deg, transparent, #E8E3D8, transparent)' }} />

      <section id="how" className="relative z-10 px-6 py-[80px] max-w-[1200px] mx-auto w-full font-sans"
        style={{ background: '#FCF9F2' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#8B8BA8', letterSpacing: '0.12em' }}>
          How It Works
        </div>
        <h2 className="font-heading font-bold leading-tight mb-3" style={{
          fontSize: 'clamp(32px, 3.5vw, 48px)',
          color: '#16163D',
        }}>
          Write. <span className="italic" style={{ color: '#FF2A6D' }}>Share.</span> Discuss.
        </h2>
        <p className="text-base leading-relaxed max-w-[480px]" style={{ color: '#4A4A6A' }}>
          Three seconds to share your thinking. One click for anyone to explore it with AI.
        </p>

        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {[{
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            ),
            title: 'Write or paste',
            desc: 'Type or paste your knowledge into the box. A brief, a research note, a meeting recap — anything you need to share. No account required.',
          }, {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            ),
            title: 'Get a short link',
            desc: 'Hit "Create" and you get a contxt.to short link instantly. Drop it in Slack, email, or a doc — the link preview already shows the summary.',
          }, {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <polygon points="11 5 6 9 2 8 14 2 18 6 12 12 14 18 10 14 22 22" />
              </svg>
            ),
            title: 'Continue in any AI',
            desc: 'Recipients open the link, see the gist, and tap "Continue in ChatGPT" or "Gemini" — full context flows into their chat. Instant discussion.',
          }].map((step, i) => (
            <div key={i}
              className="anim-up rounded-[20px] border p-8 shadow-sm transition-all"
              style={{
                background: '#FFFFFF',
                borderColor: '#F0EDE4',
                boxShadow: '0 4px 20px rgba(22, 22, 61, 0.06)',
                '--delay': `${0.1 + i * 0.1}s`,
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(22, 22, 61, 0.1)'
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(22, 22, 61, 0.06)'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <div className="w-11 h-11 rounded-[10px] flex items-center justify-center mb-[18px]"
                style={{ background: 'rgba(255, 42, 109, 0.06)', color: '#FF2A6D' }}>
                {step.icon}
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#16163D' }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#4A4A6A' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ THE EXPERIENCE ═══ */}
      <TabbedExperience />

      {/* ═══ USE CASES ═══ */}
      <section id="use" className="relative z-10 px-6 py-[80px] max-w-[1200px] mx-auto w-full font-sans"
        style={{ background: '#FCF9F2' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#8B8BA8', letterSpacing: '0.12em' }}>
          Use Cases
        </div>
        <h2 className="font-heading font-bold leading-tight mb-3" style={{
          fontSize: 'clamp(32px, 3.5vw, 48px)',
          color: '#16163D',
        }}>
          Context, <span className="italic" style={{ color: '#FF2A6D' }}>everywhere</span> it matters.
        </h2>
        <p className="text-base leading-relaxed max-w-[480px] mb-12" style={{ color: '#4A4A6A' }}>
          From research to handoffs — share what matters, not what happened.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { emoji: '🤖', title: 'AI Research', desc: 'Turn AI research into a shareable page with executive summaries, key insights, citations, and interactive AI Q&A.' },
            { emoji: '🎙️', title: 'Meeting Briefs', desc: 'Share meeting context, not recordings — decisions, action items, summaries, and follow-up briefs from any call.' },
            { emoji: '📚', title: 'Learning Capsules', desc: 'Learn anything through AI-powered context — summaries, structured concepts, and an interactive AI tutor.' },
            { emoji: '🔄', title: 'Project Handoff', desc: 'Transfer project context instantly — overviews, technical decisions, next steps, and team onboarding in one link.' },
          ].map((item, i) => (
            <div key={i}
              className="anim-up rounded-[20px] border p-7 shadow-sm transition-all"
              style={{
                background: '#FFFFFF',
                borderColor: '#F0EDE4',
                boxShadow: '0 4px 20px rgba(22, 22, 61, 0.06)',
                '--delay': `${0.1 + i * 0.08}s`,
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(22, 22, 61, 0.1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(22, 22, 61, 0.06)'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <div className="text-2xl mb-3.5">{item.emoji}</div>
              <h3 className="text-base font-bold mb-1.5" style={{ color: '#16163D' }}>{item.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: '#4A4A6A' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TRUST ═══ */}
      <section className="relative z-10 px-6 py-[60px] max-w-[1200px] mx-auto w-full" style={{ background: '#FCF9F2' }}>
        <div className="text-center max-w-[600px] mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#8B8BA8', letterSpacing: '0.12em' }}>Trust</div>
          <h2 className="font-heading font-bold leading-tight mb-4" style={{ fontSize: 'clamp(28px, 3vw, 42px)', color: '#16163D' }}>
            Private. <span style={{ color: '#FF2A6D', fontStyle: 'italic' }}>No catch.</span>
          </h2>
          <p className="text-base leading-relaxed mb-6" style={{ color: '#4A4A6A' }}>
            Links are private — only people you share with can access them. No public directory. No search indexing. No signup required for you or your recipients.
          </p>
          <p className="text-sm" style={{ color: '#8B8BA8' }}>
            Built by people tired of copy-pasting the same context into every AI chat. Free to use. Always.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-8 border-t text-[13px]"
        style={{ borderColor: '#F0EDE4', color: '#8B8BA8', background: '#FCF9F2' }}>
        <span>© 2026 <a href="/" className="no-underline font-medium transition-colors" style={{ color: '#4A4A6A' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#FF2A6D'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A6A'}>Contxt</a></span>
        <div className="flex gap-6">
          <a href="/privacy" className="no-underline transition-colors" style={{ color: '#4A4A6A' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FF2A6D'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A6A'}>Privacy</a>
          <a href="/terms" className="no-underline transition-colors" style={{ color: '#4A4A6A' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FF2A6D'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A6A'}>Terms</a>
          <a href="/changelog" className="no-underline transition-colors" style={{ color: '#4A4A6A' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FF2A6D'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A6A'}>Changelog</a>
          <a href="mailto:hello@contxt.to" className="no-underline transition-colors" style={{ color: '#4A4A6A' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FF2A6D'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A6A'}>Contact</a>
          <a href="mailto:ai@contxt.to" className="no-underline transition-colors" style={{ color: '#4A4A6A' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FF2A6D'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A6A'}>AI Support</a>
        </div>
      </footer>

      {/* Animation styles */}
      <style>{`
        .anim-up {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--delay, 0s);
        }
        .anim-up.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .anim-up,
          .anim-up.is-visible {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </>
  )
}
