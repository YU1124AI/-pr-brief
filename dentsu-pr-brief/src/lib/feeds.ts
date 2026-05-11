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
    ],
  },
})

function extractImage(item: any): string | undefined {
  if (item.mediaContent?.$.url) return item.mediaContent.$.url
  if (item.mediaThumbnail?.$.url) return item.mediaThumbnail.$.url
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) return item.enclosure.url
  const html = item['content:encoded'] || item.content || item.summary || ''
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/)
  if (m) return m[1]
  return undefined
}

function relativeTime(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const diff = Date.now() - d.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}分前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}時間前`
  return `${Math.floor(h / 24)}日前`
}

const PLACEHOLDER: Record<string, string> = {
  'PR TIMES':   'https://prtimes.jp/img/common/prtimes_ogp.png',
  'PR EDGE':    'https://predge.jp/wp-content/themes/prtimesmedia-theme/assets/img/meta/og_image.png',
  'Yahoo!ニュース': 'https://s.yimg.jp/images/top/ogp/fb_y_1500x1500.png',
  '朝日新聞':     'https://www.asahi.com/assets/templates/common/images/asahicom-ogpimage.png',
  '宣伝会議':     'https://www.sendenkaigi.com/wp-content/uploads/2020/04/ogp_default.jpg',
  '広報会議':     'https://www.sendenkaigi.com/wp-content/uploads/2020/04/ogp_default.jpg',
}

export async function fetchPRTimes(limit = 6): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL('https://prtimes.jp/index.rdf')
    return (feed.items || []).slice(0, limit).map((item: any) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: relativeTime(item.pubDate || ''),
      summary: (item.contentSnippet || item.summary || '').replace(/<[^>]+>/g,'').slice(0, 90),
      imageUrl: extractImage(item) || PLACEHOLDER['PR TIMES'],
      source: 'PR TIMES',
      tag: 'pr' as const,
    }))
  } catch { return [] }
}

export async function fetchPREdge(limit = 5): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL('https://predge.jp/feed/')
    return (feed.items || []).slice(0, limit).map((item: any) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: relativeTime(item.pubDate || ''),
      summary: (item.contentSnippet || item.summary || '').replace(/<[^>]+>/g,'').slice(0, 90),
      imageUrl: extractImage(item) || PLACEHOLDER['PR EDGE'],
      source: 'PR EDGE',
      tag: 'ad' as const,
    }))
  } catch { return [] }
}

export async function fetchYahooNews(limit = 8): Promise<FeedItem[]> {
  try {
    const urls = [
      'https://news.yahoo.co.jp/rss/topics/top-picks.xml',
      'https://news.yahoo.co.jp/rss/topics/business.xml',
      'https://news.yahoo.co.jp/rss/topics/economy.xml',
      'https://news.yahoo.co.jp/rss/topics/entertainment.xml',
    ]
    const results = await Promise.allSettled(urls.map(u => parser.parseURL(u)))
    const items: FeedItem[] = []
    for (const r of results) {
      if (r.status === 'fulfilled') {
        for (const item of (r.value.items || []).slice(0, 3)) {
          items.push({
            title: (item as any).title || '',
            link: (item as any).link || '',
            pubDate: relativeTime((item as any).pubDate || ''),
            summary: ((item as any).contentSnippet || '').slice(0, 90),
            imageUrl: PLACEHOLDER['Yahoo!ニュース'],
            source: 'Yahoo!ニュース',
            tag: 'news' as const,
          })
        }
      }
    }
    return items.slice(0, limit)
  } catch { return [] }
}

export async function fetchAsahi(limit = 4): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL('https://www.asahi.com/rss/asahi/newsheadlines.rdf')
    return (feed.items || []).slice(0, limit).map((item: any) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: relativeTime(item.pubDate || ''),
      summary: (item.contentSnippet || item.summary || '').replace(/<[^>]+>/g,'').slice(0, 90),
      imageUrl: extractImage(item) || PLACEHOLDER['朝日新聞'],
      source: '朝日新聞',
      tag: 'news' as const,
    }))
  } catch { return [] }
}

export async function fetchSendenKaigi(limit = 6): Promise<FeedItem[]> {
  try {
    const urls = [
      'https://www.sendenkaigi.com/marketing/media/sendenkaigi/feed/',
      'https://www.sendenkaigi.com/marketing/media/kouhoukaigi/feed/',
    ]
    const results = await Promise.allSettled(urls.map(u => parser.parseURL(u)))
    const items: FeedItem[] = []
    for (const r of results) {
      if (r.status === 'fulfilled') {
        for (const item of (r.value.items || []).slice(0, 3)) {
          const src = ((item as any).link || '').includes('kouhoukaigi') ? '広報会議' : '宣伝会議'
          items.push({
            title: (item as any).title || '',
            link: (item as any).link || '',
            pubDate: relativeTime((item as any).pubDate || ''),
            summary: ((item as any).contentSnippet || '').replace(/<[^>]+>/g,'').slice(0, 90),
            imageUrl: extractImage(item) || PLACEHOLDER[src],
            source: src,
            tag: 'ad' as const,
          })
        }
      }
    }
    return items.slice(0, limit)
  } catch { return [] }
}

export async function fetchXTrends(limit = 15): Promise<{ rank: number; term: string; volume?: string }[]> {
  try {
    const feed = await parser.parseURL('https://trends24.in/japan/feed/')
    const items = (feed.items || []).slice(0, 2)
    const trends: { rank: number; term: string; volume?: string }[] = []
    for (const item of items) {
      const content = (item as any).content || (item as any)['content:encoded'] || ''
      const matches = content.matchAll(/<li[^>]*>.*?<a[^>]*>([^<]+)<\/a>(?:[^<]*<[^>]+>[^<]*<\/[^>]+>)*[^<]*(?:<span[^>]*>([^<]*)<\/span>)?/g)
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
    if (trends.length === 0 && items.length > 0) {
      const content = (items[0] as any).content || ''
      const liMatches = [...content.matchAll(/<li[^>]*>([^<]{1,60})<\/li>/g)]
      liMatches.slice(0, limit).forEach((m, i) => {
        const term = m[1].replace(/&amp;/g,'&').replace(/&#\d+;/g,'').trim()
        if (term) trends.push({ rank: i+1, term })
      })
    }
    return trends
  } catch { return [] }
}

export const WEEKLY_THEMES = [
  { theme: 'Z世代の「推し消費」とブランド人格化', desc: '応援・共感消費が加速するZ世代。ブランドが"人格"を持つとき何が起きるか？' },
  { theme: '生成AI × 生活者体験の再設計', desc: 'AIが日常に溶け込む今、生活者の「体験」はどう変わるか？人間らしさを再定義するPR戦略。' },
  { theme: '社会課題をエンターテインメントにする', desc: 'SDGs疲れを越えて「楽しみながら行動変容」を促す。Cannes型の社会課題×クリエイティブの構造。' },
  { theme: 'リアル × デジタルの融合体験設計', desc: 'OMO時代の体験型PR。リアルとデジタルを橋渡しするキャンペーン設計の核心。' },
  { theme: 'インフルエンサー経済の次を読む', desc: '信頼経済・コミュニティ型影響力の時代に、PRはどう生活者に届けるか？' },
  { theme: 'ブランドの「沈黙」と「発言」を選ぶ基準', desc: '企業がいつ声を上げ、いつ沈黙すべきか？リスクコミュニケーションの設計思想。' },
  { theme: 'ローカルブランドの世界進出戦略', desc: '日本のローカルカルチャーが世界に刺さる「文脈」のつくり方。地域資産を武器にした海外PR。' },
  { theme: 'ウェルビーイングと消費行動の新関係', desc: '「豊かさの再定義」を起点にしたPRブランディング。健康・幸福感への意識が消費を変える。' },
]

export const IDEAS_BANK: Record<number, { t: string; d: string; k: string }[]> = {
  0: [
    { t: '#拒絶から推しへ', d: 'ブランドを一度否定した人が熱狂的なファンになる過程を本人がドキュメントするUGCキャンペーン。', k: 'インサイト：反転型感情の強度×SNS拡散構造' },
    { t: '共同制作型ブランドブック', d: 'Z世代10名とブランドの未来を共同執筆。制作過程をライブ配信し、最終版を書店で販売。', k: '仕掛け：参加×物語×リアル接点の三重構造' },
    { t: '「推し活費」可視化ツールPR', d: '年間推し消費額を可視化するウェブアプリを提供し感情を数値化。メディア露出とブランド親和性を同時獲得。', k: '構造：データ×感情×シェア動機の連鎖' },
  ],
  1: [
    { t: 'AIが「私だけの体験」を設計する', d: '生活者の行動データからAIがパーソナライズドイベントを提案。「自分のために作られた」感覚が話題を生む。', k: '核心：AIパーソナル化×驚き体験の設計' },
    { t: 'AIの判断を人間が添削するキャンペーン', d: 'ブランドのAI推薦に「人間の感性」で反論できるSNS企画。面白さがバイラルを生む。', k: '逆張り：AI×人間の緊張感をコンテンツ化' },
    { t: '「AIに伝わらないこと」収集プロジェクト', d: '生活者からAIに伝わらない感情・体験を募集し書籍化。人間らしさを再定義するブランドメッセージに。', k: '構造：課題収集→コンテンツ化→出版PR' },
  ],
  2: [
    { t: '課題を「遊び場」にする', d: 'ゴミ拾いをゲーム化し、参加者数がリアルタイムでOOHに表示される仕掛け。行動→可視化→拡散の三段設計。', k: 'エンタメ化：行動変容のゲーミフィケーション' },
    { t: '社会課題をアーティストに翻訳させる', d: '3テーマを3組のアーティストが作品化。企業は「場」だけを提供し、メッセージは作品が語る。', k: '仕掛け：企業の透明化×アート×共感設計' },
    { t: '失敗白書PR', d: '社会課題解決に失敗した取り組みを正直に公開。誠実さが信頼獲得とメディア露出を生む。', k: '逆張り：失敗の開示が最大の信頼資産になる' },
  ],
  3: [
    { t: 'リアル店舗を「記憶の劇場」に', d: 'QRを読むと棚の商品に紐づく誰かのエピソードが流れるアプリ。購買体験を情緒的物語に変換する。', k: '構造：デジタル文脈×リアル体験×感情接続' },
    { t: '行動の「開始点」だけをデジタルで設計', d: 'アプリがゴールを提示し、達成はリアル店舗で体験する設計。デジタルとリアルの役割を明確に分けた融合体験。', k: '設計：デジタル＝起点、リアル＝完結の役割分担' },
    { t: '街がキャンバスになるAR体験', d: '特定エリアでスマホを向けると社会課題に紐づくビジュアルが出現。体験投稿が情報拡散の主体になる。', k: '仕掛け：AR×OOH×UGC拡散の連鎖設計' },
  ],
  4: [
    { t: 'ナノインフルエンサーを「取材記者」にする', d: 'フォロワー1000人以下の生活者に「ブランド記者証」を与え工場・研究所に招待。リアルな発信が信頼を生む。', k: '逆転：マイクロ化×誠実さ×信頼経済の三位一体' },
    { t: 'コミュニティから先に作る新商品開発', d: 'コアファン100人と3ヶ月かけて商品を共同開発し、発売前から熱量を醸成。', k: '構造：共創→関係→発売→拡散の四段フロー' },
    { t: '「バズを禁止する」PR宣言', d: '一切バズを狙わない、口コミだけで広げるキャンペーンを宣言。その宣言自体がバズを生む逆説設計。', k: '逆張り：制約×逆説×メタPRの構造' },
  ],
  5: [
    { t: '「発言しない理由」を先に公開する', d: '社会課題について発言しない理由を透明に開示した上で、どんな条件なら発言するかを宣言するPR。', k: '逆張り：沈黙の開示が信頼を生む構造' },
    { t: 'ブランドの「炎上仮説書」', d: '炎上しうるシナリオをあえて公開し、リスクと向き合う姿勢をコンテンツにする。', k: '透明化：想定リスクの可視化が強さに転換' },
    { t: '社員の「迷い」をドキュメントする', d: '社内で議論する過程をドキュメンタリー公開。「迷いながら向き合う姿」が生活者共感を獲得。', k: '構造：プロセス公開×共感×誠実さの連鎖' },
  ],
  6: [
    { t: 'ローカルの「語感」で世界に届ける', d: '日本語のオノマトペを翻訳不能なまま世界発信。翻訳の不完全さが独自性になる逆説。', k: '逆転：翻訳できないことが最大の強さになる' },
    { t: '地元の「当たり前」を外国人が驚く動画PR', d: 'インバウンド旅行者の反応動画を収集し、地域の「見えていた価値」を可視化。', k: '構造：他者視点×発見×拡散の三段設計' },
    { t: '地方産品に「産地の時間軸」を付ける', d: '商品と一緒に地域タイムラインを届けるパッケージPR。物語が差別化になる。', k: '核心：時間×文化文脈×感情価値の融合' },
  ],
  7: [
    { t: '「ゆる継続」を可視化するブランドPR', d: '毎日少しずつ続ける行動をアプリで記録し1年後の変化を自動生成レポートに。', k: '構造：行動変容の見える化×長期関係性の構築' },
    { t: 'ウェルビーイングを「共通言語」にする', d: '企業横断のウェルビーイング白書を複数ブランドが共同発表。単独より大きなメディア露出を獲得。', k: '仕掛け：競合協調×業界PR×権威性の三角形' },
    { t: '「今日の小さな幸せ」収集キャンペーン', d: '生活者から「小さな幸福体験」を毎日収集しデータを可視化して発表。ブランドは背景にいながら社会的発信者になる。', k: '設計：データ蓄積→コンテンツ化→ブランド想起' },
  ],
}
