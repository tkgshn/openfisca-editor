# API リファレンス

このドキュメントでは、OpenFisca Editor で使用される API 関数とデータ型について説明します。

## データ型

### Institution

制度を表すデータ型です。

```typescript
interface Institution {
  id: string;                  // 制度の一意のID
  name: string;                // 制度名
  source: "sample" | "user";   // 制度のソース（サンプルまたはユーザー作成）
  url?: string;                // 参照URL
  summary?: string;            // 概要
  usage?: string;              // 利用方法
  conditions?: string;         // 利用条件
  department?: string;         // 所管部署
  postingUrl?: string;         // 掲載URL
  applicationUrl?: string;     // 申請先URL
  formulaCode: string;         // OpenFiscaコード
  testCases: TestCase[];       // テストケース
  testYamlRaw?: string;        // テストYAML
  mermaidCode?: string;        // フローチャートコード
  parameters?: Parameter[];    // パラメータ
  visibility?: string;         // 公開範囲（private, restricted, public）
  publishedAt?: string;        // 公開日時
  versions: Version[];         // バージョン履歴
  currentVersion: string;      // 現在のバージョンID
  lastTestResults?: TestResults; // 最新のテスト結果
}

