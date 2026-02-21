"use client"

import { useEffect, useState } from "react"
import { loadImage, getImageData, extractDominantColors, rgbToHex, rgbToHsl } from "../canvas-utils"

export function ColorPalette({
  referenceImage,
  artworkImage,
}: {
  referenceImage: string
  artworkImage: string
}) {
  const [refPalette, setRefPalette] = useState<Array<{ r: number; g: number; b: number }>>([])
  const [artPalette, setArtPalette] = useState<Array<{ r: number; g: number; b: number }>>([])
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
        setRefPalette(extractDominantColors(refData.data, 7))
        setArtPalette(extractDominantColors(artData.data, 7))
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
        <h3 className="text-lg font-semibold text-foreground">Color Palette Generator</h3>
        <p className="text-sm text-muted-foreground">
          Extract dominant colors from each image.
        </p>
      </div>
      {processing && <p className="text-sm text-muted-foreground">Extracting colors...</p>}
      <div className="flex flex-col gap-6 sm:flex-row">
        <PaletteDisplay label="Reference Palette" palette={refPalette} />
        <PaletteDisplay label="Artwork Palette" palette={artPalette} />
      </div>
    </div>
  )
}

function PaletteDisplay({
  label,
  palette,
}: {
  label: string
  palette: Array<{ r: number; g: number; b: number }>
}) {
  if (palette.length === 0) return null
  return (
    <div className="flex flex-1 flex-col gap-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex gap-2">
        {palette.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="size-10 rounded-md border border-border"
              style={{ backgroundColor: rgbToHex(c.r, c.g, c.b) }}
            />
            <span className="text-[10px] text-muted-foreground">
              {rgbToHex(c.r, c.g, c.b).toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {palette.map((c, i) => {
          const hsl = rgbToHsl(c.r, c.g, c.b)
          return (
            <div key={i} className="flex items-center gap-2 text-xs text-foreground">
              <div
                className="size-3 rounded-sm border border-border"
                style={{ backgroundColor: rgbToHex(c.r, c.g, c.b) }}
              />
              <span>
                HSL({hsl.h}, {hsl.s}%, {hsl.l}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
