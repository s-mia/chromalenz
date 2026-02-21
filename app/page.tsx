import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChromaLensLogo } from "@/components/chromalens/logo"

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Full-screen painting background */}
      <img
        src="/background.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      {/* Dark overlay at 78% opacity */}
      <div className="pointer-events-none absolute inset-0 bg-overlay-dark/[0.78]" />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="mb-10 transition-transform duration-300 hover:scale-105">
          <ChromaLensLogo size={96} variant="light" />
        </div>

        <h1 className="text-balance text-5xl font-bold tracking-tight text-text-primary sm:text-6xl">
          ChromaLens Pro
        </h1>

        <p className="mt-4 text-lg font-medium text-text-secondary">
          Advanced Visual Intelligence for Artists
        </p>

        <p className="mt-6 max-w-lg text-pretty leading-relaxed text-text-muted">
          Compare reference images against your artwork with professional-grade
          analysis tools. Evaluate color harmony, value accuracy, edge coherence,
          and more -- all in your browser.
        </p>

        <Button
          asChild
          size="lg"
          className="mt-10 bg-moss px-10 text-base font-semibold text-[#FFFFFF] shadow-lg shadow-overlay-dark/40 transition-all duration-200 hover:bg-moss-hover focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-overlay-dark"
        >
          <Link href="/upload">Start Analysis</Link>
        </Button>

        <div className="mt-16 flex gap-8">
          {[
            { value: "11", label: "Analysis Tools" },
            { value: "100%", label: "Client-Side" },
            { value: "0", label: "Extra Dependencies" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-panel px-5 py-4 shadow-lg shadow-overlay-dark/30 transition-all duration-200 hover:bg-elevated hover:shadow-xl"
            >
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
