"use client"

import { useEffect, useRef, useState } from "react"
import { loadImage, getImageData, toGrayscale } from "../canvas-utils"

function computeEntropy(imageData: ImageData, gridSize: number = 8): {
  entropyMap: number[][]
  avgEntropy: number
  width: number
  height: number
} {
  const gray = toGrayscale(imageData)
  const { width, height } = gray
  const cellW = Math.floor(width / gridSize)
  const cellH = Math.floor(height / gridSize)
  const entropyMap: number[][] = []
  let totalEntropy = 0
  let count = 0

  for (let gy = 0; gy < gridSize; gy++) {
    const row: number[] = []
    for (let gx = 0; gx < gridSize; gx++) {
      const x0 = gx * cellW
      const y0 = gy * cellH

      // Collect brightness values in this cell
      const values: number[] = []
      for (let y = y0; y < y0 + cellH && y < height; y++) {
        for (let x = x0; x < x0 + cellW && x < width; x++) {
          values.push(gray.data[(y * width + x) * 4])
        }
      }

      // Calculate variance (as proxy for entropy)
      if (values.length === 0) {
        row.push(0)
        continue
      }
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length
      const normalizedVariance = Math.min(1, Math.sqrt(variance) / 128)
      row.push(normalizedVariance)
      totalEntropy += normalizedVariance
      count++
    }
    entropyMap.push(row)
  }

  return { entropyMap, avgEntropy: count > 0 ? totalEntropy / count : 0, width, height }
}

function drawEntropyMap(
  canvas: HTMLCanvasElement,
  entropyMap: number[][],
  originalWidth: number,
  originalHeight: number
) {
  const gridRows = entropyMap.length
  const gridCols = entropyMap[0]?.length || 0
  canvas.width = originalWidth
  canvas.height = originalHeight
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const cellW = originalWidth / gridCols
  const cellH = originalHeight / gridRows

  for (let y = 0; y < gridRows; y++) {
    for (let x = 0; x < gridCols; x++) {
      const v = entropyMap[y][x]
      // Low entropy = blue (uniform), high entropy = yellow/red (complex)
      const r = Math.round(v * 255)
      const g = Math.round(v * 200)
      const b = Math.round((1 - v) * 255)
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.7)`
      ctx.fillRect(x * cellW, y * cellH, cellW, cellH)
    }
  }

  // Draw grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.2)"
  ctx.lineWidth = 1
  for (let x = 0; x <= gridCols; x++) {
    ctx.beginPath()
    ctx.moveTo(x * cellW, 0)
    ctx.lineTo(x * cellW, originalHeight)
    ctx.stroke()
  }
  for (let y = 0; y <= gridRows; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * cellH)
    ctx.lineTo(originalWidth, y * cellH)
    ctx.stroke()
  }
}

export function ValueEntropy({
  referenceImage,
  artworkImage,
}: {
  referenceImage: string
  artworkImage: string
}) {
  const refCanvasRef = useRef<HTMLCanvasElement>(null)
  const artCanvasRef = useRef<HTMLCanvasElement>(null)
  const [refEntropy, setRefEntropy] = useState(0)
  const [artEntropy, setArtEntropy] = useState(0)
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function process() {
      setProcessing(true)
      try {
        const [refImg, artImg] = await Promise.all([
          loadImage(referenceImage),
          loadImage(artworkImage),
        ])
        if (cancelled) return

        const refData = getImageData(refImg)
        const artData = getImageData(artImg)
        const refResult = computeEntropy(refData.data)
        const artResult = computeEntropy(artData.data)

        setRefEntropy(Math.round(refResult.avgEntropy * 100))
        setArtEntropy(Math.round(artResult.avgEntropy * 100))

        const refCanvas = refCanvasRef.current
        const artCanvas = artCanvasRef.current
        if (refCanvas) drawEntropyMap(refCanvas, refResult.entropyMap, refData.width, refData.height)
        if (artCanvas) drawEntropyMap(artCanvas, artResult.entropyMap, artData.width, artData.height)
      } catch {
        // silently fail
      }
      if (!cancelled) setProcessing(false)
    }
    process()
    return () => { cancelled = true }
  }, [referenceImage, artworkImage])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Local Value Distribution Entropy</h3>
        <p className="text-sm text-muted-foreground">
          Measures visual complexity by analyzing brightness variance across regions.
        </p>
      </div>
      {processing && <p className="text-sm text-muted-foreground">Computing entropy...</p>}
      {!processing && (
        <div className="flex gap-6">
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{refEntropy}%</p>
            <p className="text-xs text-muted-foreground">Reference Entropy</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{artEntropy}%</p>
            <p className="text-xs text-muted-foreground">Artwork Entropy</p>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Reference Complexity Map</p>
          <canvas ref={refCanvasRef} className="w-full rounded border border-border" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Artwork Complexity Map</p>
          <canvas ref={artCanvasRef} className="w-full rounded border border-border" />
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="size-3 rounded-sm" style={{ backgroundColor: "rgb(0,0,255)" }} />
          <span>Low complexity (uniform)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-3 rounded-sm" style={{ backgroundColor: "rgb(255,200,0)" }} />
          <span>High complexity (varied)</span>
        </div>
      </div>
    </div>
  )
}
