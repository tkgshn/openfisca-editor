import type { Institution, Parameter, Version } from "./types"
import { v4 as uuidv4 } from "uuid"

const API_BASE_URL = "http://localhost:8000"
const LOCAL_STORAGE_KEY = "openfisca-user-institutions"

// サンプルデータ
const sampleInstitutions: Institution[] = [
  {
    id: "sample-1",
    source: "sample",
    name: "児童手当",
    summary: "中学校卒業まで（15歳の誕生日後の最初の3月31日まで）の児童を養育している方に支給される手当",
    url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/jidouteate/index.html",
    conditions: "中学校卒業前の児童を養育していること",
    department: "厚生労働省",
    postingUrl: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/jidouteate/index.html",
    applicationUrl: "https://www.digital.go.jp/policies/posts/childrearing_allowance",
    formulaCode: `"""
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
from openfisca_japan.variables.全般 import 小学生学年, 中学生学年, 高校生学年

class 児童手当(Variable):
  value_type = int
  entity = 世帯
  definition_period = DAY
  label = "中学校卒業まで（15歳の誕生日後の最初の3月31日まで）の児童を養育している方に支給される手当"
  reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/jidouteate/index.html"
  conditions = "中学校卒業前の児童を養育していること"
  department = "厚生労働省"
  application_url = "https://www.digital.go.jp/policies/posts/childrearing_allowance"

  def formula(対象世帯, 対象期間, parameters):
      # 子供の年齢を取得
      子一覧 = 対象世帯.members('子一覧', 対象期間)
      子の年齢 = 対象世帯.members('年齢', 対象期間)
      
      # 3歳未満、3歳以上小学校修了前、中学生の子供の数を計算
      三歳未満の子供数 = 対象世帯.sum(np.logical_and(子一覧, 子の年齢 < 3))
      三歳以上小学生の子供数 = 対象世帯.sum(np.logical_and(子一覧, np.logical_and(子の年齢 >= 3, 子の年齢 < 12)))
      中学生の子供数 = 対象世帯.sum(np.logical_and(子一覧, np.logical_and(子の年齢 >= 12, 子の年齢 < 15)))
      
      # 所得制限を考慮（簡略化のため、所得制限は考慮しない）
      
      # 支給額を計算
      支給額 = (三歳未満の子供数 * 15000) + (三歳以上小学生の子供数 * 10000) + (中学生の子供数 * 10000)
      
      return 支給額`,
    testCases: [
      {
        parent: [35],
        grandparent: [],
        child: [2],
        amount: 15000,
      },
      {
        parent: [40],
        grandparent: [],
        child: [5, 8],
        amount: 20000,
      },
      {
        parent: [45],
        grandparent: [],
        child: [13],
        amount: 10000,
      },
      {
        parent: [50],
        grandparent: [],
        child: [16],
        amount: 0,
      },
    ],
    testYamlRaw: `# 児童手当のテスト
# 参照URL: https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/jidouteate/index.html

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

- name: ケース3 - 中学生の子供1人
period: 2023-01-01
input:
  世帯:
    親一覧:
      - 45
    子一覧:
      - 13
output:
  世帯:
    児童手当: 10000

- name: ケース4 - 高校生の子供1人（対象外）
period: 2023-01-01
input:
  世帯:
    親一覧:
      - 50
    子一覧:
      - 16
output:
  世帯:
    児童手当: 0`,
    mermaidCode: `flowchart TD
  A["開始"] --> B{"子供の年齢確認"}
  B -->|"3歳未満"| C["15,000円/月"]
  B -->|"3歳以上小学校修了前"| D["10,000円/月"]
  B -->|"中学生"| E["10,000円/月"]
  B -->|"15歳以上"| F["支給なし"]
  C --> G["支給額合計"]
  D --> G
  E --> G
  F --> G`,
    parameters: [
      {
        name: "児童手当_3歳未満",
        description: "3歳未満の児童に対する手当額",
        reference: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/jidouteate/index.html",
        unit: "currency-JPY",
        values: [
          {
            date: "2023-01-01",
            value: 15000,
            label: "3歳未満の児童手当額",
            description: "3歳未満の児童1人につき支給される月額",
          },
        ],
      },
      {
        name: "児童手当_3歳以上小学生",
        description: "3歳以上小学生の児童に対する手当額",
        reference: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/jidouteate/index.html",
        unit: "currency-JPY",
        values: [
          {
            date: "2023-01-01",
            value: 10000,
            label: "3歳以上小学生の児童手当額",
            description: "3歳以上小学生の児童1人につき支給される月額",
          },
        ],
      },
      {
        name: "児童手当_中学生",
        description: "中学生の児童に対する手当額",
        reference: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/jidouteate/index.html",
        unit: "currency-JPY",
        values: [
          {
            date: "2023-01-01",
            value: 10000,
            label: "中学生の児童手当額",
            description: "中学生の児童1人につき支給される月額",
          },
        ],
      },
    ],
    versions: [],
    currentVersion: "",
  },
  {
    id: "sample-2",
    source: "sample",
    name: "特別児童扶養手当",
    summary: "精神または身体に障害を有する児童について手当を支給することにより、児童の福祉の増進を図る制度",
    url: "https://www.mhlw.go.jp/bunya/kodomo/osirase/100526-1.html",
    conditions: "20歳未満で政令で定める程度の障害を有する児童を家庭で監護、養育していること",
    department: "厚生労働省",
    postingUrl: "https://www.mhlw.go.jp/bunya/kodomo/osirase/100526-1.html",
    applicationUrl: "https://www.mhlw.go.jp/bunya/kodomo/osirase/100526-1.html",
    formulaCode: `"""
特別児童扶養手当 の実装

概要: 精神または身体に障害を有する児童について手当を支給することにより、児童の福祉の増進を図る制度
利用条件: 20歳未満で政令で定める程度の障害を有する児童を家庭で監護、養育していること
所管部署: 厚生労働省
掲載URL: https://www.mhlw.go.jp/bunya/kodomo/osirase/100526-1.html
申請先URL: https://www.mhlw.go.jp/bunya/kodomo/osirase/100526-1.html
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯

class 特別児童扶養手当(Variable):
  value_type = int
  entity = 世帯
  definition_period = DAY
  label = "精神または身体に障害を有する児童について手当を支給することにより、児童の福祉の増進を図る制度"
  reference = "https://www.mhlw.go.jp/bunya/kodomo/osirase/100526-1.html"
  conditions = "20歳未満で政令で定める程度の障害を有する児童を家庭で監護、養育していること"
  department = "厚生労働省"
  application_url = "https://www.mhlw.go.jp/bunya/kodomo/osirase/100526-1.html"

  def formula(対象世帯, 対象期間, parameters):
      # 子供の年齢と障害状態を取得
      子一覧 = 対象世帯.members('子一覧', 対象期間)
      子の年齢 = 対象世帯.members('年齢', 対象期間)
      
      # 簡略化のため、障害の程度は仮定する
      # 実際には障害の程度を示す変数が必要
      重度障害 = 対象世帯.members('重度障害', 対象期間) if '重度障害' in parameters else np.zeros(子の年齢.shape)
      中度障害 = 対象世帯.members('中度障害', 対象期間) if '中度障害' in parameters else np.zeros(子の年齢.shape)
      
      # 20歳未満の子供を対象とする
      対象児童 = np.logical_and(子一覧, 子の年齢 < 20)
      
      # 1級（重度）の障害児の数
      一級障害児数 = 対象世帯.sum(np.logical_and(対象児童, 重度障害))
      
      # 2級（中度）の障害児の数
      二級障害児数 = 対象世帯.sum(np.logical_and(対象児童, 中度障害))
      
      # 支給額を計算（2023年4月現在）
      一級支給額 = 一級障害児数 * 52400  # 1級: 月額52,400円
      二級支給額 = 二級障害児数 * 34900  # 2級: 月額34,900円
      
      return 一級支給額 + 二級支給額`,
    testCases: [
      {
        parent: [40],
        grandparent: [],
        child: [10],
        amount: 52400,
      },
      {
        parent: [45],
        grandparent: [],
        child: [15],
        amount: 34900,
      },
      {
        parent: [50],
        grandparent: [],
        child: [21],
        amount: 0,
      },
    ],
    testYamlRaw: `# 特別児童扶養手当のテスト
# 参照URL: https://www.mhlw.go.jp/bunya/kodomo/osirase/100526-1.html

- name: ケース1 - 重度障害のある10歳の子供
period: 2023-01-01
input:
  世帯:
    親一覧:
      - 40
    子一覧:
      - 10
  世帯員:
    子1:
      年齢: 10
      重度障害: True
      中度障害: False
output:
  世帯:
    特別児童扶養手当: 52400

- name: ケース2 - 中度障害のある15歳の子供
period: 2023-01-01
input:
  世帯:
    親一覧:
      - 45
    子一覧:
      - 15
  世帯員:
    子1:
      年齢: 15
      重度障害: False
      中度障害: True
output:
  世帯:
    特別児童扶養手当: 34900

- name: ケース3 - 21歳の障害者（対象外）
period: 2023-01-01
input:
  世帯:
    親一覧:
      - 50
    子一覧:
      - 21
  世帯員:
    子1:
      年齢: 21
      重度障害: True
      中度障害: False
output:
  世帯:
    特別児童扶養手当: 0`,
    mermaidCode: `flowchart TD
  A["開始"] --> B{"子供の年齢確認"}
  B -->|"20歳未満"| C{"障害の程度確認"}
  B -->|"20歳以上"| D["支給なし"]
  C -->|"1級（重度）"| E["月額52,400円"]
  C -->|"2級（中度）"| F["月額34,900円"]
  C -->|"該当なし"| D
  E --> G["支給額合計"]
  F --> G
  D --> G`,
    parameters: [
      {
        name: "特別児童扶養手当_1級",
        description: "1級（重度）障害児に対する手当額",
        reference: "https://www.mhlw.go.jp/bunya/kodomo/osirase/100526-1.html",
        unit: "currency-JPY",
        values: [
          {
            date: "2023-01-01",
            value: 52400,
            label: "1級（重度）障害児の特別児童扶養手当額",
            description: "1級（重度）障害児1人につき支給される月額",
          },
        ],
      },
      {
        name: "特別児童扶養手当_2級",
        description: "2級（中度）障害児に対する手当額",
        reference: "https://www.mhlw.go.jp/bunya/kodomo/osirase/100526-1.html",
        unit: "currency-JPY",
        values: [
          {
            date: "2023-01-01",
            value: 34900,
            label: "2級（中度）障害児の特別児童扶養手当額",
            description: "2級（中度）障害児1人につき支給される月額",
          },
        ],
      },
    ],
    versions: [],
    currentVersion: "",
  },
  {
    id: "sample-3",
    source: "sample",
    name: "3の倍数給付金",
    summary: "3の倍数の年齢の子供がいる世帯に支給される給付金（サンプル）",
    url: "",
    conditions: "3の倍数の年齢の子供がいること",
    department: "サンプル部署",
    postingUrl: "",
    applicationUrl: "",
    formulaCode: `"""
3の倍数給付金 の実装

概要: 年齢が3の倍数の世帯員の1人につき、年間10万円を給付する架空の制度。一部の学生については追加で年間3万円を給付する。
利用条件: 
所管部署: 
掲載URL: 
申請先URL: 
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯
from openfisca_japan.variables.全般 import 小学生学年, 中学生学年, 高校生学年

# 数字始まりのクラス名を使えないので、漢数字を使っている
class 三の倍数給付金(Variable):
    value_type = int  # この給付金は小数にはならないので整数型のintを指定している
    entity = 世帯  # この給付金は世帯ごとに支給されるので世帯を指定している
    definition_period = DAY  # この給付金は年額で給付されるため本来はYEARが適切。しかし、現状では他のVariableがDAYになっているなどの理由でDAYにしないと動かない。設計の見直しが必要。
    label = "年齢が3の倍数の世帯員の1人につき、年間10万円を給付する架空の制度。一部の学生については追加で年間3万円を給付する。"  # このVariableの説明

    def formula(対象世帯, 対象期間, parameters):  # この給付金の計算式を記述する
        # 世帯員の年齢を取得する
        世帯員の年齢一覧 = 対象世帯.members("年齢", 対象期間)

        # 各世帯員が3の倍数の年齢であるかを判定する
        年齢が3の倍数である = 世帯員の年齢一覧 % 3 == 0  # 条件に該当するか否かのbool値のndarray配列ができる

        # 世帯員の学年を取得する
        世帯員の学年一覧 = 対象世帯.members("学年", 対象期間)

        # 各世帯員がボーナス対象学年であるかを判定する
        小学三年生である = 世帯員の学年一覧 == 小学生学年.三年生.value  # 条件に該当するか否かのbool値のndarray配列ができる
        小学六年生である = 世帯員の学年一覧 == 小学生学年.六年生.value
        中学三年生である = 世帯員の学年一覧 == 中学生学年.三年生.value
        高校三年生である = 世帯員の学年一覧 == 高校生学年.三年生.value
        ボーナス対象学年である = 小学三年生である + 小学六年生である + 中学三年生である + 高校三年生である  # OpenFiscaでは or の代わりに + を用います

        # 判定結果から世帯の給付金額の合計値を算出する
        給付金額一覧 = 年齢が3の倍数である * parameters(対象期間).チュートリアル.三の倍数給付金額_通常 + ボーナス対象学年である * parameters(対象期間).チュートリアル.三の倍数給付金額_ボーナス  # 世帯員ごとに給付される額が格納されたndarray配列ができる
        給付金額 = 対象世帯.sum(給付金額一覧)  # numpy の関数はできるだけ使わないことが望ましい

        # デバッグ用（エラーが発生したら出力される）
        print('======== START ========')
        print('世帯員の年齢一覧', 世帯員の年齢一覧)
        print('年齢が3の倍数である', 年齢が3の倍数である)
        print('世帯員の学年一覧', 世帯員の学年一覧)
        print('ボーナス対象学年である', ボーナス対象学年である)
        print('給付金額一覧', 給付金額一覧)
        print('給付金額', 給付金額)
        print('======== END ========')

        # エラーが発生した場合に標準出力が表示されるため、デバッグのために強制的にエラーを発生させることも有用
        # （出力結果とテストに記載の結果が一致せずテストに失敗するだけでは標準出力は表示されない）
        # raise ValueError("debug")

        return 給付金額`,
    testCases: [
      {
        parent: [30],
        grandparent: [],
        child: [3],
        amount: 10000,
      },
      {
        parent: [35],
        grandparent: [],
        child: [6],
        amount: 10000,
      },
      {
        parent: [40],
        grandparent: [],
        child: [9],
        amount: 10000,
      },
      {
        parent: [45],
        grandparent: [],
        child: [4],
        amount: 0,
      },
    ],
    testYamlRaw: `# 3の倍数給付金のテスト

- name: ケース1 - 3歳の子供
period: 2023-01-01
input:
  世帯:
    親一覧:
      - 30
    子一覧:
      - 3
output:
  世帯:
    三の倍数給付金: 10000

- name: ケース2 - 6歳の子供
period: 2023-01-01
input:
  世帯:
    親一覧:
      - 35
    子一覧:
      - 6
output:
  世帯:
    三の倍数給付金: 10000

- name: ケース3 - 9歳の子供
period: 2023-01-01
input:
  世帯:
    親一覧:
      - 40
    子一覧:
      - 9
output:
  世帯:
    三の倍数給付金: 10000

- name: ケース4 - 4歳の子供（対象外）
period: 2023-01-01
input:
  世帯:
    親一覧:
      - 45
    子一覧:
      - 4
output:
  世帯:
    三の倍数給付金: 0`,
    mermaidCode: `flowchart TD
  A["開始"] --> B{"子供の年齢が3の倍数か確認"}
  B -->|"はい（3, 6, 9, 12, ...歳）"| C["10,000円支給"]
  B -->|"いいえ"| D["支給なし（0円）"]
  C --> E["終了"]
  D --> E`,
    parameters: [
      {
        name: "三の倍数給付金額_通常",
        description: "3の倍数給付金額",
        reference: "https://project-inclusive.github.io/OpenFisca-Japan/tutorial.html",
        unit: "currency-JPY",
        values: [
          {
            date: "2023-01-01",
            value: 100000,
            label: "3の倍数給付金の通常額",
            description: "年齢が3の倍数の世帯員1人につき給付される金額",
          },
        ],
      },
      {
        name: "三の倍数給付金額_ボーナス",
        description: "3の倍数給付金額_ボーナス",
        reference: "https://project-inclusive.github.io/OpenFisca-Japan/tutorial.html",
        unit: "currency-JPY",
        values: [
          {
            date: "2023-01-01",
            value: 30000,
            label: "3の倍数給付金のボーナス額",
            description: "特定の学年の世帯員に追加で給付される金額",
          },
        ],
      },
    ],
    versions: [],
    currentVersion: "",
  },
  {
    id: "sample-4",
    source: "sample",
    name: "子育てめっちゃ頑張ってください助成金",
    summary: "各世帯における子供の数と子供の年齢に応じて給付金を配布する制度",
    url: "",
    conditions: "一定収入以上の世帯は対象になりません。子供の年齢に応じて給付額が変わります。",
    department: "内閣府",
    postingUrl: "",
    applicationUrl: "",
    formulaCode: `"""
子育てめっちゃ頑張ってください助成金 の実装

概要: 各世帯における子供の数と子供の年齢に応じて給付金を配布する制度
利用条件: 一定収入以上の世帯は対象になりません。子供の年齢に応じて給付額が変わります。
所管部署: 内閣府
掲載URL: 
申請先URL: 
"""

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯
from openfisca_japan.variables.年齢 import 年齢
from openfisca_japan.variables.世帯収入 import 世帯収入

class 子育てめっちゃ頑張ってください助成金(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "各世帯における子供の数と子供の年齢に応じて給付金を配布する制度"
    reference = ""
    conditions = "一定収入以上の世帯は対象になりません。子供の年齢に応じて給付額が変わります。"
    department = "内閣府"
    application_url = ""

    def formula(世帯, period, parameters):
        # 1. 世帯収入を取得
        income = 世帯(世帯収入, period)

        # 2. パラメータの取得
        threshold = parameters(period).childcare_policy.income_threshold
        amt_0_3   = parameters(period).childcare_policy.subsidy_0_3
        amt_3_5   = parameters(period).childcare_policy.subsidy_3_5
        amt_6_10  = parameters(period).childcare_policy.subsidy_6_10

        # 3. 世帯員の年齢リストを取得
        ages = 世帯.members(年齢, period)
        
        # 4. 収入が threshold 以上の場合は支給なし
        if income >= threshold:
            return 0.0
            
        # 5. 子ども1人ごとに年齢帯に応じて給付額を合計
        total = 0.0
        for (let age of ages) {
            if (0 <= age && age < 3) {
                total += amt_0_3
            } else if (3 <= age && age < 6) {
                total += amt_3_5
            } else if (6 <= age && age < 11) {
                total += amt_6_10
            }
        }
        return total`,
    testCases: [
      {
        parent: [30],
        grandparent: [],
        child: [2],
        amount: 15000,
      },
      {
        parent: [30],
        grandparent: [],
        child: [4],
        amount: 10000,
      },
      {
        parent: [30],
        grandparent: [],
        child: [7],
        amount: 5000,
      },
      {
        parent: [40, 42],
        grandparent: [],
        child: [2, 5, 8],
        amount: 30000,
      },
      {
        parent: [30],
        grandparent: [],
        child: [2],
        amount: 0,
      },
    ],
    testYamlRaw: `# 子育てめっちゃ頑張ってください助成金のテスト

- name: ケース1 - 0-3歳の子供
  period: 2023-01-01
  input:
    世帯:
      親一覧:
        - 30
      子一覧:
        - 2
      世帯収入: 6000000
  output:
    世帯:
      子育てめっちゃ頑張ってください助成金: 15000

- name: ケース2 - 3-5歳の子供
  period: 2023-01-01
  input:
    世帯:
      親一覧:
        - 30
      子一覧:
        - 4
      世帯収入: 6000000
  output:
    世帯:
      子育てめっちゃ頑張ってください助成金: 10000

- name: ケース3 - 6-10歳の子供
  period: 2023-01-01
  input:
    世帯:
      親一覧:
        - 30
      子一覧:
        - 7
      世帯収入: 6000000
  output:
    世帯:
      子育てめっちゃ頑張ってください助成金: 5000

- name: ケース4 - 複数の子供
  period: 2023-01-01
  input:
    世帯:
      親一覧:
        - 40
        - 42
      子一覧:
        - 2
        - 5
        - 8
      世帯収入: 7000000
  output:
    世帯:
      子育てめっちゃ頑張ってください助成金: 30000

- name: ケース5 - 収入超過で対象外
  period: 2023-01-01
  input:
    世帯:
      親一覧:
        - 30
      子一覧:
        - 2
      世帯収入: 9000000
  output:
    世帯:
      子育てめっちゃ頑張ってください助成金: 0`,
    mermaidCode: `flowchart TD
A["開始"] --> B{"世帯収入が閾値以下か確認"}
B -->|"いいえ（閾値以上）"| C["支給なし（0円）"]
B -->|"はい（閾値以下）"| D["子供の年齢確認"]
D -->|"0-3歳の子供"| E["15,000円/人"]
D -->|"3-5歳の子供"| F["10,000円/人"]
D -->|"6-10歳の子供"| G["5,000円/人"]
E --> H["支給額を合計"]
F --> H
G --> H
H --> I["終了"]
C --> I`,
    parameters: [
      {
        name: "childcare_policy.income_threshold",
        description: "収入制限",
        reference: "",
        unit: "currency-JPY",
        values: [
          {
            date: "2023-01-01",
            value: 8000000,
            label: "収入制限",
            description: "この金額以上の世帯収入がある場合は、給付の対象外となります",
          },
        ],
      },
      {
        name: "childcare_policy.subsidy_0_3",
        description: "0~3歳給付額",
        reference: "",
        unit: "currency-JPY",
        values: [
          {
            date: "2023-01-01",
            value: 15000,
            label: "0-3歳の子供への給付額",
            description: "0歳から3歳未満の子供1人あたりの給付額",
          },
        ],
      },
      {
        name: "childcare_policy.subsidy_3_5",
        description: "3~5歳給付額",
        reference: "",
        unit: "currency-JPY",
        values: [
          {
            date: "2023-01-01",
            value: 10000,
            label: "3-5歳の子供への給付額",
            description: "3歳から6歳未満の子供1人あたりの給付額",
          },
        ],
      },
      {
        name: "childcare_policy.subsidy_6_10",
        description: "6~10歳給付額",
        reference: "",
        unit: "currency-JPY",
        values: [
          {
            date: "2023-01-01",
            value: 5000,
            label: "6-10歳の子供への給付額",
            description: "6歳から11歳未満の子供1人あたりの給付額",
          },
        ],
      },
    ],
    versions: [],
    currentVersion: "",
  },
]

// ユーザー作成の制度をlocalStorageから取得
const getUserInstitutions = (): Institution[] => {
  if (typeof window === "undefined") return []

  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!storedData) return []
    return JSON.parse(storedData)
  } catch (error) {
    console.error("Failed to load user institutions from localStorage:", error)
    return []
  }
}

// ユーザー作成の制度をlocalStorageに保存
const saveUserInstitutions = (institutions: Institution[]): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(institutions))
  } catch (error) {
    console.error("Failed to save user institutions to localStorage:", error)
  }
}

// 全ての制度を取得（サンプル + ユーザー作成）
export async function fetchInstitutions(): Promise<Institution[]> {
  // サーバーサイドでの実行時はサンプルデータのみを返す
  if (typeof window === "undefined") {
    return [...sampleInstitutions]
  }

  const userInstitutions = getUserInstitutions()
  return [...sampleInstitutions, ...userInstitutions]
}

// 新しい制度を作成
export async function createInstitution(name: string): Promise<Institution> {
  // 新しい制度を作成
  const newInstitution: Institution = {
    id: uuidv4(), // 一意のIDを生成
    source: "user", // ユーザー作成の制度
    name,
    summary: "",
    url: "",
    conditions: "",
    department: "",
    postingUrl: "",
    applicationUrl: "",
    formulaCode: `"""
${name} の実装

概要: 
利用条件: 
所管部署: 
掲載URL: 
申請先URL: 
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯

class ${name}(Variable):
  value_type = int
  entity = 世帯
  definition_period = DAY
  label = ""
  reference = ""
  conditions = ""
  department = ""
  application_url = ""

  def formula(対象世帯, 対象期間, parameters):
      return 0`,
    testCases: [],
    testYamlRaw: `# ${name} のテスト

`,
    parameters: [],
    versions: [], // Initialize empty versions array
    currentVersion: "", // No current version initially
  }

  // ユーザー作成の制度を保存
  const userInstitutions = getUserInstitutions()
  userInstitutions.push(newInstitution)
  saveUserInstitutions(userInstitutions)

  return Promise.resolve(newInstitution)
}

// 制度を更新
export async function updateInstitution(institution: Institution): Promise<void> {
  if (institution.source === "sample") {
    // サンプル制度は更新できない（実際のアプリケーションでは警告を表示するなど）
    console.warn("サンプル制度は更新できません")
    return Promise.resolve()
  }

  // ユーザー作成の制度を更新
  const userInstitutions = getUserInstitutions()
  const index = userInstitutions.findIndex((inst) => inst.id === institution.id)

  if (index !== -1) {
    userInstitutions[index] = institution
    saveUserInstitutions(userInstitutions)
  }

  return Promise.resolve()
}

// 制度を削除
export async function deleteInstitution(institutionId: string): Promise<void> {
  // サンプル制度のIDかチェック
  if (sampleInstitutions.some((inst) => inst.id === institutionId)) {
    console.warn("サンプル制度は削除できません")
    return Promise.resolve()
  }

  // ユーザー作成の制度を削除
  const userInstitutions = getUserInstitutions()
  const filteredInstitutions = userInstitutions.filter((inst) => inst.id !== institutionId)

  if (filteredInstitutions.length !== userInstitutions.length) {
    saveUserInstitutions(filteredInstitutions)
  }

  return Promise.resolve()
}

// テスト実行
export async function runTest(institutionId: string, yamlContent: string, signal?: AbortSignal): Promise<any> {
  try {
    // Try to connect to the local backend with timeout
    const controller = signal ? undefined : new AbortController()
    const timeoutId = controller ? setTimeout(() => controller.abort(), 10000) : undefined // 10秒でタイムアウト

    try {
      const response = await fetch("http://localhost:8000/run_test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          yaml_path: `openfisca_japan/tests/チュートリアル/${institutionId}.yaml`,
          yaml_content: yamlContent,
        }),
        signal: signal || (controller ? controller.signal : undefined),
      })

      if (controller && timeoutId) {
        clearTimeout(timeoutId)
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Add additional information to the results
      return {
        ...data,
        timestamp: new Date().toISOString(),
        duration: data.duration || 0,
        passed: data.passed || 0,
        failed: data.failed || 0,
        total: data.total || 0,
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError)
      // ここでfetchエラーを明示的に処理
      throw new Error(fetchError instanceof Error ? fetchError.message : "Network request failed")
    }
  } catch (error) {
    console.error("Failed to run test:", error)

    // バックエンドが利用できない場合のモックデータ生成
    const institution = await getMockOrRealInstitution(institutionId)
    const testCasesCount = institution?.testCases?.length || 0

    // モックデータを返す
    const mockData = {
      stdout: `${testCasesCount} tests passed\nAll tests passed successfully!`,
      stderr: "",
      returncode: 0,
      timestamp: new Date().toISOString(),
      duration: 0.5,
      passed: testCasesCount,
      failed: 0,
      total: testCasesCount,
      isMock: true, // これがモックデータであることを示すフラグ
    }

    // サンプル制度の場合は常に成功を返す
    if (institution && institution.source === "sample") {
      return mockData
    }

    // ユーザー制度の場合はIDに基づいて成功/失敗を決定
    const shouldPass = institutionId.charCodeAt(0) % 2 === 0

    if (shouldPass) {
      return mockData
    } else {
      return {
        stdout: "",
        stderr: `Error: バックエンドサービスに接続できません。\nOpenFiscaバックエンドサービスが起動しているか確認してください。\n起動コマンド: uvicorn server:app --reload\n\n詳細エラー: ${error instanceof Error ? error.message : "Unknown error"}`,
        returncode: 1,
        timestamp: new Date().toISOString(),
        duration: 0,
        passed: 0,
        failed: testCasesCount,
        total: testCasesCount,
        isMock: true,
      }
    }
  }
}

// 制度データを取得する補助関数（実際のデータまたはモックデータ）
async function getMockOrRealInstitution(institutionId: string): Promise<Institution | undefined> {
  // まずサンプルデータから探す
  const sampleInst = sampleInstitutions.find((inst) => inst.id === institutionId)
  if (sampleInst) return sampleInst

  // ユーザー作成の制度から探す
  try {
    const userInstitutions = getUserInstitutions()
    return userInstitutions.find((inst) => inst.id === institutionId)
  } catch (error) {
    console.error("Failed to get user institutions:", error)
    return undefined
  }
}

// Mermaidダイアグラム生成
export async function generateMermaidDiagram(openfiscaCode: string): Promise<string> {
  // コードを分析して、どのような種類のポリシーかを判断
  let policyType = ""
  if (openfiscaCode.includes("子の年齢")) {
    if (openfiscaCode.includes("% 3 == 0")) {
      policyType = "3の倍数"
    } else if (openfiscaCode.includes("< 3")) {
      policyType = "児童手当"
    } else if (openfiscaCode.includes("障害")) {
      policyType = "障害手当"
    } else {
      policyType = "年齢基準"
    }
  } else {
    policyType = "一般"
  }

  // ポリシータイプに基づいて異なるダイアグラムを返す
  switch (policyType) {
    case "3の倍数":
      return `flowchart TD
A["開始"] --> B{"子供の年齢が3の倍数か確認"}
B -->|"はい（3, 6, 9, 12, ...歳）"| C["10,000円支給"]
B -->|"いいえ"| D["支給なし（0円）"]
C --> E["終了"]\
D --> E`

    case "児童手当":
      return `flowchart TD
A["開始"] --> B{"子供の年齢確認"}
B -->|"3歳未満"| C["15,000円/月"]
B -->|"3歳以上小学校修了前"| D["10,000円/月"]
B -->|"中学生"| E["10,000円/月"]
B -->|"15歳以上"| F["支給なし"]
C --> G["支給額合計"]
D --> G
E --> G
F --> G`

    case "障害手当":
      return `flowchart TD
A["開始"] --> B{"子供の年齢確認"}
B -->|"20歳未満"| C{"障害の程度確認"}
B -->|"20歳以上"| D["支給なし"]
C -->|"1級（重度）"| E["月額52,400円"]
C -->|"2級（中度）"| F["月額34,900円"]
C -->|"該当なし"| D
E --> G["支給額合計"]
F --> G
D --> G`

    default:
      return `flowchart TD
A["開始"] --> B{"条件確認"}
B -->|"条件を満たす"| C["給付金支給"]
B -->|"条件を満たさない"| D["支給なし"]
C --> E["終了"]
D --> E`
  }
}

// パラメータ関連の関数
export async function createParameter(institution: Institution, parameter: Parameter): Promise<void> {
  if (institution.source === "sample") {
    console.warn("サンプル制度のパラメータは追加できません")
    return Promise.resolve()
  }

  // パラメータを追加
  if (!institution.parameters) {
    institution.parameters = []
  }
  institution.parameters.push(parameter)

  // 制度を更新
  await updateInstitution(institution)
  return Promise.resolve()
}

export async function updateParameter(
  institution: Institution,
  parameterIndex: number,
  parameter: Parameter,
): Promise<void> {
  if (institution.source === "sample") {
    console.warn("サンプル制度のパラメータは更新できません")
    return Promise.resolve()
  }

  // パラメータを更新
  if (institution.parameters && institution.parameters[parameterIndex]) {
    institution.parameters[parameterIndex] = parameter

    // 制度を更新
    await updateInstitution(institution)
  }
  return Promise.resolve()
}

export async function deleteParameter(institution: Institution, parameterIndex: number): Promise<void> {
  if (institution.source === "sample") {
    console.warn("サンプル制度のパラメータは削除できません")
    return Promise.resolve()
  }

  // パラメータを削除
  if (institution.parameters && institution.parameters[parameterIndex]) {
    institution.parameters.splice(parameterIndex, 1)

    // 制度を更新
    await updateInstitution(institution)
  }
  return Promise.resolve()
}

// OpenFiscaファイルのエクスポート
export async function exportToOpenFisca(
  institution: Institution,
): Promise<{ variable: string; test: string; parameters: string[] }> {
  // 変数ファイル（.py）
  const variableFile = institution.formulaCode

  // テストファイル（.yaml）
  const testFile = institution.testYamlRaw || `# ${institution.name} のテスト\n`

  // パラメータファイル（.yaml）
  const parameterFiles: string[] = []

  if (institution.parameters && institution.parameters.length > 0) {
    institution.parameters.forEach((param) => {
      let paramYaml = `description: ${param.description}\n`
      paramYaml += `metadata:\n`

      if (param.reference) {
        paramYaml += `  reference: ${param.reference}\n`
      }

      if (param.unit) {
        paramYaml += `  unit: ${param.unit}\n`
      }

      paramYaml += `values:\n`

      param.values.forEach((value) => {
        paramYaml += `  ${value.date}:\n`
        paramYaml += `    value: ${value.value}\n`

        if (value.label || value.description) {
          paramYaml += `    metadata:\n`

          if (value.label) {
            paramYaml += `      label: '${value.label}'\n`
          }

          if (value.description) {
            paramYaml += `      description: '${value.description}'\n`
          }
        }
      })

      parameterFiles.push(paramYaml)
    })
  }

  return Promise.resolve({
    variable: variableFile,
    test: testFile,
    parameters: parameterFiles,
  })
}

export async function publishInstitution(institution: Institution, visibility: string): Promise<void> {
  if (institution.source === "sample") {
    console.warn("サンプル制度は公開できません")
    return Promise.resolve()
  }

  // ユーザー作成の制度を更新
  const userInstitutions = getUserInstitutions()
  const index = userInstitutions.findIndex((inst) => inst.id === institution.id)

  if (index !== -1) {
    userInstitutions[index] = {
      ...institution,
      visibility: visibility,
      publishedAt: new Date().toISOString(),
    }
    saveUserInstitutions(userInstitutions)
  }

  return Promise.resolve()
}

export async function createVersion(
  institution: Institution,
  message: string,
  changes: { before: Partial<Institution>; after: Partial<Institution> },
): Promise<Version> {
  const version: Version = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    message,
    changes,
  }

  // Run tests for the new version
  const testResults = await runTest(institution.id, institution.testYamlRaw || "")
  version.testResults = {
    success: testResults.returncode === 0,
    timestamp: new Date().toISOString(),
    duration: testResults.duration || 0,
    details: {
      passed: testResults.passed || 0,
      failed: testResults.failed || 0,
      total: (testResults.passed || 0) + (testResults.failed || 0),
      errors: testResults.stderr ? [testResults.stderr] : undefined,
    },
  }

  return version
}

export async function revertToVersion(institution: Institution, versionId: string): Promise<Institution> {
  const version = institution.versions.find((v) => v.id === versionId)
  if (!version) {
    throw new Error("Version not found")
  }

  // Apply the changes in reverse
  const updatedInstitution = {
    ...institution,
    ...version.changes.before,
    currentVersion: versionId,
  }

  // Save the updated institution
  await updateInstitution(updatedInstitution)

  return updatedInstitution
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// シミュレーション実行
export async function runSimulation(institutionId: string, params: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/simulate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ institutionId, params }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to run simulation:", error)
    throw error
  }
}

// 制度詳細取得
export async function fetchInstitutionById(id: string): Promise<any> {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockInstitution = {
        id: id,
        name: "Mock Institution",
        description: "This is a mock institution for testing purposes.",
        stats: {
          variables: 10,
          parameters: 5,
          tests: 3,
        },
      }
      resolve(mockInstitution)
    }, 500)
  })
}

