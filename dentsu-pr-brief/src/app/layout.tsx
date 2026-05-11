import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '電通PR Morning Brief | 相原悠人',
  description: '毎朝9:00更新 — PR TIMES・PR EDGE・Yahoo!ニュース・Xトレンドを集約したインテリジェンスダッシュボード',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
