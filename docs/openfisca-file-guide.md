# OpenFisca ファイル作成ガイド

このガイドでは、OpenFisca フレームワークで使用するファイルの作成方法について説明します。

## OpenFisca ファイルの種類

OpenFisca で使用する主なファイルは以下の3種類です：

1. **変数ファイル（.py）**: 制度のロジックを実装する Python ファイル
2. **テストファイル（.yaml）**: 制度のテストケースを定義する YAML ファイル
3. **パラメータファイル（.yaml）**: 制度のパラメータを定義する YAML ファイル

## 1. 変数ファイル（.py）の作成

変数ファイルは、制度のロジックを Python コードで実装するファイルです。OpenFisca Editor では、「コードエディタ」タブで編集できます。

### 基本構造

```python
"""
[制度名] の実装

概要: [概要]
利用条件: [利用条件]
所管部署: [所管部署]
掲載URL: [URL]
申請先URL: [URL]
"""

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯

class [制度名](Variable):
    value_type = [型]  # int, float, bool などの型
    entity = [エンティティ]  # 世帯, 人物 などのエンティティ
    definition_period = [期間]  # DAY, MONTH, YEAR, ETERNITY
    label = "[ラベル]"  # 制度の説明
    reference = "[参照URL]"  # 参考資料のURL

    def formula(対象, 期間, parameters):
        # ロジックの実装
        return [結果]
```

### 例：児童手当

```python
"""
児童手当 の実装

概要: 中学校卒業まで（15歳の誕生日後の最初の3月31日まで）の児童を養育している方に支給される手当
利用条件: 中学校卒業前の児童を養育していること
所管部署: 厚生労働省
掲載URL: https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/jidouteate/index.html
申請先URL: https://www.digital.go.jp/policies/posts/childrearing_allowance
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯

class 児童手当(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "中学校卒業まで（15歳の誕生日後の最初の3月31日まで）の児童を養育している方に支給される手当"
    reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/jidouteate/index.html"

    def formula(対象世帯, 対象期間, parameters):
        # 子供の年齢を取得
        子一覧 = 対象世帯.members('子一覧', 対象期間)
        子の年齢 = 対象世帯.members('年齢', 対象期間)

        # 3歳未満、3歳以上小学校修了前、中学生の子供の数を計算
        三歳未満の子供数 = 対象世帯.sum(np.logical_and(子一覧, 子の年齢 < 3))
        三歳以上小学生の子供数 = 対象世帯.sum(np.logical_and(子一覧, np.logical_and(子の年齢 >= 3, 子の年齢 < 12)))
        中学生の子供数 = 対象世帯.sum(np.logical_and(子一覧, np.logical_and(子の年齢 >= 12, 子の年齢 < 15)))

        # 支給額を計算
        支給額 = (三歳未満の子供数 * 15000) + (三歳以上小学生の子供数 * 10000) + (中学生の子供数 * 10000)

        return 支給額
```

## 2. テストファイル（.yaml）の作成

テストファイルは、制度が正しく機能することを確認するためのテストケースを YAML 形式で定義するファイルです。

### 基本構造

```yaml
# [制度名] のテスト

- name: [テスト名]
  period: [対象期間]
  input:
    [エンティティ]:
      [入力1]: [値1]
      [入力2]: [値2]
  output:
    [エンティティ]:
      [出力変数]: [期待値]
```

### 例：児童手当のテスト

```yaml
# 児童手当のテスト

- name: ケース1 - 3歳未満の子供1人
  period: 2023-01-01
  input:
    世帯:
      親一覧:
        - 35
      子一覧:
        - 2
  output:
    世帯:
      児童手当: 15000

- name: ケース2 - 小学生の子供2人
  period: 2023-01-01
  input:
    世帯:
      親一覧:
        - 40
      子一覧:
        - 5
        - 8
  output:
    世帯:
      児童手当: 20000
```

## 3. パラメータファイル（.yaml）の作成

パラメータファイルは、制度のパラメータを YAML 形式で定義するファイルです。OpenFisca Editor では、「パラメータ」タブで編集できます。

### 基本構造

```yaml
description: [説明]
metadata:
  reference: [参照URL]
  unit: [単位]
values:
  [日付]:
    value: [値]
    metadata:
      label: [ラベル]
      description: [説明]
```

### 例：児童手当のパラメータ

```yaml
description: 3歳未満の児童に対する手当額
metadata:
  reference: https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/jidouteate/index.html
  unit: currency-JPY
values:
  2023-01-01:
    value: 15000
    metadata:
      label: 3歳未満の児童手当額
      description: 3歳未満の児童1人につき支給される月額
```

## OpenFisca 変数の主要な属性

| 属性 | 説明 | 例 |
|-----|------|-----|
| value_type | 変数の型 | int, float, bool, date, str, Enum |
| entity | 変数が適用されるエンティティ | 世帯, 人物 |
| definition_period | 変数が定義される期間 | DAY, MONTH, YEAR, ETERNITY |
| label | 変数の表示名 | "児童手当" |
| reference | 参考資料のURL | "https://..." |
| default_value | デフォルト値 | 0, False など |

## OpenFisca の主要なエンティティ

OpenFisca Japan で使用される主要なエンティティは以下の通りです：

- 世帯（世帯全体）
- 人物（個人）

## OpenFisca の典型的な関数

### エンティティメンバーの属性を取得

```python
# 世帯の子どもの年齢を取得
子の年齢 = 世帯.members('年齢', 期間)
```

### 論理演算

```python
# 3歳未満の子どもかどうか
三歳未満 = 子の年齢 < 3

# 3歳以上小学生かどうか
三歳以上小学生 = np.logical_and(子の年齢 >= 3, 子の年齢 < 12)
```

### エンティティ集計

```python
# 3歳未満の子どもの数を集計
三歳未満の子供数 = 世帯.sum(np.logical_and(子一覧, 子の年齢 < 3))
```

### パラメータの取得

```python
# パラメータから値を取得
給付額 = parameters(期間).手当.基本額
```

## エラーと注意点

- 変数名には日本語を使用できますが、クラス名としての制約を守る必要があります
- 数字から始まる変数名は使用できないため、漢数字を使用することがあります（例：`三の倍数給付金`）
- デバッグには `print` 文を使用できますが、製品コードでは削除しましょう
- エラーが発生した場合は、詳細なエラーメッセージを確認して問題を特定しましょう

## 参考資料

- [OpenFisca 公式ドキュメント](https://openfisca.org/doc/)
- [OpenFisca Japan ドキュメント](https://project-inclusive.github.io/OpenFisca-Japan/)
