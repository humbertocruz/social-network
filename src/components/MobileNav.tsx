// src/components/MobileNav.tsx
"use client"

import { useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Logo } from "./Logo"

const routes = [
  {
    href: "/dashboard",
    label: "Dashboard",
    protected: true
  },
  {
    href: "/messages",
    label: "Messages",
    protected: true
  },
  {
    href: "/gallery",
    label: "Gallery",
    protected: true
  },
  {
    href: "/radar",
    label: "Radar",
    protected: true
  },
  {
    href: "/top",
    label: "Top",
    protected: true
  }
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { user, logout, activeProfile } = useAuth()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col h-full">
          <div className="px-4 py-6 border-b">
            <div className="flex items-center gap-2 mb-4">
              <Logo className="h-8 w-8" />
              <span className="font-bold text-xl">Vibe</span>
            </div>
            {activeProfile && (
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="font-medium">{activeProfile.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {activeProfile.type}
                  </span>
                </div>
              </div>
            )}
          </div>
          <nav className="flex-1 px-2 py-4">
            <div className="space-y-1">
              {routes.map((route) => {
                if (route.protected && !user) return null;
                
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 w-full p-2 rounded-lg hover:bg-accent text-sm font-medium",
                      "transition-colors duration-200"
                    )}
                  >
                    {route.label}
                  </Link>
                )
              })}
            </div>
          </nav>
          <div className="border-t px-4 py-6">
            {user ? (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
              >
                Logout
              </Button>
            ) : (
              <div className="space-y-2">
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}