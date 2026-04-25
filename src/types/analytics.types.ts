export interface RealtimeStats {
  total_students:      number
  total_teachers:      number
  total_courses:       number
  total_enrollments:   number
  total_revenue:       number
  total_certificates:  number
  today_revenue:       number
  today_enrollments:   number
  today_orders:        number
  today_new_students:  number
  live_classes_active: number
  pending_payouts:     number
}

export interface ChartDataPoint {
  date:        string
  revenue?:    number
  orders?:     number
  count?:      number
  enrollments?: number
}

export interface TopCourse {
  id:             number
  title:          string
  teacher:        string
  category:       string
  category_color: string
  enrollments:    number
  revenue:        number
  rating:         number
  thumbnail_url:  string | null
}

export interface CategoryRevenue {
  category: string
  color:    string
  revenue:  number
  sales:    number
}

export interface TeacherPerformance {
  id:         number
  name:       string
  avatar_url: string
  courses:    number
  students:   number
  revenue:    number
}

export interface TeacherAnalytics {
  chart:             ChartDataPoint[]
  total_students:    number
  total_courses:     number
  published_courses: number
  total_revenue:     number
  period_revenue:    number
}

export interface SiteTheme {
  mode:          'light' | 'dark'
  primary_color: string
  accent_color:  string
  custom_css:    string
  site_name:     string
  site_logo:     string | null
}

export interface SiteSettings {
  [group: string]: {
    [key: string]: {
      value:       any
      type:        string
      label:       string
      description: string | null
      is_public:   boolean
    }
  }
}