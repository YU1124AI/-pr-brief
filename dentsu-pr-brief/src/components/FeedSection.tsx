import { FeedItem } from '@/lib/feeds'

interface FeedSectionProps {
  title: string
  icon: React.ReactNode
  items: FeedItem[]
  loading: boolean
  cols?: number
}

const FALLBACK_IMAGES: Record<string, string> = {
  'PR TIMES': 'https://prtimes.jp/img/common/prtimes_ogp.png',
  'PR EDGE': 'https://predge.jp/wp-content/themes/prtimesmedia-theme/assets/img/meta/og_image.png',
  'Yahoo!ニュース': 'https://s.yimg.jp/images/top/ogp/fb_y_1500x1500.png',
  '朝日新聞': 'https://www.asahi.com/assets/templates/common/images/asahicom-ogpimage.png',
  'Web担当者Forum': 'https://webtan.impress.co.jp/sites/default/files/images/webtan-ogp.png',
  MarkeZine: 'https://markezine.jp/static/common/img/ogp.png',
  AdverTimes: 'https://www.advertimes.com/wp-content/themes/advertimes/assets/images/ogp.png',
}

function getFallbackImage(source: string) {
  return FALLBACK_IMAGES[source] || FALLBACK_IMAGES['PR TIMES']
}

export default function FeedSection({
  title,
  icon,
  items,
  loading,
  cols = 3,
}: FeedSectionProps) {
  const gridCols =
    cols === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

  return (
    <section>
      <div className="flex items-center gap-2 mb-3 text-gray-400">
        {icon}
        <div className="section-label mb-0">{title}</div>
      </div>

      {loading ? (
        <div className={`grid ${gridCols} gap-4`}>
          {Array(cols)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <div className="skeleton h-40 w-full" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-4 w-5/6 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                </div>
              </div>
            ))}
        </div>
      ) : items.length > 0 ? (
        <div className={`grid ${gridCols} gap-4`}>
          {items.map((item, i) => (
            <a
              key={`${item.link}-${i}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass glass-hover rounded-2xl overflow-hidden group block"
            >
              <div className="relative h-40 bg-white/5 overflow-hidden">
                <img
                  src={item.imageUrl || getFallbackImage(item.source)}
                  alt={item.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    const img = e.currentTarget
                    const fallback = getFallbackImage(item.source)

                    if (img.src !== fallback) {
                      img.src = fallback
                    } else {
                      img.style.display = 'none'
                    }
                  }}
                />

                <div className="absolute top-3 left-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-white border border-white/10">
                    {item.source}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 mb-2 group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>

                {item.summary && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
                    {item.summary}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-gray-600">
                  <span>{item.source}</span>
                  <span>{item.pubDate}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 text-sm text-gray-500">
          データを取得できませんでした。時間をおいて再試行してください。
        </div>
      )}
    </section>
  )
}
