# インストールガイド

このガイドでは、OpenFisca Editor のインストールと設定方法について説明します。

## 前提条件

- Node.js 18.0.0 以上
- pnpm 8.0.0 以上
- モダンブラウザ（Chrome, Firefox, Safari, Edge最新版）

## パッケージマネージャーの設定

プロジェクトでは pnpm を使用します。以下のコマンドで pnpm をインストールしてください：

```bash
npm install -g pnpm@latest
```

また、Node.js のバージョンが正しいことを確認してください：

```bash
node --version  # v18.0.0以上であることを確認
```

## インストール手順

1. リポジトリをクローン:

```bash
git clone https://github.com/yourusername/openfisca-editor.git
cd openfisca-editor
```

2. 依存関係のインストール:

```bash
pnpm install
```

3. 環境変数の設定:

```bash
# .env.local.exampleを.env.localにコピー
cp .env.local.example .env.local

# 必要に応じて.env.localを編集
```

主な環境変数：
- `NEXT_PUBLIC_API_URL`: OpenFisca APIのURL（オプション）
- `OPENAI_API_KEY`: OpenAI APIキー（AIアシスタント機能に必要）

4. 開発サーバーの起動:

```bash
pnpm dev
```

5. ブラウザで以下の URL にアクセス:

```
http://localhost:3000
```

## 本番環境へのデプロイ

本番環境用にビルド:

```bash
pnpm build
```

ビルドされたアプリケーションを起動:

```bash
pnpm start
```

## Docker での実行

Dockerfile が含まれている場合は、以下のコマンドでコンテナをビルドして実行できます:

```bash
# イメージをビルド
docker build -t openfisca-editor .

# コンテナを実行
docker run -p 3000:3000 openfisca-editor
```

## OpenFisca APIとの連携（オプション）

OpenFisca Editor は、ローカルストレージのみで動作しますが、OpenFisca APIと連携することで高度な機能を利用できます。

1. OpenFisca APIをセットアップ:

```bash
# OpenFisca Core と OpenFisca Japan をインストール
pip install openfisca-core openfisca-japan

# API サーバーを起動
openfisca serve --country-package openfisca_japan
```

2. 環境変数を設定:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. OpenFisca Editorを再起動

## トラブルシューティング

### インストール時の問題

- **Node.jsのバージョンエラー**: `nvm`（Node Version Manager）を使用して、適切なNode.jsバージョンをインストールしてください。
- **pnpmコマンドが見つからない**: グローバルにpnpmをインストールしたか確認してください。

### 起動時の問題

- **ポート3000が既に使用されている**: 別のポートを指定してください：`pnpm dev --port 3001`
- **モジュールが見つからないエラー**: `pnpm install`を再実行してください。

### ビルド時の問題

- **TypeScriptコンパイルエラー**: エラーメッセージを確認して型の問題を修正してください。
- **ビルドが失敗する**: Node.jsとpnpmのバージョンが適切か確認してください。

### API接続の問題

- OpenFiscaサーバーが実行されていることを確認
- CORSが適切に設定されていることを確認
- ネットワーク接続を確認

## 必要システムリソース

- **最小要件**:
  - CPU: デュアルコア以上
  - メモリ: 4GB以上
  - ディスク: 1GB以上の空き容量
  - ブラウザ: 最新のモダンブラウザ

- **推奨要件**:
  - CPU: クアッドコア以上
  - メモリ: 8GB以上
  - ディスク: 2GB以上の空き容量
  - ブラウザ: Chrome, Firefox, Safari, Edgeの最新版
