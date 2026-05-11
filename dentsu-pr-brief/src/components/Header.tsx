'use client'
import { useEffect, useState } from 'react'

interface HeaderProps {
  fetchedAt: string
  onRefresh: () => void
  loading: boolean
}

export default function Header({ fetchedAt, onRefresh, loading }: HeaderProps) {
  const [now, setNow] = useState('')
  const [nextReset, setNextReset] = useState('')

  useEffect(() => {
    const update = () => {
      const d = new Date()
      const days = ['日', '月', '火', '水', '木', '金', '土']
      setNow(`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${days[d.getDay()]}）`)
      // Next 9:00 reset
      const next9 = new Date(d)
      next9.setHours(9, 0, 0, 0)
      if (next9 <= d) next9.setDate(next9.getDate() + 1)
      const diff = next9.getTime() - d.getTime()
      const hh = Math.floor(diff / 3600000)
      const mm = Math.floor((diff % 3600000) / 60000)
      setNextReset(`次回リセット：${hh}時間${mm}分後`)
    }
    update()
    const iv = setInterval(update, 30000)
    return () => clearInterval(iv)
  }, [])

  const ftLabel = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) + ' 取得'
    : ''

  return (
    <header className="flex items-start justify-between mb-8 gap-4 flex-wrap">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="live-dot" />
          <h1 className="text-xl font-bold gradient-text tracking-wide">Morning Brief</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full glass border border-indigo-500/30 text-indigo-300 font-medium">
            電通PR
          </span>
        </div>
        <p className="text-sm text-gray-500">{now}</p>
        <p className="text-xs text-gray-600 mt-0.5">{nextReset}</p>
      </div>

      <div className="flex items-center gap-3">
        {ftLabel && (
          <span className="text-xs text-gray-600">{ftLabel}</span>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 glass rounded-lg border border-white/10
                     hover:border-indigo-500/40 hover:text-indigo-300 transition-all disabled:opacity-40"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? '取得中...' : '今すぐ更新'}
        </button>
      </div>
    </header>
  )
}
