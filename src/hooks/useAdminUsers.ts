import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin.api'
import type { UserFilters } from '../types/role.types'

export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey:  ['admin', 'users', filters],
    queryFn:   async () => {
      const { data } = await adminApi.getUsers(filters)
      return data.data
    },
    staleTime: 30_000,
  })
}

export function useAssignRole() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      adminApi.assignRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useToggleActive() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminApi.toggleActive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}