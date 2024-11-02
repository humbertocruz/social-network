// src/providers/auth-provider.tsx
"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  name: string
  type: 'HE' | 'SHE'
  avatar: string
  bio?: string
}

interface User {
  id: string
  email: string
  role: string
  profiles: Profile[]
}

interface AuthContextType {
  user: User | null
  activeProfile: Profile | null
  loading: boolean
  login: (user: User) => void
  logout: () => void
  setActiveProfile: (profile: Profile) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  activeProfile: null,
  loading: true,
  login: () => {},
  logout: () => {},
  setActiveProfile: () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
          // Check for stored active profile
          const storedProfile = localStorage.getItem('activeProfile')
          if (storedProfile) {
            setActiveProfile(JSON.parse(storedProfile))
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = (userData: User) => {
    setUser(userData)
    // Clear any existing active profile
    setActiveProfile(null)
    localStorage.removeItem('activeProfile')
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setActiveProfile(null)
      localStorage.removeItem('activeProfile')
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const updateActiveProfile = (profile: Profile) => {
    setActiveProfile(profile)
    localStorage.setItem('activeProfile', JSON.stringify(profile))
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        activeProfile, 
        loading, 
        login, 
        logout, 
        setActiveProfile: updateActiveProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)