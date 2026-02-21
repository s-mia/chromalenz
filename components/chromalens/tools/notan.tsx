"use client"

import { useEffect, useRef, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { loadImage, getImageData, toNotan } from "../canvas-utils"

export function Notan({
  referenceImage,
  artworkImage,
}: {
  referenceImage: string
  artworkImage: string
}) {
  const refCanvasRef = useRef<HTMLCanvasElement>(null)
  const artCanvasRef = useRef<HTMLCanvasElement>(null)
  const [threshold, setThreshold] = useState(128)
  const refDataRef = useRef<ImageData | null>(null)
  const artDataRef = useRef<ImageData | null>(null)
  const refDimsRef = useRef({ w: 0, h: 0 })
  const artDimsRef = useRef({ w: 0, h: 0 })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [refImg, artImg] = await Promise.all([
          loadImage(referenceImage),
          loadImage(artworkImage),
        ])
        if (cancelled) return
        const refData = getImageData(refImg)
        const artData = getImageData(artImg)
        refDataRef.current = refData.data
        artDataRef.current = artData.data
        refDimsRef.current = { w: refData.width, h: refData.height }
        artDimsRef.current = { w: artData.width, h: artData.height }
      } catch {
        // silently fail
      }
    }
    load()
    return () => { cancelled = true }
  }, [referenceImage, artworkImage])

  useEffect(() => {
    if (!refDataRef.current || !artDataRef.current) return
    const refNotan = toNotan(refDataRef.current, threshold)
    const artNotan = toNotan(artDataRef.current, threshold)

    const refCanvas = refCanvasRef.current
    const artCanvas = artCanvasRef.current
    if (!refCanvas || !artCanvas) return

    refCanvas.width = refDimsRef.current.w
    refCanvas.height = refDimsRef.current.h
    const refCtx = refCanvas.getContext("2d")
    if (refCtx) refCtx.putImageData(refNotan, 0, 0)

    artCanvas.width = artDimsRef.current.w
    artCanvas.height = artDimsRef.current.h
    const artCtx = artCanvas.getContext("2d")
    if (artCtx) artCtx.putImageData(artNotan, 0, 0)
  }, [threshold])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Notan Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Reduce images to black and white to study value patterns.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-foreground">Threshold: {threshold}</label>
        <Slider
          value={[threshold]}
          onValueChange={(v) => setThreshold(v[0])}
          min={0}
          max={255}
          className="max-w-xs"
        />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Reference</p>
          <canvas ref={refCanvasRef} className="w-full rounded border border-border" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Artwork</p>
          <canvas ref={artCanvasRef} className="w-full rounded border border-border" />
        </div>
      </div>
    </div>
  )
}
