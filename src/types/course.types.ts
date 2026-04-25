import type { User }     from './auth.types'
import type { Category } from './category.types'

export type CourseLevel    = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type CourseStatus   = 'draft' | 'pending' | 'approved' | 'rejected' | 'published'
export type LessonType     = 'video' | 'text' | 'pdf' | 'live' | 'quiz'

export interface Lesson {
  id:                  number
  title:               string
  type:                LessonType
  order:               number
  duration:            number
  duration_formatted:  string
  is_preview:          boolean
  is_published:        boolean
  video_url?:          string
  video_provider?:     string
  content?:            string
  pdf_url?:            string
}

export interface Chapter {
  id:            number
  title:         string
  description:   string | null
  order:         number
  is_published:  boolean
  lessons_count: number
  duration:      number
  lessons?:      Lesson[]
}

export interface Course {
  id:                 number
  title:              string
  slug:               string
  short_description:  string
  description?:       string
  thumbnail_url:      string | null
  preview_video:      string | null
  level:              CourseLevel
  language:           string
  is_free:            boolean
  price:              string
  discount_price:     string | null
  effective_price:    number
  currency:           string
  requirements:       string[]
  outcomes:           string[]
  tags:               string[]
  total_lessons:      number
  total_duration:     number
  duration_formatted: string
  enrollments_count:  number
  rating_avg:         string
  rating_count:       number
  status:             CourseStatus
  status_label:       string
  status_color:       string
  is_published:       boolean
  is_featured:        boolean
  is_approved:        boolean
  rejection_reason?:  string
  published_at:       string | null
  teacher?:           User
  category?:          Category
  chapters?:          Chapter[]
  created_at:         string
  updated_at:         string
}

export interface CourseFilters {
  search?:      string
  category_id?: number
  level?:       CourseLevel | ''
  language?:    string
  status?:      CourseStatus | ''
  is_free?:     boolean
  is_featured?: boolean
  per_page?:    number
  page?:        number
}

export interface CourseMeta {
  current_page: number
  last_page:    number
  per_page:     number
  total:        number
}

export interface CourseFormData {
  title:             string
  category_id:       number
  short_description: string
  description?:      string
  level:             CourseLevel
  language:          string
  is_free:           boolean
  price:             number
  discount_price?:   number
  currency:          string
  requirements:      string[]
  outcomes:          string[]
  tags:              string[]
  preview_video?:    string
}

export const LEVEL_OPTIONS = [
  { value: 'beginner',     label: 'Beginner',     color: 'bg-green-100 text-green-700' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-700' },
  { value: 'advanced',     label: 'Advanced',     color: 'bg-orange-100 text-orange-700' },
  { value: 'expert',       label: 'Expert',       color: 'bg-red-100 text-red-700' },
] as const

export const STATUS_OPTIONS = [
  { value: 'draft',     label: 'Draft',           color: 'bg-gray-100 text-gray-600' },
  { value: 'pending',   label: 'Pending Review',  color: 'bg-amber-100 text-amber-700' },
  { value: 'approved',  label: 'Approved',        color: 'bg-blue-100 text-blue-700' },
  { value: 'rejected',  label: 'Rejected',        color: 'bg-red-100 text-red-600' },
  { value: 'published', label: 'Published',       color: 'bg-green-100 text-green-700' },
] as const

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ur', label: 'Urdu' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
] as const