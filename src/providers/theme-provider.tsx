// src/providers/theme-provider.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {ThemeEffect} from "@/components/theme-effect";
type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
    undefined
)

export function ThemeProvider({
                                  children,
                                  defaultTheme = "system",
                              }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme)

    useEffect(() => {
        const root = window.document.documentElement

        // Dispatch theme change event
        window.dispatchEvent(new Event('themeChange'))

        root.classList.remove("light", "dark")

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.classList.add(systemTheme)
            return
        }

        root.classList.add(theme)
    }, [theme])

    const value = {
        theme,
        setTheme: (newTheme: Theme) => {
            setTheme(newTheme)
            // Store theme preference
            try {
                localStorage.setItem('theme', newTheme)
            } catch (e) {
                // Handle localStorage errors
            }
        },
    }

    return (
        <ThemeProviderContext.Provider value={value}>
            <ThemeEffect />
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }

    return context
}