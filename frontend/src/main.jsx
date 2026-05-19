import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import './utils/i18n.js'
import App from './App.jsx'
import { reportWebVitals } from './utils/monitoring.js'

// Register service worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

// Report web vitals (FCP, LCP, FID, CLS, TTFB)
reportWebVitals()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
