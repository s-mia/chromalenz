"use client"

import { useEffect, useRef, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { loadImage, getImageData, sobelEdges } from "../canvas-utils"

export function ContourOverlay({
  referenceImage,
  artworkImage,
}: {
  referenceImage: string
  artworkImage: string
}) {
  const refCanvasRef = useRef<HTMLCanvasElement>(null)
  const artCanvasRef = useRef<HTMLCanvasElement>(null)
  const [opacity, setOpacity] = useState(70)
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
        const refEdges = sobelEdges(refData.data)
        const artEdges = sobelEdges(artData.data)

        const refCanvas = refCanvasRef.current
        const artCanvas = artCanvasRef.current
        if (!refCanvas || !artCanvas) return

        refCanvas.width = refData.width
        refCanvas.height = refData.height
        const refCtx = refCanvas.getContext("2d")
        if (refCtx) refCtx.putImageData(refEdges, 0, 0)

        artCanvas.width = artData.width
        artCanvas.height = artData.height
        const artCtx = artCanvas.getContext("2d")
        if (artCtx) artCtx.putImageData(artEdges, 0, 0)
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
        <h3 className="text-lg font-semibold text-foreground">Contour Overlay</h3>
        <p className="text-sm text-muted-foreground">
          Edge detection to reveal contour lines and shapes.
        </p>
      </div>
      {processing && <p className="text-sm text-muted-foreground">Processing...</p>}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-foreground">Opacity: {opacity}%</label>
        <Slider
          value={[opacity]}
          onValueChange={(v) => setOpacity(v[0])}
          min={10}
          max={100}
          className="max-w-xs"
        />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Reference</p>
          <div className="relative overflow-hidden rounded border border-border">
            <img
              src={referenceImage}
              alt="Reference"
              className="w-full object-contain"
            />
            <canvas
              ref={refCanvasRef}
              className="pointer-events-none absolute inset-0 h-full w-full object-contain mix-blend-multiply"
              style={{ opacity: opacity / 100 }}
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Artwork</p>
          <div className="relative overflow-hidden rounded border border-border">
            <img
              src={artworkImage}
              alt="Artwork"
              className="w-full object-contain"
            />
            <canvas
              ref={artCanvasRef}
              className="pointer-events-none absolute inset-0 h-full w-full object-contain mix-blend-multiply"
              style={{ opacity: opacity / 100 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
