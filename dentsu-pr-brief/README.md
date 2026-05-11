# 電通PR Morning Brief — 相原悠人

毎朝9:00に自動更新されるPRインテリジェンスダッシュボード。

## データソース

| ソース | 内容 | 更新頻度 |
|---|---|---|
| PR TIMES | 最新プレスリリース（RSS） | リアルタイム |
| PR EDGE (predge.jp) | 話題の広告・PR事例（RSS） | リアルタイム |
| Yahoo!ニュース | トップニュース（RSS） | リアルタイム |
| X (Twitter) トレンド | 前日の日本トレンド（trends24.in） | 毎日更新 |

## Vercelデプロイ手順（5分で完了）

### 1. GitHubにリポジトリを作成

```bash
cd dentsu-pr-brief
git init
git add .
git commit -m "initial commit"
# GitHub で新規リポジトリを作り、以下を実行
git remote add origin https://github.com/YOUR_NAME/dentsu-pr-brief.git
git push -u origin main
```

### 2. Vercelでデプロイ

1. https://vercel.com にアクセスしてGitHubでログイン
2. 「Add New Project」→ 作成したリポジトリを選択
3. Framework: **Next.js**（自動検出されます）
4. 「Deploy」ボタンを押すだけ

5〜10分後に固定URLが発行されます。
例: `https://dentsu-pr-brief.vercel.app`

### 3. ブックマーク登録

発行されたURLをブラウザにブックマーク。  
毎朝このURLを開くだけでダッシュボードが表示されます。

## ローカル起動（確認用）

```bash
npm install
npm run dev
# → http://localhost:3000 で確認
```

## 機能

- **PR TIMES** 最新プレスリリース（画像付き）
- **PR EDGE** 広告・PR事例（画像付き）
- **Yahoo!ニュース** 今日のトップニュース
- **Xトレンド** 前日の日本トレンドTOP15（クリックで検索）
- **週次テーマ** 自動ローテーション（カスタム設定可）
- **AIアイデア3案** 今週のお題から自動生成
- **チェックリスト** 毎朝9:00に自動リセット
- **違和感メモ** ローカル保存（日付をまたいでも残る）

## キャッシュ設計

APIルートは `revalidate = 3600`（1時間キャッシュ）。  
「今すぐ更新」ボタンで即時リフレッシュ可能。
