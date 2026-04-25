import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo:   any 
  }
}



const appKey = import.meta.env.VITE_REVERB_APP_KEY

// Guard — Echo initialize only if key exists
if (appKey) {
  window.Pusher = Pusher

  window.Echo = new Echo({
    broadcaster:       'reverb',
    key:               appKey,
    wsHost:            import.meta.env.VITE_REVERB_HOST     ?? 'localhost',
    wsPort:            import.meta.env.VITE_REVERB_PORT     ?? 8080,
    wssPort:           import.meta.env.VITE_REVERB_PORT     ?? 8080,
    forceTLS:          false,
    enabledTransports: ['ws', 'wss'],
    authEndpoint:      `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token') ?? ''}`,
      },
    },
  })
} else {
  console.warn('[Echo] VITE_REVERB_APP_KEY not set — WebSocket disabled.')
}

export default window.Echo