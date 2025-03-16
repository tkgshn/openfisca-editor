"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Parameter } from "@/lib/types"
import { ParameterDetailModal } from "./parameter-detail-modal"
import { ParameterModal } from "./parameter-modal"

interface ParameterCarouselProps {
  parameters: Parameter[]
  className?: string
  onUpdate?: (parameters: Parameter[]) => void
}

export function ParameterCarousel({ parameters, className = "", onUpdate }: ParameterCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [displayCount, setDisplayCount] = useState(3)

  // ウィンドウサイズに応じて表示数を調整
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) { // sm
        setDisplayCount(1)
      } else if (window.innerWidth < 1024) { // md
        setDisplayCount(2)
      } else { // lg以上
        setDisplayCount(3)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < parameters.length - displayCount ? prev + 1 : prev))
  }

  const handleOpenDetail = (parameter: Parameter) => {
    setSelectedParameter(parameter)
    setIsDetailModalOpen(true)
  }

  const handleCreateParameter = () => {
    setIsCreateModalOpen(true)
  }

  const handleSaveParameter = (parameter: Parameter) => {
    if (onUpdate) {
      const updatedParameters = [...parameters, parameter]
      onUpdate(updatedParameters)
    }
    setIsCreateModalOpen(false)
  }

  const handleDeleteParameter = () => {
    // 新規作成時は削除機能は使用しない
  }

  const formatValue = (value: number, unit?: string) => {
    if (unit === "currency-JPY") {
      return `${value.toLocaleString()}円`
    }
    return value.toString()
  }

  if (!parameters || parameters.length === 0) {
    return (
      <div className={`${className} space-y-2`}>
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">パラメータ</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateParameter}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            パラメータを追加
          </Button>
        </div>
        <div className="bg-muted/50 rounded-lg p-8 text-center text-muted-foreground">
          パラメータがありません
        </div>
        <ParameterModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSaveParameter}
          onDelete={handleDeleteParameter}
          isEditing={false}
        />
      </div>
    )
  }

  // パラメータの数が表示数以下の場合は、ナビゲーション矢印を非表示
  const showNavigation = parameters.length > displayCount

  return (
    <>
      <div className={`${className} space-y-2`}>
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">パラメータ</h3>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateParameter}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              パラメータを追加
            </Button>
            {showNavigation && (
              <>
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
              </>
            )}
          </div>
        </div>

        <div className={`grid grid-cols-${displayCount} gap-3`}>
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
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}

      <ParameterModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveParameter}
        onDelete={handleDeleteParameter}
        isEditing={false}
      />
    </>
  )
}

