'use client'

import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="font-bold text-xl">Vibe</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/messages">
              <Button variant="ghost">Messages</Button>
            </Link>
            <Link href="/events">
              <Button variant="ghost">Events</Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src={user.profiles[0]?.avatar} />
                  <AvatarFallback>
                    {user.profiles[0]?.name[0]}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/gallery">Gallery</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/invitations">Invitations</Link>
                </DropdownMenuItem>
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
