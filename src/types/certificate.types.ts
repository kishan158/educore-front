export interface Certificate {
  id:                  number
  certificate_number:  string
  issued_at:           string
  issued_at_human:     string
  pdf_url:             string | null
  verification_url:    string
  course?: {
    id:            number
    title:         string
    thumbnail_url: string | null
    teacher:       { name: string }
  }
  user?: {
    id:   number
    name: string
  }
}