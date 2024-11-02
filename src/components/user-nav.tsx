// src/components/user-nav.tsx
"use client"

import { useAuth } from "@/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  User,
  Settings,
  Lock,
  LogOut,
  UserX,
  Shield,
  UserCog,
  BadgeHelp
} from "lucide-react"
import Link from "next/link"

export function UserNav() {
  const { user, activeProfile, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )
    
    if (confirmed) {
      try {
        const response = await fetch('/api/user/delete', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!response.ok) throw new Error('Failed to delete account')

        toast({
          title: "Account deleted",
          description: "Your account has been successfully deleted.",
        })
        
        logout()
        router.push('/')
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activeProfile?.avatar || user.profiles[0]?.avatar} alt="Profile" />
            <AvatarFallback>{activeProfile?.name?.[0] || user.profiles[0]?.name[0]}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {activeProfile?.name || user.profiles[0]?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="w-full cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/profile/edit" className="w-full cursor-pointer">
              <UserCog className="mr-2 h-4 w-4" />
              <span>Edit Profiles</span>
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="w-full cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/change-password" className="w-full cursor-pointer">
              <Lock className="mr-2 h-4 w-4" />
              <span>Change Password</span>
            </Link>
          </DropdownMenuItem>
          {user.role === 'PREMIUM' && (
            <DropdownMenuItem asChild>
              <Link href="/subscription" className="w-full cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Subscription</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/support" className="w-full cursor-pointer">
              <BadgeHelp className="mr-2 h-4 w-4" />
              <span>Support</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={handleDeleteAccount}
        >
          <UserX className="mr-2 h-4 w-4" />
          <span>Delete Account</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
