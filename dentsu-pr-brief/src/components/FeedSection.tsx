'use client'
import Image from 'next/image'
import { FeedItem } from '@/lib/feeds'

const TAG_LABELS: Record<string, string> = {
  pr: 'PR TIMES', news: 'Yahoo!ニュース', ad: 'PR EDGE', trend: 'トレンド', global: 'グローバル'
}

function Skeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="skeleton h-40 w-full" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
      </div>
    </div>
  )
}

interface FeedCardProps {
  item: FeedItem
}

function FeedCard({ item }: FeedCardProps) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="glass glass-hover img-card rounded-2xl flex flex-col block transition-all group"
    >
      {/* Image area */}
      <div className="relative w-full h-40 bg-gray-900/60 overflow-hidden rounded-t-2xl flex-shrink-0">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Tag overlay */}
        <span className={`absolute top-2 left-2 tag-${item.tag} text-[10px] px-2 py-0.5 rounded-full font-medium`}>
          {TAG_LABELS[item.tag] || item.source}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        <p className="text-xs font-medium text-white leading-snug mb-1.5 line-clamp-2 group-hover:text-indigo-200 transition-colors">
          {item.title}
        </p>
        {item.summary && (
          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 flex-1">{item.summary}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-gray-600">{item.source}</span>
          <span className="text-[10px] text-gray-600">{item.pubDate}</span>
        </div>
      </div>
    </a>
  )
}

interface FeedSectionProps {
  title: string
  icon: React.ReactNode
  items: FeedItem[]
  loading: boolean
  cols?: number
}

export default function FeedSection({ title, icon, items, loading, cols = 3 }: FeedSectionProps) {
  const gridCols = cols === 2
    ? 'grid-cols-1 sm:grid-cols-2'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-400">{icon}</span>
        <div className="section-label mb-0">{title}</div>
      </div>

      <div className={`grid ${gridCols} gap-3`}>
        {loading
          ? Array(cols === 2 ? 2 : 3).fill(0).map((_, i) => <Skeleton key={i} />)
          : items.length === 0
            ? <div className="col-span-full text-center text-xs text-gray-600 py-8 glass rounded-2xl">
                データを取得できませんでした。時間をおいて再試行してください。
              </div>
            : items.map((item, i) => <FeedCard key={i} item={item} />)
        }
      </div>
    </div>
  )
}
