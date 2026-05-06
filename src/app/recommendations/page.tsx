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

export default async function RecommendationsPage() {
  const { data } = await supabase
    .from('matches')
    .select('id, score, status, seniors(name, region, desired_job), jobs(title, region, job_type)')
    .order('score', { ascending: false })

  const matches = (data ?? []) as unknown as MatchRow[]

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-600 text-lg mb-6 inline-block">
          ← 홈으로
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">매칭 추천 목록</h1>
        <p className="text-lg text-gray-500 mb-10">
          점수 높은 순으로 추천 일자리가 표시됩니다.{' '}
          <span className="font-semibold text-gray-700">총 {matches.length}건</span>
        </p>

        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-16 text-center">
            <p className="text-2xl text-gray-400 mb-2">매칭 결과가 없습니다.</p>
            <p className="text-lg text-gray-400 mb-8">시니어 프로필을 먼저 등록해 주세요.</p>
            <Link
              href="/register"
              className="inline-block py-4 px-10 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-2xl transition-colors"
            >
              프로필 등록하기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {matches.map((m) => {
              const scoreColor =
                m.score >= 80
                  ? 'bg-green-100 text-green-800'
                  : m.score >= 40
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-600'
              return (
                <div key={m.id} className="bg-white rounded-2xl shadow p-6 flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-40">
                    <p className="text-xl font-bold text-gray-900">{m.seniors?.name}</p>
                    <p className="text-base text-gray-500">{m.seniors?.region} · {m.seniors?.desired_job}</p>
                  </div>

                  <span className="text-gray-300 text-2xl hidden sm:block">→</span>

                  <div className="flex-1 min-w-40">
                    <p className="text-xl font-bold text-gray-900">{m.jobs?.title}</p>
                    <p className="text-base text-gray-500">{m.jobs?.region} · {m.jobs?.job_type}</p>
                  </div>

                  <span className={`px-4 py-2 rounded-full text-xl font-bold ${scoreColor}`}>
                    {m.score}점
                  </span>

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
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
