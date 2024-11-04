// src/components/Navbar.tsx
"use client"

import { MobileNav } from "./MobileNav"
import { ThemeSwitch } from "./theme-switch"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { Logo } from "./Logo"
import { UserNav } from "./user-nav"
import { useAuth } from "@/providers/auth-provider"
import Link from "next/link"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import useDic from "./dic"

export function Navbar() {
  const { user } = useAuth()
  const dic = useDic()
  const routes = [
    {
      href: "/dashboard",
      label: dic('navigation.dashboard')
    },
    {
      href: "/messages",
      label: dic('navigation.messages')
    },
    {
      href: "/gallery",
      label: dic('navigation.gallery')
    },
    {
      href: "/radar",
      label: dic('navigation.radar')
    },
    {
      href: "/top",
      label: dic('navigation.top')
    }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <MobileNav />
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold">Vibe</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="hidden md:flex items-center space-x-4">
            {user && routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary"
                )}
              >
                {route.label}
              </Link>
            ))}
            {user && <Link
                href={'/admin'}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary"
                )}
              >
                Admin
            </Link>}
          </nav>
          <div className="flex items-center space-x-4">
            <ThemeSwitch />
            <LanguageSwitcher />
            {user ? (
              <>
                <UserNav />
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost">{dic('auth.login')}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
