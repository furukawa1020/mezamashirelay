self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  clients.claim()
})

self.addEventListener('fetch', (event) => {
  // シンプルにネットワークファーストで動かす。必要に応じて拡張。
})
