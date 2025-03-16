# OpenFisca Editor

OpenFisca Editor は、社会保障制度のシミュレーションと可視化のためのツールです。

## 機能概要

- 社会保障制度の定義と編集
- パラメータの設定と調整
- シミュレーションの実行と結果の可視化
- テストケースの作成と実行
- 制度のフローチャート表示
- 制度の公開と共有

## ドキュメント

詳細なドキュメントは `/docs` ディレクトリにあります：

- [インストールガイド](./docs/installation.md) - インストールと設定方法
- [ユーザーガイド](./docs/user-guide.md) - 基本的な使い方
- [OpenFisca 概念ガイド](./docs/openfisca-concepts.md) - OpenFisca の基本概念
- [OpenFisca ファイル作成ガイド](./docs/openfisca-file-guide.md) - OpenFisca ファイルの作成方法
- [アーキテクチャ](./docs/architecture.md) - アプリケーションの構造
- [API リファレンス](./docs/api-reference.md) - API 関数の詳細

## 起動方法

1. 環境変数の設定:

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
# ローカル開発環境の場合
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000  # APIのベースURL
NEXT_PUBLIC_APP_URL=http://localhost:3000       # アプリケーションのURL
NEXT_PUBLIC_OPENAI_API_KEY=your_key_here        # OpenAI APIキー

# 本番環境の場合は、実際のドメインに変更してください
# NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
# NEXT_PUBLIC_APP_URL=https://your-domain.com
```

2. API サーバーの起動:

```bash
# APIサーバーのセットアップと起動手順は別途ドキュメントを参照してください
# デフォルトでは http://localhost:8000 で起動することを想定しています
```

3. 依存関係のインストール:

```bash
pnpm install
```

4. 開発サーバーの起動:

```bash
pnpm dev
```

5. ブラウザで以下の URL にアクセス:

```
http://localhost:3000
```

## 必要要件

- Node.js 18.0.0 以上
- pnpm 8.0.0 以上
- OpenAI API キー（機能の一部で必要）
- API サーバー（別途セットアップが必要）

## プロジェクト構造

OpenFisca Editor は以下のディレクトリ構造で整理されています：

- `app/` - Next.js アプリケーションのエントリーポイント
- `components/` - React コンポーネント
  - `ui/` - 汎用的な UI コンポーネント
  - `editor/` - コードエディタ関連
  - `institution/` - 制度関連
  - `test/` - テスト関連
  - `visualization/` - 可視化関連
  - `simulation/` - シミュレーション関連
  - `layout/` - レイアウト関連
  - `shared/` - 共有コンポーネント
- `contexts/` - React コンテキスト
- `lib/` - ユーティリティ関数と型定義
- `docs/` - ドキュメント
- `public/` - 静的アセット

## ライセンス

このソフトウェアは Server Side Public License (SSPL) v1.0 の下で提供されています。
詳細は [LICENSE](./LICENSE) ファイルをご覧ください。
