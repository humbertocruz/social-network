// src/components/ProfileSelectModal.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function ProfileSelectModal() {
  const { user, activeProfile, setActiveProfile } = useAuth()
  const router = useRouter()

  // Show modal if user is logged in but no active profile is selected
  const showModal = user && !activeProfile

  const handleProfileSelect = (profile: any) => {
    setActiveProfile(profile)
    router.push('/dashboard') // or wherever you want to redirect after selection
  }

  // Prevent navigation if no profile is selected
  useEffect(() => {
    if (user && !activeProfile) {
      router.push('/profile-select')
    }
  }, [user, activeProfile])

  if (!user) return null

  return (
    <Dialog open={showModal} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" showClose={false}>
        <DialogHeader>
          <DialogTitle>Choose Your Profile</DialogTitle>
          <DialogDescription>
            Select which profile you want to use
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {user.profiles.map((profile) => (
            <Button
              key={profile.id}
              variant="outline"
              className="w-full p-6 flex items-center gap-4 justify-start hover:bg-accent"
              onClick={() => handleProfileSelect(profile)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback>{profile.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="font-medium">{profile.name}</span>
                <Badge variant={profile.type === 'HE' ? 'default' : 'secondary'}>
                  {profile.type}
                </Badge>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
