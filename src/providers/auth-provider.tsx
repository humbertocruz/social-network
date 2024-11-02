// src/providers/auth-provider.tsx
"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  name: string
  avatar: string
  type: 'HE' | 'SHE'
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
  token: string | null;  // Add token to context
  login: (userData: { user: User, token: string }) => void
  logout: () => void
  setActiveProfile: (profile: Profile) => void
  getToken: () => string | null;  // Add token getter
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)  // Add token state
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Get token from localStorage
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
          setToken(storedToken)  // Set token in state
          
          const storedProfile = localStorage.getItem('activeProfile')
          if (storedProfile) {
            setActiveProfile(JSON.parse(storedProfile))
          }
        }
      } else {
        // Clear invalid token
        localStorage.removeItem('token')
        setToken(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = ({ user: userData, token: newToken }: { user: User, token: string }) => {
    setUser(userData)
    setToken(newToken)  // Set token in state
    localStorage.setItem('token', newToken)  // Store token
    setActiveProfile(null)
    localStorage.removeItem('activeProfile')
  }

  const logout = async () => {
    try {
      const currentToken = localStorage.getItem('token')
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      })
    } finally {
      setUser(null)
      setToken(null)  // Clear token from state
      setActiveProfile(null)
      localStorage.removeItem('token')  // Clear token from storage
      localStorage.removeItem('activeProfile')
      router.push('/login')
    }
  }

  const updateActiveProfile = (profile: Profile) => {
    setActiveProfile(profile)
    localStorage.setItem('activeProfile', JSON.stringify(profile))
  }

  // Add token getter
  const getToken = () => {
    return localStorage.getItem('token')
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        activeProfile,
        token,
        loading,
        login, 
        logout, 
        setActiveProfile: updateActiveProfile,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}