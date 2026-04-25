export type QuestionType = 'mcq' | 'true_false' | 'short_answer'
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned'

export interface QuizQuestion {
  id:             number
  question:       string
  type:           QuestionType
  options:        string[] | null
  marks:          number
  order:          number
  explanation?:   string
  correct_answer?: string[] // only for teachers
}

export interface Quiz {
  id:                  number
  title:               string
  description:         string | null
  time_limit:          number
  pass_percentage:     number
  max_attempts:        number
  shuffle_questions:   boolean
  show_answers_after:  boolean
  is_published:        boolean
  total_marks:         number
  questions_count:     number
  questions?:          QuizQuestion[]
}

export interface AttemptAnswer {
  id:               number
  question_id:      number
  question?:        string
  given_answer:     string[]
  is_correct:       boolean | null
  marks_awarded:    number
  is_graded:        boolean
  teacher_feedback: string | null
  correct_answer?:  string[]
  explanation?:     string
}

export interface QuizAttempt {
  id:            number
  score:         number
  total_marks:   number
  percentage:    number
  passed:        boolean
  time_taken:    number
  status:        AttemptStatus
  started_at:    string
  submitted_at:  string | null
  quiz?:         Quiz
  answers?:      AttemptAnswer[]
  user?:         import('./auth.types').User
}

export type SubmissionStatus =
  | 'submitted'
  | 'under_review'
  | 'passed'
  | 'failed'
  | 'resubmit_required'

export interface Assignment {
  id:                  number
  title:               string
  description:         string
  instructions:        string | null
  max_marks:           number
  due_date:            string | null
  is_overdue:          boolean
  allowed_file_types:  string[]
  max_file_size_mb:    number
  max_files:           number
  is_published:        boolean
  submissions_count:   number
  lesson?:             { id: number; title: string }
}

export interface Submission {
  id:              number
  notes:           string | null
  file_urls:       string[]
  status:          SubmissionStatus
  status_label:    string
  status_color:    string
  marks_obtained:  number | null
  feedback:        string | null
  submitted_at:    string
  graded_at:       string | null
  student?:        import('./auth.types').User
  assignment?:     Assignment
}