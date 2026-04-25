import api from '../lib/axios'
import type { ApiSuccess }                    from '../types/auth.types'
import type { LiveClass, JoinUrlResponse, LiveClassFormData } from '../types/liveclass.types'

export const liveClassApi = {
  // Student
  upcoming: () =>
    api.get<ApiSuccess<LiveClass[]>>('/student/live-classes/upcoming'),

  studentJoinUrl: (id: number) =>
    api.get<ApiSuccess<JoinUrlResponse>>(`/student/live-classes/${id}/join`),

  recordJoin: (id: number) =>
    api.post(`/student/live-classes/${id}/joined`),

  recordLeave: (id: number) =>
    api.post(`/student/live-classes/${id}/left`),

  // Teacher
  teacherList: (params = {}) =>
    api.get<{ success: boolean; data: LiveClass[]; meta: any }>(
      '/teacher/live-classes', { params }
    ),

  schedule: (courseId: number, data: LiveClassFormData) =>
    api.post<ApiSuccess<LiveClass>>(`/teacher/courses/${courseId}/live-classes`, data),

  teacherJoinUrl: (id: number) =>
    api.get<ApiSuccess<JoinUrlResponse>>(`/teacher/live-classes/${id}/join`),

  startClass: (id: number) =>
    api.post<ApiSuccess<LiveClass>>(`/teacher/live-classes/${id}/start`),

  endClass: (id: number) =>
    api.post<ApiSuccess<LiveClass>>(`/teacher/live-classes/${id}/end`),

  cancelClass: (id: number, reason?: string) =>
    api.post<ApiSuccess<LiveClass>>(`/teacher/live-classes/${id}/cancel`, { reason }),
}