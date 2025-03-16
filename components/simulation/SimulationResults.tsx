import type React from "react"
import type { SimulationData } from "@/types/types"
import StatsCard from "./StatsCard"
import SimulationVisualization from "./SimulationVisualization"

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 w-full">
      {/* Stats Section */}
      <div className="flex flex-col space-y-4 lg:space-y-6">
        <StatsCard
          totalHouseholds={totalHouseholds}
          targetHouseholds={targetHouseholds}
          totalAmount={totalAmount}
          averageAmount={averageAmount}
        />
      </div>

      {/* Visualization Section */}
      <div className="w-full aspect-square lg:aspect-[4/3]">
        <SimulationVisualization data={visualizationData} />
      </div>
    </div>
  )
}

export default SimulationResults

