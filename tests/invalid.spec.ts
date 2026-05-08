import { test, expect } from '@playwright/test'
import { supabase, resetDb } from './helpers'

test.beforeEach(async () => {
  await resetDb()
})

test('실패 시나리오: 이름 누락 시 빨간 안내 박스 표시 및 DB 저장 차단', async ({ page }) => {
  await page.goto('/register')

  // 이름은 비워두고 나머지만 입력
  await page.selectOption('#region', '서울')
  await page.selectOption('#desired_job', '경비')
  await page.fill('#career_years', '3')

  await page.click('button[type=submit]')

  // 이름 필드 위 빨간 안내 박스 확인
  await expect(page.locator('text=이름을 입력해 주세요.')).toBeVisible()

  // seniors 테이블에 레코드가 들어가지 않았음을 확인
  const { count } = await supabase
    .from('seniors')
    .select('*', { count: 'exact', head: true })
  expect(count).toBe(0)
})
