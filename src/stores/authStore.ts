import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '../types/auth.types'

interface AuthState {
  user:            User | null
  token:           string | null
  isAuthenticated: boolean

  setAuth:   (user: User, token: string) => void
  setUser:   (user: User) => void
  logout:    () => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // ✅ Login / set auth
      setAuth: (user, token) => {
        localStorage.setItem('auth_token', token)
        set({
          user,
          token,
          isAuthenticated: true,
        })
      },

      // ✅ Update user
      setUser: (user) => {
        set({ user })
      },

      // ✅ Logout (main function used in sidebar)
      logout: () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('device_fingerprint')

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })

        // optional redirect
        window.location.href = '/auth/login'
      },

      // ✅ Clear auth (internal use)
      clearAuth: () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('device_fingerprint')

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'educore-auth',
      storage: createJSONStorage(() => localStorage),

      // ✅ Persist only required fields
      partialize: (state) => ({
        user:            state.user,
        token:           state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)