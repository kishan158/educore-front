import api from '../lib/axios'
import type { ApiSuccess } from '../types/auth.types'
import type { Certificate } from '../types/certificate.types'

export const certificateApi = {
  myCertificates: () =>
    api.get<ApiSuccess<Certificate[]>>('/student/certificates'),

  verify: (hash: string) =>
    api.get<ApiSuccess<Certificate>>(`/certificates/verify/${hash}`),
}