import api from '../lib/axios'
import type { Course, CourseFilters, CourseFormData, CourseMeta } from '../types/course.types'
import type { ApiSuccess } from '../types/auth.types'

export interface PaginatedCourses {
  data: Course[]
  meta: CourseMeta
}

export const courseApi = {
  // ─── Public ────────────────────────────────────────────────────
  list: (filters: CourseFilters = {}) =>
    api.get<{ success: boolean; data: Course[]; meta: CourseMeta }>('/courses', { params: filters }),

  show: (slug: string) =>
    api.get<ApiSuccess<Course>>(`/courses/${slug}`),

  // ─── Teacher ───────────────────────────────────────────────────
  teacherList: (filters: CourseFilters = {}) =>
    api.get<{ success: boolean; data: Course[]; meta: CourseMeta }>('/teacher/courses', { params: filters }),

  teacherShow: (id: number) =>
    api.get<ApiSuccess<Course>>(`/teacher/courses/${id}`),

  create: (data: FormData) =>
    api.post<ApiSuccess<Course>>('/teacher/courses', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: number, data: FormData) =>
    api.post<ApiSuccess<Course>>(`/teacher/courses/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params:  { _method: 'PUT' },
    }),

  delete: (id: number) =>
    api.delete<ApiSuccess<null>>(`/teacher/courses/${id}`),

  submitForReview: (id: number) =>
    api.post<ApiSuccess<Course>>(`/teacher/courses/${id}/submit`),

  publish: (id: number) =>
    api.post<ApiSuccess<Course>>(`/teacher/courses/${id}/publish`),

  unpublish: (id: number) =>
    api.post<ApiSuccess<Course>>(`/teacher/courses/${id}/unpublish`),

  // ─── Chapters ──────────────────────────────────────────────────
  getChapters: (courseId: number) =>
    api.get<ApiSuccess<import('../types/course.types').Chapter[]>>(`/teacher/courses/${courseId}/chapters`),

  createChapter: (courseId: number, data: { title: string; description?: string }) =>
    api.post(`/teacher/courses/${courseId}/chapters`, data),

  updateChapter: (courseId: number, chapterId: number, data: object) =>
    api.put(`/teacher/courses/${courseId}/chapters/${chapterId}`, data),

  deleteChapter: (courseId: number, chapterId: number) =>
    api.delete(`/teacher/courses/${courseId}/chapters/${chapterId}`),

  reorderChapters: (courseId: number, order: { id: number; order: number }[]) =>
    api.post(`/teacher/courses/${courseId}/chapters/reorder`, { order }),

  // ─── Lessons ───────────────────────────────────────────────────
  createLesson: (chapterId: number, data: FormData) =>
    api.post(`/teacher/chapters/${chapterId}/lessons`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateLesson: (chapterId: number, lessonId: number, data: FormData) =>
    api.post(`/teacher/chapters/${chapterId}/lessons/${lessonId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params:  { _method: 'PUT' },
    }),

  deleteLesson: (chapterId: number, lessonId: number) =>
    api.delete(`/teacher/chapters/${chapterId}/lessons/${lessonId}`),

  reorderLessons: (chapterId: number, order: { id: number; order: number }[]) =>
    api.post(`/teacher/chapters/${chapterId}/lessons/reorder`, { order }),

  // ─── Admin ─────────────────────────────────────────────────────
  adminList: (filters: CourseFilters = {}) =>
    api.get<{ success: boolean; data: Course[]; meta: CourseMeta }>('/admin/courses', { params: filters }),

  approve: (id: number) =>
    api.post<ApiSuccess<Course>>(`/admin/courses/${id}/approve`),

  reject: (id: number, reason: string) =>
    api.post<ApiSuccess<Course>>(`/admin/courses/${id}/reject`, { reason }),

  toggleFeatured: (id: number) =>
    api.post<ApiSuccess<Course>>(`/admin/courses/${id}/featured`),
}