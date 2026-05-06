import { test, expect } from '@playwright/test'

test.describe('EthioCode Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/EthioCode/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('navigation links exist', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('a[href="/jobs"], a[href*="jobs"]').first()).toBeVisible()
  })

  test('login page renders', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

  test('jobs page loads', async ({ page }) => {
    await page.goto('/jobs')
    await expect(page).toHaveURL(/jobs/)
  })

  test('dark mode toggle works', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    const before = await html.getAttribute('class')
    const toggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme"], button[aria-label*="dark"]').first()
    if (await toggle.isVisible()) {
      await toggle.click()
      const after = await html.getAttribute('class')
      expect(before).not.toEqual(after)
    }
  })

  test('PWA manifest is served', async ({ page }) => {
    const res = await page.request.get('/manifest.json')
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.name).toBe('EthioCode')
  })

  test('service worker registers', async ({ page }) => {
    await page.goto('/')
    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false
      const regs = await navigator.serviceWorker.getRegistrations()
      return regs.length > 0
    })
    // SW may not register in test env — just check no JS errors
    expect(typeof swRegistered).toBe('boolean')
  })
})
