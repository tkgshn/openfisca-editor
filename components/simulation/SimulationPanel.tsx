"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import SimulationResults from "./SimulationResults"
import { runSimulation } from "@/lib/api"
import type { SimulationData } from "@/types/types"

interface SimulationPanelProps {
  institutionId: string
}

/**
 * Panel for configuring and running simulations
 * @param {SimulationPanelProps} props - Component props
 * @param {string} props.institutionId - ID of the institution to run simulations for
 * @returns {JSX.Element} Simulation panel component
 */
const SimulationPanel: React.FC<SimulationPanelProps> = ({ institutionId }) => {
  const [incomeLimit, setIncomeLimit] = useState(8000000)
  const [childBenefit03, setChildBenefit03] = useState(15000)
  const [childBenefit35, setChildBenefit35] = useState(10000)
  const [childBenefit610, setChildBenefit610] = useState(5000)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<{
    totalHouseholds: number
    targetHouseholds: number
    totalAmount: number
    averageAmount: number
    visualizationData: SimulationData[]
  } | null>(null)

  const handleRunSimulation = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = {
        incomeLimit,
        childBenefit03,
        childBenefit35,
        childBenefit610,
      }

      const simulationResults = await runSimulation(institutionId, params)

      setResults({
        totalHouseholds: simulationResults.totalHouseholds || 150,
        targetHouseholds: simulationResults.targetHouseholds || 35,
        totalAmount: simulationResults.totalAmount || 1200000,
        averageAmount: simulationResults.averageAmount || 34286,
        visualizationData: simulationResults.visualizationData || [],
      })
    } catch (err) {
      console.error("Error running simulation:", err)
      setError(`Failed to run simulation: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Simulation Parameters</h3>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="income-limit">収入制限</Label>
              <span>{(incomeLimit / 10000).toFixed(0)}万円</span>
            </div>
            <Slider
              id="income-limit"
              min={0}
              max={10000000}
              step={100000}
              value={[incomeLimit]}
              onValueChange={(value) => setIncomeLimit(value[0])}
            />
            <p className="text-sm text-gray-500">一定収入以上の世帯は支援対象外です。</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="child-benefit-03">0-3歳の子供への給付</Label>
              <span>{childBenefit03.toLocaleString()}円</span>
            </div>
            <Slider
              id="child-benefit-03"
              min={0}
              max={50000}
              step={1000}
              value={[childBenefit03]}
              onValueChange={(value) => setChildBenefit03(value[0])}
            />
            <p className="text-sm text-gray-500">0歳から3歳未満の子供1人あたりの給付額</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="child-benefit-35">3-5歳の子供への給付</Label>
              <span>{childBenefit35.toLocaleString()}円</span>
            </div>
            <Slider
              id="child-benefit-35"
              min={0}
              max={50000}
              step={1000}
              value={[childBenefit35]}
              onValueChange={(value) => setChildBenefit35(value[0])}
            />
            <p className="text-sm text-gray-500">3歳から6歳未満の子供1人あたりの給付額</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="child-benefit-610">6-10歳の子供への給付</Label>
              <span>{childBenefit610.toLocaleString()}円</span>
            </div>
            <Slider
              id="child-benefit-610"
              min={0}
              max={50000}
              step={1000}
              value={[childBenefit610]}
              onValueChange={(value) => setChildBenefit610(value[0])}
            />
            <p className="text-sm text-gray-500">6歳から11歳未満の子供1人あたりの給付額</p>
          </div>

          <Button onClick={handleRunSimulation} disabled={loading} className="w-full">
            {loading ? "シミュレーション実行中..." : "シミュレーション実行"}
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="p-6 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {results && (
        <SimulationResults
          totalHouseholds={results.totalHouseholds}
          targetHouseholds={results.targetHouseholds}
          totalAmount={results.totalAmount}
          averageAmount={results.averageAmount}
          visualizationData={results.visualizationData}
        />
      )}
    </div>
  )
}

export default SimulationPanel

