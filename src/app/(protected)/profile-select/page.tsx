// src/app/profile-select/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Card } from "@/components/ui/card"
import { ProfileSelectModal } from "@/components/ProfileSelectModal"

export default function ProfileSelectPage() {
  const { user, activeProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else if (activeProfile) {
      router.push('/dashboard')
    }
  }, [user, activeProfile])

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-6">
        <ProfileSelectModal />
      </Card>
    </div>
  )
}