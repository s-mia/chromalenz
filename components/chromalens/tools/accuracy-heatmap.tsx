"use client"

import { useEffect, useRef, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { loadImage, getImageData, toGrayscale } from "../canvas-utils"

export function AccuracyHeatmap({
  referenceImage,
  artworkImage,
}: {
  referenceImage: string
  artworkImage: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [sensitivity, setSensitivity] = useState(30)
  const refGrayRef = useRef<ImageData | null>(null)
  const artGrayRef = useRef<ImageData | null>(null)
  const dimsRef = useRef({ w: 0, h: 0 })
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setProcessing(true)
      try {
        const [refImg, artImg] = await Promise.all([
          loadImage(referenceImage),
          loadImage(artworkImage),
        ])
        if (cancelled) return

        // Use same dimensions for both
        const maxW = 500
        const maxH = 400
        const scale = Math.min(
          maxW / Math.max(refImg.naturalWidth, artImg.naturalWidth),
          maxH / Math.max(refImg.naturalHeight, artImg.naturalHeight),
          1
        )
        const w = Math.floor(Math.min(refImg.naturalWidth, artImg.naturalWidth) * scale)
        const h = Math.floor(Math.min(refImg.naturalHeight, artImg.naturalHeight) * scale)

        const refCanvas = document.createElement("canvas")
        refCanvas.width = w
        refCanvas.height = h
        const refCtx = refCanvas.getContext("2d")
        if (!refCtx) return
        refCtx.drawImage(refImg, 0, 0, w, h)
        refGrayRef.current = toGrayscale(refCtx.getImageData(0, 0, w, h))

        const artCanvas = document.createElement("canvas")
        artCanvas.width = w
        artCanvas.height = h
        const artCtx = artCanvas.getContext("2d")
        if (!artCtx) return
        artCtx.drawImage(artImg, 0, 0, w, h)
        artGrayRef.current = toGrayscale(artCtx.getImageData(0, 0, w, h))

        dimsRef.current = { w, h }
      } catch {
        // silently fail
      }
      if (!cancelled) setProcessing(false)
    }
    load()
    return () => { cancelled = true }
  }, [referenceImage, artworkImage])

  useEffect(() => {
    const refGray = refGrayRef.current
    const artGray = artGrayRef.current
    const canvas = canvasRef.current
    if (!refGray || !artGray || !canvas) return

    const { w, h } = dimsRef.current
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const output = ctx.createImageData(w, h)
    for (let i = 0; i < refGray.data.length; i += 4) {
      const diff = Math.abs(refGray.data[i] - artGray.data[i])
      if (diff > sensitivity) {
        // Red for large differences
        const intensity = Math.min(255, (diff / 255) * 512)
        output.data[i] = intensity
        output.data[i + 1] = 0
        output.data[i + 2] = 0
        output.data[i + 3] = 180
      } else {
        // Green for small differences
        output.data[i] = 0
        output.data[i + 1] = 180
        output.data[i + 2] = 0
        output.data[i + 3] = 60
      }
    }
    ctx.putImageData(output, 0, 0)
  }, [sensitivity, processing])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Accuracy Heatmap</h3>
        <p className="text-sm text-muted-foreground">
          Highlights value differences between reference and artwork. Red areas show larger discrepancies.
        </p>
      </div>
      {processing && <p className="text-sm text-muted-foreground">Processing...</p>}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-foreground">Sensitivity: {sensitivity}</label>
        <Slider
          value={[sensitivity]}
          onValueChange={(v) => setSensitivity(v[0])}
          min={5}
          max={100}
          className="max-w-xs"
        />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Difference Heatmap</p>
          <canvas ref={canvasRef} className="w-full rounded border border-border" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Artwork (for reference)</p>
          <img
            src={artworkImage}
            alt="Artwork"
            className="w-full rounded border border-border object-contain"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="size-3 rounded-sm bg-red-500" />
          <span>Large difference</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-3 rounded-sm bg-green-500" />
          <span>Small difference</span>
        </div>
      </div>
    </div>
  )
}
