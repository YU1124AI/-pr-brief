'use client'

interface Trend {
  rank: number
  term: string
  volume?: string
}

interface XTrendsProps {
  trends: Trend[]
  loading: boolean
  date: string
}

const rankColor = (r: number) => {
  if (r === 1) return 'text-yellow-400'
  if (r === 2) return 'text-gray-300'
  if (r === 3) return 'text-amber-600'
  return 'text-gray-600'
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {Array(10).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <div className="skeleton w-5 h-3 rounded" />
          <div className="skeleton flex-1 h-3 rounded" />
          <div className="skeleton w-12 h-3 rounded" />
        </div>
      ))}
    </div>
  )
}

export default function XTrends({ trends, loading, date }: XTrendsProps) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <div className="section-label mb-0">X トレンド（前日 / 日本）</div>
        </div>
        {date && <span className="text-[10px] text-gray-600">{date}</span>}
      </div>

      {loading ? (
        <Skeleton />
      ) : trends.length === 0 ? (
        <div className="text-center text-xs text-gray-600 py-6">
          <p>Xトレンドを取得できませんでした</p>
          <a
            href="https://trends24.in/japan/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-indigo-400 hover:underline"
          >
            Trends24で確認 →
          </a>
        </div>
      ) : (
        <div className="space-y-1.5">
          {trends.map((t) => (
            <a
              key={t.rank}
              href={`https://x.com/search?q=${encodeURIComponent(t.term)}&src=trend_click`}
              target="_blank"
              rel="noopener noreferrer"
              className="x-trend-item group"
            >
              <span className={`text-xs font-bold w-5 text-right flex-shrink-0 ${rankColor(t.rank)}`}>
                {t.rank}
              </span>
              <span className="text-sm text-gray-200 flex-1 group-hover:text-white transition-colors truncate">
                {t.term}
              </span>
              {t.volume && (
                <span className="text-[10px] text-gray-600 flex-shrink-0">{t.volume}</span>
              )}
              <svg className="w-3 h-3 text-gray-700 group-hover:text-gray-400 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      )}

      {/* Insight prompt */}
      {!loading && trends.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <p className="text-[11px] text-gray-600 mb-2">→ トレンドをPR視点で読む</p>
          <div className="text-[11px] text-gray-500 leading-relaxed space-y-1">
            <p>「なぜ今バズっているか？」を言語化し、</p>
            <p>生活者の共通言語としてキャンペーンに活かす。</p>
          </div>
        </div>
      )}
    </div>
  )
}
