export type ErrorLevel    = 'debug' | 'info' | 'warning' | 'error' | 'critical'
export type ServerStatus  = 'healthy' | 'warning' | 'critical'

export interface ErrorLogItem {
  id:               number
  level:            ErrorLevel
  level_color:      string
  message:          string
  file:             string | null
  line:             number | null
  url:              string | null
  method:           string | null
  ip_address:       string | null
  environment:      string
  is_resolved:      boolean
  resolution_note:  string | null
  resolved_at:      string | null
  stack_trace?:     string
  context:          Record<string, any> | null
  created_at:       string
  created_human:    string
  user?:            { id: number; name: string } | null
}

export interface ErrorStats {
  by_level:         Record<string, number>
  total_unresolved: number
}

export interface ServerMetrics {
  cpu_usage:           number
  memory_usage:        number
  disk_usage:          number
  memory_total_mb:     number
  memory_used_mb:      number
  disk_total_gb:       number
  disk_used_gb:        number
  queue_jobs_pending:  number
  queue_jobs_failed:   number
  load_average:        number
  php_workers:         number
}

export interface HealthReport {
  server:        ServerMetrics
  status:        ServerStatus
  database:      { status: string; latency_ms?: number; driver: string }
  cache:         { status: string; driver: string }
  queue:         { failed: number; pending: number; driver: string }
  php: {
  version: string
  memory_limit: string
  max_execution: number | string
  extensions: string[]
}
  laravel:       { version: string; environment: string; debug: boolean; uptime: string }
  collected_at:  string
}

export interface MetricHistory { 
  time:    string
  cpu:     number
  memory:  number
  disk:    number
}