# コンポーネント整理計画

このドキュメントでは、OpenFisca Editor のコンポーネント整理計画を説明します。

## 現状の問題点

1. **重複するコンポーネント**: `visualization/` と `simulation/` ディレクトリに類似の機能を持つコンポーネントが存在しています
2. **命名規則の不統一**: kebab-case（例: `institution-details.tsx`）と PascalCase（例: `InstitutionDetails.tsx`）が混在しています
3. **ディレクトリ構造の整理不足**: 機能ごとのディレクトリ分けはされていますが、一部のコンポーネントは適切な場所に配置されていません

## 整理計画

### 1. ディレクトリ構造

現在の基本的なディレクトリ構造は次の通りです：

```
components/
  ├── ui/             # 汎用的なUIコンポーネント（shadcn/ui）
  ├── editor/         # コードエディタ関連
  ├── institution/    # 制度関連
  ├── test/           # テスト関連
  ├── visualization/  # 可視化関連（MermaidPanel, SimulationPanel）
  ├── simulation/     # シミュレーション関連（SimulationPanel, SimulationVisualization）
  ├── layout/         # レイアウト関連（Header, Footer, Sidebar）
  └── shared/         # 共有コンポーネント
```

### 2. 命名規則統一

すべてのコンポーネントファイルの命名規則を PascalCase に統一します：

- ✅ `InstitutionDetails.tsx`
- ❌ `institution-details.tsx`

### 3. SimulationPanel の整理

現在、`visualization/simulation-panel.tsx` と `simulation/SimulationPanel.tsx` の2つのファイルが存在しています。これらを整理し、以下の方針で統合します：

- **目標**: `simulation/` ディレクトリに統合し、責務を明確に分離
- **方針**:
  - `simulation/SimulationPanel.tsx`: メインのシミュレーションパネルコンポーネント
  - `simulation/SimulationVisualization.tsx`: 3D可視化を担当するサブコンポーネント
  - `simulation/SimulationResults.tsx`: 結果表示を担当するサブコンポーネント

### 4. 整理後のコンポーネント責務

#### visualization/ と simulation/ の責務分離

- **visualization/**
  - フローチャートやダイアグラムの表示（Mermaid.jsを使用）
  - 静的な可視化を担当

- **simulation/**
  - インタラクティブなシミュレーションの実行
  - パラメータ調整UI
  - シミュレーション結果の3D可視化（Plotly.jsを使用）
  - 動的な可視化を担当

### 5. 移動・統合計画

#### ファイル移動計画

| 現在のパス | 移動先パス | 備考 |
|----------|-----------|------|
| `components/visualization/simulation-panel.tsx` | `components/simulation/SimulationPanel.tsx` | 既存ファイルと統合 |
| `components/institution/institution-details.tsx` | `components/institution/InstitutionDetails.tsx` | ケース統一 |
| `components/institution/institution-header.tsx` | `components/institution/InstitutionHeader.tsx` | ケース統一 |
| `components/institution/parameter-panel.tsx` | `components/institution/ParameterPanel.tsx` | ケース統一 |
| `components/institution/publish-popover.tsx` | `components/institution/PublishPopover.tsx` | ケース統一 |
| `components/institution/share-confirmation-modal.tsx` | `components/institution/ShareConfirmationModal.tsx` | ケース統一 |
| `components/test/test-case-modal.tsx` | `components/test/TestCaseModal.tsx` | ケース統一 |
| `components/test/test-case-panel.tsx` | `components/test/TestCasePanel.tsx` | ケース統一 |
| `components/test/test-results-modal.tsx` | `components/test/TestResultsModal.tsx` | ケース統一 |
| `components/shared/sidebar.tsx` | `components/layout/Sidebar.tsx` | ディレクトリ変更 |
| `components/ui/use-mobile.tsx` | `hooks/useMobile.tsx` | フックをhooksディレクトリへ |
| `components/ui/use-toast.ts` | `hooks/useToast.ts` | フックをhooksディレクトリへ |

### 6. 統合後のチェックリスト

- [ ] すべてのコンポーネントが適切なディレクトリに配置されていることを確認
- [ ] すべてのファイル名がPascalCaseに統一されていることを確認
- [ ] インポートパスが正しく更新されていることを確認
- [ ] アプリケーションが正常に動作することを確認

### 7. プランの実装方法

コンポーネント整理は以下のステップで実施します：

1. **バックアップ**: 現在のコードベースをバックアップ
2. **移動**: ファイルを適切な場所に移動
3. **インポートパス更新**: 全ファイルのインポートパスを更新
4. **命名規則統一**: ファイル名をPascalCaseに統一
5. **テスト**: アプリケーションが正常に動作するか確認
6. **クリーンアップ**: 不要になったファイルの削除

### 8. 長期的な整理方針

- **コンポーネントの粒度**: 大きなコンポーネントは小さなサブコンポーネントに分割
- **再利用性の向上**: 共通パターンを抽出し、再利用可能なコンポーネントとして実装
- **テスト容易性**: コンポーネントは単体テスト可能な設計に
- **パフォーマンス**: 不要な再レンダリングを避けるため、適切なメモ化と状態管理
