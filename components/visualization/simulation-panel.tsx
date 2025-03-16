"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PlayCircle, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import type { Institution, Parameter } from "@/lib/types"
import dynamic from "next/dynamic"

// Plotly.jsをクライアントサイドのみでロード
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface SimulationPanelProps {
  institution: Institution
}

export function SimulationPanel({ institution }: SimulationPanelProps) {
  const [paramValues, setParamValues] = useState<Record<string, number>>({})
  const [simulationData, setSimulationData] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showNewParamForm, setShowNewParamForm] = useState(false)

  // Check if this is a special childcare grant institution
  const isChildcareGrant = useMemo(() => {
    return institution.name === "子育て助成金"
  }, [institution.name])

  // Parameters for childcare grant
  const [thresholdIncome, setThresholdIncome] = useState(8000000)
  const [amount0_3, setAmount0_3] = useState(15000)
  const [amount3_5, setAmount3_5] = useState(10000)
  const [amount6_10, setAmount6_10] = useState(5000)

  // 制度のパラメータが変更されたら、パラメータ値を初期化
  useEffect(() => {
    const initialValues: Record<string, number> = {}

    if (isChildcareGrant) {
      // Set childcare grant specific parameters
      initialValues["thresholdIncome"] = 8000000
      initialValues["amount0_3"] = 15000
      initialValues["amount3_5"] = 10000
      initialValues["amount6_10"] = 5000
      setThresholdIncome(8000000)
      setAmount0_3(15000)
      setAmount3_5(10000)
      setAmount6_10(5000)
    } else if (institution.parameters) {
      // Set parameters for other institutions
      institution.parameters.forEach((param) => {
        if (param.values && param.values.length > 0) {
          initialValues[param.name] = param.values[0].value
        }
      })
    }

    setParamValues(initialValues)

    // 初期値でシミュレーションを実行
    runSimulation(initialValues)
  }, [institution, isChildcareGrant])

  const handleSliderChange = (paramName: string, value: number[]) => {
    const newValues = {
      ...paramValues,
      [paramName]: value[0],
    }

    // Update special states for childcare grant
    if (isChildcareGrant) {
      if (paramName === "thresholdIncome") setThresholdIncome(value[0])
      if (paramName === "amount0_3") setAmount0_3(value[0])
      if (paramName === "amount3_5") setAmount3_5(value[0])
      if (paramName === "amount6_10") setAmount6_10(value[0])
    }

    setParamValues(newValues)

    // パラメータが変更されたら自動的にシミュレーションを実行
    runSimulation(newValues)
  }

  const runSimulation = async (params: Record<string, number> = paramValues) => {
    setIsRunning(true)
    try {
      // 子育て助成金のシミュレーションを実行
      if (isChildcareGrant) {
        const data = generateChildcareSimulationData(
          params.thresholdIncome || thresholdIncome,
          params.amount0_3 || amount0_3,
          params.amount3_5 || amount3_5,
          params.amount6_10 || amount6_10,
        )
        setSimulationData(data)
      } else if (institution.name === "3の倍数給付金") {
        // 3の倍数給付金のシミュレーションを実行
        const data = generateMultiplesOf3SimulationData(params)
        setSimulationData(data)
      } else {
        // その他の制度のシミュレーションデータを生成
        const data = generateSimulationData(params)
        setSimulationData(data)
      }
    } catch (error) {
      console.error("Failed to run simulation:", error)
      alert("シミュレーションの実行に失敗しました。")
    } finally {
      setIsRunning(false)
    }
  }

  // 子育て助成金のシミュレーションデータを生成
  const generateChildcareSimulationData = (
    thresholdVal: number,
    amount0_3Val: number,
    amount3_5Val: number,
    amount6_10Val: number,
  ) => {
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
      const inside = isInPolygon2D && income <= thresholdVal

      // 給付額を計算
      let support = 0
      if (inside) {
        support = calculateChildcareSupport(ages, income, thresholdVal, amount0_3Val, amount3_5Val, amount6_10Val)
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
      plotData: generateChildcarePlotData(households, thresholdVal),
    }
  }

  // 2Dポリゴン内部判定の関数
  const isPointInPolygon2D = (x: number, y: number, polygon: number[][]) => {
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

  // 給付額計算関数
  const calculateChildcareSupport = (
    ages: number[],
    income: number,
    threshold: number,
    amt0_3: number,
    amt3_5: number,
    amt6_10: number,
  ) => {
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

  // 子育て助成金のプロット用データを生成
  const generateChildcarePlotData = (households: any[], threshold: number) => {
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

  // 3の倍数給付金のシミュレーションデータを生成
  const generateMultiplesOf3SimulationData = (params: Record<string, number>) => {
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

  // 3の倍数給付金のプロット用データを生成
  const generateMultiplesOf3PlotData = (households: any[], normalAmount: number, bonusAmount: number) => {
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

  // 一般的なシミュレーションデータを生成（他の制度用）
  const generateSimulationData = (params: Record<string, number>) => {
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
      plotData: generatePlotData(households),
    }
  }

  // 一般的なプロット用データを生成
  const generatePlotData = (households: any[]) => {
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

  // 金額をフォーマット
  const formatCurrency = (value: number) => {
    return value.toLocaleString("ja-JP") + "円"
  }

  // パーセントをフォーマット
  const formatPercent = (value: number) => {
    return value.toFixed(1) + "%"
  }

  // 収入をフォーマット（万円単位）
  const formatIncome = (value: number) => {
    return (value / 10000).toLocaleString("ja-JP") + "万円"
  }

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNextSlide = () => {
    const maxSlides = institution.parameters ? institution.parameters.length : 0
    setCurrentSlide((prev) => (prev < maxSlides - 1 ? prev + 1 : prev))
  }

  const handleAddParameter = () => {
    setShowNewParamForm(true)
    setCurrentSlide(0)
  }

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-foreground" />
          シミュレーション
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* パラメータ設定部分 */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">パラメータ変更</h3>

            {isChildcareGrant ? (
              // 子育て助成金のパラメータ
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">収入制限</Label>
                    <span className="text-sm font-mono">{formatIncome(thresholdIncome)}</span>
                  </div>
                  <Slider
                    value={[thresholdIncome]}
                    min={4000000}
                    max={12000000}
                    step={50000}
                    onValueChange={(value) => handleSliderChange("thresholdIncome", value)}
                  />
                  <p className="text-xs text-muted-foreground">一定収入以上の世帯は支援対象外です。</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">0-3歳の子供への給付</Label>
                    <span className="text-sm font-mono">{formatCurrency(amount0_3)}</span>
                  </div>
                  <Slider
                    value={[amount0_3]}
                    min={5000}
                    max={30000}
                    step={1000}
                    onValueChange={(value) => handleSliderChange("amount0_3", value)}
                  />
                  <p className="text-xs text-muted-foreground">0歳から3歳未満の子供1人あたりの給付額</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">3-5歳の子供への給付</Label>
                    <span className="text-sm font-mono">{formatCurrency(amount3_5)}</span>
                  </div>
                  <Slider
                    value={[amount3_5]}
                    min={5000}
                    max={30000}
                    step={1000}
                    onValueChange={(value) => handleSliderChange("amount3_5", value)}
                  />
                  <p className="text-xs text-muted-foreground">3歳から6歳未満の子供1人あたりの給付額</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">6-10歳の子供への給付</Label>
                    <span className="text-sm font-mono">{formatCurrency(amount6_10)}</span>
                  </div>
                  <Slider
                    value={[amount6_10]}
                    min={5000}
                    max={30000}
                    step={1000}
                    onValueChange={(value) => handleSliderChange("amount6_10", value)}
                  />
                  <p className="text-xs text-muted-foreground">6歳から11歳未満の子供1人あたりの給付額</p>
                </div>

                <Button
                  onClick={() =>
                    runSimulation({
                      thresholdIncome,
                      amount0_3,
                      amount3_5,
                      amount6_10,
                    })
                  }
                  className="w-full"
                >
                  シミュレーション再実行
                </Button>
              </div>
            ) : institution.parameters && institution.parameters.length > 0 ? (
              // 通常の制度のパラメータ
              <div className="space-y-4">
                {institution.parameters.map((param: Parameter, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">{param.name}</Label>
                      <span className="text-sm font-mono">
                        {param.unit === "currency-JPY"
                          ? formatCurrency(paramValues[param.name] || 0)
                          : (paramValues[param.name] || 0).toLocaleString()}
                      </span>
                    </div>
                    <Slider
                      value={[paramValues[param.name] || 0]}
                      min={param.values[0].value / 2}
                      max={param.values[0].value * 2}
                      step={param.values[0].value / 100}
                      onValueChange={(value) => handleSliderChange(param.name, value)}
                    />
                    <p className="text-xs text-muted-foreground">{param.description}</p>
                  </div>
                ))}

                <Button onClick={() => runSimulation()} className="w-full mt-4">
                  シミュレーション再実行
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>パラメータが設定されていません。パラメータを追加してください。</p>
                <Button
                  variant="outline"
                  onClick={handleAddParameter}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  新しいパラメータを追加
                </Button>
              </div>
            )}
          </div>

          {/* シミュレーション結果部分 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">シミュレーション結果</h3>
            {simulationData ? (
              <>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-muted/50 p-3 rounded-md">
                    <h4 className="text-sm font-medium">対象世帯数</h4>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-bold">{simulationData.stats.eligibleCount}</span>
                      <span className="text-xs text-muted-foreground">
                        / {simulationData.stats.totalHouseholds}世帯
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      対象率: {formatPercent(simulationData.stats.eligibilityRate)}
                    </p>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-md">
                    <h4 className="text-sm font-medium">総給付額</h4>
                    <div className="text-xl font-bold mt-1">{formatCurrency(simulationData.stats.totalSupport)}</div>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-md">
                    <h4 className="text-sm font-medium">平均給付額</h4>
                    <div className="text-xl font-bold mt-1">
                      {formatCurrency(Math.round(simulationData.stats.avgSupport))}
                    </div>
                  </div>
                </div>

                <div className="border rounded-md overflow-hidden bg-white h-[400px]">
                  {typeof window !== "undefined" && (
                    <Plot
                      data={simulationData.plotData.data}
                      layout={{
                        ...simulationData.plotData.layout,
                        autosize: true,
                        margin: { l: 50, r: 50, t: 30, b: 30 },
                        height: 400,
                      }}
                      config={{
                        responsive: true,
                        displayModeBar: false
                      }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 bg-muted/30 rounded-md">
                <p className="text-muted-foreground">シミュレーションデータを読み込み中...</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
