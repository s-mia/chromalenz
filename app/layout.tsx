import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ChromaLens Pro",
  description:
    "Advanced Visual Intelligence for Artists - Professional visual analysis tool",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${geist.className} ${geistMono.className} relative min-h-screen antialiased text-white`}
      >
        {/* Background Layer */}
        <div className="fixed inset-0 -z-10">
          <img
            src="/background.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />

          {/* Dark overlay for contrast */}
          <div className="absolute inset-0 bg-[#0F1B2A]/75 backdrop-blur-sm" />
        </div>

        {children}

        <Analytics />
      </body>
    </html>
  )
}