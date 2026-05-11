import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'trend catch | 毎朝のPRインテリジェンス',
  description: '毎朝9:00更新ダッシュボード',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
