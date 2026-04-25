export interface Category {
  id:            number
  name:          string
  slug:          string
  description:   string | null
  icon:          string | null
  color:         string
  image_url:     string | null
  order:         number
  is_active:     boolean
  courses_count: number
  has_children:  boolean
  parent?:       Category | null
  children?:     Category[]
  created_at:    string
}

export interface CategoryFormData {
  name:        string
  slug?:       string
  parent_id?:  number | null
  description?: string
  icon?:       string
  color?:      string
  order?:      number
  is_active?:  boolean
}