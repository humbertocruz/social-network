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
            <path
                d="M15 65 L50 15 L85 65
           A35 35 0 0 1 50 85
           A35 35 0 0 1 15 65 Z
           M50 85 L65 95 L50 100 L35 95 L50 85"
                fill="currentColor"
            />
        </svg>
    )
}