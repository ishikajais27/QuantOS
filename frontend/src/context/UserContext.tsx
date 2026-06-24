// frontend/context/UserContext.tsx
'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import {
  AuthUser,
  getUser,
  logout as authLogout,
  markTourSeen,
  updateUser,
} from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface UserContextValue {
  user: AuthUser | null
  isLoading: boolean
  logout: () => void
  refreshUser: () => void
  completeTour: () => void
}

const UserContext = createContext<UserContextValue>({
  user: null,
  isLoading: true,
  logout: () => {},
  refreshUser: () => {},
  completeTour: () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = useCallback(() => {
    const u = getUser()
    setUser(u)
  }, [])

  useEffect(() => {
    refreshUser()
    setIsLoading(false)
  }, [refreshUser])

  const logout = useCallback(() => {
    authLogout()
    setUser(null)
    router.push('/login')
  }, [router])

  const completeTour = useCallback(() => {
    markTourSeen()
    refreshUser()
  }, [refreshUser])

  return (
    <UserContext.Provider
      value={{ user, isLoading, logout, refreshUser, completeTour }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}

// Guard component — wraps any page that requires auth
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-green-400 text-sm font-mono animate-pulse">
          Initialising QuantOS...
        </div>
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
