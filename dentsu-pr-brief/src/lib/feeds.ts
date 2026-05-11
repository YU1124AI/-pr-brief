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
    .replace(/\s+/g, ' ')
    .trim()
}

function extractImage(item: any): string | undefined {
  if (item.mediaContent?.$.url) return item.mediaContent.$.url
  if (item.mediaThumbnail?.$.url) return item.mediaThumbnail.$.url
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) return item.enclosure.url

  const html = item.contentEncoded || item['content:encoded'] || item.content || item.summary || ''
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/)
  return m?.[1]
}

async function fetchOgImage(url: string): Promise<string | undefined> {
  if (!url) return undefined

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
    })

    if (!res.ok) return undefined

    const html = await res.text()

    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)

    if (!match?.[1]) return undefined

    return new URL(match[1], url).toString()
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

async function mapFeedItem(item: any, source: string, tag: FeedItem['tag']): Promise<FeedItem> {
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
    return await Promise.all((feed.items || []).slice(0, limit).map((item: any) => mapFeedItem(item, 'PR TIMES', 'pr')))
  } catch {
    return []
  }
}

export async function fetchPREdge(limit = 6): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL('https://predge.jp/feed/')
    return await Promise.all((feed.items || []).slice(0, limit).map((item: any) => mapFeedItem(item, 'PR EDGE', 'ad')))
  } catch {
    return []
  }
}

export async function fetchWebTan(limit = 6): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL('https://webtan.impress.co.jp/rss.xml')
    return await Promise.all((feed.items || []).slice(0, limit).map((item: any) => mapFeedItem(item, 'Web担当者Forum', 'ad')))
  } catch {
    return []
  }
}

export async function fetchMarkeZine(limit = 6): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL('https://markezine.jp/rss/new/20/index.xml')
    return await Promise.all((feed.items || []).slice(0, limit).map((item: any) => mapFeedItem(item, 'MarkeZine', 'ad')))
  } catch {
    return []
  }
}

export async function fetchAdverTimes(limit = 6): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL('https://www.advertimes.com/feed/')
    return await Promise.all((feed.items || []).slice(0, limit).map((item: any) => mapFeedItem(item, 'AdverTimes', 'ad')))
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

    return await Promise.all(rawItems.slice(0, limit).map((item: any) => mapFeedItem(item, 'Yahoo!ニュース', 'news')))
  } catch {
    return []
  }
}

export async function fetchAsahi(limit = 4): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL('https://www.asahi.com/rss/asahi/newsheadlines.rdf')
    return await Promise.all((feed.items || []).slice(0, limit).map((item: any) => mapFeedItem(item, '朝日新聞', 'news')))
  } catch {
    return []
  }
}

export async function fetchXTrends(limit = 15): Promise<{ rank: number; term: string; volume?: string }[]> {
  try {
    const feed = await parser.parseURL('https://trends24.in/japan/feed/')
    const item = (feed.items || [])[0] as any
    const content = item?.content || item?.['content:encoded'] || ''
    const trends: { rank: number; term: string; volume?: string }[] = []

    const matches = content.matchAll(/<li[^>]*>.*?<a[^>]*>([^<]+)<\/a>/g)

    let rank = 1
    for (const m of matches) {
      if (rank > limit) break
      const term = m[1]?.trim()
      if (term && !term.includes('http')) {
        trends.push({ rank, term })
        rank++
      }
    }

    return trends
  } catch {
    return []
  }
}

export const WEEKLY_THEMES = [
  {
    theme: 'インフルエンサー経済の次を読む',
    desc: '信頼経済・コミュニティ型影響力の時代に、PRはどう生活者に届けるか？',
  },
  {
    theme: '生成AI × 生活者体験の再設計',
    desc: 'AIが日常に溶け込む今、生活者体験はどう変わるか？',
  },
  {
    theme: '社会課題をエンターテインメントにする',
    desc: '社会課題を楽しく参加できる体験に変えるPR設計。',
  },
]

export const IDEAS_BANK: Record<number, { t: string; d: string; k: string }[]> = {
  0: [
    {
      t: 'ナノインフルエンサー記者団',
      d: 'フォロワー数ではなくリアルな生活者視点を持つ人を記者化するPR。',
      k: '生活者発信×信頼経済',
    },
    {
      t: 'コミュニティ共創商品',
      d: 'ファンや利用者を企画段階から巻き込み、開発過程も発信する。',
      k: '共創×発売前話題化',
    },
    {
      t: 'バズを禁止するPR宣言',
      d: 'あえてバズを狙わない姿勢を打ち出し、誠実なブランド姿勢を話題化する。',
      k: '逆張り×信頼形成',
    },
  ],
  1: [
    {
      t: 'AIに伝わらない感情募集',
      d: 'AIでは表現しにくい感情や体験を生活者から集めるキャンペーン。',
      k: 'AI時代×人間らしさ',
    },
    {
      t: 'AI診断を人間が添削',
      d: 'AIの提案に人間がツッコミを入れる参加型SNS企画。',
      k: 'AI×参加型コンテンツ',
    },
    {
      t: '私だけの体験設計',
      d: 'AIで一人ひとりに違うブランド体験を提示する。',
      k: 'パーソナライズ×体験PR',
    },
  ],
  2: [
    {
      t: '社会課題ゲーム化',
      d: 'ゴミ拾いや節電などをゲーム感覚で参加できる形にする。',
      k: '行動変容×エンタメ',
    },
    {
      t: '失敗白書PR',
      d: '失敗や学びを正直に公開し、誠実さをブランド資産に変える。',
      k: '透明性×信頼獲得',
    },
    {
      t: '課題をアート化',
      d: '社会課題をアーティストと翻訳し、展示やSNSで広げる。',
      k: '社会課題×文化化',
    },
  ],
}
