"use client"

import React from "react"
import dynamic from "next/dynamic"
import type { SimulationData } from "@/types/types"
import { formatters } from "@/lib/simulation-helpers"

// Plotlyをクライアントサイドのみでロード
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

/**
 * シミュレーション結果を表示するコンポーネント
 */
interface SimulationResultsProps {
  isLoading?: boolean
  data: {
    stats?: {
      totalHouseholds: number
      eligibleCount: number
      eligibilityRate: number
      totalSupport: number
      avgSupport: number
    }
    plotData?: {
      data: any[]
      layout: any
    }
    // 互換性のために別の形式もサポート
    totalHouseholds?: number
    targetHouseholds?: number
    totalAmount?: number
    averageAmount?: number
    visualizationData?: SimulationData[]
  } | null
}

/**
 * シミュレーション結果表示コンポーネント
 * 様々な形式のデータをサポートし、統計情報とプロットを表示
 */
const SimulationResults: React.FC<SimulationResultsProps> = ({ isLoading = false, data }) => {
  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-2">シミュレーション結果</h3>
        <div className="flex items-center justify-center h-48 bg-muted/30 rounded-md">
          <p className="text-muted-foreground">
            {isLoading ? "シミュレーションデータを読み込み中..." : "シミュレーションデータがありません"}
          </p>
        </div>
      </div>
    )
  }

  // データ形式の標準化（両方のフォーマットをサポート）
  const stats = data.stats || {
    totalHouseholds: data.totalHouseholds || 0,
    eligibleCount: data.targetHouseholds || 0,
    eligibilityRate: data.totalHouseholds ? ((data.targetHouseholds || 0) / data.totalHouseholds) * 100 : 0,
    totalSupport: data.totalAmount || 0,
    avgSupport: data.averageAmount || 0
  }

  // プロットデータの生成（両方のフォーマットをサポート）
  const plotData = data.plotData || {
    data: data.visualizationData ? [
      {
        type: "scatter3d",
        mode: "markers",
        x: data.visualizationData.map(d => d.x),
        y: data.visualizationData.map(d => d.y),
        z: data.visualizationData.map(d => d.z),
        marker: {
          size: 5,
          color: data.visualizationData.map(d => d.color),
          colorscale: "YlOrRd",
          showscale: true,
          colorbar: { title: "給付額(円)" }
        },
        name: "対象世帯"
      }
    ] : [],
    layout: {
      scene: {
        xaxis: { title: "子どもの平均年齢" },
        yaxis: { title: "子どもの人数" },
        zaxis: { title: "世帯収入(円)" }
      }
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">シミュレーション結果</h3>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-muted/50 p-3 rounded-md">
          <h4 className="text-sm font-medium">対象世帯数</h4>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold">{stats.eligibleCount}</span>
            <span className="text-xs text-muted-foreground">
              / {stats.totalHouseholds}世帯
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            対象率: {formatters.percent(stats.eligibilityRate)}
          </p>
        </div>

        <div className="bg-muted/50 p-3 rounded-md">
          <h4 className="text-sm font-medium">総給付額</h4>
          <div className="text-xl font-bold mt-1">{formatters.currency(stats.totalSupport)}</div>
        </div>

        <div className="bg-muted/50 p-3 rounded-md">
          <h4 className="text-sm font-medium">平均給付額</h4>
          <div className="text-xl font-bold mt-1">
            {formatters.currency(Math.round(stats.avgSupport))}
          </div>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden bg-white h-[400px]">
        {typeof window !== "undefined" && plotData.data.length > 0 && (
          <Plot
            data={plotData.data}
            layout={{
              ...plotData.layout,
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
    </div>
  )
}

export default SimulationResults

