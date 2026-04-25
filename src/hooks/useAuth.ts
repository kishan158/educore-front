import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../stores/authStore'
import { getFingerprint } from '../utils/fingerprint'
import type { LoginPayload, RegisterPayload } from '../types/auth.types'

// ─── Role-based redirect map ──────────────────────────────────────
const ROLE_REDIRECT = {
  admin:   '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
} as const

export function useLogin() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      // Fingerprint get karo
      const fingerprint = await getFingerprint()
      return authApi.login({
        ...payload,
        device_fingerprint: fingerprint,
        device_name: `${navigator.platform} - ${navigator.userAgent.split(')')[0].split('(')[1]}`,
      })
    },
    onSuccess: ({ data }) => {
      const result = data.data

      if ('user_id' in result) {
        navigate('/auth/two-factor', { state: { userId: result.user_id } })
        return
      }

      setAuth(result.user, result.token)
      navigate(ROLE_REDIRECT[result.user.role])
      
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: ({ data }) => {
      const { user, token } = data.data
      setAuth(user, token)
      navigate(ROLE_REDIRECT[user.role])
    },
  })
}

export function useLogout() {
  const navigate   = useNavigate()
  const clearAuth  = useAuthStore((s) => s.clearAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth()
      queryClient.clear()
      navigate('/auth/login')
    },
    onError: () => {
      // Error pe bhi clear karo
      clearAuth()
      navigate('/auth/login')
    },
  })
}

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setUser         = useAuthStore((s) => s.setUser)

  return useQuery({
    queryKey:  ['auth', 'me'],
    queryFn:   async () => {
      const { data } = await authApi.me()
      setUser(data.data)
      return data.data
    },
    enabled:   isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 min
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword({ email }),
  })
}

export function useResetPassword() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      navigate('/auth/login', {
        state: { message: 'Password reset ho gaya! Ab login karo.' },
      })
    },
  })
}