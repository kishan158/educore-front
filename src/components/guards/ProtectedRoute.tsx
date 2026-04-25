import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import type { UserRole } from '../../types/auth.types'

interface Props {
  allowedRoles?: UserRole[]
  children: React.ReactNode
}

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const fallback = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
    }

    return <Navigate to={fallback[user.role]} replace />
  }

  return children   // 🔥🔥🔥 MOST IMPORTANT FIX
}