import { useQuery } from '@tanstack/react-query'
import { certificateApi } from '../api/certificate.api'

export function useMyCertificates() {
  return useQuery({
    queryKey: ['student', 'certificates'],
    queryFn:  async () => {
      const { data } = await certificateApi.myCertificates()
      return data.data
    },
  })
}

export function useVerifyCertificate(hash: string) {
  return useQuery({
    queryKey: ['certificate', 'verify', hash],
    queryFn:  async () => {
      const { data } = await certificateApi.verify(hash)
      return data.data
    },
    enabled: !!hash,
    retry:   false,
  })
}