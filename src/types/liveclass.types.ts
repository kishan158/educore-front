export type LiveClassStatus   = 'scheduled' | 'live' | 'ended' | 'cancelled'
export type LiveClassProvider = 'zoom' | 'jitsi' | 'google_meet' | 'custom'

export interface LiveClass {
  id:                  number
  title:               string
  description:         string | null
  provider:            LiveClassProvider
  starts_at:           string
  starts_at_human:     string
  ends_at:             string | null
  duration:            number
  duration_formatted:  string
  status:              LiveClassStatus
  is_upcoming:         boolean
  is_starting_soon:    boolean
  is_recorded:         boolean
  recording_url?:      string
  join_url?:           string
  start_url?:          string
  teacher?: {
    id:         number
    name:       string
    avatar_url: string
  }
  course?: {
    id:    number
    title: string
    slug:  string
  }
  attendances_count?: number
}

export interface JoinUrlResponse {
  url:       string
  provider:  LiveClassProvider
  jwt?:      string
  room?:     string
  type:      'host' | 'moderator' | 'participant'
}

export interface LiveClassFormData {
  title:       string
  description?: string
  provider:    LiveClassProvider
  starts_at:   string
  duration:    number
}