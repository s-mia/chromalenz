"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChromaLensLogo } from "@/components/chromalens/logo"
import { SimpleValueChecker } from "@/components/chromalens/tools/simple-value-checker"
import { Notan } from "@/components/chromalens/tools/notan"
import { SquintAnalysis } from "@/components/chromalens/tools/squint-analysis"
import { GridSystem } from "@/components/chromalens/tools/grid-system"
import { ContourOverlay } from "@/components/chromalens/tools/contour-overlay"
import { ColorPicker } from "@/components/chromalens/tools/color-picker"
import { ColorPalette } from "@/components/chromalens/tools/color-palette"
import { AccuracyHeatmap } from "@/components/chromalens/tools/accuracy-heatmap"
import { EdgeCoherence } from "@/components/chromalens/tools/edge-coherence"
import { ColorHarmony } from "@/components/chromalens/tools/color-harmony"
import { ValueEntropy } from "@/components/chromalens/tools/value-entropy"

type ToolId =
  | "value-checker"
  | "notan"
  | "squint"
  | "grid"
  | "contour"
  | "color-picker"
  | "color-palette"
  | "color-harmony"
  | "accuracy-heatmap"
  | "edge-coherence"
  | "value-entropy"

interface ToolDef {
  id: ToolId
  label: string
  category: "Foundational" | "Color" | "Structural"
}

const TOOLS: ToolDef[] = [
  { id: "value-checker", label: "Simple Value Checker", category: "Foundational" },
  { id: "notan", label: "Notan", category: "Foundational" },
  { id: "squint", label: "Squint Analysis", category: "Foundational" },
  { id: "grid", label: "Grid System", category: "Foundational" },
  { id: "contour", label: "Contour Overlay", category: "Foundational" },
  { id: "color-picker", label: "Color Picker", category: "Color" },
  { id: "color-palette", label: "Color Palette Generator", category: "Color" },
  { id: "color-harmony", label: "Color Harmony Scoring", category: "Color" },
  { id: "accuracy-heatmap", label: "Accuracy Heatmap", category: "Structural" },
  { id: "edge-coherence", label: "Multi-Scale Edge Coherence", category: "Structural" },
  { id: "value-entropy", label: "Local Value Distribution Entropy", category: "Structural" },
]

const CATEGORIES = ["Foundational", "Color", "Structural"] as const

export default function DashboardPage() {
  const router = useRouter()
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [artworkImage, setArtworkImage] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<ToolId>("value-checker")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const ref = sessionStorage.getItem("chromalens-reference")
      const art = sessionStorage.getItem("chromalens-artwork")
      if (!ref || !art) {
        router.push("/upload")
        return
      }
      setReferenceImage(ref)
      setArtworkImage(art)
      setReady(true)
    } catch {
      router.push("/upload")
    }
  }, [router])

  const renderTool = useCallback(() => {
    if (!referenceImage || !artworkImage) return null
    const props = { referenceImage, artworkImage }
    switch (activeTool) {
      case "value-checker": return <SimpleValueChecker {...props} />
      case "notan": return <Notan {...props} />
      case "squint": return <SquintAnalysis {...props} />
      case "grid": return <GridSystem {...props} />
      case "contour": return <ContourOverlay {...props} />
      case "color-picker": return <ColorPicker {...props} />
      case "color-palette": return <ColorPalette {...props} />
      case "color-harmony": return <ColorHarmony {...props} />
      case "accuracy-heatmap": return <AccuracyHeatmap {...props} />
      case "edge-coherence": return <EdgeCoherence {...props} />
      case "value-entropy": return <ValueEntropy {...props} />
      default: return null
    }
  }, [activeTool, referenceImage, artworkImage])

  if (!ready) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <img
          src="/background.jpg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-overlay-dark/[0.78]" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <ChromaLensLogo size={48} variant="light" />
          <p className="text-sm text-text-muted">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      {/* Full-screen painting background */}
      <img
        src="/images/water-lilies-bg.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none fixed inset-0 bg-overlay-dark/[0.78]" />

      {/* Header */}
      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-panel px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            className="text-text-muted transition-colors duration-150 hover:bg-elevated hover:text-text-primary"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </Button>
          <Link href="/" className="flex items-center gap-2 transition-opacity duration-150 hover:opacity-80">
            <ChromaLensLogo size={24} variant="light" />
            <span className="text-base font-bold tracking-tight text-text-primary">
              ChromaLens Pro
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden rounded bg-elevated px-2.5 py-1 text-[11px] font-medium text-text-secondary sm:inline">
            {TOOLS.find((t) => t.id === activeTool)?.label}
          </span>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-[rgba(255,255,255,0.1)] bg-elevated text-text-secondary transition-all duration-150 hover:bg-elevated/80 hover:text-text-primary"
          >
            <Link href="/upload">Change Images</Link>
          </Button>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="flex w-60 shrink-0 flex-col border-r border-[rgba(255,255,255,0.06)] bg-sidebar">
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-0.5 p-3">
                {/* Image previews */}
                <div className="mb-4 flex gap-2">
                  {referenceImage && (
                    <div className="flex flex-1 flex-col gap-1.5">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                        Reference
                      </p>
                      <img
                        src={referenceImage}
                        alt="Reference thumbnail"
                        className="h-14 w-full rounded border border-[rgba(255,255,255,0.08)] object-contain"
                      />
                    </div>
                  )}
                  {artworkImage && (
                    <div className="flex flex-1 flex-col gap-1.5">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                        Artwork
                      </p>
                      <img
                        src={artworkImage}
                        alt="Artwork thumbnail"
                        className="h-14 w-full rounded border border-[rgba(255,255,255,0.08)] object-contain"
                      />
                    </div>
                  )}
                </div>

                {CATEGORIES.map((cat) => (
                  <div key={cat} className="mb-3">
                    <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted/60">
                      {cat}
                    </p>
                    {TOOLS.filter((t) => t.category === cat).map((tool) => {
                      const isActive = activeTool === tool.id
                      return (
                        <button
                          key={tool.id}
                          onClick={() => setActiveTool(tool.id)}
                          className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-[13px] transition-all duration-150 ${
                            isActive
                              ? "border-l-2 border-l-moss bg-elevated font-semibold text-text-primary"
                              : "border-l-2 border-l-transparent text-text-muted hover:bg-panel hover:text-text-secondary"
                          }`}
                        >
                          {tool.label}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Main workspace */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-5xl p-6">
            {renderTool()}
          </div>
        </main>
      </div>
    </div>
  )
}
