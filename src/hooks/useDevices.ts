import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deviceApi } from '../api/device.api'

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn:  async () => {
      const { data } = await deviceApi.list()
      return data.data
    },
  })
}

export function useTrustDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deviceApi.trust(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['devices'] }),
  })
}

export function useRemoveDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deviceApi.remove(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['devices'] }),
  })
}

export function useRemoveAllDevices() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => deviceApi.removeAll(),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['devices'] }),
  })
}