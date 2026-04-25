import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courseApi } from '../api/course.api'
import type { CourseFilters } from '../types/course.types'

// ─── Public ───────────────────────────────────────────────────────
export function usePublicCourses(filters: CourseFilters = {}) {
  return useQuery({
    queryKey: ['courses', 'public', filters],
    queryFn:  async () => {
      const { data } = await courseApi.list(filters)
      return data
    },
    staleTime: 60_000,
  })
}

export function useCourseDetail(slug: string) {
  return useQuery({
    queryKey: ['courses', 'detail', slug],
    queryFn:  async () => {
      const { data } = await courseApi.show(slug)
      return data.data
    },
  })
}

// ─── Teacher ──────────────────────────────────────────────────────
export function useTeacherCourses(filters: CourseFilters = {}) {
  return useQuery({
    queryKey: ['teacher', 'courses', filters],
    queryFn:  async () => {
      const { data } = await courseApi.teacherList(filters)
      return data
    },
  })
}

export function useTeacherCourse(id: number) {
  return useQuery({
    queryKey: ['teacher', 'courses', id],
    queryFn:  async () => {
      const { data } = await courseApi.teacherShow(id)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => courseApi.create(formData),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['teacher', 'courses'] }),
  })
}

export function useUpdateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      courseApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teacher', 'courses'] }),
  })
}

export function useDeleteCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => courseApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['teacher', 'courses'] }),
  })
}

export function useSubmitForReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => courseApi.submitForReview(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['teacher', 'courses'] }),
  })
}

export function usePublishCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => courseApi.publish(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['teacher', 'courses'] }),
  })
}

// ─── Chapters ─────────────────────────────────────────────────────
export function useChapters(courseId: number) {
  return useQuery({
    queryKey: ['teacher', 'chapters', courseId],
    queryFn:  async () => {
      const { data } = await courseApi.getChapters(courseId)
      return data.data
    },
    enabled: !!courseId,
  })
}

export function useCreateChapter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: number; data: { title: string; description?: string } }) =>
      courseApi.createChapter(courseId, data),
    onSuccess: (_, { courseId }) =>
      qc.invalidateQueries({ queryKey: ['teacher', 'chapters', courseId] }),
  })
}

export function useDeleteChapter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, chapterId }: { courseId: number; chapterId: number }) =>
      courseApi.deleteChapter(courseId, chapterId),
    onSuccess: (_, { courseId }) =>
      qc.invalidateQueries({ queryKey: ['teacher', 'chapters', courseId] }),
  })
}

// ─── Admin ────────────────────────────────────────────────────────
export function useAdminCourses(filters: CourseFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'courses', filters],
    queryFn:  async () => {
      const { data } = await courseApi.adminList(filters)
      return data
    },
  })
}

export function useApproveCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => courseApi.approve(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'courses'] }),
  })
}

export function useRejectCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      courseApi.reject(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'courses'] }),
  })
}