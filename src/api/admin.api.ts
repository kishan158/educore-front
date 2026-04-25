import api from '../lib/axios'
import type { UsersListResponse, UserFilters } from '../types/role.types'
import type { ApiSuccess, User } from '../types/auth.types'

export const adminApi = {
  // ─── Users ────────────────────────────────────────────────────
  getUsers: (filters: UserFilters = {}) =>
    api.get<ApiSuccess<UsersListResponse>>('/admin/users', { params: filters }),

  getUser: (id: number) =>
    api.get<ApiSuccess<User>>(`/admin/users/${id}`),

  assignRole: (id: number, role: string) =>
    api.post<ApiSuccess<User>>(`/admin/users/${id}/assign-role`, { role }),

  toggleActive: (id: number) =>
    api.post<ApiSuccess<User>>(`/admin/users/${id}/toggle-active`),

  deleteUser: (id: number) =>
    api.delete<ApiSuccess<null>>(`/admin/users/${id}`),

  getUserPermissions: (id: number) =>
    api.get(`/admin/users/${id}/permissions`),

  getRoles: () =>
    api.get('/admin/users/roles'),
}