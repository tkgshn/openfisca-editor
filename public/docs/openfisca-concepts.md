# OpenFisca 概念ガイド

このドキュメントでは、OpenFisca の主要な概念と OpenFisca Editor での利用方法について説明します。

## OpenFisca とは

[OpenFisca](https://openfisca.org/) は、税制や社会保障制度をモデル化するためのオープンソースプラットフォームです。政策立案者や研究者が、政策変更が個人や世帯に与える影響をシミュレートできるようにします。

## 主要概念

### 変数 (Variables)

変数は、所得、年齢、給付金の受給資格などの概念を表します。変数には以下の属性があります：

- **value_type**: 変数の型（boolean, float, integer, date, string, enum）
- **entity**: 変数が適用されるエンティティ（Person, Household など）
- **definition_period**: 変数が定義される期間（MONTH, YEAR, ETERNITY）
- **label**: 変数の表示名
- **description**: 変数の説明

#### 例：

```python
class basic_income(Variable):
    value_type = float
    entity = Person
    definition_period = MONTH
    label = "Basic income amount"

    def formula(person, period, parameters):
        age = person('age', period)
        income_threshold = parameters(period).benefits.basic_income.income_threshold
        base_amount = parameters(period).benefits.basic_income.amount

        income = person('income', period)
        eligible = income < income_threshold

        return eligible * base_amount
```

### パラメータ (Parameters)

パラメータは、税率や給付金額など、設定可能な値を表します。パラメータは時間とともに変化する可能性があり、日付ごとに異なる値を持つことができます。

#### 例：

```yaml
benefits:
  basic_income:
    amount:
      2020-01-01:
        value: 1000
      2021-01-01:
        value: 1100
    income_threshold:
      2020-01-01:
        value: 30000
```

### エンティティ (Entities)

エンティティは、個人、世帯、組織などのグループを表します。各エンティティは固有の属性と関係を持ちます。

#### 例：

```python
class Person(Entity):
    # ...

class Household(Entity):
    # ...
    roles = [PARENT, CHILD]
    # ...
```

### 期間 (Periods)

期間は、計算が実行される時間枠を表します。OpenFisca は以下の期間をサポートしています：

- **ETERNITY**: 時間によって変化しない値（性別など）
- **YEAR**: 年単位の値（年間所得など）
- **MONTH**: 月単位の値（月額給付金など）
- **DAY**: 日単位の値

### テスト (Tests)

テストは、システムが期待通りに動作することを検証します。テストケースは、特定の入力に対して期待される出力を指定します。

#### 例：

```yaml
- name: "Basic income test"
  period: 2020-01
  input:
    age: 30
    income: 20000
  output:
    basic_income: 1000
```

## OpenFisca Editor での開発フロー

1. **制度の定義**: 名前、概要、利用条件などの基本情報を入力
2. **変数の作成**: 計算に必要な変数を定義
3. **パラメータの設定**: 制度に関連するパラメータを設定
4. **テストケースの作成**: 制度が正しく機能することを確認するためのテストを作成
5. **シミュレーションの実行**: テストケースを実行して結果を可視化
6. **公開と共有**: 完成した制度をエクスポートして共有

## コード例：子育て支援給付金

```python
class child_benefit(Variable):
    value_type = float
    entity = Household
    definition_period = MONTH
    label = "Child benefit amount"

    def formula(household, period, parameters):
        # 子どもの数を取得
        nb_children = household.nb_persons(role=Household.CHILD)

        # パラメータから給付金額を取得
        amount_per_child = parameters(period).benefits.child_benefit.amount_per_child

        # 給付金の計算
        return nb_children * amount_per_child
```

## 参考資料

- [OpenFisca 公式ドキュメント](https://openfisca.org/doc/)
- [OpenFisca GitHub リポジトリ](https://github.com/openfisca/openfisca-core)
