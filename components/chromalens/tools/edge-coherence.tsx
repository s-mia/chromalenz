"use client"

import { useEffect, useRef, useState } from "react"
import { loadImage, sobelEdges } from "../canvas-utils"

function getEdgeDataAtScale(
  img: HTMLImageElement,
  scale: number
): { edges: ImageData; width: number; height: number } {
  const w = Math.floor(img.naturalWidth * scale)
  const h = Math.floor(img.naturalHeight * scale)
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("No context")
  ctx.drawImage(img, 0, 0, w, h)
  const data = ctx.getImageData(0, 0, w, h)
  const edges = sobelEdges(data)
  return { edges, width: w, height: h }
}

function computeCoherence(
  refEdges: ImageData,
  artEdges: ImageData,
  w: number,
  h: number
): number {
  let matches = 0
  let total = 0
  const len = Math.min(refEdges.data.length, artEdges.data.length)
  for (let i = 0; i < len; i += 4) {
    const refVal = refEdges.data[i] > 30 ? 1 : 0
    const artVal = artEdges.data[i] > 30 ? 1 : 0
    if (refVal === 1 || artVal === 1) {
      total++
      if (refVal === artVal) matches++
    }
  }
  return total === 0 ? 100 : Math.round((matches / total) * 100)
}

export function EdgeCoherence({
  referenceImage,
  artworkImage,
}: {
  referenceImage: string
  artworkImage: string
}) {
  const [scores, setScores] = useState<{ scale: string; score: number }[]>([])
  const [avgScore, setAvgScore] = useState(0)
  const [processing, setProcessing] = useState(true)
  const refCanvasRef = useRef<HTMLCanvasElement>(null)
  const artCanvasRef = useRef<HTMLCanvasElement>(null)

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

        const scales = [
          { label: "Large (50%)", value: 0.5 },
          { label: "Medium (30%)", value: 0.3 },
          { label: "Small (15%)", value: 0.15 },
        ]

        const results: { scale: string; score: number }[] = []
        for (const s of scales) {
          const refEdge = getEdgeDataAtScale(refImg, s.value)
          const artEdge = getEdgeDataAtScale(artImg, s.value)
          const minW = Math.min(refEdge.width, artEdge.width)
          const minH = Math.min(refEdge.height, artEdge.height)
          const score = computeCoherence(refEdge.edges, artEdge.edges, minW, minH)
          results.push({ scale: s.label, score })
        }

        setScores(results)
        setAvgScore(Math.round(results.reduce((a, b) => a + b.score, 0) / results.length))

        // Show medium scale edges in canvases
        const displayScale = Math.min(500 / refImg.naturalWidth, 350 / refImg.naturalHeight, 1)
        const refEdges = getEdgeDataAtScale(refImg, displayScale)
        const artEdges = getEdgeDataAtScale(artImg, displayScale)

        const refCanvas = refCanvasRef.current
        const artCanvas = artCanvasRef.current
        if (refCanvas) {
          refCanvas.width = refEdges.width
          refCanvas.height = refEdges.height
          const ctx = refCanvas.getContext("2d")
          if (ctx) ctx.putImageData(refEdges.edges, 0, 0)
        }
        if (artCanvas) {
          artCanvas.width = artEdges.width
          artCanvas.height = artEdges.height
          const ctx = artCanvas.getContext("2d")
          if (ctx) ctx.putImageData(artEdges.edges, 0, 0)
        }
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
        <h3 className="text-lg font-semibold text-foreground">Multi-Scale Edge Coherence</h3>
        <p className="text-sm text-muted-foreground">
          Compare edge alignment between reference and artwork at multiple scales.
        </p>
      </div>
      {processing && <p className="text-sm text-muted-foreground">Processing...</p>}
      {!processing && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground">{avgScore}%</span>
            <span className="text-sm text-muted-foreground">Average Coherence Score</span>
          </div>
          <div className="flex flex-col gap-2">
            {scores.map((s) => (
              <div key={s.scale} className="flex items-center gap-3">
                <span className="w-28 text-sm text-foreground">{s.scale}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${s.score}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-medium text-foreground">{s.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Reference Edges</p>
          <canvas ref={refCanvasRef} className="w-full rounded border border-border" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Artwork Edges</p>
          <canvas ref={artCanvasRef} className="w-full rounded border border-border" />
        </div>
      </div>
    </div>
  )
}
