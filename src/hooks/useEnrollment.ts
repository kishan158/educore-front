import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { enrollmentApi } from '../api/enrollment.api'

export function useMyEnrollments(filters = {}) {
  return useQuery({
    queryKey: ['student', 'enrollments', filters],
    queryFn:  async () => {
      const { data } = await enrollmentApi.myEnrollments(filters)
      return data
    },
  })
}

export function useEnrollmentStatus(courseId: number) {
  return useQuery({
    queryKey: ['enrollment', 'status', courseId],
    queryFn:  async () => {
      const { data } = await enrollmentApi.checkEnrollment(courseId)
      return data.data
    },
    enabled: !!courseId,
  })
}

export function useCourseProgress(courseId: number) {
  return useQuery({
    queryKey: ['enrollment', 'progress', courseId],
    queryFn:  async () => {
      const { data } = await enrollmentApi.getProgress(courseId)
      return data.data
    },
    enabled: !!courseId,
  })
}

export function useEnrollFree() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (courseId: number) => enrollmentApi.enroll(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student', 'enrollments'] })
      qc.invalidateQueries({ queryKey: ['enrollment', 'status'] })
    },
  })
}

export function useMarkLessonComplete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (lessonId: number) => enrollmentApi.markComplete(lessonId),
    onSuccess: (_, lessonId) => {
      qc.invalidateQueries({ queryKey: ['enrollment', 'progress'] })
      qc.invalidateQueries({ queryKey: ['student', 'enrollments'] })
    },
  })
}

export function useMyStudents(filters = {}) {
  return useQuery({
    queryKey: ['teacher', 'students', filters],
    queryFn:  async () => {
      const { data } = await enrollmentApi.myStudents(filters)
      return data
    },
  })
}