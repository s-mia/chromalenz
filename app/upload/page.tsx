"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChromaLensLogo } from "@/components/chromalens/logo"

function ImageDropZone({
  label,
  image,
  onSelect,
}: {
  label: string
  image: string | null
  onSelect: (dataUrl: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === "string") {
          onSelect(result)
        }
      }
      reader.readAsDataURL(file)
    },
    [onSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div className="flex flex-1 flex-col gap-3">
      <label className="text-sm font-medium text-text-secondary">{label}</label>
      <div
        className={`relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 ${
          dragActive
            ? "border-moss bg-moss/15 shadow-lg"
            : image
              ? "border-[rgba(255,255,255,0.12)] bg-panel shadow-md"
              : "border-[rgba(255,255,255,0.08)] bg-panel/80 hover:border-moss/50 hover:bg-panel hover:shadow-md"
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        aria-label={`Upload ${label}`}
      >
        {image ? (
          <img
            src={image}
            alt={`${label} preview`}
            className="max-h-[260px] max-w-full rounded object-contain p-2"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-text-muted"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <p className="text-sm text-text-muted">
              Drag and drop or click to upload
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>
      {image && (
        <Button
          variant="outline"
          size="sm"
          className="self-start border-[rgba(255,255,255,0.1)] bg-elevated text-text-secondary transition-colors duration-150 hover:bg-elevated/80 hover:text-text-primary"
          onClick={(e) => {
            e.stopPropagation()
            inputRef.current?.click()
          }}
        >
          Replace
        </Button>
      )}
    </div>
  )
}

export default function UploadPage() {
  const router = useRouter()
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [artworkImage, setArtworkImage] = useState<string | null>(null)

  const canContinue = referenceImage && artworkImage

  const handleContinue = () => {
    if (!referenceImage || !artworkImage) return
    try {
      sessionStorage.setItem("chromalens-reference", referenceImage)
      sessionStorage.setItem("chromalens-artwork", artworkImage)
      router.push("/dashboard")
    } catch {
      alert("Image files are too large. Please use smaller images.")
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Full-screen painting background */}
      <img
        src="/background.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none fixed inset-0 bg-overlay-dark/[0.78]" />

      <header className="relative z-10 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-panel px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity duration-150 hover:opacity-80">
          <ChromaLensLogo size={28} variant="light" />
          <span className="text-lg font-bold tracking-tight text-text-primary">
            ChromaLens Pro
          </span>
        </Link>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Upload Images</h1>
          <p className="mt-2 leading-relaxed text-text-muted">
            Upload a reference image and your artwork to begin analysis.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-6 sm:flex-row">
          <ImageDropZone
            label="Reference Image"
            image={referenceImage}
            onSelect={setReferenceImage}
          />
          <ImageDropZone
            label="Artwork Image"
            image={artworkImage}
            onSelect={setArtworkImage}
          />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            asChild
            className="border-[rgba(255,255,255,0.1)] bg-elevated text-text-secondary transition-colors duration-150 hover:bg-elevated/80 hover:text-text-primary"
          >
            <Link href="/">Back</Link>
          </Button>
          <Button
            disabled={!canContinue}
            onClick={handleContinue}
            className="bg-moss font-semibold text-[#FFFFFF] shadow-lg shadow-overlay-dark/40 transition-all duration-200 hover:bg-moss-hover focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-overlay-dark disabled:opacity-40"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    </main>
  )
}
