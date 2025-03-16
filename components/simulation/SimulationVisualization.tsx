"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
// @ts-ignore - d3モジュールの型定義がない場合の警告を無視
import * as d3 from "d3"

interface SimulationData {
  time: number
  value: number
}

interface SimulationVisualizationProps {
  data: SimulationData[]
}

const SimulationVisualization: React.FC<SimulationVisualizationProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
        setContainerHeight(containerRef.current.offsetHeight)
      }
    }

    handleResize()

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || containerWidth === 0 || containerHeight === 0) {
      return
    }

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove() // Clear previous chart

    const margin = { top: 10, right: 10, bottom: 30, left: 30 }
    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d: SimulationData) => d.time) as [number, number])
      .range([0, width])

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d: SimulationData) => d.value) as number])
      .range([height, 0])

    const line = d3
      .line<SimulationData>()
      .x((d: SimulationData) => x(d.time))
      .y((d: SimulationData) => y(d.value))

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line)

    g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x))

    g.append("g").call(d3.axisLeft(y))
  }, [data, containerWidth, containerHeight])

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <div className="absolute inset-0">
        <svg ref={svgRef} width="100%" height="100%"></svg>
      </div>
    </div>
  )
}

export default SimulationVisualization
