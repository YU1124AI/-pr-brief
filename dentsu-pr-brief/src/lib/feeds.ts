import Parser from 'rss-parser'

export interface FeedItem {
  title: string
  link: string
  pubDate: string
  summary: string
  imageUrl?: string
  source: string
  tag: 'pr' | 'news' | 'ad' | 'trend' | 'global'
}

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
})

function cleanText(text: string): string {
  return (text || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractImage(item: any): string | undefined {
  if (item.mediaContent?.$.url) return item.mediaContent.$.url
  if (item.mediaThumbnail?.$.url) return item.mediaThumbnail.$.url
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) return item.enclosure.url

  const html =
    item.contentEncoded ||
    item['content:encoded'] ||
    item.content ||
    item.summary ||
    ''

  const m = html.match(/<img[^>]+src=["']([^"']+)["']/)
  if (m) return m[1]

  return undefined
}

async function fetchOgImage(url: string): Promise<string | undefined> {
  if (!url) return undefined

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      cache: 'no-store',
    })

    clearTimeout(timeout)

    if (!res.ok) return undefined

    const html = await res.text()

    const ogMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)

    if (!ogMatch?.[1]) return undefined

    return new URL(ogMatch[1], url).toString()
  } catch {
    return undefined
  }
}

function relativeTime(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''

  const diff = Date.now() - d.getTime()
  const m = Math.floor(diff / 60000)

  if (m < 1) return 'たった今'
  if (m < 60) return `${m}分前`

  const h = Math.floor(m / 60)
  if (h < 24) return `${h}時間前`

  return `${Math.floor(h / 24)}日前`
}

const PLACEHOLDER: Record<string, string> = {
  'PR TIMES': 'https://prtimes.jp/img/common/prtimes_ogp.png',
  'PR EDGE': 'https://predge.jp/wp-content/themes/prtimesmedia-theme/assets/img/meta/og_image.png',
  'Yahoo!ニュース': 'https://s.yimg.jp/images/top/ogp/fb_y_1500x1500.png',
  '朝日新聞': 'https://www.asahi.com/assets/templates/common/images/asahicom-ogpimage.png',
  'Web担当者Forum': 'https://webtan.impress.co.jp/sites/default/files/images/webtan-ogp.png',
  MarkeZine: 'https://markezine.jp/static/common/img/ogp.png',
  AdverTimes: 'https://www.advertimes.com/wp-content/themes/advertimes/assets/images/ogp.png',
}

async function mapFeedItem(
  item: any,
  source: string,
  tag: FeedItem['tag']
): Promise<FeedItem> {
  const link = item.link || ''
  const rssImage = extractImage(item)
  const ogImage = rssImage ? undefined : await fetchOgImage(link)

  return {
    title: item.title || '',
    link,
    pubDate: relativeTime(item.pubDate || item.isoDate || ''),
    summary: cleanText(item.contentSnippet || item.summary || item.content || '').slice(0, 90),
    imageUrl: rssImage || ogImage || PLACEHOLDER[source],
    source,
    tag,
  }
}

export async function fetchPRTimes(limit = 6): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL('https://prtimes.jp/index.rdf')
    const items = (feed.items || []).slice(0, limit)
    return await Promise.all(items.map((item: any) => mapFeedItem(item, 'PR TIMES', 'pr')))
  } catch {
    return []
  }
}

export async function fetchPREdge(limit = 6): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL('https://predge.jp/feed/')
    const items = (feed.items || []).slice(0, limit)
    return await Promise.all(items.map((item: any) => mapFeedItem(item, 'PR EDGE', 'ad')))
  } catch {
    return []
  }
}

export async function fetchWebTan(limit = 6): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL('https://webtan.impress.co.jp/rss.xml')
    const items = (feed.items || []).slice(0, limit)
    return await Promise.all(items.map((item: any) => mapFeedItem(item, 'Web担当者Forum', 'ad')))
  } catch {
    return []
  }
}

export async function fetchMarkeZine(limit = 6): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL('https://markezine.jp/rss/new/20/index.xml')
    const items = (feed.items || []).slice(0, limit)
    return await Promise.all(items.map((item: any) => mapFeedItem(item, 'MarkeZine', 'ad')))
  } catch {
    return []
  }
}

export async function fetchAdverTimes(limit = 6): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL('https://www.advertimes.com/feed/')
    const items = (feed.items || []).slice(0, limit)
    return await Promise.all(items.map((item: any) => mapFeedItem(item, 'AdverTimes', 'ad')))
  } catch {
    return []
  }
}

export async function fetchYahooNews(limit = 8): Promise<FeedItem[]> {
  try {
    const urls = [
      'https://news.yahoo.co.jp/rss/topics/top-picks.xml',
      'https://news.yahoo.co.jp/rss/topics/business.xml',
      'https://news.yahoo.co.jp/rss/topics/economy.xml',
      'https://news.yahoo.co.jp/rss/topics/entertainment.xml',
    ]

    const results = await Promise.allSettled(urls.map((u) => parser.parseURL(u)))
    const rawItems: any[] = []

    for (const r of results) {
      if (r.status === 'fulfilled') {
        rawItems.push(...(r.value.items || []).slice(0, 3))
      }
    }

    const items = rawItems.slice(0, limit)

    return await Promise.all(
      items.map((item: any) => mapFeedItem(item, 'Yahoo!ニュース', 'news'))
    )
  } catch {
    return []
  }
}

export async function fetchAsahi(limit = 4): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL('https://www.asahi.com/rss/asahi/newsheadlines.rdf')
    const items = (feed.items || []).slice(0, limit)
    return await Promise.all(items.map((item: any) => mapFeedItem(item, '朝日新聞', 'news')))
  } catch {
    return []
  }
}

export async function fetchXTrends(
  limit = 15
): Promise<{ rank: number; term: string; volume?: string }[]> {
  try {
    const feed = await parser.parseURL('https://trends24.in/japan/feed/')
    const items = (feed.items || []).slice(0, 2)
    const trends: { rank: number; term: string; volume?: string }[] = []

    for (const item of items) {
      const content = (item as any).content || (item as any)['content:encoded'] || ''
      const matches = content.matchAll(
        /<li[^>]*>.*?<a[^>]*>([^<]+)<\/a>(?:[^<]*<[^>]+>[^<]*<\/[^>]+>)*[^<]*(?:<span[^>]*>([^<]*)<\/span>)?/g
      )

      let rank = 1

      for (const m of matches) {
        if (rank > limit) break

        const term = m[1]?.trim()
        const vol = m[2]?.trim()

        if (term && !term.includes('http')) {
          trends.push({ rank, term, volume: vol || undefined })
          rank++
        }
      }

      if (trends.length > 0) break
    }

    return trends
  } catch {
    return []
  }
}

export const WEEKLY_THEMES = [
  {
    theme: 'Z世代の「推し消費」とブランド人格化',
    desc: '応援・共感消費が加速するZ世代。ブランドが"人格"を持つとき何が起きるか？',
  },
  {
    theme: '生成AI × 生活者体験の再設計',
    desc: 'AIが日常に溶け込む今、生活者の「体験」はどう変わるか？人間らしさを再定義するPR戦略。',
  },
  {
    theme: '社会課題をエンターテインメントにする',
    desc: 'SDGs疲れを越えて「楽しみながら行動変容」を促す。Cannes型の社会課題×クリエイティブの構造。',
  },
  {
    theme: 'リアル × デジタルの融合体験設計',
    desc: 'OMO時代の体験型PR。リアルとデジタルを橋渡しするキャンペーン設計の核心。',
  },
  {
    theme: 'インフルエンサー経済の次を読む',
    desc: '信頼経済・コミュニティ型影響力の時代に、PRはどう生活者に届けるか？',
  },
  {
    theme: 'ブランドの「沈黙」と「発言」を選ぶ基準',
    desc: '企業がいつ声を上げ、いつ沈黙すべきか？リスクコミュニケーションの設計思想。',
  },
  {
    theme: 'ローカルブランドの世界進出戦略',
    desc: '日本のローカルカルチャーが世界に刺さる「文脈」のつくり方。地域資産を武器にした海外PR。',
  },
  {
    theme: 'ウェルビーイングと消費行動の新関係',
    desc: '「豊かさの再定義」を起点にしたPRブランディング。健康・幸福感への意識が消費を変える。',
  },
]

export const IDEAS_BANK: Record<number, { t: string; d: string; k: string }[]> = {
  0: [
    {
      t: '#拒絶から推しへ',
      d: 'ブランドを一度否定した人が熱狂的なファンになる過程を本人がドキュメントするUGCキャンペーン。',
      k: 'インサイト：反転型感情の強度×SNS拡散構造',
    },
    {
      t: '共同制作型ブランドブック',
      d: 'Z世代10名とブランドの未来を共同執筆。制作過程をライブ配信し、最終版を書店で販売。',
      k: '仕掛け：参加×物語×リアル接点の三重構造',
    },
    {
      t: '「推し活費」可視化ツールPR',
      d: '年間推し消費額を可視化するウェブアプリを提供し感情を数値化。メディア露出とブランド親和性を同時獲得。',
      k: '構造：データ×感情×シェア動機の連鎖',
    },
  ],
  1: [
    {
      t: 'AIが「私だけの体験」を設計する',
      d: '生活者の行動データからAIがパーソナライズドイベントを提案。「自分のために作られた」感覚が話題を生む。',
      k: '核心：AIパーソナル化×驚き体験の設計',
    },
    {
      t: 'AIの判断を人間が添削するキャンペーン',
      d: 'ブランドのAI推薦に「人間の感性」で反論できるSNS企画。面白さがバイラルを生む。',
      k: '逆張り：AI×人間の緊張感をコンテンツ化',
    },
    {
      t: '「AIに伝わらないこと」収集プロジェクト',
      d: '生活者からAIに伝わらない感情・体験を募集し書籍化。人間らしさを再定義するブランドメッセージに。',
      k: '構造：課題収集→コンテンツ化→出版PR',
    },
  ],
}
