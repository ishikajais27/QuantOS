// frontend/lib/auth.ts

import { UserRole } from './mockData'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  token: string
  createdAt: string
  hasSeenTour: boolean
}

const USER_KEY = 'quantos_user'

function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

function generateToken(userId: string, role: UserRole): string {
  // Mock JWT structure (header.payload.signature) — not cryptographically real
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ sub: userId, role, iat: Date.now() }))
  const sig = btoa(`${userId}-${role}-quantos`)
  return `${header}.${payload}.${sig}`
}

export function signup(name: string, email: string, role: UserRole): AuthUser {
  const id = generateId()
  const user: AuthUser = {
    id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    token: generateToken(id, role),
    createdAt: new Date().toISOString(),
    hasSeenTour: false,
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export function login(
  email: string,
  role: UserRole,
  name?: string,
): AuthUser | null {
  // Check if a user with this email already exists in storage
  const existing = getUser()
  if (existing && existing.email === email.trim().toLowerCase()) {
    return existing
  }
  // Otherwise create a new session (demo mode — no password)
  return signup(name || email.split('@')[0], email, role)
}

export function logout(): void {
  localStorage.removeItem(USER_KEY)
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getUser() !== null
}

export function markTourSeen(): void {
  const user = getUser()
  if (!user) return
  user.hasSeenTour = true
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function updateUser(patch: Partial<AuthUser>): void {
  const user = getUser()
  if (!user) return
  const updated = { ...user, ...patch }
  localStorage.setItem(USER_KEY, JSON.stringify(updated))
}

// Per-user mock data storage
export function getUserPositionsKey(userId: string): string {
  return `quantos_positions_${userId}`
}

export function getUserOrdersKey(userId: string): string {
  return `quantos_orders_${userId}`
}
