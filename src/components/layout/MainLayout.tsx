import { useState }              from 'react'
import { Outlet, useLocation }   from 'react-router-dom'
import { motion }                from 'framer-motion'
import Sidebar                   from './Sidebar'
import NotificationBell          from '../shared/NotificationBell'
import { useAuthStore }          from '../../stores/authStore'
import { useThemeStore }         from '../../stores/themeStore'

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user }    = useAuthStore()
  const { theme }   = useThemeStore()
  const location    = useLocation()

  // Derive page title from path
  const getPageTitle = () => {
    const seg = location.pathname.split('/').filter(Boolean)
    const last = seg[seg.length - 1] ?? 'dashboard'
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ')
  }

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC' }}>

      {/* ─── Sidebar ────────────────────────────────────────────── */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* ─── Right panel ────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ─── Header ───────────────────────────────────────────── */}
        <header style={{
          height:       '64px',
          background:   '#FFFFFF',
          borderBottom: '1px solid #F1F5F9',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'space-between',
          padding:      '0 24px',
          flexShrink:   0,
          boxShadow:    '0 1px 3px rgba(0,0,0,0.04)',
        }}>

          {/* Left: breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Hamburger for mobile */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                display:      'flex', alignItems: 'center', justifyContent: 'center',
                width: '36px', height: '36px', borderRadius: '10px',
                border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B',
              }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {getPageTitle()}
              </p>
              <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
                {dateStr} · {timeStr}
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Search button */}
            <button style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '7px 14px', borderRadius: '10px',
              border: '1px solid #E2E8F0', background: '#F8FAFC',
              cursor: 'pointer', color: '#94A3B8', fontSize: '13px',
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span style={{ display: 'none' }}>Search</span>
            </button>

            {/* Notification */}
            <NotificationBell />

            {/* Divider */}
            <div style={{ width: '1px', height: '28px', background: '#F1F5F9' }} />

            {/* User chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={user?.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'User')}&size=36&background=1E3A5F&color=fff`}
                  alt={user?.name ?? ''}
                  style={{ width: 36, height: 36, borderRadius: '50%', display: 'block', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute', bottom: '1px', right: '1px',
                  width: '9px', height: '9px', borderRadius: '50%',
                  background: '#10B981', border: '2px solid #fff',
                }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                  {user?.name ?? 'User'}
                </p>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, textTransform: 'capitalize' }}>
                  {user?.role ?? 'student'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Page content ─────────────────────────────────────── */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#F8FAFC' }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>

        {/* ─── Footer ───────────────────────────────────────────── */}
        <footer style={{
          height:       '44px',
          background:   '#FFFFFF',
          borderTop:    '1px solid #F1F5F9',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'space-between',
          padding:      '0 24px',
          flexShrink:   0,
        }}>
          <p style={{ fontSize: '11px', color: '#CBD5E1', margin: 0 }}>
            © {new Date().getFullYear()} EduCore LMS · All rights reserved
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {['Privacy Policy', 'Terms of Service', 'Support'].map((link) => (
              <a key={link} href="#"
                style={{ fontSize: '11px', color: '#CBD5E1', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#2563EB')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
              >
                {link}
              </a>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', color: '#CBD5E1' }}>All systems operational</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}