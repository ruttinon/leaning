import { test, expect } from '@playwright/test'

test.describe('public smoke', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    await expect(page).toHaveURL(/\/$/)
  })

  test('login page shows form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('courses page loads', async ({ page }) => {
    await page.goto('/courses')
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('student auth smoke', () => {
  test('student can log in and open dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"], input[name="email"]').fill('student@example.com')
    await page.locator('input[type="password"]').fill('student1234')
    await page.locator('form button[type="submit"]').click()

    await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(/แดชบอร์ด|dashboard|คอร์ส|courses/i)
  })
})

test.describe('teacher auth smoke', () => {
  test('teacher can log in and open dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"], input[name="email"]').fill('teacher@example.com')
    await page.locator('input[type="password"]').fill('teacher1234')
    await page.locator('form button[type="submit"]').click()

    await expect(page).toHaveURL(/\/teacher\/dashboard/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(/แดชบอร์ด|dashboard|คอร์ส|courses/i)
  })
})

test.describe('navigation smoke', () => {
  test('courses page shows localized heading', async ({ page }) => {
    await page.goto('/courses')
    await expect(page.locator('h1')).toContainText(/เลือกคอร์ส|Find the right course/i)
  })

  test('teacher can open courses list', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"], input[name="email"]').fill('teacher@example.com')
    await page.locator('input[type="password"]').fill('teacher1234')
    await page.locator('form button[type="submit"]').click()
    await expect(page).toHaveURL(/\/teacher\/dashboard/, { timeout: 15000 })

    await page.goto('/teacher/courses')
    await expect(page.locator('body')).toBeVisible()
    await expect(page).toHaveURL(/\/teacher\/courses/)
  })
})
