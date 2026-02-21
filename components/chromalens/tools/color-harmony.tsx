"use client"

import { useEffect, useState } from "react"
import { loadImage, getImageData, extractDominantColors, rgbToHsl, rgbToHex } from "../canvas-utils"

interface HarmonyResult {
  score: number
  complementaryBalance: number
  warmCoolRatio: string
  saturationVariance: number
  explanation: string
  palette: Array<{ r: number; g: number; b: number }>
}

function analyzeHarmony(colors: Array<{ r: number; g: number; b: number }>): HarmonyResult {
  const hslColors = colors.map((c) => rgbToHsl(c.r, c.g, c.b))

  // Complementary balance: check if hues span opposing sides
  const hues = hslColors.map((c) => c.h)
  let compScore = 0
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      const diff = Math.abs(hues[i] - hues[j])
      const dist = Math.min(diff, 360 - diff)
      if (dist > 150 && dist < 210) compScore += 20
      else if (dist > 60 && dist < 120) compScore += 10
    }
  }
  const complementaryBalance = Math.min(100, compScore)

  // Warm vs cool distribution
  let warm = 0
  let cool = 0
  for (const c of hslColors) {
    if ((c.h >= 0 && c.h < 60) || c.h >= 300) warm++
    else cool++
  }
  const warmCoolRatio = `${warm}W : ${cool}C`

  // Saturation variance
  const sats = hslColors.map((c) => c.s)
  const avgSat = sats.reduce((a, b) => a + b, 0) / sats.length
  const satVariance = Math.round(
    Math.sqrt(sats.reduce((acc, s) => acc + (s - avgSat) ** 2, 0) / sats.length)
  )

  // Overall harmony score
  const hueSpread = Math.max(...hues) - Math.min(...hues)
  const spreadScore = hueSpread > 30 && hueSpread < 300 ? 40 : 20
  const satScore = satVariance < 25 ? 30 : satVariance < 50 ? 20 : 10
  const score = Math.min(100, spreadScore + satScore + Math.round(complementaryBalance * 0.3))

  let explanation = ""
  if (score >= 75) explanation = "Strong color harmony with well-balanced relationships and consistent saturation."
  else if (score >= 50) explanation = "Moderate harmony. Some color relationships work well, but variance could be refined."
  else explanation = "Weak harmony. Colors may feel disjointed. Consider adjusting saturation consistency or hue relationships."

  return {
    score,
    complementaryBalance,
    warmCoolRatio,
    saturationVariance: satVariance,
    explanation,
    palette: colors,
  }
}

export function ColorHarmony({
  referenceImage,
  artworkImage,
}: {
  referenceImage: string
  artworkImage: string
}) {
  const [refHarmony, setRefHarmony] = useState<HarmonyResult | null>(null)
  const [artHarmony, setArtHarmony] = useState<HarmonyResult | null>(null)
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
        const refColors = extractDominantColors(refData.data, 6)
        const artColors = extractDominantColors(artData.data, 6)
        setRefHarmony(analyzeHarmony(refColors))
        setArtHarmony(analyzeHarmony(artColors))
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
        <h3 className="text-lg font-semibold text-foreground">Color Harmony Scoring</h3>
        <p className="text-sm text-muted-foreground">
          Analyze color relationships and harmony of each image.
        </p>
      </div>
      {processing && <p className="text-sm text-muted-foreground">Analyzing harmony...</p>}
      <div className="flex flex-col gap-4 sm:flex-row">
        {refHarmony && <HarmonyCard label="Reference" harmony={refHarmony} />}
        {artHarmony && <HarmonyCard label="Artwork" harmony={artHarmony} />}
      </div>
    </div>
  )
}

function HarmonyCard({ label, harmony }: { label: string; harmony: HarmonyResult }) {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-foreground">{harmony.score}</span>
        <span className="text-sm text-muted-foreground">/ 100</span>
      </div>
      <div className="flex gap-1">
        {harmony.palette.map((c, i) => (
          <div
            key={i}
            className="h-6 flex-1 first:rounded-l-md last:rounded-r-md"
            style={{ backgroundColor: rgbToHex(c.r, c.g, c.b) }}
          />
        ))}
      </div>
      <div className="flex flex-col gap-1 text-xs text-foreground">
        <span>Complementary Balance: {harmony.complementaryBalance}%</span>
        <span>Warm/Cool: {harmony.warmCoolRatio}</span>
        <span>Saturation Variance: {harmony.saturationVariance}</span>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{harmony.explanation}</p>
    </div>
  )
}
