# OpenFisca Editor ユーザーガイド

このガイドでは、OpenFisca Editor の基本的な使い方について説明します。

## 目次

- [ホーム画面](#ホーム画面)
- [制度の作成と編集](#制度の作成と編集)
- [テストケースの作成](#テストケースの作成)
- [コードエディタの使用](#コードエディタの使用)
- [パラメータの設定](#パラメータの設定)
- [シミュレーションの実行](#シミュレーションの実行)
- [フローチャートの表示](#フローチャートの表示)
- [制度の公開と共有](#制度の公開と共有)
- [言語設定](#言語設定)

## ホーム画面

アプリケーションを起動すると、ホーム画面が表示されます。サイドバーには既存の制度のリストが表示され、メインエリアには選択した制度の詳細が表示されます。

- **新しい制度を作成**: ホーム画面の「新しい制度を作成」ボタンをクリックします。
- **既存の制度を選択**: サイドバーの制度リストから選択します。
- **複数の制度を操作**: 「複数選択モード」ボタンをクリックし、複数の制度を選択して一括操作を行います。

## 制度の作成と編集

### 新しい制度の作成

1. ホーム画面の「新しい制度を作成」ボタンをクリックします。
2. 基本情報を入力します：
   - 制度名
   - 概要
   - 利用条件
   - 所管部署
   - 掲載URL
   - 申請先URL

### 制度の編集

制度を選択すると、制度の詳細情報を編集できます：

1. 制度名や説明などの基本情報の編集
2. 制度のコード編集（OpenFisca Python コード）
3. パラメータの設定
4. テストケースの作成

## テストケースの作成

テストケースパネルで、制度の動作をテストするためのケースを作成できます。

1. 「テストケース」タブを選択します。
2. 「新しいテストケースを追加」ボタンをクリックします。
3. テストケースの情報を入力します：
   - 親（扶養者）の人数
   - 祖父母の人数
   - 子供の人数
   - 支給額

テストケースは、制度が正しく機能しているかを検証するために使用されます。テスト結果はモーダルウィンドウに表示され、成功または失敗のステータスを確認できます。

## コードエディタの使用

コードエディタパネルでは、OpenFisca の Python コードを直接編集できます。

1. 「コードエディタ」タブを選択します。
2. 制度のコードを編集します。
3. 変更を保存するには「保存」ボタンをクリックします。

コードエディタは、制度のロジックを実装するために使用されます。「[OpenFisca 概念ガイド](./openfisca-concepts.md)」を参照して、コードの作成方法を学びましょう。シンタックスハイライト機能により、コードの可読性が向上しています。

### OpenFisca コードの注意点

- 変数名に数字始まりのクラス名は使用できません（漢数字を使用してください）
- 日本語名のクラスは使用可能ですが、一般的なクラス名の制約を守る必要があります
- エンティティには `世帯`、`人物` などがあります
- 期間には `DAY`、`MONTH`、`YEAR`、`ETERNITY` があります

## パラメータの設定

パラメータパネルでは、制度のパラメータを設定できます。

1. 「パラメータ」タブを選択します。
2. 「新しいパラメータを追加」ボタンをクリックします。
3. パラメータの情報を入力します：
   - 名前
   - 説明
   - 参照
   - 単位
   - 値（日付ごとに異なる値を設定可能）

パラメータは、制度の計算に使用される値を定義します。制度のロジックから参照できるパラメータをここで設定します。

## シミュレーションの実行

シミュレーションパネルでは、制度のシミュレーションを実行して結果を確認できます。

1. 「シミュレーション」タブを選択します。
2. パラメータを調整します。特定の制度には専用のシミュレーション設定があります：
   - **子育て助成金**: 収入制限、年齢別給付額などを調整できます
   - **3の倍数給付金**: 基本給付額、ボーナス給付額などを調整できます
   - **その他の制度**: 制度に合わせたパラメータを調整できます
3. 「シミュレーション実行」ボタンをクリックします。
4. Plotly.jsを使用した3D可視化で結果を確認できます：
   - X軸、Y軸、Z軸でさまざまな要素（年齢、世帯人数、収入など）を表示
   - 色で給付額を表現
   - ズーム、回転、視点変更が可能

シミュレーション結果では以下の統計情報も確認できます：
- 対象世帯数と対象率
- 総給付額
- 平均給付額

シミュレーションは、制度が実際にどのように機能するかを視覚的に確認するために使用されます。

## フローチャートの表示

Mermaid パネルでは、制度のフローチャートを表示できます。

1. 「フローチャート」タブを選択します。
2. Mermaid コードが自動生成され、制度のロジックに基づいたフローチャートが表示されます。
3. 必要に応じてMermaidコードを編集することもできます。

フローチャートは、制度の計算ロジックや条件分岐の流れを視覚的に理解するために使用されます。

## 制度の公開と共有

完成した制度は、公開して他のユーザーと共有できます。

1. 制度の詳細画面で「公開」ボタンをクリックします。
2. 公開範囲を選択します（プライベート、制限付き、公開）。
3. 「確認」ボタンをクリックして公開します。

公開した制度は、リンクを共有することで他のユーザーと共有できます。また、「エクスポート」ボタンをクリックして OpenFisca 形式でエクスポートすることもできます。

## 言語設定

OpenFisca Editor は複数の言語に対応しています：

1. 画面右上の言語切替メニューをクリックします。
2. 以下の言語から選択できます：
   - 日本語（デフォルト）
   - 英語
   - フランス語
3. 選択した言語はブラウザに保存され、次回アクセス時にも同じ言語設定が使用されます。

言語設定を変更すると、インターフェース全体が選択した言語で表示されます。

## キーボードショートカット

| 機能 | ショートカット |
|-----|-------------|
| 保存 | Ctrl+S（Windows/Linux）または Command+S（Mac） |
| コードのフォーマット | Alt+Shift+F |
| シミュレーション実行 | Ctrl+Enter |
| 新しいパラメータ追加 | Ctrl+Shift+P |
| 新しいテストケース追加 | Ctrl+Shift+T |

## トラブルシューティング

- **コードエラー**: コードエディタでエラーが表示される場合は、エラーメッセージを確認し、文法や変数名を修正してください。
- **シミュレーションエラー**: シミュレーションが失敗する場合は、テストケースの設定やコードの実装を確認してください。
- **保存エラー**: 変更が保存できない場合は、ブラウザのキャッシュをクリアするか、別のブラウザで試してください。
- **サンプル制度の編集**: サンプル制度（source: "sample"）は編集できませんが、コピーして新しい制度として保存することはできます。

問題が解決しない場合は、[GitHub Issues](https://github.com/yourusername/openfisca-editor/issues) で報告してください。
