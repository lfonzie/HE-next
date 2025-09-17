import { test, expect } from '@playwright/test'

test.describe('Complete User Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/')
  })

  test.describe('Scenario 1 - Happy Path Complete Flow', () => {
    test('should complete full lesson generation flow', async ({ page }) => {
      // Step 1: Navigate to professor interactive
      await page.click('text=Professor Interativa')
      await expect(page).toHaveURL(/.*professor.*/)

      // Step 2: Enter topic
      await page.fill('input[placeholder*="tópico"]', 'fotossíntese')
      await page.click('button:has-text("Gerar Aula")')

      // Step 3: Wait for classification (should be fast)
      await expect(page.locator('text=Classificando')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=Classificação concluída')).toBeVisible({ timeout: 10000 })

      // Step 4: Wait for TOC generation
      await expect(page.locator('text=Gerando conteúdo')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=Conteúdo gerado')).toBeVisible({ timeout: 15000 })

      // Step 5: Verify slides are rendered
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible({ timeout: 20000 })
      await expect(page.locator('[data-testid="slide-2"]')).toBeVisible({ timeout: 5000 })

      // Step 6: Verify image loading
      await expect(page.locator('[data-testid="slide-1"] img')).toBeVisible({ timeout: 10000 })

      // Step 7: Test navigation
      await page.click('[data-testid="next-slide"]')
      await expect(page.locator('[data-testid="slide-2"]')).toBeVisible()

      await page.click('[data-testid="prev-slide"]')
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible()

      // Step 8: Test keyboard navigation
      await page.keyboard.press('ArrowRight')
      await expect(page.locator('[data-testid="slide-2"]')).toBeVisible()

      await page.keyboard.press('ArrowLeft')
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible()

      // Step 9: Navigate to question slides
      await page.click('[data-testid="slide-4"]')
      await expect(page.locator('[data-testid="question"]')).toBeVisible()
      await expect(page.locator('[data-testid="option"]')).toHaveCount(4)

      // Step 10: Test question interaction
      await page.click('[data-testid="option"]:first-child')
      await expect(page.locator('[data-testid="feedback"]')).toBeVisible()

      // Step 11: Navigate to final slide
      await page.click('[data-testid="slide-9"]')
      await expect(page.locator('[data-testid="lesson-complete"]')).toBeVisible()

      // Step 12: Test footer functionality
      await page.click('[data-testid="restart-lesson"]')
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible()
    })
  })

  test.describe('Scenario 2 - Graceful Degradation', () => {
    test('should handle OpenAI rate limit gracefully', async ({ page }) => {
      // Mock OpenAI rate limit
      await page.route('**/api/professor/generate', async route => {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Rate limit exceeded' })
        })
      })

      await page.click('text=Professor Interativa')
      await page.fill('input[placeholder*="tópico"]', 'matemática')
      await page.click('button:has-text("Gerar Aula")')

      // Should show fallback content
      await expect(page.locator('text=Usando conteúdo de fallback')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible({ timeout: 15000 })
    })

    test('should handle Unsplash failure gracefully', async ({ page }) => {
      // Mock Unsplash failure
      await page.route('**/api/image**', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Image service unavailable' })
        })
      })

      await page.click('text=Professor Interativa')
      await page.fill('input[placeholder*="tópico"]', 'história')
      await page.click('button:has-text("Gerar Aula")')

      // Should complete without images
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible({ timeout: 20000 })
      await expect(page.locator('[data-testid="slide-1"] img')).not.toBeVisible()
    })

    test('should handle network timeout gracefully', async ({ page }) => {
      // Mock network timeout
      await page.route('**/api/router/classify', async route => {
        await new Promise(resolve => setTimeout(resolve, 20000)) // 20s delay
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ classification: 'simples' })
        })
      })

      await page.click('text=Professor Interativa')
      await page.fill('input[placeholder*="tópico"]', 'química')
      await page.click('button:has-text("Gerar Aula")')

      // Should show timeout message and continue
      await expect(page.locator('text=Tempo limite excedido')).toBeVisible({ timeout: 25000 })
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible({ timeout: 30000 })
    })
  })

  test.describe('Scenario 3 - Edge Cases', () => {
    test('should handle very long input', async ({ page }) => {
      const longInput = 'fotossíntese '.repeat(100)

      await page.click('text=Professor Interativa')
      await page.fill('input[placeholder*="tópico"]', longInput)
      await page.click('button:has-text("Gerar Aula")')

      // Should truncate and process
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible({ timeout: 20000 })
    })

    test('should handle special characters', async ({ page }) => {
      const specialInput = 'fotossíntese 🌱 matemática + física = 🧮'

      await page.click('text=Professor Interativa')
      await page.fill('input[placeholder*="tópico"]', specialInput)
      await page.click('button:has-text("Gerar Aula")')

      // Should process successfully
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible({ timeout: 20000 })
    })

    test('should handle empty input', async ({ page }) => {
      await page.click('text=Professor Interativa')
      await page.click('button:has-text("Gerar Aula")')

      // Should show validation error
      await expect(page.locator('text=Por favor, insira um tópico')).toBeVisible()
    })
  })

  test.describe('Performance Tests', () => {
    test('should meet performance benchmarks', async ({ page }) => {
      const startTime = Date.now()

      await page.click('text=Professor Interativa')
      await page.fill('input[placeholder*="tópico"]', 'fotossíntese')
      await page.click('button:has-text("Gerar Aula")')

      // Classification should complete in < 3 seconds
      await expect(page.locator('text=Classificação concluída')).toBeVisible({ timeout: 3000 })
      const classificationTime = Date.now() - startTime
      expect(classificationTime).toBeLessThan(3000)

      // First slide should render in < 15 seconds
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible({ timeout: 15000 })
      const firstSlideTime = Date.now() - startTime
      expect(firstSlideTime).toBeLessThan(15000)

      // Image should load in < 2 seconds
      await expect(page.locator('[data-testid="slide-1"] img')).toBeVisible({ timeout: 2000 })
      const imageTime = Date.now() - startTime
      expect(imageTime).toBeLessThan(17000) // Total time including previous steps
    })

    test('should handle navigation performance', async ({ page }) => {
      // Generate lesson first
      await page.click('text=Professor Interativa')
      await page.fill('input[placeholder*="tópico"]', 'matemática')
      await page.click('button:has-text("Gerar Aula")')
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible({ timeout: 20000 })

      // Test navigation speed
      const navStartTime = Date.now()
      await page.click('[data-testid="next-slide"]')
      await expect(page.locator('[data-testid="slide-2"]')).toBeVisible()
      const navTime = Date.now() - navStartTime
      expect(navTime).toBeLessThan(500) // Navigation should be < 500ms
    })
  })

  test.describe('Accessibility Tests', () => {
    test('should be fully keyboard navigable', async ({ page }) => {
      await page.click('text=Professor Interativa')
      await page.fill('input[placeholder*="tópico"]', 'fotossíntese')

      // Navigate using only keyboard
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')

      // Wait for lesson to generate
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible({ timeout: 20000 })

      // Test keyboard navigation through slides
      await page.keyboard.press('ArrowRight')
      await expect(page.locator('[data-testid="slide-2"]')).toBeVisible()

      await page.keyboard.press('ArrowLeft')
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible()

      await page.keyboard.press(' ')
      await expect(page.locator('[data-testid="slide-2"]')).toBeVisible()
    })

    test('should have proper ARIA labels', async ({ page }) => {
      await page.click('text=Professor Interativa')
      await page.fill('input[placeholder*="tópico"]', 'história')
      await page.click('button:has-text("Gerar Aula")')
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible({ timeout: 20000 })

      // Check ARIA labels
      await expect(page.locator('[data-testid="next-slide"]')).toHaveAttribute('aria-label')
      await expect(page.locator('[data-testid="prev-slide"]')).toHaveAttribute('aria-label')
      await expect(page.locator('[data-testid="slide-1"]')).toHaveAttribute('aria-label')
    })

    test('should work with screen reader', async ({ page }) => {
      // Test with reduced motion for screen reader compatibility
      await page.emulateMedia({ reducedMotion: 'reduce' })

      await page.click('text=Professor Interativa')
      await page.fill('input[placeholder*="tópico"]', 'química')
      await page.click('button:has-text("Gerar Aula")')
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible({ timeout: 20000 })

      // Verify screen reader friendly elements
      await expect(page.locator('[role="main"]')).toBeVisible()
      await expect(page.locator('[role="button"]')).toHaveCount(2) // Next/Prev buttons
    })
  })

  test.describe('Cross-Browser Compatibility', () => {
    test('should work consistently across browsers', async ({ page, browserName }) => {
      await page.click('text=Professor Interativa')
      await page.fill('input[placeholder*="tópico"]', 'física')
      await page.click('button:has-text("Gerar Aula")')

      // Should work the same regardless of browser
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible({ timeout: 20000 })
      await expect(page.locator('[data-testid="slide-1"] img')).toBeVisible({ timeout: 5000 })

      // Test navigation
      await page.click('[data-testid="next-slide"]')
      await expect(page.locator('[data-testid="slide-2"]')).toBeVisible()
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      await page.click('text=Professor Interativa')
      await page.fill('input[placeholder*="tópico"]', 'biologia')
      await page.click('button:has-text("Gerar Aula")')

      // Should work on mobile
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible({ timeout: 20000 })

      // Test touch navigation
      await page.touchscreen.tap(300, 400) // Tap next area
      await expect(page.locator('[data-testid="slide-2"]')).toBeVisible()
    })

    test('should handle orientation changes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.click('text=Professor Interativa')
      await page.fill('input[placeholder*="tópico"]', 'geografia')
      await page.click('button:has-text("Gerar Aula")')
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible({ timeout: 20000 })

      // Change to landscape
      await page.setViewportSize({ width: 667, height: 375 })

      // Should still work
      await expect(page.locator('[data-testid="slide-1"]')).toBeVisible()
      await page.click('[data-testid="next-slide"]')
      await expect(page.locator('[data-testid="slide-2"]')).toBeVisible()
    })
  })
})
