import { test, expect } from '@playwright/test'
import { supabase, resetDb } from './helpers'

// 점수 계산: 서울(+40) + 경비(+40) + 경력 5>=3(+20) = 100점

test.beforeEach(async () => {
  await resetDb()
  // 서울/경비/요구경력 3년 공고 1건 세팅
  await supabase.from('jobs').insert({
    title: '서울 아파트 경비원',
    region: '서울',
    job_type: '경비',
    required_career: 3,
  })
})

test('정상 시나리오: 등록 완료 및 100점 매칭 카드 표시', async ({ page }) => {
  await page.goto('/register')

  await page.fill('#name', '테스트시니어')
  await page.selectOption('#region', '서울')
  await page.selectOption('#desired_job', '경비')
  await page.fill('#career_years', '5')

  // API 응답을 가로채 senior_id 획득
  const responsePromise = page.waitForResponse(
    (res) => res.url().includes('/api/seniors') && res.request().method() === 'POST',
  )
  await page.click('button[type=submit]')
  const apiResponse = await responsePromise
  const { senior } = await apiResponse.json()

  // 성공 메시지 확인
  await expect(page.locator('text=등록이 완료되었습니다')).toBeVisible()

  // 추천 목록에서 100점 배지 확인
  await page.goto(`/recommendations?senior_id=${senior.id}`)
  await expect(page.locator('text=100점')).toBeVisible()
})
