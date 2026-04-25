import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryApi } from '../api/category.api'
import type { CategoryFormData } from '../types/category.types'

// Public tree
export function useCategoryTree() {
  return useQuery({
    queryKey:  ['categories', 'tree'],
    queryFn:   async () => {
      const { data } = await categoryApi.tree()
      return data.data
    },
    staleTime: 60 * 60 * 1000, // 1 hour — cached on backend too
  })
}

// Admin tree
export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn:  async () => {
      const { data } = await categoryApi.adminTree()
      return data.data
    },
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CategoryFormData) => categoryApi.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoryFormData> }) =>
      categoryApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  })
}