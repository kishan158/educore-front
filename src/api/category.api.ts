import api from '../lib/axios'
import type { ApiSuccess } from '../types/auth.types'
import type { Category, CategoryFormData } from '../types/category.types'

export const categoryApi = {
  // Public
  list: () =>
    api.get<ApiSuccess<Category[]>>('/categories'),

  tree: () =>
    api.get<ApiSuccess<Category[]>>('/categories/tree'),

  // Admin
  adminList: () =>
    api.get<ApiSuccess<Category[]>>('/admin/categories'),

  adminTree: () =>
    api.get<ApiSuccess<Category[]>>('/admin/categories/tree'),

  show: (id: number) =>
    api.get<ApiSuccess<Category>>(`/admin/categories/${id}`),

  create: (data: CategoryFormData) =>
    api.post<ApiSuccess<Category>>('/admin/categories', data),

  update: (id: number, data: Partial<CategoryFormData>) =>
    api.put<ApiSuccess<Category>>(`/admin/categories/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiSuccess<null>>(`/admin/categories/${id}`),

  reorder: (order: { id: number; order: number }[]) =>
    api.post<ApiSuccess<null>>('/admin/categories/reorder', { order }),
}