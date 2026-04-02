"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

interface RotatingGlobeProps {
  className?: string
}

export default function RotatingGlobe({ className = "" }: RotatingGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const container = containerRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const radius = Math.min(containerWidth, containerHeight) * 0.44

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    context.scale(dpr, dpr)

    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)

    const path = d3.geoPath().projection(projection).context(context)

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point
      let inside = false
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]
        const [xj, yj] = polygon[j]
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside
        }
      }
      return inside
    }

    const pointInFeature = (point: [number, number], feature: { geometry: { type: string; coordinates: number[][][] | number[][][][] } }): boolean => {
      const geometry = feature.geometry
      if (geometry.type === "Polygon") {
        const coordinates = geometry.coordinates as number[][][]
        if (!pointInPolygon(point, coordinates[0])) return false
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) return false
        }
        return true
      } else if (geometry.type === "MultiPolygon") {
        const coordinates = geometry.coordinates as number[][][][]
        for (const polygon of coordinates) {
          if (pointInPolygon(point, polygon[0])) {
            let inHole = false
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) { inHole = true; break }
            }
            if (!inHole) return true
          }
        }
        return false
      }
      return false
    }

    const generateDotsInPolygon = (feature: { geometry: { type: string; coordinates: number[][][] | number[][][][] }; properties?: Record<string, unknown> }, dotSpacing = 16) => {
      const dots: [number, number][] = []
      const bounds = d3.geoBounds(feature as Parameters<typeof d3.geoBounds>[0])
      const [[minLng, minLat], [maxLng, maxLat]] = bounds
      const stepSize = dotSpacing * 0.08
      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point: [number, number] = [lng, lat]
          if (pointInFeature(point, feature)) dots.push(point)
        }
      }
      return dots
    }

    interface DotData { lng: number; lat: number }
    const allDots: DotData[] = []
    let landFeatures: { features: { geometry: { type: string; coordinates: number[][][] | number[][][][] }; properties?: Record<string, unknown> }[] } | null = null

    const render = () => {
      context.clearRect(0, 0, containerWidth, containerHeight)

      const currentScale = projection.scale()
      const sf = currentScale / radius

      const cx = containerWidth / 2
      const cy = containerHeight / 2

      const outerGrad = context.createRadialGradient(cx, cy, 0, cx, cy, currentScale)
      outerGrad.addColorStop(0, "rgba(5, 46, 22, 0.92)")
      outerGrad.addColorStop(0.6, "rgba(5, 25, 12, 0.97)")
      outerGrad.addColorStop(1, "rgba(2, 8, 4, 1)")

      context.beginPath()
      context.arc(cx, cy, currentScale, 0, 2 * Math.PI)
      context.fillStyle = outerGrad
      context.fill()

      context.strokeStyle = "rgba(74, 222, 128, 0.35)"
      context.lineWidth = 1.5 * sf
      context.stroke()

      if (!landFeatures) return

      const graticule = d3.geoGraticule()
      context.beginPath()
      path(graticule())
      context.strokeStyle = "rgba(74, 222, 128, 0.12)"
      context.lineWidth = 0.6 * sf
      context.globalAlpha = 1
      context.stroke()

      context.beginPath()
      landFeatures.features.forEach((feature) => {
        path(feature as Parameters<typeof path>[0])
      })
      context.strokeStyle = "rgba(74, 222, 128, 0.55)"
      context.lineWidth = 0.8 * sf
      context.stroke()

      allDots.forEach((dot) => {
        const projected = projection([dot.lng, dot.lat])
        if (
          projected &&
          projected[0] >= 0 && projected[0] <= containerWidth &&
          projected[1] >= 0 && projected[1] <= containerHeight
        ) {
          context.beginPath()
          context.arc(projected[0], projected[1], 1.1 * sf, 0, 2 * Math.PI)
          context.fillStyle = "rgba(52, 211, 153, 0.65)"
          context.fill()
        }
      })

      const shimmerGrad = context.createRadialGradient(cx - currentScale * 0.3, cy - currentScale * 0.35, 0, cx, cy, currentScale)
      shimmerGrad.addColorStop(0, "rgba(74, 222, 128, 0.06)")
      shimmerGrad.addColorStop(0.5, "transparent")
      shimmerGrad.addColorStop(1, "rgba(0,0,0,0.18)")

      context.beginPath()
      context.arc(cx, cy, currentScale, 0, 2 * Math.PI)
      context.fillStyle = shimmerGrad
      context.fill()
    }

    const loadWorldData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json"
        )
        if (!response.ok) throw new Error("Failed to load land data")
        landFeatures = await response.json() as typeof landFeatures

        landFeatures!.features.forEach((feature) => {
          const dots = generateDotsInPolygon(feature, 16)
          dots.forEach(([lng, lat]) => allDots.push({ lng, lat }))
        })

        setLoaded(true)
        render()
      } catch {
        setLoaded(true)
      }
    }

    const rotation: [number, number] = [0, -15]
    let autoRotate = true
    const rotationSpeed = 0.18

    const rotationTimer = d3.timer(() => {
      if (autoRotate) {
        rotation[0] += rotationSpeed
        projection.rotate(rotation)
        render()
      }
    })

    const handleMouseDown = (event: MouseEvent) => {
      autoRotate = false
      const startX = event.clientX
      const startY = event.clientY
      const startRot: [number, number] = [...rotation]

      const handleMouseMove = (e: MouseEvent) => {
        const sensitivity = 0.4
        rotation[0] = startRot[0] + (e.clientX - startX) * sensitivity
        rotation[1] = Math.max(-75, Math.min(75, startRot[1] - (e.clientY - startY) * sensitivity))
        projection.rotate(rotation)
        render()
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        setTimeout(() => { autoRotate = true }, 10)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    canvas.addEventListener("mousedown", handleMouseDown)

    loadWorldData()

    return () => {
      rotationTimer.stop()
      canvas.removeEventListener("mousedown", handleMouseDown)
    }
  }, [])

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ display: "block" }}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}
    </div>
  )
}
