# OpenFisca Editor

OpenFisca Editor は、社会保障制度のシミュレーションと可視化のためのウェブアプリケーションです。特に日本の社会保障制度（OpenFisca-Japan）と連携して、制度設計・実装・テスト・可視化を支援します。

[![Vercel デプロイ](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://openfisca-editor.vercel.app)
[![GitHub リポジトリ](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/tkgshn/openfisca-editor)

👉 **[オンラインデモを試す](https://openfisca-editor.vercel.app)** 👈

## 機能概要

- 社会保障制度の定義と編集
- パラメータの設定と調整
- シミュレーションの実行と 3D 可視化
- テストケースの作成と実行
- 制度のフローチャート表示（Mermaid.js）
- 制度の公開と共有
- 多言語対応（日本語、英語、フランス語）

## インストールと起動方法

### 必要要件

- Node.js 18.0.0 以上
- pnpm 8.0.0 以上
- モダンブラウザ（Chrome, Firefox, Safari, Edge 最新版）
- OpenAI API キー（AI 機能で必要）
- Docker Desktop（OpenFisca-Japan 連携時に必要）

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/openfisca-editor.git
cd openfisca-editor
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
# 基本設定
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=your_key_here  # OpenAI APIキー（AIアシスタント機能に必要）

# OpenFisca-Japan連携設定（オプション）
OPENFISCA_JAPAN_PATH=/path/to/OpenFisca-Japan  # OpenFisca-Japanリポジトリのパス
NEXT_PUBLIC_OPENFISCA_API_URL=http://localhost:50000  # OpenFisca-JapanのAPIエンドポイント
```

### 3. 依存関係のインストール

```bash
pnpm install
```

### 4. 開発サーバーの起動

```bash
pnpm dev
```

### 5. ブラウザでアクセス

```
http://localhost:3000
```

## OpenFisca-Japan との連携方法

このエディタシステムは、既存の OpenFisca-Japan リポジトリと連携して動作します。連携することで、制度のテスト実行や動的なシミュレーションが可能になります。

### 1. OpenFisca-Japan リポジトリの準備

まだ OpenFisca-Japan リポジトリをお持ちでない場合は、以下のコマンドでクローンしてください：

```bash
git clone https://github.com/openfisca/openfisca-japan.git
cd openfisca-japan
```

### 2. OpenFisca-Japan の API サーバーの起動

OpenFisca-Japan リポジトリで以下のコマンドを実行して、API サーバーを起動します：

```bash
cd /path/to/OpenFisca-Japan
docker-compose up --build
```

これにより、以下のサービスが起動します：

- OpenFisca API サーバー: http://localhost:50000
- ダッシュボード: http://localhost:30000
- Swagger UI: http://localhost:8080

### 3. 連携の確認

エディタシステムと OpenFisca-Japan の連携が正常に機能しているか確認するには：

1. エディタシステムの UI から制度を選択
2. テストケースを作成または編集
3. 「テスト実行」ボタンをクリック

テスト実行のリクエストが OpenFisca-Japan の API サーバーに送信され、結果が UI 上に表示されます。

## 主な機能の使い方

### 制度の作成と編集

1. サイドバーの「制度追加」ボタンをクリック
2. 制度名と基本情報を入力
3. エディタで制度のコードを実装
4. 「保存」ボタンをクリック

### テストケースの作成と実行

1. 「テストケース」タブを選択
2. 「テストケース追加」ボタンをクリック
3. 世帯構成や条件を設定
4. 「テスト実行」ボタンをクリック

テスト実行コンポーネント（`TestRunner`）は以下の機能を提供します：

- テストファイルパスの入力
- テスト実行ボタン
- テスト結果の表示（成功/失敗）
- 詳細なテスト結果の表示

### フローチャートの生成

1. 制度のコードを編集・保存
2. 「フローチャート」タブを選択
3. 自動生成されたフローチャートを確認

### シミュレーションの実行

1. 「シミュレーション」タブを選択
2. パラメータを設定
3. 「実行」ボタンをクリック
4. 3D 可視化された結果を確認

## プロジェクト構造

OpenFisca Editor は以下のディレクトリ構造で整理されています：

- `app/` - Next.js アプリケーションのエントリーポイント
  - `api/` - API ルート
  - `docs/` - ドキュメントページ
  - `institutions/` - 制度詳細ページ
- `components/` - React コンポーネント
  - `ui/` - 汎用的な UI コンポーネント
  - `editor/` - エディタ関連
  - `parameters/` - パラメータ設定・表示関連
  - `dialogs/` - モーダルダイアログ関連
  - `institution/` - 制度関連
  - `test/` - テスト関連（TestRunner など）
  - `visualization/` - 可視化関連
  - `simulation/` - シミュレーション関連
- `contexts/` - React コンテキスト
- `hooks/` - カスタムフック
- `lib/` - ユーティリティ関数、型定義など
  - `test-runner.ts` - テスト実行 API
- `public/` - 静的アセット
- `styles/` - グローバルスタイル定義
- `types/` - TypeScript 型定義

## 開発者向け情報

### テスト実行 API の直接利用

テスト実行 API を直接利用することもできます：

```typescript
import testRunner from "@/lib/test-runner";

// テストの実行
const result = await testRunner.runTest(
  "openfisca_japan/tests/チュートリアル/テスト給付金.yaml"
);

// テスト結果の解析
const parsedResult = testRunner.parseTestResult(result);
console.log(parsedResult.success); // テスト成功の場合はtrue
console.log(parsedResult.message); // テスト結果のメッセージ
console.log(parsedResult.details); // テスト結果の詳細
```

### テスト実行コンポーネントの使用方法

テスト実行コンポーネント（`TestRunner`）を使用すると、任意のページでテスト実行機能を利用できます：

```tsx
import TestRunner from "@/components/TestRunner";

export default function InstitutionPage() {
  return (
    <div>
      {/* 他のコンポーネント */}
      <TestRunner institutionName="テスト給付金" />
    </div>
  );
}
```

## トラブルシューティング

### API 接続エラー

エディタシステムが OpenFisca-Japan の API に接続できない場合は、以下を確認してください：

1. OpenFisca-Japan の Docker コンテナが実行中であること

   ```bash
   docker ps | grep openfisca
   ```

2. 環境変数`NEXT_PUBLIC_OPENFISCA_API_URL`が正しく設定されていること

   ```
   NEXT_PUBLIC_OPENFISCA_API_URL=http://localhost:50000
   ```

3. ネットワーク接続に問題がないこと
   ```bash
   curl http://localhost:50000/hello
   ```

### ファイルパーミッションの問題

制度ファイルの作成や更新ができない場合は、以下を確認してください：

1. OpenFisca-Japan リポジトリのディレクトリに書き込み権限があること

   ```bash
   ls -la /path/to/OpenFisca-Japan/openfisca_japan/variables/チュートリアル/
   ls -la /path/to/OpenFisca-Japan/openfisca_japan/tests/チュートリアル/
   ```

2. 必要に応じて権限を修正
   ```bash
   chmod -R 755 /path/to/OpenFisca-Japan/openfisca_japan/variables/チュートリアル/
   chmod -R 755 /path/to/OpenFisca-Japan/openfisca_japan/tests/チュートリアル/
   ```

### 開発サーバーの問題

開発サーバーが起動しない場合は、以下を確認してください：

1. Node.js と pnpm のバージョンが要件を満たしていること
2. 依存関係が正しくインストールされていること
3. 環境変数が正しく設定されていること

## 詳細なドキュメント

詳細なドキュメントは下記リンクから閲覧できます：

- [インストールガイド](/public/docs/installation.md) - インストールと設定方法
- [ユーザーガイド](/public/docs/user-guide.md) - 基本的な使い方
- [OpenFisca 概念ガイド](/public/docs/openfisca-concepts.md) - OpenFisca の基本概念
- [OpenFisca ファイル作成ガイド](/public/docs/openfisca-file-guide.md) - OpenFisca ファイルの作成方法
- [アーキテクチャ](/public/docs/architecture.md) - アプリケーションの構造

### 開発者向けドキュメント

- [コーディング規約](/docs/CLAUDE.md) - プロジェクトのコーディング規約とディレクトリ構造
- [テストガイド](/docs/testing-guide.md) - テスト機能の使い方と実装
- [バージョン管理ガイド](/docs/version-control-guide.md) - バージョン管理の仕組みと使い方
- [リファクタリングノート](/docs/refactoring-notes.md) - 最近のコードリファクタリングの詳細

## コントリビューション

プロジェクトへの貢献を歓迎します。以下の手順で貢献できます：

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/new-feature`)
3. 変更をコミット (`git commit -am 'Add some feature'`)
4. ブランチにプッシュ (`git push origin feature/new-feature`)
5. プルリクエストを作成

## ライセンス

このソフトウェアは Server Side Public License (SSPL) v1.0 の下で提供されています。
詳細は[LICENSE](./LICENSE)ファイルをご覧ください。
