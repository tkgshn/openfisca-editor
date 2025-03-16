# OpenFisca Editor

OpenFisca Editor は、社会保障制度のシミュレーションと可視化のためのウェブアプリケーションです。

## 機能概要

- 社会保障制度の定義と編集
- パラメータの設定と調整
- シミュレーションの実行と3D可視化
- テストケースの作成と実行
- 制度のフローチャート表示（Mermaid.js）
- 制度の公開と共有
- 多言語対応（日本語、英語、フランス語）

## ドキュメント

詳細なドキュメントは下記リンクから閲覧できます：

- [インストールガイド](/public/docs/installation.md) - インストールと設定方法
- [ユーザーガイド](/public/docs/user-guide.md) - 基本的な使い方
- [OpenFisca 概念ガイド](/public/docs/openfisca-concepts.md) - OpenFisca の基本概念
- [OpenFisca ファイル作成ガイド](/public/docs/openfisca-file-guide.md) - OpenFisca ファイルの作成方法
- [アーキテクチャ](/public/docs/architecture.md) - アプリケーションの構造
- [コンポーネント整理計画](/public/docs/component-reorganization.md) - コンポーネント整理の方針

## 技術スタック

- **フロントエンド**: Next.js（React）、TypeScript
- **スタイリング**: Tailwind CSS、shadcn/ui コンポーネント
- **状態管理**: React Context API
- **データ保存**: ローカルストレージ（クライアントサイド）
- **バックエンド接続**: OpenFisca API（オプション）
- **国際化**: i18n（日本語、英語、フランス語対応）
- **可視化**: Plotly.js（シミュレーション）、Mermaid.js（フローチャート）

## 起動方法

1. 環境変数の設定:

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
# ローカル開発環境の場合
NEXT_PUBLIC_API_URL=http://localhost:5000  # OpenFisca APIのURL（オプション）
OPENAI_API_KEY=your_key_here               # OpenAI APIキー（AIアシスタント機能に必要）
```

2. 依存関係のインストール:

```bash
pnpm install
```

3. 開発サーバーの起動:

```bash
pnpm dev
```

4. ブラウザで以下の URL にアクセス:

```
http://localhost:3000
```

## 必要要件

- Node.js 18.0.0 以上
- pnpm 8.0.0 以上
- モダンブラウザ（Chrome, Firefox, Safari, Edge 最新版）
- OpenAI API キー（AIアシスタント機能で必要）

## プロジェクト構造

OpenFisca Editor は以下のディレクトリ構造で整理されています：

- `app/` - Next.js アプリケーションのエントリーポイント
  - `api/` - API ルート
  - `docs/` - ドキュメントページ
  - `institutions/` - 制度詳細ページ
- `components/` - React コンポーネント
  - `ui/` - 汎用的な UI コンポーネント（shadcn/ui）
  - `editor/` - コードエディタ関連
  - `institution/` - 制度関連
  - `test/` - テスト関連
  - `visualization/` - 可視化関連（MermaidPanel）
  - `simulation/` - シミュレーション関連（3D可視化）
  - `layout/` - レイアウト関連
  - `shared/` - 共有コンポーネント
- `contexts/` - React コンテキスト
- `lib/` - ユーティリティ関数、型定義など
  - `i18n/` - 国際化関連
- `public/` - 静的アセット
  - `docs/` - マークダウン形式のドキュメント

## 主要コンポーネント

- **OpenFiscaEditor**: アプリケーションのメインコンポーネント
- **InstitutionDetails**: 制度の詳細情報を表示・編集するコンポーネント
- **CodeEditorPanel**: OpenFisca コードを編集するコンポーネント
- **TestCasePanel**: テストケースを管理するコンポーネント
- **SimulationPanel**: シミュレーションを実行し、結果を3D可視化するコンポーネント
- **MermaidPanel**: 制度のフローチャートを表示するコンポーネント

## コントリビューション

プロジェクトへの貢献を歓迎します。以下の手順で貢献できます：

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/new-feature`)
3. 変更をコミット (`git commit -am 'Add some feature'`)
4. ブランチにプッシュ (`git push origin feature/new-feature`)
5. プルリクエストを作成

## ライセンス

このソフトウェアは Server Side Public License (SSPL) v1.0 の下で提供されています。
詳細は [LICENSE](./LICENSE) ファイルをご覧ください。
