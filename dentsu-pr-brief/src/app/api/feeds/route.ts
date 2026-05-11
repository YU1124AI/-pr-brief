import { NextResponse } from 'next/server'
import { fetchPRTimes, fetchPREdge, fetchYahooNews, fetchAsahi, fetchSendenKaigi, fetchXTrends } from '@/lib/feeds'

export const revalidate = 3600

const PR_IDEAS = [
  { title: 'UGC×逆転インサイト', body: '生活者の「嫌いだったもの」を起点にしたブランド再発見キャンペーン。否定→肯定の感情変化をドキュメントしSNSで拡散。', tag: '拡散型' },
  { title: '参加型ブランドブック', body: 'Z世代10名と共同制作するブランドの未来ビジョン書。過程をライブ配信し、完成品を書店で販売してメディア露出獲得。', tag: '体験型' },
  { title: '失敗白書PR', body: '社会課題解決に失敗した取り組みを正直に公開。誠実な透明性が信頼を生み、質の高いメディア露出につながる逆張り施策。', tag: '信頼獲得型' },
  { title: 'ナノインフルエンサー記者団', body: 'フォロワー1000人以下の生活者に記者証を発行し工場・研究所へ招待。リアルな体験発信がブランドの信頼資産を構築する。', tag: 'コミュニティ型' },
  { title: 'AR×OOH×UGC連鎖設計', body: '特定エリアでスマホをかざすと社会課題ビジュアルが出現するAR体験。体験投稿が二次拡散の主体となる三段式設計。', tag: '体験拡散型' },
  { title: 'データドリブン白書', body: '生活者の行動データを独自調査してレポート化・無償公開。データの希少性がメディア掲載の必然性をつくる権威型PR。', tag: '権威型' },
  { title: '「沈黙の理由」開示PR', body: '社会課題に対して発言しない理由を先に透明開示。どんな条件で声を上げるかを宣言することで誠実さを最大資産に変える。', tag: 'リスクコミュニケーション型' },
]

function getDailyIdeas() {
  const d = new Date()
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(),0,0).getTime()) / 86400000)
  const idx = dayOfYear % PR_IDEAS.length
  return [0,1,2].map(i => PR_IDEAS[(idx+i) % PR_IDEAS.length])
}

export async function GET() {
  try {
    const [prTimes, prEdge, yahooNews, asahi, sendenKaigi, xTrends] = await Promise.allSettled([
      fetchPRTimes(6),
      fetchPREdge(5),
      fetchYahooNews(8),
      fetchAsahi(4),
      fetchSendenKaigi(4),
      fetchXTrends(15),
    ])

    const yahooData = yahooNews.status==='fulfilled' ? yahooNews.value : []
    const prData = prTimes.status==='fulfilled' ? prTimes.value : []
    const trendsData = xTrends.status==='fulfilled' ? xTrends.value : []

    const topNews = yahooData.slice(0,3).map((i:any)=>i.title).join('、')
    const topPR = prData.slice(0,2).map((i:any)=>i.title).join('、')
    const topTrends = trendsData.slice(0,5).map((t:any)=>t.term).join('・')

    return NextResponse.json({
      prTimes: prData,
      prEdge: prEdge.status==='fulfilled' ? prEdge.value : [],
      yahooNews: yahooData,
      asahi: asahi.status==='fulfilled' ? asahi.value : [],
      sendenKaigi: sendenKaigi.status==='fulfilled' ? sendenKaigi.value : [],
      xTrends: trendsData,
      dailyIdeas: getDailyIdeas(),
      summaryContext: { topNews, topPR, topTrends },
      fetchedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}
