'use client'
import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import ThemeAndIdeas from '@/components/ThemeAndIdeas'
import FeedSection from '@/components/FeedSection'
import XTrends from '@/components/XTrends'
import ChecklistAndMemo from '@/components/ChecklistAndMemo'
import { FeedItem } from '@/lib/feeds'

interface FeedsData {
  prTimes:   FeedItem[]
  prEdge:    FeedItem[]
  yahooNews: FeedItem[]
  xTrends:   { rank: number; term: string; volume?: string }[]
  fetchedAt: string
}

function iconNews() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  )
}
function iconAd() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
}
function iconPR() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  )
}

function getTrendDate() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getMonth()+1}月${d.getDate()}日（前日）`
}

export default function Home() {
  const [data, setData]       = useState<FeedsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/feeds', { cache: 'no-store' })
      if (!res.ok) throw new Error('fetch error')
      const json: FeedsData = await res.json()
      setData(json)
      setLastFetch(json.fetchedAt)
    } catch {
      // keep existing data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Auto-refresh at 9:00 AM
    const checkReset = () => {
      const n = new Date()
      if (n.getHours() === 9 && n.getMinutes() === 0) fetchData()
    }
    const iv = setInterval(checkReset, 60000)
    return () => clearInterval(iv)
  }, [fetchData])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0f14 0%, #131320 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header fetchedAt={lastFetch} onRefresh={fetchData} loading={loading} />

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

          {/* LEFT — main content */}
          <div className="space-y-8 min-w-0">

            {/* Yahoo! News */}
            <FeedSection
              title="Yahoo! ニュース — 今日のシグナル"
              icon={iconNews()}
              items={data?.yahooNews || []}
              loading={loading}
              cols={3}
            />

            {/* PR TIMES */}
            <FeedSection
              title="PR TIMES — 今日のプレスリリース"
              icon={iconPR()}
              items={data?.prTimes || []}
              loading={loading}
              cols={3}
            />

            {/* PR EDGE */}
            <FeedSection
              title="PR EDGE — 話題の広告・PR事例"
              icon={iconAd()}
              items={data?.prEdge || []}
              loading={loading}
              cols={3}
            />
          </div>

          {/* RIGHT sidebar */}
          <div className="space-y-4">
            {/* X Trends */}
            <XTrends
              trends={data?.xTrends || []}
              loading={loading}
              date={getTrendDate()}
            />

            {/* Weekly Theme + Ideas */}
            <ThemeAndIdeas />

            {/* Checklist + Memo */}
            <ChecklistAndMemo />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-gray-700">
          <span>電通PR Morning Brief — 相原悠人</span>
          <span>毎朝9:00 自動リセット | PR TIMES / PR EDGE / Yahoo!ニュース / X トレンド</span>
        </footer>
      </div>
    </div>
  )
}
