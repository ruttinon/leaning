import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'

interface User {
  id: string
  email: string
  username?: string
  firstName: string
  lastName: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
  studentProfile?: any
  teacherProfile?: any
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (user: User, token: string, refreshToken?: string) => void
  setUser: (user: User) => void
  setTokens: (token: string, refreshToken?: string) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken: refreshToken || null, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      setTokens: (token, refreshToken) =>
        set({
          token,
          refreshToken: refreshToken ?? get().refreshToken,
          isAuthenticated: true,
        }),
      logout: async () => {
        const refreshToken = get().refreshToken
        if (refreshToken) {
          try {
            await api.post('/auth/logout', { refresh_token: refreshToken })
          } catch {
            // ignore logout API errors
          }
        }
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
)
