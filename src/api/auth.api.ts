import api from '../lib/axios'
import type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ApiSuccess,
  AuthResponse,
  TwoFactorPendingResponse,
  User,
} from '../types/auth.types'
import type { AxiosResponse } from 'axios'

export const authApi = {
  register: (
    payload: RegisterPayload
  ): Promise<AxiosResponse<ApiSuccess<AuthResponse>>> =>
    api.post('/auth/register', payload),

  login: (
    payload: LoginPayload
  ): Promise<AxiosResponse<ApiSuccess<AuthResponse | TwoFactorPendingResponse>>> =>
    api.post('/auth/login', payload),

  logout: (): Promise<AxiosResponse<ApiSuccess<null>>> =>
    api.post('/auth/logout'),

  logoutAll: (): Promise<AxiosResponse<ApiSuccess<null>>> =>
    api.post('/auth/logout-all'),

  me: (): Promise<AxiosResponse<ApiSuccess<User>>> =>
    api.get('/auth/me'),

  forgotPassword: (
    payload: ForgotPasswordPayload
  ): Promise<AxiosResponse<ApiSuccess<null>>> =>
    api.post('/auth/forgot-password', payload),

  resetPassword: (
    payload: ResetPasswordPayload
  ): Promise<AxiosResponse<ApiSuccess<null>>> =>
    api.post('/auth/reset-password', payload),

  updateProfile: (
    payload: FormData
  ): Promise<AxiosResponse<ApiSuccess<User>>> =>
    api.post('/auth/update-profile', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}