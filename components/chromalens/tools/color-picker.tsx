"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { loadImage, rgbToHsl, rgbToHex } from "../canvas-utils"

interface PickedColor {
  r: number
  g: number
  b: number
  hex: string
  hsl: { h: number; s: number; l: number }
  brightness: number
}

function ColorInfo({ label, color }: { label: string; color: PickedColor | null }) {
  if (!color) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-2 text-xs text-muted-foreground">Click on the image to pick a color</p>
      </div>
    )
  }
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="mt-3 flex items-center gap-3">
        <div
          className="size-12 rounded-md border border-border"
          style={{ backgroundColor: color.hex }}
        />
        <div className="flex flex-col gap-1 text-xs text-foreground">
          <span>HEX: {color.hex.toUpperCase()}</span>
          <span>RGB: ({color.r}, {color.g}, {color.b})</span>
          <span>HSL: ({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)</span>
          <span>Brightness: {color.brightness}</span>
        </div>
      </div>
    </div>
  )
}

function PickableImage({
  src,
  alt,
  onPick,
}: {
  src: string
  alt: string
  onPick: (color: PickedColor) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const img = await loadImage(src)
        if (cancelled) return
        const canvas = canvasRef.current
        if (!canvas) return
        const scale = Math.min(600 / img.naturalWidth, 400 / img.naturalHeight, 1)
        canvas.width = Math.floor(img.naturalWidth * scale)
        canvas.height = Math.floor(img.naturalHeight * scale)
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          setLoaded(true)
        }
      } catch {
        // fail silently
      }
    }
    load()
    return () => { cancelled = true }
  }, [src])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas || !loaded) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const x = Math.floor((e.clientX - rect.left) * scaleX)
      const y = Math.floor((e.clientY - rect.top) * scaleY)
      try {
        const pixel = ctx.getImageData(x, y, 1, 1).data
        const r = pixel[0]
        const g = pixel[1]
        const b = pixel[2]
        const hex = rgbToHex(r, g, b)
        const hsl = rgbToHsl(r, g, b)
        const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
        onPick({ r, g, b, hex, hsl, brightness })
      } catch {
        // CORS or other error
      }
    },
    [loaded, onPick]
  )

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="w-full cursor-crosshair rounded border border-border"
      aria-label={alt}
    />
  )
}

export function ColorPicker({
  referenceImage,
  artworkImage,
}: {
  referenceImage: string
  artworkImage: string
}) {
  const [refColor, setRefColor] = useState<PickedColor | null>(null)
  const [artColor, setArtColor] = useState<PickedColor | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Color Picker</h3>
        <p className="text-sm text-muted-foreground">
          Click on each image to sample and compare colors.
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Reference</p>
          <PickableImage src={referenceImage} alt="Pick color from reference" onPick={setRefColor} />
          <ColorInfo label="Reference Color" color={refColor} />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Artwork</p>
          <PickableImage src={artworkImage} alt="Pick color from artwork" onPick={setArtColor} />
          <ColorInfo label="Artwork Color" color={artColor} />
        </div>
      </div>
    </div>
  )
}
