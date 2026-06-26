// frontend/lib/auth.ts
// Connects to the real Spring Boot backend at /api/auth/*
// No more fake JWTs — everything goes through PostgreSQL.

import { UserRole } from './mockData'

export interface AuthUser {
  id: string // accountId from backend (UUID)
  name: string // Display name
  email: string
  role: UserRole // 'retail' | 'quant' | 'institutional'
  token: string // Real JWT from backend
  createdAt: string
  hasSeenTour: boolean
}

const USER_KEY = 'quantos_user'

// ──────────────────────────────────────────────────────────────────────────────
// Map between backend role strings and frontend role strings
// ──────────────────────────────────────────────────────────────────────────────
function toFrontendRole(backendRole: string): UserRole {
  const map: Record<string, UserRole> = {
    retail: 'retail',
    quant: 'quant',
    institutional: 'institutional',
    trader: 'retail', // legacy default
  }
  return map[backendRole.toLowerCase()] ?? 'retail'
}

function toBackendRole(role: UserRole): string {
  return role.toUpperCase() // 'RETAIL', 'QUANT', 'INSTITUTIONAL'
}

// ──────────────────────────────────────────────────────────────────────────────
// Register a new user — calls POST /api/auth/register
// ──────────────────────────────────────────────────────────────────────────────
export async function signup(
  name: string,
  email: string,
  password: string,
  role: UserRole,
): Promise<AuthUser> {
  // Derive a username from the name (e.g. "Test User" → "testuser")
  const username = name.trim().toLowerCase().replace(/\s+/g, '')

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      username,
      email: email.trim().toLowerCase(),
      password,
      role: toBackendRole(role),
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error ?? 'Registration failed. Please try again.')
  }

  const user: AuthUser = {
    id: data.accountId,
    name: data.name || name,
    email: data.email || email,
    role: toFrontendRole(data.role),
    token: data.token,
    createdAt: new Date().toISOString(),
    hasSeenTour: false,
  }
  persistUser(user)
  return user
}

// ──────────────────────────────────────────────────────────────────────────────
// Login — calls POST /api/auth/login (accepts email OR username)
// ──────────────────────────────────────────────────────────────────────────────
export async function login(
  emailOrUsername: string,
  password: string,
): Promise<AuthUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: emailOrUsername.trim(),
      password,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(
      data.error ??
        'Invalid credentials. Please check your email and password.',
    )
  }

  const existing = getUser()
  const hasSeenTour: boolean =
    existing?.email === data.email ? (existing?.hasSeenTour ?? false) : false

  const user: AuthUser = {
    id: data.accountId,
    name: data.name || emailOrUsername,
    email: data.email || emailOrUsername,
    role: toFrontendRole(data.role),
    token: data.token,
    createdAt: new Date().toISOString(),
    hasSeenTour: hasSeenTour,
  }

  persistUser(user)
  return user
}

function persistUser(user: AuthUser): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
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

export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_KEY)
}

export function markTourSeen(): void {
  const user = getUser()
  if (!user) return
  persistUser({ ...user, hasSeenTour: true })
}

export function updateUser(patch: Partial<AuthUser>): void {
  const user = getUser()
  if (!user) return
  persistUser({ ...user, ...patch })
}

export function isAuthenticated(): boolean {
  return getUser() !== null
}

// Per-user storage keys (for mock position data)
export function getUserPositionsKey(userId: string): string {
  return `quantos_positions_${userId}`
}
export function getUserOrdersKey(userId: string): string {
  return `quantos_orders_${userId}`
}
