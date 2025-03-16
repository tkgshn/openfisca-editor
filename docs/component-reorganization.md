# コンポーネント整理計画

このドキュメントでは、OpenFisca Editor のコンポーネント整理計画を説明します。

## 現状の問題点

1. **重複するコンポーネント**: 同じ機能のコンポーネントが複数のディレクトリに存在しています
2. **命名規則の不統一**: kebab-case と PascalCase が混在しています
3. **ディレクトリ構造の整理不足**: 機能ごとのディレクトリ分けはされていますが、一部のコンポーネントは適切な場所に配置されていません

## 整理計画

### 1. ディレクトリ構造

以下のディレクトリ構造に整理します：

```
components/
  ├── ui/             # 汎用的なUIコンポーネント
  ├── editor/         # コードエディタ関連
  ├── institution/    # 制度関連
  ├── test/           # テスト関連
  ├── visualization/  # 可視化関連
  ├── simulation/     # シミュレーション関連
  ├── layout/         # レイアウト関連
  └── shared/         # 共有コンポーネント
```

### 2. 命名規則

すべてのコンポーネントファイルの命名規則を PascalCase に統一します：

- ✅ `InstitutionDetails.tsx`
- ❌ `institution-details.tsx`

### 3. 移動・統合計画

#### ルートディレクトリからの移動

| 現在のパス | 移動先パス | 備考 |
|----------|-----------|------|
| `components/openfisca-editor.tsx` | `components/OpenFiscaEditor.tsx` | リネームのみ（ルートに残す） |
| `components/theme-provider.tsx` | `components/shared/ThemeProvider.tsx` | |
| `components/ai-provider.tsx` | `components/shared/AIProvider.tsx` | |
| `components/code-editor-panel.tsx` | `components/editor/CodeEditorPanel.tsx` | 既存の同名ファイルと統合 |
| `components/institution-details.tsx` | `components/institution/InstitutionDetails.tsx` | 既存の同名ファイルと統合 |
| `components/institution-header.tsx` | `components/institution/InstitutionHeader.tsx` | 既存の同名ファイルと統合 |
| `components/institution-summary-card.tsx` | `components/institution/InstitutionSummaryCard.tsx` | 既存の同名ファイルと統合 |
| `components/mermaid-panel.tsx` | `components/visualization/MermaidPanel.tsx` | 既存の同名ファイルと統合 |
| `components/parameter-panel.tsx` | `components/institution/ParameterPanel.tsx` | 既存の同名ファイルと統合 |
| `components/parameter-carousel.tsx` | `components/institution/ParameterCarousel.tsx` | |
| `components/parameter-detail-modal.tsx` | `components/institution/ParameterDetailModal.tsx` | |
| `components/parameter-modal.tsx` | `components/institution/ParameterModal.tsx` | |
| `components/publish-dialog.tsx` | `components/institution/PublishDialog.tsx` | |
| `components/publish-popover.tsx` | `components/institution/PublishPopover.tsx` | 既存の同名ファイルと統合 |
| `components/settings-dialog.tsx` | `components/shared/SettingsDialog.tsx` | |
| `components/share-confirmation-modal.tsx` | `components/institution/ShareConfirmationModal.tsx` | 既存の同名ファイルと統合 |
| `components/sidebar.tsx` | `components/layout/Sidebar.tsx` | 既存の同名ファイルと統合 |
| `components/simulation-panel.tsx` | `components/simulation/SimulationPanel.tsx` | 既存の同名ファイルと統合 |
| `components/test-case-modal.tsx` | `components/test/TestCaseModal.tsx` | 既存の同名ファイルと統合 |
| `components/test-case-panel.tsx` | `components/test/TestCasePanel.tsx` | 既存の同名ファイルと統合 |
| `components/test-results-modal.tsx` | `components/test/TestResultsModal.tsx` | 既存の同名ファイルと統合 |
| `components/test-results-panel.tsx` | `components/test/TestResultsPanel.tsx` | |
| `components/test-runner-panel.tsx` | `components/test/TestRunnerPanel.tsx` | 既存の同名ファイルと統合 |

#### サブディレクトリ内の命名規則統一

| 現在のパス | 移動先パス | 備考 |
|----------|-----------|------|
| `components/institution/institution-details.tsx` | `components/institution/InstitutionDetails.tsx` | 既存の同名ファイルと統合 |
| `components/institution/institution-header.tsx` | `components/institution/InstitutionHeader.tsx` | 既存の同名ファイルと統合 |
| `components/institution/institution-summary-card.tsx` | `components/institution/InstitutionSummaryCard.tsx` | 既存の同名ファイルと統合 |
| `components/institution/parameter-panel.tsx` | `components/institution/ParameterPanel.tsx` | |
| `components/institution/publish-popover.tsx` | `components/institution/PublishPopover.tsx` | |
| `components/institution/share-confirmation-modal.tsx` | `components/institution/ShareConfirmationModal.tsx` | |
| `components/shared/sidebar.tsx` | `components/layout/Sidebar.tsx` | 既存の同名ファイルと統合 |
| `components/visualization/mermaid-panel.tsx` | `components/visualization/MermaidPanel.tsx` | |
| `components/visualization/simulation-panel.tsx` | `components/simulation/SimulationPanel.tsx` | 既存の同名ファイルと統合 |
| `components/test/test-case-modal.tsx` | `components/test/TestCaseModal.tsx` | |
| `components/test/test-case-panel.tsx` | `components/test/TestCasePanel.tsx` | |
| `components/test/test-results-modal.tsx` | `components/test/TestResultsModal.tsx` | |
| `components/ui/use-mobile.tsx` | `components/ui/UseMobile.tsx` | フックなので `hooks/useMobile.tsx` に移動するかも |

### 4. 統合後のチェックリスト

- [ ] すべてのコンポーネントが適切なディレクトリに配置されていることを確認
- [ ] すべてのファイル名がPascalCaseに統一されていることを確認
- [ ] インポートパスが正しく更新されていることを確認
- [ ] アプリケーションが正常に動作することを確認
