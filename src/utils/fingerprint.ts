import FingerprintJS from '@fingerprintjs/fingerprintjs'

let cachedFingerprint: string | null = null

export async function getFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint

  const stored = localStorage.getItem('device_fingerprint')
  if (stored) {
    cachedFingerprint = stored
    return stored
  }

  const fp     = await FingerprintJS.load()
  const result = await fp.get()
  const id     = result.visitorId

  localStorage.setItem('device_fingerprint', id)
  cachedFingerprint = id

  return id
}