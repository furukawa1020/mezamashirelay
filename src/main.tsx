import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { AuthProvider } from './services/auth'
import LocalAuthProvider from './services/localAuth'
import { SoundProvider } from './services/soundProvider'
import ToastProvider from './components/Toast'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {(import.meta.env.VITE_USE_FIREBASE === '1') ? (
      // Explicit opt-in to Firebase when VITE_USE_FIREBASE=1
      <AuthProvider>
        <SoundProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </SoundProvider>
      </AuthProvider>
    ) : (
      // Default: local-first mode
      <LocalAuthProvider>
        <SoundProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </SoundProvider>
      </LocalAuthProvider>
    )}
  </React.StrictMode>
)

// register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/src/sw.js').catch(() => {})
  })
}
