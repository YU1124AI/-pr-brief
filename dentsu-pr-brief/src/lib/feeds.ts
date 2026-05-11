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
    title: 'ニュース便乗型PR',
    body: '今日のニュースに出ている社会変化を、自社ブランドの課題提起に接続する。',
    tag: '時流活用型',
  },
  {
    title: 'データ白書PR',
    body: '生活者の行動や意識を調査し、メディアが引用しやすい独自データとして発表する。',
    tag: '権威型',
  },
  {
    title: '逆張り宣言PR',
    body: '業界の当たり前にあえて反対する宣言を出し、議論と取材のきっかけをつくる。',
    tag: '話題化型',
  },
  {
    title: '社員のリアル可視化',
    body: '商品やサービスの裏側にいる社員の迷いや工夫をストーリー化して信頼を高める。',
    tag: '信頼獲得型',
  },
  {
    title: 'Z世代共創企画',
    body: '若年層を企画段階から巻き込み、完成までの過程自体をコンテンツ化する。',
    tag: '共創型',
  },
  {
    title: '地域起点の発見PR',
    body: '地域の当たり前を外部視点で再発見し、観光・商品・文化文脈へ展開する。',
    tag: 'ローカル型',
  },
  {
    title: '失敗白書PR',
    body: '成功事例ではなく失敗と学びを公開し、誠実さをブランド資産に変える。',
    tag: '透明性型',
  },
  {
    title: 'OOH連動UGC',
    body: '街中の広告を撮影・投稿したくなる仕掛けにして、SNS上の二次拡散を設計する。',
    tag: '拡散型',
  },
  {
    title: '比較される前提PR',
    body: '競合との違いをあえて生活者目線で比較し、選ばれる理由を明確にする。',
    tag: '差別化型',
  },
  {
    title: '記念日化PR',
    body: '商品や社会課題に関係する独自の記念日を設定し、毎年話題化できる資産にする。',
    tag: '定番化型',
  },
]

function getDailyIdeas() {
  const now = new Date()

  const seed =
    now.getFullYear() * 1000000 +
    (now.getMonth() + 1) * 10000 +
    now.getDate() * 100 +
    now.getHours()

  const start = seed % PR_IDEAS.length

  return [0, 1, 2].map((i) => PR_IDEAS[(start + i) % PR_IDEAS.length])
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
