import { NextResponse } from 'next/server'

import {
  fetchPRTimes,
  fetchPREdge,
  fetchYahooNews,
  fetchAsahi,
  fetchWebTan,
  fetchMarkeZine,
  fetchAdverTimes,
  fetchXTrends,
} from '@/lib/feeds'

export const revalidate = 3600

const PR_IDEAS = [
  {
    title: 'UGC×逆転インサイト',
    body: '生活者の「嫌いだったもの」を起点にしたブランド再発見キャンペーン。',
    tag: '拡散型',
  },
  {
    title: '参加型ブランドブック',
    body: 'Z世代10名と共同制作するブランド未来ビジョン企画。',
    tag: '体験型',
  },
  {
    title: '失敗白書PR',
    body: '失敗事例をあえて公開することで信頼獲得につなげるPR。',
    tag: '信頼獲得型',
  },
  {
    title: 'ナノインフルエンサー記者団',
    body: 'フォロワー1000人以下の生活者を招待するコミュニティPR。',
    tag: 'コミュニティ型',
  },
  {
    title: 'AR×OOH×UGC連鎖設計',
    body: 'AR体験とOOHを連動させSNS拡散へつなげる。',
    tag: '体験拡散型',
  },
]

function getDailyIdeas() {
  const d = new Date()

  const dayOfYear = Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000
  )

  const idx = dayOfYear % PR_IDEAS.length

  return [0, 1, 2].map((i) => PR_IDEAS[(idx + i) % PR_IDEAS.length])
}

export async function GET() {
  try {
    const [
      prTimes,
      prEdge,
      yahooNews,
      asahi,
      webtan,
      markezine,
      adverTimes,
      xTrends,
    ] = await Promise.allSettled([
      fetchPRTimes(6),
      fetchPREdge(6),
      fetchYahooNews(8),
      fetchAsahi(4),
      fetchWebTan(6),
      fetchMarkeZine(6),
      fetchAdverTimes(6),
      fetchXTrends(15),
    ])

    const yahooData =
      yahooNews.status === 'fulfilled' ? yahooNews.value : []

    const prData =
      prTimes.status === 'fulfilled' ? prTimes.value : []

    const trendsData =
      xTrends.status === 'fulfilled' ? xTrends.value : []

    const topNews = yahooData
      .slice(0, 3)
      .map((i: any) => i.title)
      .join('、')

    const topPR = prData
      .slice(0, 2)
      .map((i: any) => i.title)
      .join('、')

    const topTrends = trendsData
      .slice(0, 5)
      .map((t: any) => t.term)
      .join('・')

    return NextResponse.json({
      prTimes: prData,
      prEdge: prEdge.status === 'fulfilled' ? prEdge.value : [],
      yahooNews: yahooData,
      asahi: asahi.status === 'fulfilled' ? asahi.value : [],
      webtan: webtan.status === 'fulfilled' ? webtan.value : [],
      markezine:
        markezine.status === 'fulfilled' ? markezine.value : [],
      adverTimes:
        adverTimes.status === 'fulfilled' ? adverTimes.value : [],
      xTrends: trendsData,

      dailyIdeas: getDailyIdeas(),

      summaryContext: {
        topNews,
        topPR,
        topTrends,
      },

      fetchedAt: new Date().toISOString(),
    })
  } catch (e) {
    console.error(e)

    return NextResponse.json(
      { error: 'fetch failed' },
      { status: 500 }
    )
  }
}
