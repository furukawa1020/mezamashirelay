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
    {(import.meta.env.VITE_FORCE_LOCAL === '1') ? (
      <LocalAuthProvider>
        <SoundProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </SoundProvider>
      </LocalAuthProvider>
    ) : (
      <AuthProvider>
        <SoundProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </SoundProvider>
      </AuthProvider>
    )}
  </React.StrictMode>
)

// register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/src/sw.js').catch(() => {})
  })
}
