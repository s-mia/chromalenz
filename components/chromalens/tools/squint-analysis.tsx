"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

export function SquintAnalysis({
  referenceImage,
  artworkImage,
}: {
  referenceImage: string
  artworkImage: string
}) {
  const [blur, setBlur] = useState(5)
  const [active, setActive] = useState(true)

  const filterStyle = active ? { filter: `blur(${blur}px)` } : {}

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Squint Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Simulate squinting to see the broad value and color masses.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant={active ? "default" : "outline"}
          size="sm"
          onClick={() => setActive(!active)}
        >
          {active ? "Blur On" : "Blur Off"}
        </Button>
        <label className="text-sm font-medium text-foreground">Intensity: {blur}px</label>
        <Slider
          value={[blur]}
          onValueChange={(v) => setBlur(v[0])}
          min={1}
          max={20}
          className="max-w-xs"
        />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Reference</p>
          <div className="overflow-hidden rounded border border-border">
            <img
              src={referenceImage}
              alt="Reference squint view"
              className="w-full object-contain"
              style={filterStyle}
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Artwork</p>
          <div className="overflow-hidden rounded border border-border">
            <img
              src={artworkImage}
              alt="Artwork squint view"
              className="w-full object-contain"
              style={filterStyle}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
