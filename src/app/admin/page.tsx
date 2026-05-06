import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

type Senior = {
  id: string
  name: string
  region: string | null
  desired_job: string | null
  career_years: number | null
}

type MatchRow = {
  id: string
  senior_id: string
  score: number
  status: string
  seniors: { name: string; region: string | null; desired_job: string | null } | null
  jobs: { title: string; region: string | null; job_type: string | null } | null
}

async function assignMatch(formData: FormData) {
  'use server'
  const matchId = formData.get('matchId') as string
  await supabase.from('matches').update({ status: 'assigned' }).eq('id', matchId)
  revalidatePath('/admin')
}

export default async function AdminPage() {
  const [{ data: rawSeniors }, { data: rawMatches }] = await Promise.all([
    supabase.from('seniors').select('*'),
    supabase
      .from('matches')
      .select('id, senior_id, score, status, seniors(name, region, desired_job), jobs(title, region, job_type)')
      .order('score', { ascending: false }),
  ])

  const seniors = (rawSeniors ?? []) as Senior[]
  const matches = (rawMatches ?? []) as unknown as MatchRow[]

  const matchedIds = new Set(matches.map((m) => m.senior_id))
  const unmatched = seniors.filter((s) => !matchedIds.has(s.id))
  const pending  = matches.filter((m) => m.status === 'pending')
  const assigned = matches.filter((m) => m.status === 'assigned')

  const summary = [
    { label: '미매칭',   count: unmatched.length, border: 'border-red-400',    bg: 'bg-red-50',    badge: 'bg-red-100 text-red-700'    },
    { label: '매칭 대기', count: pending.length,  border: 'border-yellow-400', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
    { label: '배정 완료', count: assigned.length, border: 'border-green-400',  bg: 'bg-green-50',  badge: 'bg-green-100 text-green-700'  },
  ]

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">담당자 대시보드</h1>
        <p className="text-lg text-gray-500 mb-10">매칭 현황을 한눈에 확인하고 관리합니다.</p>

        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          {summary.map(({ label, count, border, bg, badge }) => (
            <div key={label} className={`rounded-2xl border-2 ${border} ${bg} p-6 flex items-center justify-between`}>
              <span className="text-2xl font-bold text-gray-800">{label}</span>
              <span className={`px-3 py-1 rounded-full text-xl font-bold ${badge}`}>{count}건</span>
            </div>
          ))}
        </div>

        {/* 미매칭 */}
        <AdminSection title="미매칭" count={unmatched.length}>
          {unmatched.length === 0 ? (
            <EmptyRow />
          ) : (
            unmatched.map((s) => (
              <TableRow key={s.id}>
                <td className="py-4 px-4 text-lg font-medium text-gray-900">{s.name}</td>
                <td className="py-4 px-4 text-base text-gray-600">{s.region ?? '—'}</td>
                <td className="py-4 px-4 text-base text-gray-600">{s.desired_job ?? '—'}</td>
                <td className="py-4 px-4 text-base text-gray-400">—</td>
                <td className="py-4 px-4" />
              </TableRow>
            ))
          )}
        </AdminSection>

        {/* 매칭 대기 */}
        <AdminSection title="매칭 대기" count={pending.length}>
          {pending.length === 0 ? (
            <EmptyRow />
          ) : (
            pending.map((m) => (
              <TableRow key={m.id}>
                <td className="py-4 px-4 text-lg font-medium text-gray-900">{m.seniors?.name}</td>
                <td className="py-4 px-4 text-base text-gray-600">{m.seniors?.region ?? '—'}</td>
                <td className="py-4 px-4 text-base text-gray-600">{m.seniors?.desired_job ?? '—'}</td>
                <td className="py-4 px-4 text-base text-gray-700">
                  {m.jobs?.title} <span className="text-gray-400 text-sm">({m.jobs?.region})</span>
                  <span className="ml-2 text-blue-700 font-semibold">{m.score}점</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <form action={assignMatch}>
                    <input type="hidden" name="matchId" value={m.id} />
                    <button
                      type="submit"
                      className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-base font-semibold rounded-xl transition-colors"
                    >
                      배정 확정
                    </button>
                  </form>
                </td>
              </TableRow>
            ))
          )}
        </AdminSection>

        {/* 배정 완료 */}
        <AdminSection title="배정 완료" count={assigned.length}>
          {assigned.length === 0 ? (
            <EmptyRow />
          ) : (
            assigned.map((m) => (
              <TableRow key={m.id}>
                <td className="py-4 px-4 text-lg font-medium text-gray-900">{m.seniors?.name}</td>
                <td className="py-4 px-4 text-base text-gray-600">{m.seniors?.region ?? '—'}</td>
                <td className="py-4 px-4 text-base text-gray-600">{m.seniors?.desired_job ?? '—'}</td>
                <td className="py-4 px-4 text-base text-gray-700">
                  {m.jobs?.title} <span className="text-gray-400 text-sm">({m.jobs?.region})</span>
                  <span className="ml-2 text-blue-700 font-semibold">{m.score}점</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                    완료
                  </span>
                </td>
              </TableRow>
            ))
          )}
        </AdminSection>
      </div>
    </main>
  )
}

function AdminSection({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-2xl shadow p-8 mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-5">
        {title}{' '}
        <span className="text-lg font-normal text-gray-400">({count}건)</span>
      </h2>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 rounded-xl text-base font-semibold text-gray-600">
            <th className="py-3 px-4 text-left rounded-l-xl">이름</th>
            <th className="py-3 px-4 text-left">지역</th>
            <th className="py-3 px-4 text-left">희망 직종</th>
            <th className="py-3 px-4 text-left">배정 일자리</th>
            <th className="py-3 px-4 text-right rounded-r-xl">작업</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </section>
  )
}

function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50">{children}</tr>
}

function EmptyRow() {
  return (
    <tr>
      <td colSpan={5} className="py-12 text-center text-gray-400">
        <span className="text-4xl block mb-2">📋</span>
        데이터가 없습니다.
      </td>
    </tr>
  )
}
