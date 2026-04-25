export type PayoutStatus = 'pending' | 'approved' | 'processing' | 'paid' | 'rejected'
export type PayoutMethod = 'bank_transfer' | 'paypal' | 'stripe' | 'manual'

export interface Earning {
  id:              number
  gross_amount:    string
  commission_rate: string
  platform_fee:    string
  net_amount:      string
  currency:        string
  status:          'pending' | 'in_payout' | 'paid'
  created_at:      string
  course?:         { id: number; title: string }
  order?:          { order_number: string; paid_at: string }
}

export interface EarningsSummary {
  total_earned:    number
  total_pending:   number
  total_paid:      number
  total_in_payout: number
  total_sales:     number
}

export interface Payout {
  id:               number
  payout_number:    string
  amount:           string
  currency:         string
  method:           PayoutMethod
  reference:        string | null
  notes:            string | null
  status:           PayoutStatus
  rejection_reason: string | null
  requested_at:     string
  approved_at:      string | null
  paid_at:          string | null
  teacher?:         import('./auth.types').User
  earnings_count?:  number
}

export interface NotificationItem {
  id:          number
  type:        string
  title:       string
  message:     string
  data:        Record<string, any> | null
  action_url:  string | null
  icon:        string | null
  sound:       string | null
  is_read:     boolean
  read_at:     string | null
  created_at:  string
  created_raw: string
}