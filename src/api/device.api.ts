import api from '../lib/axios'
import type { ApiSuccess } from '../types/auth.types'
import type { Device, DevicesResponse } from '../types/device.types'

export const deviceApi = {
  list: () =>
    api.get<ApiSuccess<DevicesResponse>>('/devices'),

  trust: (id: number) =>
    api.post<ApiSuccess<Device>>(`/devices/${id}/trust`),

  remove: (id: number) =>
    api.delete<ApiSuccess<null>>(`/devices/${id}`),

  removeAll: () =>
    api.delete<ApiSuccess<null>>('/devices'),
}