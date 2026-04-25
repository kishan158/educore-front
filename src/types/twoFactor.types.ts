export interface TwoFactorSetup {
  secret:       string
  qr_code_url:  string
  qr_code_svg:  string
  user:         import('./auth.types').User
}

export interface TwoFactorStatus {
  two_factor_enabled: boolean
  has_secret:         boolean
}

export interface LoginVerifyPayload {
  user_id: number
  code:    string
}