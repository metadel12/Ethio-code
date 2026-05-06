/**
 * Error tracking (Sentry-compatible) + Performance monitoring
 * Set VITE_SENTRY_DSN in .env to enable real Sentry reporting.
 */

const DSN = import.meta.env.VITE_SENTRY_DSN

let _sentry = null
const getSentry = async () => {
  if (!DSN) return null
  if (_sentry) return _sentry
  try {
    // Only runs if @sentry/react is installed and VITE_SENTRY_DSN is set
    const pkg = '@sentry/react'
    const Sentry = await import(/* @vite-ignore */ pkg)
    Sentry.init({ dsn: DSN, environment: import.meta.env.MODE, tracesSampleRate: 0.2 })
    _sentry = Sentry
    return Sentry
  } catch {
    return null
  }
}

export const captureError = async (error, context = {}) => {
  console.error('[Error]', error, context)
  const s = await getSentry()
  if (s) s.captureException(error, { extra: context })
}

export const captureMessage = async (msg, level = 'info') => {
  const s = await getSentry()
  if (s) s.captureMessage(msg, level)
}

export const setUser = async (user) => {
  const s = await getSentry()
  if (s) s.setUser(user ? { id: String(user.user_id), email: user.sub } : null)
}

// ── Performance monitoring ────────────────────────────────────────────────────
const _metrics = []

export const measurePerf = (name, fn) => async (...args) => {
  const t0 = performance.now()
  try {
    return await fn(...args)
  } finally {
    const ms = Math.round(performance.now() - t0)
    _metrics.push({ name, ms, ts: Date.now() })
    if (_metrics.length > 500) _metrics.shift()
    if (import.meta.env.DEV && ms > 150) {
      console.warn(`[Perf] ${name} took ${ms}ms`)
    }
  }
}

export const getMetrics = () => [..._metrics]

// ── Web Vitals reporting ──────────────────────────────────────────────────────
export const reportWebVitals = async () => {
  if (!('PerformanceObserver' in window)) return
  const targets = { FCP: 800, LCP: 1500, FID: 50, CLS: 0.05, TTI: 2000 }

  const report = (name, value) => {
    const target = targets[name]
    const pass = target ? (name === 'CLS' ? value <= target : value <= target) : true
    if (import.meta.env.DEV) {
      console.log(`[Vitals] ${name}: ${typeof value === 'number' ? Math.round(value) : value}ms ${pass ? '✅' : '⚠️'}`)
    }
  }

  try {
    const { onFCP, onLCP, onFID, onCLS, onTTFB } = await import('web-vitals')
    onFCP(({ value }) => report('FCP', value))
    onLCP(({ value }) => report('LCP', value))
    onFID(({ value }) => report('FID', value))
    onCLS(({ value }) => report('CLS', value))
    onTTFB(({ value }) => report('TTFB', value))
  } catch { /* web-vitals not installed */ }
}
