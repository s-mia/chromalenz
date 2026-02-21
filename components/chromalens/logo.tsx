interface LogoProps {
  size?: number
  className?: string
  variant?: "light" | "dark"
}

export function ChromaLensLogo({ size = 48, className = "", variant = "light" }: LogoProps) {
  const color = variant === "light" ? "#F5F5F5" : "#111111"
  const sub = variant === "light" ? "rgba(245,245,245,0.3)" : "rgba(17,17,17,0.3)"

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer circle */}
      <circle cx="32" cy="32" r="28" stroke={color} strokeWidth="1.5" fill="none" />

      {/* Inner ring */}
      <circle cx="32" cy="32" r="20" stroke={sub} strokeWidth="1" fill="none" />

      {/* Aperture opening */}
      <circle cx="32" cy="32" r="10" stroke={color} strokeWidth="1" fill="none" />

      {/* Center dot */}
      <circle cx="32" cy="32" r="2.5" fill={color} />
    </svg>
  )
}
