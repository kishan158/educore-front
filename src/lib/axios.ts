import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
})

// ─── Request interceptor ──────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token       = localStorage.getItem('auth_token')
  const fingerprint = localStorage.getItem('device_fingerprint')

  if (token)       config.headers.Authorization       = `Bearer ${token}`
  if (fingerprint) config.headers['X-Device-Fingerprint'] = fingerprint

  return config
})

// ─── Response interceptor ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export default api