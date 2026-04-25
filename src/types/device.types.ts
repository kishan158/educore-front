export interface Device {
  id:              number
  device_name:     string
  browser:         string
  platform:        string
  ip_address:      string
  is_trusted:      boolean
  last_active_at:  string
  last_active_raw: string
  created_at:      string
}

export interface DevicesResponse {
  data:  Device[]
  limit: number
  count: number
}