import { createClient } from '@supabase/supabase-js'

// NEXT_PUBLIC_ 변수는 공개값이므로 테스트 파일에 직접 사용
export const supabase = createClient(
  'https://ewuvwbowytecpmmssdlh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dXZ3Ym93eXRlY3BtbXNzZGxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTA5NDksImV4cCI6MjA5MzU2Njk0OX0.uS8G0EnqoA1WwF9VjRZ2QOBCf5YbIEGy2TiYK5EPyvs',
)

/** 테스트 전 DB 완전 초기화 (matches → seniors → jobs 순서로 FK 제약 준수) */
export async function resetDb() {
  await supabase.from('matches').delete().not('id', 'is', null)
  await supabase.from('seniors').delete().not('id', 'is', null)
  await supabase.from('jobs').delete().not('id', 'is', null)
}
