import type { Course } from './course.types'
import type { User }   from './auth.types'

export interface Enrollment {
  id:               number
  progress_percent: number
  is_completed:     boolean
  enrolled_at:      string
  completed_at:     string | null
  last_accessed_at: string | null
  course?:          Course
  user?:            User
}

export interface LessonProgressData {
  completed_lessons: number[]
  watch_times:       Record<number, number>
  progress_percent:  number
  is_completed:      boolean
}

export interface EnrollmentStatus {
  is_enrolled:       boolean
  progress_percent:  number
  is_completed:      boolean
}

export interface MarkCompleteResult {
  progress_percent: number
  course_completed: boolean
}

export interface WatermarkData {
  name:      string
  email:     string
  user_id:   number
  timestamp: string
}

export type CaptureType =
  | 'devtools_open'
  | 'screen_capture_api'
  | 'pip_attempt'
  | 'visibility_hidden'
  | 'right_click'
  | 'keyboard_shortcut'