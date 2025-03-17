"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { PlayCircle } from "lucide-react"
import SimulationResults from "./SimulationResults"
import { runSimulation } from "@/lib/api"
import { generateFallbackSimulationData, formatters } from "@/lib/simulation-helpers"
import type { Institution } from "@/types/types"

interface SimulationPanelProps {
  institution: Institution
}

/**
 * シミュレーションパネルコンポーネント
 * パラメータ設定と結果表示を行う
 */
const SimulationPanel: React.FC<SimulationPanelProps> = ({ institution }) => {
  // 基本パラメータ状態
  const [incomeLimit, setIncomeLimit] = useState(8000000)
  const [childBenefit03, setChildBenefit03] = useState(15000)
  const [childBenefit35, setChildBenefit35] = useState(10000)
  const [childBenefit610, setChildBenefit610] = useState(5000)
  
  // 一般パラメータ状態（institution.parametersで動的に対応）
  const [paramValues, setParamValues] = useState<Record<string, number>>({})

  // UI状態
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)

  // 制度タイプに応じた分岐
  const isChildcareGrant = institution.name === "子育て助成金"
  const isMultiplesOf3 = institution.name === "3の倍数給付金"

  // 初期値設定
  useEffect(() => {
    // institution.parametersから初期値を設定
    const initialValues: Record<string, number> = {}
    
    if (institution.parameters) {
      institution.parameters.forEach((param) => {
        if (param.values && param.values.length > 0) {
          const value = typeof param.values[0].value === 'number' 
            ? param.values[0].value as number
            : 0
          initialValues[param.name] = value
        }
      })
    }
    
    setParamValues(initialValues)

    // 子育て助成金の特殊パラメータ初期化
    if (isChildcareGrant) {
      // 設定済みの値がある場合はそれを使用
      const threshold = initialValues["childcare_policy.income_threshold"] || 8000000
      const amt03 = initialValues["childcare_policy.subsidy_0_3"] || 15000
      const amt35 = initialValues["childcare_policy.subsidy_3_5"] || 10000
      const amt610 = initialValues["childcare_policy.subsidy_6_10"] || 5000
      
      setIncomeLimit(threshold)
      setChildBenefit03(amt03)
      setChildBenefit35(amt35)
      setChildBenefit610(amt610)
    }
    
    // 初期シミュレーション実行
    handleRunSimulation()
  }, [institution])

  // スライダー変更ハンドラー
  const handleSliderChange = (paramName: string, value: number[]) => {
    // 子育て助成金の特殊パラメータ対応
    if (isChildcareGrant) {
      if (paramName === "incomeLimit" || paramName === "childcare_policy.income_threshold") {
        setIncomeLimit(value[0])
      } else if (paramName === "childBenefit03" || paramName === "childcare_policy.subsidy_0_3") {
        setChildBenefit03(value[0])
      } else if (paramName === "childBenefit35" || paramName === "childcare_policy.subsidy_3_5") {
        setChildBenefit35(value[0])
      } else if (paramName === "childBenefit610" || paramName === "childcare_policy.subsidy_6_10") {
        setChildBenefit610(value[0])
      }
    }

    // 一般パラメータ更新
    setParamValues(prev => ({
      ...prev,
      [paramName]: value[0]
    }))
  }

  // シミュレーション実行
  const handleRunSimulation = async () => {
    setLoading(true)
    setError(null)

    try {
      let params: Record<string, any> = {}
      
      // 制度タイプに応じたパラメータ設定
      if (isChildcareGrant) {
        params = {
          incomeLimit,
          childBenefit03,
          childBenefit35,
          childBenefit610
        }
      } else if (isMultiplesOf3) {
        params = {
          normalAmount: paramValues["三の倍数給付金額_通常"] || 100000,
          bonusAmount: paramValues["三の倍数給付金額_ボーナス"] || 30000
        }
      } else {
        params = paramValues
      }

      try {
        // APIを通じてシミュレーション実行
        const apiResults = await runSimulation(institution.id, params)
        setResults(apiResults)
      } catch (apiError) {
        console.error("API error:", apiError)
        
        // APIエラー時にはフォールバックでクライアント側でシミュレーションデータを生成
        const fallbackData = generateFallbackSimulationData(institution.name, params)
        setResults(fallbackData)
      }
    } catch (err) {
      console.error("Error running simulation:", err)
      setError(`Failed to run simulation: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
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
                // 子育て助成金のパラメータUI
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">収入制限</Label>
                      <span className="text-sm font-mono">{formatters.income(incomeLimit)}</span>
                    </div>
                    <Slider
                      value={[incomeLimit]}
                      min={4000000}
                      max={12000000}
                      step={50000}
                      onValueChange={(value) => handleSliderChange("incomeLimit", value)}
                    />
                    <p className="text-xs text-muted-foreground">一定収入以上の世帯は支援対象外です。</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">0-3歳の子供への給付</Label>
                      <span className="text-sm font-mono">{formatters.currency(childBenefit03)}</span>
                    </div>
                    <Slider
                      value={[childBenefit03]}
                      min={5000}
                      max={30000}
                      step={1000}
                      onValueChange={(value) => handleSliderChange("childBenefit03", value)}
                    />
                    <p className="text-xs text-muted-foreground">0歳から3歳未満の子供1人あたりの給付額</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">3-5歳の子供への給付</Label>
                      <span className="text-sm font-mono">{formatters.currency(childBenefit35)}</span>
                    </div>
                    <Slider
                      value={[childBenefit35]}
                      min={5000}
                      max={30000}
                      step={1000}
                      onValueChange={(value) => handleSliderChange("childBenefit35", value)}
                    />
                    <p className="text-xs text-muted-foreground">3歳から6歳未満の子供1人あたりの給付額</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">6-10歳の子供への給付</Label>
                      <span className="text-sm font-mono">{formatters.currency(childBenefit610)}</span>
                    </div>
                    <Slider
                      value={[childBenefit610]}
                      min={5000}
                      max={30000}
                      step={1000}
                      onValueChange={(value) => handleSliderChange("childBenefit610", value)}
                    />
                    <p className="text-xs text-muted-foreground">6歳から11歳未満の子供1人あたりの給付額</p>
                  </div>
                </div>
              ) : institution.parameters && institution.parameters.length > 0 ? (
                // 一般パラメータのUI生成
                <div className="space-y-4">
                  {institution.parameters.map((param, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">{param.name}</Label>
                        <span className="text-sm font-mono">
                          {param.unit === "currency-JPY"
                            ? formatters.currency(paramValues[param.name] || 0)
                            : (paramValues[param.name] || 0).toLocaleString()}
                        </span>
                      </div>
                      <Slider
                        value={[paramValues[param.name] || 0]}
                        min={typeof param.values[0]?.value === 'number' ? (param.values[0]?.value as number) / 2 || 0 : 0}
                        max={typeof param.values[0]?.value === 'number' ? (param.values[0]?.value as number) * 2 || 100000 : 100000}
                        step={(typeof param.values[0]?.value === 'number' ? (param.values[0]?.value as number) || 100 : 100) / 100}
                        onValueChange={(value) => handleSliderChange(param.name, value)}
                      />
                      <p className="text-xs text-muted-foreground">{param.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                // パラメータがない場合
                <div className="text-center py-4 text-muted-foreground">
                  <p>パラメータが設定されていません。</p>
                </div>
              )}

              <Button 
                onClick={handleRunSimulation} 
                disabled={loading} 
                className="w-full"
              >
                {loading ? "シミュレーション実行中..." : "シミュレーション再実行"}
              </Button>
            </div>

            {/* 結果部分 */}
            {error ? (
              <div className="bg-red-50 p-4 rounded-md border border-red-200">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <SimulationResults
                isLoading={loading}
                data={results}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SimulationPanel

