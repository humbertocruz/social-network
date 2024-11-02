// src/components/theme-switch.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/providers/theme-provider"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function ThemeSwitch() {
    const { theme, setTheme } = useTheme()
    const [isRotating, setIsRotating] = useState(false)

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setIsRotating(true)
        setTheme(newTheme)
        setTimeout(() => setIsRotating(false), 300)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "theme-switcher-button",
                        isRotating && "animate-spin-slow"
                    )}
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] sun-icon theme-switch-icon" />
                    <Moon className="h-[1.2rem] w-[1.2rem] moon-icon theme-switch-icon" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="theme-dropdown">
                <DropdownMenuItem
                    onClick={() => handleThemeChange("light")}
                    className="theme-dropdown-item"
                >
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                    {theme === 'light' && (
                        <span className="absolute right-2 text-primary">✓</span>
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleThemeChange("dark")}
                    className="theme-dropdown-item"
                >
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                    {theme === 'dark' && (
                        <span className="absolute right-2 text-primary">✓</span>
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleThemeChange("system")}
                    className="theme-dropdown-item"
                >
                    <span className="mr-2">💻</span>
                    <span>System</span>
                    {theme === 'system' && (
                        <span className="absolute right-2 text-primary">✓</span>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}