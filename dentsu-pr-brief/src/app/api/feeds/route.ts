import { NextResponse } from 'next/server'
import { fetchPRTimes, fetchPREdge, fetchYahooNews, fetchXTrends } from '@/lib/feeds'

export const revalidate = 3600 // Cache for 1 hour (ISR)

export async function GET() {
  try {
    const [prTimes, prEdge, yahooNews, xTrends] = await Promise.allSettled([
      fetchPRTimes(6),
      fetchPREdge(5),
      fetchYahooNews(6),
      fetchXTrends(15),
    ])

    return NextResponse.json({
      prTimes:   prTimes.status   === 'fulfilled' ? prTimes.value   : [],
      prEdge:    prEdge.status    === 'fulfilled' ? prEdge.value    : [],
      yahooNews: yahooNews.status === 'fulfilled' ? yahooNews.value : [],
      xTrends:   xTrends.status  === 'fulfilled' ? xTrends.value   : [],
      fetchedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}
