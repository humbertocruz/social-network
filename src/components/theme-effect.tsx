// src/components/theme-effect.tsx
'use client'

import { useTheme } from "@/providers/theme-provider"
import { useEffect } from "react"

export function ThemeEffect() {
    const { theme } = useTheme()

    useEffect(() => {
        document.documentElement.style.setProperty(
            '--theme-transition',
            'opacity 0.3s ease, transform 0.3s ease'
        )

        const handler = () => {
            document.documentElement.classList.add('theme-transitioning')
            requestAnimationFrame(() => {
                document.documentElement.classList.remove('theme-transitioning')
            })
        }

        window.addEventListener('themeChange', handler)
        return () => window.removeEventListener('themeChange', handler)
    }, [theme])

    return null
}
