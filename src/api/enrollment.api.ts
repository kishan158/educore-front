import api from '../lib/axios'
import type { ApiSuccess }        from '../types/auth.types'
import type {
  Enrollment,
  EnrollmentStatus,
  LessonProgressData,
  MarkCompleteResult,
  WatermarkData,
  CaptureType,
} from '../types/enrollment.types'

export const enrollmentApi = {
  // Student
  myEnrollments: (params = {}) =>
    api.get<{ success: boolean; data: Enrollment[]; meta: any }>(
      '/student/enrollments', { params }
    ),

  enroll: (courseId: number) =>
    api.post<ApiSuccess<Enrollment>>('/student/enrollments', { course_id: courseId }),

  checkEnrollment: (courseId: number) =>
    api.get<ApiSuccess<EnrollmentStatus>>(
      `/student/enrollments/${courseId}/check`
    ),

  getProgress: (courseId: number) =>
    api.get<ApiSuccess<LessonProgressData>>(
      `/student/enrollments/${courseId}/progress`
    ),

  markComplete: (lessonId: number) =>
    api.post<ApiSuccess<MarkCompleteResult>>('/student/lessons/complete', {
      lesson_id: lessonId,
    }),

  updateWatchTime: (lessonId: number, seconds: number) =>
    api.post<ApiSuccess<null>>('/student/lessons/watch-time', {
      lesson_id: lessonId,
      seconds,
    }),

  // Teacher
  myStudents: (params = {}) =>
    api.get<{ success: boolean; data: Enrollment[]; meta: any }>(
      '/teacher/students', { params }
    ),

  // Screen protection
  logCaptureAttempt: (type: CaptureType, lessonId?: number, meta?: object) =>
    api.post<ApiSuccess<null>>('/screen-protection/log', {
      type,
      lesson_id: lessonId,
      meta,
    }),

  getWatermark: () =>
    api.get<ApiSuccess<WatermarkData>>('/screen-protection/watermark'),
}