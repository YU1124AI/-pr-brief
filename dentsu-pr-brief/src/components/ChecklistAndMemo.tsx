'use client'
import { useState, useEffect } from 'react'

const CHECKS = [
  { id: 'c1', label: 'Yahoo!ニュース — 「なぜ話題？」を1行で言語化' },
  { id: 'c2', label: 'Xトレンド — 生活者の共通言語を把握した' },
  { id: 'c3', label: 'PR TIMES — 気になるリリース1件をメモ' },
  { id: 'c4', label: 'PR EDGE — 事例1件を5項目で構造化した' },
  { id: 'c5', label: '今週のお題に絡む情報を1つ見つけた' },
  { id: 'c6', label: '違和感メモを1件記録した' },
]

const SK_CHECKS = 'dpr_checks_v2'
const SK_MEMOS  = 'dpr_memos_v2'
const SK_DATE   = 'dpr_date_v2'

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function ChecklistAndMemo() {
  const [checks, setChecks]   = useState<Record<string, boolean>>({})
  const [memos, setMemos]     = useState<string[]>([])
  const [memoInput, setMemoInput] = useState('')

  useEffect(() => {
    const today = getTodayStr()
    const savedDate = localStorage.getItem(SK_DATE)
    if (savedDate !== today) {
      // 9:00 reset — new day clears checks
      localStorage.setItem(SK_DATE, today)
      localStorage.removeItem(SK_CHECKS)
    }
    try { setChecks(JSON.parse(localStorage.getItem(SK_CHECKS) || '{}')) } catch {}
    try { setMemos(JSON.parse(localStorage.getItem(SK_MEMOS) || '[]')) } catch {}
  }, [])

  const toggle = (id: string) => {
    const next = { ...checks, [id]: !checks[id] }
    setChecks(next)
    localStorage.setItem(SK_CHECKS, JSON.stringify(next))
  }

  const addMemo = () => {
    const v = memoInput.trim()
    if (!v) return
    const next = [...memos, v]
    setMemos(next)
    localStorage.setItem(SK_MEMOS, JSON.stringify(next))
    setMemoInput('')
  }

  const removeMemo = (i: number) => {
    const next = memos.filter((_, idx) => idx !== i)
    setMemos(next)
    localStorage.setItem(SK_MEMOS, JSON.stringify(next))
  }

  const done  = CHECKS.filter(c => checks[c.id]).length
  const total = CHECKS.length
  const pct   = Math.round((done / total) * 100)

  return (
    <div className="space-y-4">
      {/* Checklist */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="section-label mb-0">今日の9:00チェックリスト</div>
          <span className="text-xs text-gray-500">{done}/{total}</span>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-white/5 rounded-full mb-4 mt-2">
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>

        <div className="space-y-1">
          {CHECKS.map(c => (
            <label
              key={c.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all
                ${checks[c.id] ? 'opacity-40' : 'hover:bg-white/4'}`}
            >
              <input
                type="checkbox"
                checked={!!checks[c.id]}
                onChange={() => toggle(c.id)}
                className="flex-shrink-0"
              />
              <span className={`text-sm ${checks[c.id] ? 'line-through text-gray-600' : 'text-gray-300'}`}>
                {c.label}
              </span>
            </label>
          ))}
        </div>

        {done === total && (
          <div className="mt-4 text-center text-sm text-emerald-400 animate-fade-in">
            ✓ 今日のルーティン完了！ 素晴らしいインプットができました。
          </div>
        )}
      </div>

      {/* Memo */}
      <div className="glass rounded-2xl p-5">
        <div className="section-label">違和感メモ — アイデアの種</div>

        {memos.length === 0 && (
          <p className="text-xs text-gray-600 mb-3">なぜ？と思ったことを記録しましょう</p>
        )}

        <div className="space-y-2 mb-3">
          {memos.map((m, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-white/3 border border-white/5 group">
              <svg className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-xs text-gray-300 flex-1 leading-relaxed">{m}</span>
              <button
                onClick={() => removeMemo(i)}
                className="text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={memoInput}
            onChange={e => setMemoInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMemo()}
            placeholder="違和感・気づき・なぜ？をひとことで..."
            maxLength={80}
            className="flex-1 text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2
                       text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
          />
          <button
            onClick={addMemo}
            className="text-sm px-3 py-2 glass border border-white/10 rounded-lg
                       hover:border-indigo-500/40 hover:text-indigo-300 transition-all"
          >
            追加
          </button>
        </div>
      </div>

      {/* Structure frame */}
      <div className="glass rounded-2xl p-5">
        <div className="section-label">事例構造化フレーム</div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { icon: '🎯', label: '課題設定' },
            { icon: '🧠', label: 'インサイト' },
            { icon: '💡', label: 'アイデア核心' },
            { icon: '⚙️', label: '仕掛け実装' },
            { icon: '❤️', label: '生活者反応' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/3 border border-white/5 text-center">
              <span className="text-lg">{s.icon}</span>
              <span className="text-[10px] text-gray-400 leading-tight">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
