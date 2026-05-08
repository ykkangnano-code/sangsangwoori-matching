import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type MatchRow = {
  id: string
  score: number
  status: string
  seniors: { name: string; region: string | null; desired_job: string | null } | null
  jobs: { title: string; region: string | null; job_type: string | null } | null
}

type Props = {
  searchParams: Promise<{ senior_id?: string }>
}

function scoreLabel(score: number): string {
  if (score >= 80) return '매우 적합'
  if (score >= 60) return '적합'
  return '보통'
}

function scoreBadgeColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800'
  if (score >= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-gray-100 text-gray-600'
}

export default async function RecommendationsPage({ searchParams }: Props) {
  const { senior_id } = await searchParams

  // senior_id가 있으면 해당 시니어 이름 조회
  let seniorName: string | null = null
  if (senior_id) {
    const { data: senior } = await supabase
      .from('seniors')
      .select('name')
      .eq('id', senior_id)
      .single()
    seniorName = senior?.name ?? null
  }

  let query = supabase
    .from('matches')
    .select('id, score, status, seniors(name, region, desired_job), jobs(title, region, job_type)')
    .order('score', { ascending: false })

  if (senior_id) {
    query = query.eq('senior_id', senior_id)
  }

  const { data } = await query
  const matches = (data ?? []) as unknown as MatchRow[]

  const pageTitle = seniorName
    ? `${seniorName} 님께 맞는 일자리`
    : '매칭 추천 목록'

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-600 text-lg mb-6 inline-block">
          ← 홈으로
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
        <p className="text-xl text-gray-500 mb-10">
          점수 높은 순으로 추천 일자리가 표시됩니다.{' '}
          <span className="font-semibold text-gray-700">총 {matches.length}건</span>
        </p>

        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-16 text-center">
            {senior_id ? (
              <>
                <p className="text-2xl text-gray-500 mb-3">현재 매칭되는 일자리가 없습니다.</p>
                <p className="text-xl text-blue-700 font-semibold">
                  담당자가 직접 연락드리니 잠시만 기다려 주세요.
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl text-gray-400 mb-2">매칭 결과가 없습니다.</p>
                <p className="text-lg text-gray-400 mb-8">시니어 프로필을 먼저 등록해 주세요.</p>
                <Link
                  href="/register"
                  className="inline-block py-4 px-10 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-2xl transition-colors"
                >
                  프로필 등록하기
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {matches.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl shadow p-6 flex items-center gap-4 flex-wrap"
              >
                {/* 시니어 정보 */}
                <div className="flex-1 min-w-40">
                  <p className="text-xl font-bold text-gray-900">{m.seniors?.name}</p>
                  <p className="text-base text-gray-500">
                    {m.seniors?.region} · {m.seniors?.desired_job}
                  </p>
                </div>

                <span className="text-gray-300 text-2xl hidden sm:block">→</span>

                {/* 일자리 정보 */}
                <div className="flex-1 min-w-40">
                  <p className="text-xl font-bold text-gray-900">{m.jobs?.title}</p>
                  <p className="text-base text-gray-500">
                    {m.jobs?.region} · {m.jobs?.job_type}
                  </p>
                </div>

                {/* 점수 배지 + 라벨 */}
                <div className="flex flex-col items-center gap-1">
                  <span className={`px-4 py-2 rounded-full text-xl font-bold ${scoreBadgeColor(m.score)}`}>
                    {m.score}점
                  </span>
                  <span className="text-sm font-medium text-gray-500">{scoreLabel(m.score)}</span>
                </div>

                {/* 상태 */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    m.status === 'assigned'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {m.status === 'assigned' ? '배정 완료' : '매칭 대기'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
