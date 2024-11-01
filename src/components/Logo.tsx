// src/components/Logo.tsx
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={cn("text-primary", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.8 }} />
        </linearGradient>
      </defs>
      
      {/* Main shape */}
      <path 
        d="M50 5 L80 25 L80 45 A30 30 0 0 1 50 75 A30 30 0 0 1 20 45 L20 25 L50 5Z
           M50 15 L70 30 L70 45 A20 20 0 0 1 50 65 A20 20 0 0 1 30 45 L30 30 L50 15Z"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />
      
      {/* Bottom accent */}
      <path 
        d="M50 75 L65 90 L50 95 L35 90 L50 75"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />
    </svg>
  )
}

// You can also create a loading version of the logo
export function LoadingLogo({ className = "", size = 40 }: LogoProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      <Logo size={size} />
    </div>
  )
}

// And an animated version for special occasions
export function AnimatedLogo({ className = "", size = 40 }: LogoProps) {
  return (
    <div className={cn("animate-float", className)}>
      <Logo size={size} />
    </div>
  )
}
