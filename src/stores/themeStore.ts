import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SiteTheme } from '../types/analytics.types'

interface ThemeState {
  theme:       SiteTheme | null
  setTheme:    (theme: SiteTheme) => void
  applyTheme:  (theme: SiteTheme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: null,

      setTheme: (theme) => set({ theme }),

      applyTheme: (theme) => {
        // Apply CSS variables to document root
        const root = document.documentElement

        root.style.setProperty('--color-primary', theme.primary_color)
        root.style.setProperty('--color-accent',  theme.accent_color)

        // Dark / Light mode
        if (theme.mode === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }

        // Custom CSS
        let styleEl = document.getElementById('custom-css')
        if (!styleEl) {
          styleEl = document.createElement('style')
          styleEl.id = 'custom-css'
          document.head.appendChild(styleEl)
        }
        styleEl.textContent = theme.custom_css

        // Site title
        document.title = theme.site_name

        set({ theme })
      },
    }),
    { name: 'educore-theme' }
  )
)