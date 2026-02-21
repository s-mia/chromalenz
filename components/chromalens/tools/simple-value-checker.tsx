"use client"

import { useEffect, useRef, useState } from "react"
import { loadImage, getImageData, toGrayscale } from "../canvas-utils"

export function SimpleValueChecker({
  referenceImage,
  artworkImage,
}: {
  referenceImage: string
  artworkImage: string
}) {
  const refCanvasRef = useRef<HTMLCanvasElement>(null)
  const artCanvasRef = useRef<HTMLCanvasElement>(null)
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
        const refGray = toGrayscale(refData.data)
        const artGray = toGrayscale(artData.data)

        const refCanvas = refCanvasRef.current
        const artCanvas = artCanvasRef.current
        if (!refCanvas || !artCanvas) return

        refCanvas.width = refData.width
        refCanvas.height = refData.height
        const refCtx = refCanvas.getContext("2d")
        if (refCtx) refCtx.putImageData(refGray, 0, 0)

        artCanvas.width = artData.width
        artCanvas.height = artData.height
        const artCtx = artCanvas.getContext("2d")
        if (artCtx) artCtx.putImageData(artGray, 0, 0)
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
        <h3 className="text-lg font-semibold text-foreground">Simple Value Checker</h3>
        <p className="text-sm text-muted-foreground">
          Compare grayscale values between reference and artwork.
        </p>
      </div>
      {processing && (
        <p className="text-sm text-muted-foreground">Processing...</p>
      )}
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
