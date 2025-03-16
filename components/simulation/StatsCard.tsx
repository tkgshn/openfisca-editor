import type React from "react"

interface StatsCardProps {
  targetHouseholds: number
  totalHouseholds: number
  totalAmount: number
  averageAmount: number
}

const StatsCard: React.FC<StatsCardProps> = ({ targetHouseholds, totalHouseholds, totalAmount, averageAmount }) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">対象世帯数</p>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-3xl font-bold">{targetHouseholds}</h2>
            <span className="text-sm text-muted-foreground">/ {totalHouseholds}世帯</span>
          </div>
          <p className="text-sm text-muted-foreground">
            対象率: {((targetHouseholds / totalHouseholds) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">総給付額</p>
          <h2 className="text-3xl font-bold">{new Intl.NumberFormat("ja-JP").format(totalAmount)}円</h2>
          <p className="text-sm text-muted-foreground">
            平均: {new Intl.NumberFormat("ja-JP").format(averageAmount)}円
          </p>
        </div>
      </div>
    </div>
  )
}

export default StatsCard

