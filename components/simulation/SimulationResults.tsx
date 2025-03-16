import type React from "react"
import type { SimulationData } from "@/types/types"
import dynamic from "next/dynamic"

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface SimulationResultsProps {
  totalHouseholds: number
  targetHouseholds: number
  totalAmount: number
  averageAmount: number
  visualizationData: SimulationData[]
}

const SimulationResults: React.FC<SimulationResultsProps> = ({
  totalHouseholds,
  targetHouseholds,
  totalAmount,
  averageAmount,
  visualizationData,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">シミュレーション結果</h3>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-muted/50 p-3 rounded-md">
          <h4 className="text-sm font-medium">対象世帯数</h4>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold">{targetHouseholds}</span>
            <span className="text-xs text-muted-foreground">/ {totalHouseholds}世帯</span>
          </div>
          <p className="text-xs text-muted-foreground">
            対象率: {((targetHouseholds / totalHouseholds) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-muted/50 p-3 rounded-md">
          <h4 className="text-sm font-medium">総給付額</h4>
          <div className="text-xl font-bold mt-1">{totalAmount.toLocaleString()}円</div>
        </div>

        <div className="bg-muted/50 p-3 rounded-md">
          <h4 className="text-sm font-medium">平均給付額</h4>
          <div className="text-xl font-bold mt-1">{averageAmount.toLocaleString()}円</div>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden bg-white h-[400px]">
        {typeof window !== "undefined" && (
          <Plot
            data={[
              {
                type: "scatter3d",
                mode: "markers",
                x: visualizationData.map((d) => d.x),
                y: visualizationData.map((d) => d.y),
                z: visualizationData.map((d) => d.z),
                marker: {
                  size: 5,
                  color: visualizationData.map((d) => d.color),
                  colorscale: "YlOrRd",
                  showscale: true,
                  colorbar: { title: "給付額(円)" },
                },
                name: "対象世帯",
              },
            ]}
            layout={{
              autosize: true,
              margin: { l: 50, r: 50, t: 30, b: 30 },
              scene: {
                xaxis: { title: "子どもの平均年齢" },
                yaxis: { title: "子どもの人数" },
                zaxis: { title: "世帯収入(円)" },
              },
              height: 400,
            }}
            config={{
              responsive: true,
              displayModeBar: false,
            }}
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </div>
    </div>
  )
}

export default SimulationResults

