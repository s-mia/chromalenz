"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

type GridType = "thirds" | "4x4" | "6x6" | "golden" | "diagonal" | "custom"

function GridOverlay({
  type,
  customRows,
  customCols,
  opacity,
}: {
  type: GridType
  customRows: number
  customCols: number
  opacity: number
}) {
  const lineStyle = `rgba(220, 50, 50, ${opacity / 100})`

  if (type === "diagonal") {
    return (
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <line x1="0" y1="0" x2="100" y2="100" stroke={lineStyle} strokeWidth="0.5" />
        <line x1="100" y1="0" x2="0" y2="100" stroke={lineStyle} strokeWidth="0.5" />
      </svg>
    )
  }

  if (type === "golden") {
    const phi = 1.618
    const g1 = (1 / phi) * 100
    const g2 = (1 - 1 / phi) * 100
    return (
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <line x1={g1} y1="0" x2={g1} y2="100" stroke={lineStyle} strokeWidth="0.5" />
        <line x1={100 - g1} y1="0" x2={100 - g1} y2="100" stroke={lineStyle} strokeWidth="0.5" />
        <line x1="0" y1={g1} x2="100" y2={g1} stroke={lineStyle} strokeWidth="0.5" />
        <line x1="0" y1={100 - g1} x2="100" y2={100 - g1} stroke={lineStyle} strokeWidth="0.5" />
        {/* additional golden spiral guides */}
        <line x1={g2} y1="0" x2={g2} y2="100" stroke={lineStyle} strokeWidth="0.3" opacity="0.5" />
        <line x1="0" y1={g2} x2="100" y2={g2} stroke={lineStyle} strokeWidth="0.3" opacity="0.5" />
      </svg>
    )
  }

  let rows = 3
  let cols = 3
  if (type === "thirds") { rows = 3; cols = 3 }
  else if (type === "4x4") { rows = 4; cols = 4 }
  else if (type === "6x6") { rows = 6; cols = 6 }
  else if (type === "custom") { rows = customRows; cols = customCols }

  const lines: React.ReactNode[] = []
  for (let i = 1; i < cols; i++) {
    const x = (i / cols) * 100
    lines.push(
      <line key={`v${i}`} x1={x} y1="0" x2={x} y2="100" stroke={lineStyle} strokeWidth="0.5" />
    )
  }
  for (let i = 1; i < rows; i++) {
    const y = (i / rows) * 100
    lines.push(
      <line key={`h${i}`} x1="0" y1={y} x2="100" y2={y} stroke={lineStyle} strokeWidth="0.5" />
    )
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {lines}
    </svg>
  )
}

const GRID_TYPES: { label: string; value: GridType }[] = [
  { label: "Rule of Thirds", value: "thirds" },
  { label: "4x4", value: "4x4" },
  { label: "6x6", value: "6x6" },
  { label: "Golden Ratio", value: "golden" },
  { label: "Diagonal", value: "diagonal" },
  { label: "Custom", value: "custom" },
]

export function GridSystem({
  referenceImage,
  artworkImage,
}: {
  referenceImage: string
  artworkImage: string
}) {
  const [gridType, setGridType] = useState<GridType>("thirds")
  const [opacity, setOpacity] = useState(60)
  const [customRows, setCustomRows] = useState(3)
  const [customCols, setCustomCols] = useState(3)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Grid System</h3>
        <p className="text-sm text-muted-foreground">
          Overlay composition grids to analyze structure.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {GRID_TYPES.map((gt) => (
          <Button
            key={gt.value}
            variant={gridType === gt.value ? "default" : "outline"}
            size="sm"
            onClick={() => setGridType(gt.value)}
          >
            {gt.label}
          </Button>
        ))}
      </div>
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
      {gridType === "custom" && (
        <div className="flex items-center gap-4">
          <label className="text-sm text-foreground">
            Rows:
            <input
              type="number"
              min={2}
              max={20}
              value={customRows}
              onChange={(e) => setCustomRows(Math.max(2, Math.min(20, Number(e.target.value))))}
              className="ml-2 w-16 rounded border border-input bg-background px-2 py-1 text-sm text-foreground"
            />
          </label>
          <label className="text-sm text-foreground">
            Cols:
            <input
              type="number"
              min={2}
              max={20}
              value={customCols}
              onChange={(e) => setCustomCols(Math.max(2, Math.min(20, Number(e.target.value))))}
              className="ml-2 w-16 rounded border border-input bg-background px-2 py-1 text-sm text-foreground"
            />
          </label>
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Reference</p>
          <div className="relative overflow-hidden rounded border border-border">
            <img
              src={referenceImage}
              alt="Reference with grid"
              className="w-full object-contain"
            />
            <GridOverlay type={gridType} customRows={customRows} customCols={customCols} opacity={opacity} />
          </div>
        </div>
        <div className="relative flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Artwork</p>
          <div className="relative overflow-hidden rounded border border-border">
            <img
              src={artworkImage}
              alt="Artwork with grid"
              className="w-full object-contain"
            />
            <GridOverlay type={gridType} customRows={customRows} customCols={customCols} opacity={opacity} />
          </div>
        </div>
      </div>
    </div>
  )
}
