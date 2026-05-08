import { test, expect } from '@playwright/test'
import { resetDb, supabase } from './helpers'

// 점수 계산: 서울 vs 기타(0) + 경비 vs 기타(0) + 경력 3>=0(+20) = 20점
// 매칭 임계값 40점 미만 → 매칭 미생성

test.beforeEach(async () => {
  await resetDb()
  // 절대 안 맞는 공고: 기타/기타/요구경력 0년
  await supabase.from('jobs').insert({
    title: '기타 업무',
    region: '기타',
    job_type: '기타',
    required_career: 0,
  })
})

test('엣지 시나리오: 매칭 조건 미충족 시 안내 메시지 표시', async ({ page }) => {
  await page.goto('/register')

  await page.fill('#name', '테스트시니어엣지')
  await page.selectOption('#region', '서울')
  await page.selectOption('#desired_job', '경비')
  await page.fill('#career_years', '3')

  const responsePromise = page.waitForResponse(
    (res) => res.url().includes('/api/seniors') && res.request().method() === 'POST',
  )
  await page.click('button[type=submit]')
  const apiResponse = await responsePromise
  const { senior } = await apiResponse.json()

  // senior_id 필터로 추천 목록 조회 → 매칭 없음 안내
  await page.goto(`/recommendations?senior_id=${senior.id}`)
  await expect(page.locator('text=현재 매칭되는 일자리가 없습니다.')).toBeVisible()
})
