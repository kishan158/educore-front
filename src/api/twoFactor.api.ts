import api from '../lib/axios'
import type { TwoFactorSetup, TwoFactorStatus, LoginVerifyPayload } from '../types/twoFactor.types'
import type { ApiSuccess, AuthResponse } from '../types/auth.types'

export const twoFactorApi = {
  status: () =>
    api.get<ApiSuccess<TwoFactorStatus>>('/auth/two-factor/status'),

  setup: () =>
    api.post<ApiSuccess<TwoFactorSetup>>('/auth/two-factor/setup'),

  enable: (code: string) =>
    api.post<ApiSuccess<import('../types/auth.types').User>>(
      '/auth/two-factor/enable',
      { code }
    ),

  loginVerify: (payload: LoginVerifyPayload) =>
    api.post<ApiSuccess<AuthResponse>>('/auth/two-factor/verify', payload),

  disable: (password: string) =>
    api.post('/auth/two-factor/disable', { password }),
}