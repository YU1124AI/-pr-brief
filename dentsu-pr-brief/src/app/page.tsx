'use client'
import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import ThemeAndIdeas from '@/components/ThemeAndIdeas'
import FeedSection from '@/components/FeedSection'
import XTrends from '@/components/XTrends'
import ChecklistAndMemo from '@/components/ChecklistAndMemo'
import { FeedItem } from '@/lib/feeds'

interface FeedsData {
  prTimes: FeedItem[]
  prEdge: FeedItem[]
  yahooNews: FeedItem[]
  asahi: FeedItem[]
  sendenKaigi: FeedItem[]
  xTrends: { rank: number; term: string; volume?: string }[]
  dailyIdeas: { title: string; body: string; tag: string }[]
  summaryContext: { topNews: string; topPR: string; topTrends: string }
  fetchedAt: string
}

const TAG_COLORS: Record<string, string> = {
  '拡散型': 'tag-trend',
  '体験型': 'tag-ad',
  '信頼獲得型': 'tag-pr',
  'コミュニティ型': 'tag-news',
  '体験拡散型': 'tag-ad',
  '権威型': 'tag-global',
  'リスクコミュニケーション型': 'tag-x',
}

function iconNews() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
}
function iconAd() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
}
function iconPR() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
}

function getTrendDate() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getMonth()+1}月${d.getDate()}日（前日）`
}

export default function Home() {
  const [data, setData] = useState<FeedsData | null>(null)
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
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const iv = setInterval(() => {
      const n = new Date()
      if (n.getHours() === 9 && n.getMinutes() === 0) fetchData()
    }, 60000)
    return () => clearInterval(iv)
  }, [fetchData])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0f14 0%, #131320 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header fetchedAt={lastFetch} onRefresh={fetchData} loading={loading} summaryContext={data?.summaryContext} />
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-8 min-w-0">
            <FeedSection title="Yahoo! ニュース — 今日のシグナル" icon={iconNews()} items={data?.yahooNews||[]} loading={loading} cols={3} />
            <FeedSection title="朝日新聞 — 社会課題・政策動向" icon={iconNews()} items={data?.asahi||[]} loading={loading} cols={2} />
            <FeedSection title="PR TIMES — 今日のプレスリリース" icon={iconPR()} items={data?.prTimes||[]} loading={loading} cols={3} />
            <FeedSection title="PR EDGE — 話題の広告・PR事例" icon={iconAd()} items={data?.prEdge||[]} loading={loading} cols={3} />
            <FeedSection title="宣伝会議 — マーケティング最新情報" icon={iconAd()} items={data?.sendenKaigi||[]} loading={loading} cols={2} />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
                <div className="section-label mb-0">今日のPR施策アイデア — 使えるネタ3案</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {loading ? Array(3).fill(0).map((_,i) => (
                  <div key={i} className="glass rounded-2xl p-4 space-y-2">
                    <div className="skeleton h-3 w-1/3 rounded"/>
                    <div className="skeleton h-4 w-4/5 rounded"/>
                    <div className="skeleton h-3 w-full rounded"/>
                  </div>
                )) : (data?.dailyIdeas||[]).map((idea,i) => (
                  <div key={i} className="glass glass-hover rounded-2xl p-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${TAG_COLORS[idea.tag]||'tag-pr'}`}>{idea.tag}</span>
                      <span className="text-[10px] text-gray-600">0{i+1}</span>
                    </div>
                    <p className="text-sm font-bold text-white leading-snug">{idea.title}</p>
                    <p className="text-xs text-gray-400 leading-relaxed flex-1">{idea.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <XTrends trends={data?.xTrends||[]} loading={loading} date={getTrendDate()} />
            <ThemeAndIdeas />
            <ChecklistAndMemo />
          </div>
        </div>
        <footer className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-gray-700 flex-wrap gap-2">
          <span>trend catch</span>
          <span>PR TIMES / PR EDGE / Yahoo!ニュース / 朝日新聞 / 宣伝会議 / X トレンド</span>
        </footer>
      </div>
    </div>
  )
}
