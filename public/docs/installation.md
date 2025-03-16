# インストールガイド

このガイドでは、OpenFisca Editor のインストールと設定方法について説明します。

## 前提条件

- Node.js 18.0.0 以上
- pnpm 8.0.0 以上

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

3. 開発サーバーの起動:

```bash
pnpm dev
```

4. ブラウザで以下の URL にアクセス:

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
