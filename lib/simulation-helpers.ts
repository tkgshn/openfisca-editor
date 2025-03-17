/**
 * シミュレーションヘルパー関数
 * シミュレーションのデータ生成と計算を行う共通ライブラリ
 */

/**
 * シミュレーションデータを生成するためのメイン関数
 * 制度名に基づいて適切なシミュレーションジェネレーターを使用する
 * 
 * @param institutionName 制度名
 * @param params パラメータ（制度によって異なる）
 * @returns シミュレーション結果データ
 */
export function generateFallbackSimulationData(institutionName: string, params: any) {
  switch(institutionName) {
    case "子育て助成金":
      return generateChildcareSimulationData(
        params.incomeLimit || 8000000, 
        params.childBenefit03 || 15000, 
        params.childBenefit35 || 10000, 
        params.childBenefit610 || 5000
      )
    case "3の倍数給付金":
      return generateMultiplesOf3SimulationData(params)
    default:
      return generateGenericSimulationData(params)
  }
}

/**
 * 子育て助成金のシミュレーションデータを生成
 * 
 * @param threshold 所得制限閾値
 * @param amt0_3 0-3歳児向け給付額
 * @param amt3_5 3-5歳児向け給付額
 * @param amt6_10 6-10歳児向け給付額
 * @returns シミュレーション結果
 */
function generateChildcareSimulationData(threshold: number, amt0_3: number, amt3_5: number, amt6_10: number) {
  // 世帯データを生成（ランダムな家族構成と所得）
  const households = Array.from({ length: 150 }, (_, i) => {
    // 子供の数をランダムに決定（1~4人）
    const numChildren = Math.floor(Math.random() * 4) + 1

    // 子供の年齢を生成（0~12歳）
    const ages = []
    for (let c = 0; c < numChildren; c++) {
      ages.push(Math.floor(Math.random() * 12))
    }

    // 世帯収入を生成（2,000,000円~10,000,000円）
    const income = 2000000 + Math.floor(Math.random() * 8000000)

    // 平均年齢を計算
    const avgAge = ages.reduce((sum, age) => sum + age, 0) / ages.length

    // 2D空間上での位置（可視化用）
    const xVal = avgAge
    const yVal = numChildren

    // 多面体内部かどうかの判定（ここを調整して内外判定を行う）
    const policyRegion2D = [
      [1, 1],
      [4, 2.5],
      [6, 4],
      [5, 6],
      [3, 5],
      [2, 3.5],
    ]

    // 2Dポリゴン内部判定
    const isInPolygon2D = isPointInPolygon2D(xVal, yVal, policyRegion2D)

    // 収入制限も考慮して内外判定
    const inside = isInPolygon2D && income <= threshold

    // 給付額を計算
    let support = 0
    if (inside) {
      support = calculateChildcareSupport(ages, income, threshold, amt0_3, amt3_5, amt6_10)
    }

    return {
      id: i,
      numChildren,
      ages,
      income,
      avgAge,
      x: xVal,
      y: yVal,
      inside,
      support,
    }
  })

  // 統計情報を計算
  const eligibleCount = households.filter((h) => h.inside).length
  const totalSupport = households.reduce((sum, h) => sum + h.support, 0)
  const avgSupport = eligibleCount > 0 ? totalSupport / eligibleCount : 0

  return {
    households,
    stats: {
      totalHouseholds: households.length,
      eligibleCount,
      ineligibleCount: households.length - eligibleCount,
      eligibilityRate: (eligibleCount / households.length) * 100,
      totalSupport,
      avgSupport,
    },
    plotData: generateChildcarePlotData(households, threshold),
  }
}

/**
 * 2Dポリゴン内部判定の関数
 */
function isPointInPolygon2D(x: number, y: number, polygon: number[][]) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1]
    const xj = polygon[j][0],
      yj = polygon[j][1]

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/**
 * 子育て助成金の給付額計算関数
 */
function calculateChildcareSupport(
  ages: number[],
  income: number,
  threshold: number,
  amt0_3: number,
  amt3_5: number,
  amt6_10: number,
) {
  if (income > threshold) return 0

  let total = 0
  ages.forEach((age) => {
    if (age < 3) {
      total += amt0_3
    } else if (age < 6) {
      total += amt3_5
    } else if (age < 11) {
      total += amt6_10
    }
  })

  return total
}

/**
 * 子育て助成金のプロット用データを生成
 */
function generateChildcarePlotData(households: any[], threshold: number) {
  const xInside: number[] = [],
    yInside: number[] = [],
    zInside: number[] = [],
    colorInside: number[] = []
  const xOut: number[] = [],
    yOut: number[] = [],
    zOut: number[] = []

  let maxSupport = 0

  households.forEach((h) => {
    if (h.inside) {
      xInside.push(h.avgAge)
      yInside.push(h.numChildren)
      zInside.push(h.income)
      colorInside.push(h.support)
      if (h.support > maxSupport) maxSupport = h.support
    } else {
      xOut.push(h.avgAge)
      yOut.push(h.numChildren)
      zOut.push(h.income)
    }
  })

  // ポリゴン境界線のデータを作成
  const policyRegion2D = [
    [1, 1],
    [4, 2.5],
    [6, 4],
    [5, 6],
    [3, 5],
    [2, 3.5],
  ]

  const traceInside = {
    type: "scatter3d",
    mode: "markers",
    x: xInside,
    y: yInside,
    z: zInside,
    marker: {
      size: 5,
      color: colorInside,
      colorscale: "YlOrRd",
      cmin: 0,
      cmax: maxSupport > 0 ? maxSupport : 1,
      showscale: true,
      colorbar: { title: "給付額(円)" },
    },
    name: "対象世帯",
  }

  const traceOutside = {
    type: "scatter3d",
    mode: "markers",
    x: xOut,
    y: yOut,
    z: zOut,
    marker: {
      size: 4,
      color: "lightgray",
      opacity: 0.3,
    },
    name: "対象外世帯",
  }

  // ポリゴン境界を描画
  const tracePoly1 = {
    type: "scatter3d",
    mode: "lines",
    x: [...policyRegion2D.map((p) => p[0]), policyRegion2D[0][0]],
    y: [...policyRegion2D.map((p) => p[1]), policyRegion2D[0][1]],
    z: Array(policyRegion2D.length + 1).fill(0),
    line: { color: "blue", width: 3 },
    name: "対象エリア(下限)",
  }

  const tracePoly2 = {
    type: "scatter3d",
    mode: "lines",
    x: [...policyRegion2D.map((p) => p[0]), policyRegion2D[0][0]],
    y: [...policyRegion2D.map((p) => p[1]), policyRegion2D[0][1]],
    z: Array(policyRegion2D.length + 1).fill(threshold),
    line: { color: "blue", width: 3 },
    name: "対象エリア(上限)",
  }

  return {
    data: [traceInside, traceOutside, tracePoly1, tracePoly2],
    layout: {
      title: "子育て助成金シミュレーション",
      scene: {
        xaxis: { title: "子どもの平均年齢" },
        yaxis: { title: "子どもの人数" },
        zaxis: { title: "世帯収入(円)" },
      },
    },
  }
}

/**
 * 3の倍数給付金のシミュレーションデータを生成
 */
function generateMultiplesOf3SimulationData(params: Record<string, number>) {
  // パラメータを取得
  const normalAmount = params["三の倍数給付金額_通常"] || 100000
  const bonusAmount = params["三の倍数給付金額_ボーナス"] || 30000

  // 世帯データを生成
  const households = Array.from({ length: 100 }, (_, i) => {
    // 世帯員の年齢をランダムに生成（1〜60歳）
    const members = Array.from(
      { length: Math.floor(Math.random() * 5) + 1 },
      () => Math.floor(Math.random() * 60) + 1,
    )

    // 3の倍数の年齢を持つ世帯員をカウント
    const multiplesOf3Count = members.filter((age) => age % 3 === 0).length

    // ボーナス対象（小3、小6、中3、高3）の世帯員をカウント
    const bonusAges = [9, 12, 15, 18] // 学年に対応する年齢（簡易的に）
    const bonusCount = members.filter((age) => bonusAges.includes(age)).length

    // 給付額を計算
    const benefit = multiplesOf3Count * normalAmount + bonusCount * bonusAmount

    // 世帯の平均年齢を計算
    const avgAge = members.reduce((sum, age) => sum + age, 0) / members.length

    return {
      id: i,
      members,
      memberCount: members.length,
      avgAge,
      multiplesOf3Count,
      bonusCount,
      benefit,
      inside: multiplesOf3Count > 0 || bonusCount > 0,
    }
  })

  // 統計情報を計算
  const eligibleCount = households.filter((h) => h.inside).length
  const totalBenefit = households.reduce((sum, h) => sum + h.benefit, 0)
  const avgBenefit = eligibleCount > 0 ? totalBenefit / eligibleCount : 0

  return {
    households,
    stats: {
      totalHouseholds: households.length,
      eligibleCount,
      ineligibleCount: households.length - eligibleCount,
      eligibilityRate: (eligibleCount / households.length) * 100,
      totalSupport: totalBenefit,
      avgSupport: avgBenefit,
    },
    plotData: generateMultiplesOf3PlotData(households, normalAmount, bonusAmount),
  }
}

/**
 * 3の倍数給付金のプロット用データを生成
 */
function generateMultiplesOf3PlotData(households: any[], normalAmount: number, bonusAmount: number) {
  const eligible = households.filter((h) => h.inside)
  const ineligible = households.filter((h) => !h.inside)

  return {
    data: [
      {
        type: "scatter3d",
        mode: "markers",
        name: "対象世帯",
        x: eligible.map((h) => h.avgAge),
        y: eligible.map((h) => h.memberCount),
        z: eligible.map((h) => h.multiplesOf3Count),
        marker: {
          size: 5,
          color: eligible.map((h) => h.benefit),
          colorscale: "YlOrRd",
          colorbar: { title: "給付額(円)" },
        },
      },
      {
        type: "scatter3d",
        mode: "markers",
        name: "対象外世帯",
        x: ineligible.map((h) => h.avgAge),
        y: ineligible.map((h) => h.memberCount),
        z: ineligible.map((h) => h.multiplesOf3Count),
        marker: {
          size: 4,
          color: "lightgray",
          opacity: 0.3,
        },
      },
    ],
    layout: {
      title: "3の倍数給付金シミュレーション",
      scene: {
        xaxis: { title: "世帯平均年齢" },
        yaxis: { title: "世帯人数" },
        zaxis: { title: "3の倍数年齢の人数" },
      },
    },
  }
}

/**
 * 一般的なシミュレーションデータを生成（他の制度用）
 */
function generateGenericSimulationData(params: Record<string, number>) {
  // 世帯データを生成（実際の実装ではより複雑なロジックになる）
  const households = Array.from({ length: 100 }, (_, i) => {
    const childrenCount = Math.floor(Math.random() * 4)
    const income = 2000000 + Math.floor(Math.random() * 10000000)
    const avgChildAge = childrenCount > 0 ? Math.floor(Math.random() * 10) : 0

    // 簡易的な給付額計算（実際の実装では制度のロジックに基づく）
    let benefit = 0
    const incomeThreshold = Object.values(params)[0] || 8000000

    if (income < incomeThreshold && childrenCount > 0) {
      // パラメータ値に基づいて給付額を計算
      const paramValues = Object.values(params)
      benefit = childrenCount * (paramValues[1] || 10000)

      // 子供の年齢に応じて調整
      if (avgChildAge < 3) {
        benefit *= 1.5
      } else if (avgChildAge > 6) {
        benefit *= 0.8
      }
    }

    return {
      id: i,
      childrenCount,
      income,
      avgChildAge,
      benefit,
      inside: benefit > 0,
    }
  })

  // 統計情報を計算
  const eligibleCount = households.filter((h) => h.inside).length
  const totalBenefit = households.reduce((sum, h) => sum + h.benefit, 0)
  const avgBenefit = eligibleCount > 0 ? totalBenefit / eligibleCount : 0

  return {
    households,
    stats: {
      totalHouseholds: households.length,
      eligibleCount,
      ineligibleCount: households.length - eligibleCount,
      eligibilityRate: (eligibleCount / households.length) * 100,
      totalSupport: totalBenefit,
      avgSupport: avgBenefit,
    },
    plotData: generateGenericPlotData(households),
  }
}

/**
 * 一般的なプロット用データを生成
 */
function generateGenericPlotData(households: any[]) {
  // 3Dプロット用データ
  const eligible = households.filter((h) => h.inside)
  const ineligible = households.filter((h) => !h.inside)

  return {
    data: [
      {
        type: "scatter3d",
        mode: "markers",
        name: "対象世帯",
        x: eligible.map((h) => h.avgChildAge),
        y: eligible.map((h) => h.childrenCount),
        z: eligible.map((h) => h.income),
        marker: {
          size: 5,
          color: eligible.map((h) => h.benefit),
          colorscale: "YlOrRd",
          colorbar: { title: "給付額(円)" },
        },
      },
      {
        type: "scatter3d",
        mode: "markers",
        name: "対象外世帯",
        x: ineligible.map((h) => h.avgChildAge),
        y: ineligible.map((h) => h.childrenCount),
        z: ineligible.map((h) => h.income),
        marker: {
          size: 4,
          color: "lightgray",
          opacity: 0.3,
        },
      },
    ],
    layout: {
      title: "制度の対象範囲",
      scene: {
        xaxis: { title: "子供の平均年齢" },
        yaxis: { title: "子供の人数" },
        zaxis: { title: "世帯収入(円)" },
      },
    },
  }
}

/**
 * 表示用ヘルパー関数
 */
export const formatters = {
  /**
   * 金額をフォーマット
   */
  currency: (value: number) => value.toLocaleString("ja-JP") + "円",

  /**
   * パーセントをフォーマット
   */
  percent: (value: number) => value.toFixed(1) + "%",

  /**
   * 収入をフォーマット（万円単位）
   */
  income: (value: number) => (value / 10000).toLocaleString("ja-JP") + "万円"
}