"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Parameter } from "@/lib/types"
import { ParameterDetailModal } from "./parameter-detail-modal"

interface ParameterCarouselProps {
  parameters: Parameter[]
  className?: string
}

export function ParameterCarousel({ parameters, className = "" }: ParameterCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 表示するパラメータの数（レスポンシブ対応）
  const displayCount = 3

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < parameters.length - displayCount ? prev + 1 : prev))
  }

  const handleOpenDetail = (parameter: Parameter) => {
    setSelectedParameter(parameter)
    setIsModalOpen(true)
  }

  const formatValue = (value: number, unit?: string) => {
    if (unit === "currency-JPY") {
      return `${value.toLocaleString()}円`
    }
    return value.toString()
  }

  if (!parameters || parameters.length === 0) {
    return null
  }

  return (
    <>
      <div className={`${className} space-y-2`}>
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">パラメータ</h3>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleNext}
              disabled={currentIndex >= parameters.length - displayCount}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {parameters.slice(currentIndex, currentIndex + displayCount).map((parameter, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => handleOpenDetail(parameter)}
            >
              <CardHeader className="p-3 pb-0">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm truncate" title={parameter.name}>
                    {parameter.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {parameter.unit || "単位なし"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <p className="text-xs text-muted-foreground line-clamp-2" title={parameter.description}>
                  {parameter.description}
                </p>
              </CardContent>
              <CardFooter className="p-3 pt-0 flex justify-between items-center">
                <span className="text-sm font-medium">
                  {parameter.values.length > 0 && formatValue(parameter.values[0].value, parameter.unit)}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {selectedParameter && (
        <ParameterDetailModal
          parameter={selectedParameter}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}

