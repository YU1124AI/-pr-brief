'use client'
import { useEffect, useState } from 'react'

export default function Header({ fetchedAt, onRefresh, loading, summaryContext }: any) {
  const [now, setNow] = useState('')
  const [nextReset, setNextReset] = useState('')
  const [yesterday, setYesterday] = useState('')

  useEffect(() => {
    const update = () => {
      const d = new Date()
      const days = ['日','月','火','水','木','金','土']
      setNow(`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${days[d.getDay()]}）`)
      const yest = new Date(d)
      yest.setDate(yest.getDate() - 1)
      setYesterday(`${yest.getMonth()+1}月${yest.getDate()}日`)
      const next9 = new Date(d)
      next9.setHours(9,0,0,0)
      if (next9 <= d) next9.setDate(next9.getDate()+1)
      const diff = next9.getTime() - d.getTime()
      const hh = Math.floor(diff/3600000)
      const mm = Math.floor((diff%3600000)/60000)
      setNextReset(`次回リセット：${hh}時間${mm}分後`)
    }
    update()
    const iv = setInterval(update, 30000)
    return () => clearInterval(iv)
  }, [])

  const ftLabel = fetchedAt ? new Date(fetchedAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})+' 取得' : ''

  return (
    <header className="mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="live-dot" />
            <h1 className="text-xl font-bold gradient-text tracking-wide">trend catch</h1>
          </div>
          <p className="text-sm text-gray-500">{now}</p>
          <p className="text-xs text-gray-600 mt-0.5">{nextReset}</p>
        </div>
        <div className="flex items-center gap-3">
          {ftLabel && <span className="text-xs text-gray-600">{ftLabel}</span>}
          <button onClick={onRefresh} disabled={loading}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 glass rounded-lg border border-white/10 hover:border-indigo-500/40 hover:text-indigo-300 transition-all disabled:opacity-40">
            <svg className={`w-3.5 h-3.5 ${loading?'animate-spin':''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {loading?'取得中...':'今すぐ更新'}
          </button>
        </div>
      </div>
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="section-label mb-0">{yesterday}（昨日）の要約</span>
        </div>
        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-3 w-full rounded"/>
            <div className="skeleton h-3 w-4/5 rounded"/>
          </div>
        ) : summaryContext ? (
          <div className="space-y-2.5">
            <div className="flex gap-3 items-start">
              <span className="text-[10px] px-2 py-0.5 rounded-full tag-news flex-shrink-0 mt-0.5">ニュース</span>
              <p className="text-xs text-gray-400 leading-relaxed">{summaryContext.topNews||'取得中...'}</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-[10px] px-2 py-0.5 rounded-full tag-pr flex-shrink-0 mt-0.5">PR</span>
              <p className="text-xs text-gray-400 leading-relaxed">{summaryContext.topPR||'取得中...'}</p>
            </div>
            {summaryContext.topTrends&&(
              <div className="flex gap-3 items-start">
                <span className="text-[10px] px-2 py-0.5 rounded-full tag-x flex-shrink-0 mt-0.5">X</span>
                <p className="text-xs text-gray-400 leading-relaxed">トレンド：{summaryContext.topTrends}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-600">情報を読み込んでいます...</p>
        )}
      </div>
    </header>
  )
}
