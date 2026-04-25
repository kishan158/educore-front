import { useAuthStore } from '../../stores/authStore'
import type { RoleName } from '../../types/role.types'

interface Props {
  roles?:    RoleName[]
  fallback?: React.ReactNode
  children:  React.ReactNode
}

export default function PermissionGuard({ roles, fallback = null, children }: Props) {
  const user = useAuthStore((s) => s.user)

  if (!user) return <>{fallback}</>

  if (roles && !roles.includes(user.role as RoleName)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}