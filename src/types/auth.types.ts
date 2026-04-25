export type UserRole = 'admin' | 'teacher' | 'student'

export interface User {
  id:                  number
  name:                string
  email:               string
  role:                UserRole
  avatar_url:          string
  phone:               string | null
  bio:                 string | null
  commission_rate:     string | null
  is_active:           boolean
  two_factor_enabled:  boolean
  email_verified:      boolean
  enrollments_count?:  number
  orders_count?:       number
  devices_count?:      number
  created_at:          string
  updated_at:          string
}

export interface AuthResponse {
  two_factor_required: boolean
  token:               string
  token_type:          string
  user:                User
}

export interface TwoFactorPendingResponse {
  two_factor_required: true
  user_id:             number
}

export interface ApiSuccess<T> {
  success: true
  message: string
  data:    T
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export interface LoginPayload {
  email:               string
  password:            string
  device_name?:        string
  device_fingerprint?: string
}

export interface RegisterPayload {
  name:                  string
  email:                 string
  password:              string
  password_confirmation: string
  role?:                 'student' | 'teacher'
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token:                 string
  email:                 string
  password:              string
  password_confirmation: string
}