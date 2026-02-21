/**
 * Safely load an image from a data URL and return an HTMLImageElement.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = src
  })
}

/**
 * Draw an image to a canvas and return the ImageData.
 * Resizes to maxWidth/maxHeight while preserving aspect ratio.
 */
export function getImageData(
  img: HTMLImageElement,
  maxWidth = 600,
  maxHeight = 400
): { data: ImageData; width: number; height: number; canvas: HTMLCanvasElement } {
  const scale = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight, 1)
  const width = Math.floor(img.naturalWidth * scale)
  const height = Math.floor(img.naturalHeight * scale)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas context unavailable")
  ctx.drawImage(img, 0, 0, width, height)
  const data = ctx.getImageData(0, 0, width, height)
  return { data, width, height, canvas }
}

/**
 * Convert ImageData to grayscale, return new ImageData.
 */
export function toGrayscale(imageData: ImageData): ImageData {
  const copy = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  )
  for (let i = 0; i < copy.data.length; i += 4) {
    const avg = copy.data[i] * 0.299 + copy.data[i + 1] * 0.587 + copy.data[i + 2] * 0.114
    copy.data[i] = avg
    copy.data[i + 1] = avg
    copy.data[i + 2] = avg
  }
  return copy
}

/**
 * Convert ImageData to black/white (notan) based on threshold.
 */
export function toNotan(imageData: ImageData, threshold: number): ImageData {
  const gray = toGrayscale(imageData)
  for (let i = 0; i < gray.data.length; i += 4) {
    const val = gray.data[i] >= threshold ? 255 : 0
    gray.data[i] = val
    gray.data[i + 1] = val
    gray.data[i + 2] = val
  }
  return gray
}

/**
 * Compute simple Sobel edge detection, return new ImageData.
 */
export function sobelEdges(imageData: ImageData): ImageData {
  const gray = toGrayscale(imageData)
  const { width, height } = gray
  const output = new ImageData(width, height)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (i: number, j: number) => ((y + j) * width + (x + i)) * 4

      const gx =
        -gray.data[idx(-1, -1)] + gray.data[idx(1, -1)] +
        -2 * gray.data[idx(-1, 0)] + 2 * gray.data[idx(1, 0)] +
        -gray.data[idx(-1, 1)] + gray.data[idx(1, 1)]

      const gy =
        -gray.data[idx(-1, -1)] - 2 * gray.data[idx(0, -1)] - gray.data[idx(1, -1)] +
        gray.data[idx(-1, 1)] + 2 * gray.data[idx(0, 1)] + gray.data[idx(1, 1)]

      const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy))
      const out = (y * width + x) * 4
      output.data[out] = mag
      output.data[out + 1] = mag
      output.data[out + 2] = mag
      output.data[out + 3] = 255
    }
  }
  return output
}

/**
 * Extract dominant colors from ImageData using simple k-means-like sampling.
 */
export function extractDominantColors(
  imageData: ImageData,
  count: number = 6
): Array<{ r: number; g: number; b: number }> {
  const { data, width, height } = imageData
  const pixels: Array<[number, number, number]> = []

  // Sample pixels
  const step = Math.max(1, Math.floor((width * height) / 2000))
  for (let i = 0; i < data.length; i += step * 4) {
    pixels.push([data[i], data[i + 1], data[i + 2]])
  }

  // Simple quantization by dividing color space
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>()
  const quantize = (v: number) => Math.round(v / 32) * 32

  for (const [r, g, b] of pixels) {
    const key = `${quantize(r)},${quantize(g)},${quantize(b)}`
    const existing = buckets.get(key)
    if (existing) {
      existing.r += r
      existing.g += g
      existing.b += b
      existing.count++
    } else {
      buckets.set(key, { r, g, b, count: 1 })
    }
  }

  const sorted = Array.from(buckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, count)
    .map((b) => ({
      r: Math.round(b.r / b.count),
      g: Math.round(b.g / b.count),
      b: Math.round(b.b / b.count),
    }))

  return sorted
}

/**
 * Convert RGB to HSL.
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * Convert RGB to HEX string.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")
  )
}
