'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  role: string
  profiles: unknown[]
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (userData: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
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
    router.push('/profile')
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
