'use client'
import { useState, useEffect } from 'react'
import { WEEKLY_THEMES, IDEAS_BANK } from '@/lib/feeds'

export default function ThemeAndIdeas() {
  const [weekNum, setWeekNum] = useState(0)
  const [customTheme, setCustomTheme] = useState('')
  const [inputVal, setInputVal] = useState('')
  const [currentTheme, setCurrentTheme] = useState(WEEKLY_THEMES[0])
  const [ideas, setIdeas] = useState(IDEAS_BANK[0])
  const [deepening, setDeepening] = useState(false)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('dpr_custom_theme') : null
    const d = new Date()
    const jan = new Date(d.getFullYear(), 0, 1)
    const wn = Math.ceil(((d.getTime() - jan.getTime()) / 86400000 + jan.getDay() + 1) / 7)
    setWeekNum(wn)
    const idx = wn % WEEKLY_THEMES.length
    const theme = stored ? { theme: stored, desc: `カスタムテーマ：${stored}をもとにアイデアを設計する` } : WEEKLY_THEMES[idx]
    setCurrentTheme(theme)
    setCustomTheme(stored || '')
    setIdeas(IDEAS_BANK[idx])
  }, [])

  const handleSetTheme = () => {
    if (!inputVal.trim()) return
    const t = { theme: inputVal.trim(), desc: `カスタムテーマ：${inputVal.trim()}をもとにアイデアを設計する` }
    setCurrentTheme(t)
    setCustomTheme(inputVal.trim())
    localStorage.setItem('dpr_custom_theme', inputVal.trim())
    setInputVal('')
  }

  const handleReset = () => {
    localStorage.removeItem('dpr_custom_theme')
    const d = new Date()
    const jan = new Date(d.getFullYear(), 0, 1)
    const wn = Math.ceil(((d.getTime() - jan.getTime()) / 86400000 + jan.getDay() + 1) / 7)
    const idx = wn % WEEKLY_THEMES.length
    setCurrentTheme(WEEKLY_THEMES[idx])
    setCustomTheme('')
  }

  return (
    <div className="space-y-4">
      {/* Weekly Theme */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="section-label">weekly theme — 第{weekNum}週</div>
          {customTheme && (
            <button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              週次テーマに戻す
            </button>
          )}
        </div>
        <h2 className="text-lg font-bold text-white mb-1.5 leading-snug">{currentTheme.theme}</h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{currentTheme.desc}</p>

        {/* Custom theme input */}
        <div className="flex gap-2">
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSetTheme()}
            placeholder="独自テーマを設定（例：推し消費×ブランド人格化）"
            className="flex-1 text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2
                       text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
          />
          <button
            onClick={handleSetTheme}
            className="text-sm px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50
                       border border-indigo-500/40 rounded-lg text-indigo-300 transition-all whitespace-nowrap"
          >
            設定
          </button>
        </div>
      </div>

      {/* AI Ideas */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="section-label">AI idea — 今週のお題から3案</div>
          <button
            onClick={() => {
              setDeepening(true)
              setTimeout(() => setDeepening(false), 1500)
            }}
            className="text-xs px-3 py-1.5 glass rounded-lg border border-indigo-500/30
                       text-indigo-300 hover:bg-indigo-500/10 transition-all"
          >
            深掘りを依頼 ↗
          </button>
        </div>

        <div className="text-xs text-gray-500 mb-3">お題：{currentTheme.theme}</div>

        <div className="space-y-3">
          {ideas.map((idea, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-indigo-500/20 transition-all">
              <div className="idea-num mt-0.5">{String(i+1).padStart(2,'0')}</div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white mb-1">{idea.t}</div>
                <div className="text-xs text-gray-400 leading-relaxed mb-1.5">{idea.d}</div>
                <div className="text-xs text-indigo-400/70">{idea.k}</div>
              </div>
            </div>
          ))}
        </div>

        {deepening && (
          <div className="mt-3 text-xs text-center text-indigo-400 animate-pulse">
            Claude に深掘りを送信中...
          </div>
        )}
      </div>
    </div>
  )
}
