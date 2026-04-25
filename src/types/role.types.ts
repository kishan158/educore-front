import type { User } from './auth.types'

export type RoleName = 'admin' | 'teacher' | 'student'

export interface UserPermissions {
  role:                string
  roles:               string[]
  permissions:         string[]
  direct_permissions:  string[]
}

export interface RoleOption {
  name:        RoleName
  label:       string
  description: string
  color:       string
  bgColor:     string
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    name:        'admin',
    label:       'Admin',
    description: 'Full system access',
    color:       'text-amber-800',
    bgColor:     'bg-amber-100',
  },
  {
    name:        'teacher',
    label:       'Teacher',
    description: 'Course management',
    color:       'text-teal-800',
    bgColor:     'bg-teal-100',
  },
  {
    name:        'student',
    label:       'Student',
    description: 'Learning access',
    color:       'text-blue-800',
    bgColor:     'bg-blue-100',
  },
]

export interface UsersListResponse {
  data: User[]
  meta: {
    current_page: number
    last_page:    number
    per_page:     number
    total:        number
  }
}

export interface UserFilters {
  role?:      RoleName | ''
  search?:    string
  is_active?: boolean | ''
  per_page?:  number
  page?:      number
}