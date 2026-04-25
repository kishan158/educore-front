import { useEffect } from 'react'
import { useSiteTheme }   from '../hooks/useAnalytics'
import { useThemeStore }  from '../stores/themeStore'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: theme }  = useSiteTheme()
  const applyTheme       = useThemeStore((s) => s.applyTheme)

  useEffect(() => {
    if (theme) applyTheme(theme)
  }, [theme])

  return <>{children}</>
}