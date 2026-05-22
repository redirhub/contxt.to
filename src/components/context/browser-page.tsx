'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'
import { Card, CardContent } from '@/components/ui/card'

interface ContextView {
  title: string
  summary: string
  content: string
}

export function BrowserContextPage({ context, url }: { context: ContextView; url: string }) {
  const [copied, setCopied] = useState(false)

  async function copyUrl() {
    const text = `Read and discuss this contxt link: ${url}`
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const encodedUrl = encodeURIComponent(url)
  const aiLinks = [
    {
      name: 'ChatGPT',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.54 5.06c-.28-.64-.68-1.22-1.18-1.71a6.43 6.43 0 00-1.72-1.17C17.99 1.11 15.77 1 12 1c-3.77 0-6 .11-7.64.18a6.43 6.43 0 00-1.72 1.17A6.23 6.23 0 001.46 5.1C.47 7.9 0 11.43 0 12c0 .57.47 4.1 1.46 6.9.28.64.68 1.22 1.18 1.71.5.49 1.08.89 1.72 1.17C6.01 21.89 8.23 22 12 22c3.77 0 6-.11 7.64-.18.64-.28 1.22-.68 1.72-1.17.5-.49.9-1.07 1.18-1.71C22.53 16.1 23 12.57 23 12c0-.57-.47-4.1-1.46-6.94z"/>
        </svg>
      ),
      bg: 'bg-[#10a37f]',
      href: `https://chatgpt.com/?q=Read+and+discuss+this+contxt+link+${encodedUrl}`,
      desc: "OpenAI's most capable assistant",
    },
    {
      name: 'Gemini',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 24A14.3 14.3 0 000 12 14.3 14.3 0 0012 0a14.3 14.3 0 0012 12 14.3 14.3 0 00-12 12z"/>
        </svg>
      ),
      bg: 'bg-[#4285f4]',
      href: `https://gemini.google.com/?q=Read+and+discuss+this+contxt+link+${encodedUrl}`,
      desc: "Google's multimodal AI",
    },
    {
      name: 'Claude',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.8 2.7c-.4-.4-.9-.7-1.5-.7s-1.1.3-1.5.7L2.7 11.8c-.4.4-.7.9-.7 1.5s.3 1.1.7 1.5l9.1 9.1c.4.4.9.7 1.5.7s1.1-.3 1.5-.7l9.1-9.1c.4-.4.7-.9.7-1.5s-.3-1.1-.7-1.5L14.8 2.7z"/>
        </svg>
      ),
      bg: 'bg-[#d97706]',
      href: `https://claude.ai/new?q=Read+and+discuss+this+contxt+link+${encodedUrl}`,
      desc: "Anthropic's AI assistant",
    },
  ]

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 min-h-screen" style={{ background: '#f8f9fc', color: '#1a1a2e' }}>
      <div className="w-full max-w-[560px] flex flex-col items-center">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-10" style={{ fontFamily: "'DM Mono', monospace" }}>
          <div className="w-7 h-7 bg-[#1a1a2e] rounded-md flex items-center justify-center text-white text-[13px] font-bold">c</div>
          <span className="text-base font-semibold tracking-tight text-[#1a1a2e]" style={{ fontFamily: 'Inter, sans-serif' }}>
            contxt<span className="text-[#9595aa]">.to</span>
          </span>
        </div>

        {/* Main card */}
        <Card className="w-full border border-[#e8e8f0] rounded-[16px] p-8 sm:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] transition-shadow duration-300"
          style={{ background: '#ffffff' }}>

          {/* Knowledge info */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e6f7f2] text-[#10a37f] text-[0.72rem] font-semibold uppercase tracking-wider mb-4">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a2 2 0 012 2v4h4a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2h4V3a2 2 0 012-2z"/>
              </svg>
              Shared with you
            </div>
            <h1 className="text-[1.35rem] font-bold leading-tight tracking-tight mb-2 text-[#1a1a2e]">
              {context.title}
            </h1>
            <p className="text-sm leading-relaxed text-[#6b6b80]">
              {context.summary}
            </p>
          </div>

          <div className="h-px bg-[#e8e8f0] my-6" />

          {/* ═══ Copy & Paste (primary action) ═══ */}
          <div className="mb-6">
            <div className="text-[0.72rem] font-semibold uppercase tracking-wider text-[#9595aa] mb-3">
              Copy & paste into any AI
            </div>
            <div
              className="flex items-center gap-2 p-3.5 px-4 rounded-[12px] border-2 border-[#10a37f]/20 bg-[#e6f7f2] cursor-pointer transition-all duration-200 hover:border-[#10a37f]/40 hover:bg-[#d6f0ea] active:scale-[0.99]"
              onClick={copyUrl}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
              <span className="flex-1 text-xs font-medium text-[#1a1a2e] truncate">
                Read and discuss this contxt link: {url}
              </span>
              <button
                className={`px-4 py-1.5 rounded-[8px] border-none text-[0.72rem] font-semibold cursor-pointer transition-all duration-150 font-inherit whitespace-nowrap ${
                  copied
                    ? 'bg-[#10a37f] text-white'
                    : 'bg-white text-[#10a37f] border border-[#10a37f]/30 hover:bg-[#10a37f] hover:text-white'
                }`}
                onClick={(e) => { e.stopPropagation(); copyUrl(); }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* ═══ AI Quick Links (secondary) ═══ */}
          <div className="text-[0.72rem] font-semibold uppercase tracking-wide text-[#9595aa] mb-3">
            Or open directly in
          </div>

          <div className="flex flex-col gap-2">
            {aiLinks.map((ai) => (
              <a
                key={ai.name}
                href={ai.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3.5 rounded-xl border border-[#e8e8f0] text-[#1a1a2e] no-underline transition-all duration-200 hover:border-[#d0d0de] hover:bg-[#fafbfe] hover:-translate-y-px hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] active:translate-y-0 group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${ai.bg} transition-transform duration-200 group-hover:scale-105`}>
                  {ai.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold mb-px">{ai.name}</div>
                  <div className="text-xs text-[#6b6b80]">{ai.desc}</div>
                </div>
                <span className="text-xs font-medium text-[#10a37f] opacity-0 -translate-x-1.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap">
                  Open →
                </span>
              </a>
            ))}
          </div>
        </Card>

        {/* Content section */}
        {context.content && (
          <div className="w-full mt-8">
            <CardContent className="prose prose-sm prose-slate max-w-none bg-white rounded-[16px] border border-[#e8e8f0] p-6 shadow-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeSanitize]}>
                {context.content}
              </ReactMarkdown>
            </CardContent>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-xs text-[#9595aa]">
          Powered by <a href="https://contxt.to" className="text-[#6b6b80] no-underline font-medium hover:text-[#10a37f] transition-colors" target="_blank" rel="noopener">contxt.to</a>
        </div>
      </div>
    </main>
  )
}
