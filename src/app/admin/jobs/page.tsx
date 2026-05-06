import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

const FIELDS = [
  { id: 'title',           label: '직종명',      placeholder: '경비원',      type: 'text'   },
  { id: 'region',          label: '지역',         placeholder: '서울 강남구', type: 'text'   },
  { id: 'job_type',        label: '직종 유형',    placeholder: '경비',        type: 'text'   },
  { id: 'required_career', label: '요구 경력(년)', placeholder: '2',          type: 'number' },
] as const

async function addJob(formData: FormData) {
  'use server'
  await supabase.from('jobs').insert({
    title:           formData.get('title')           as string,
    region:          formData.get('region')          as string,
    job_type:        formData.get('job_type')        as string,
    required_career: Number(formData.get('required_career')),
  })
  revalidatePath('/admin/jobs')
  revalidatePath('/recommendations')
}

async function deleteJob(formData: FormData) {
  'use server'
  await supabase.from('jobs').delete().eq('id', formData.get('jobId') as string)
  revalidatePath('/admin/jobs')
  revalidatePath('/admin')
  revalidatePath('/recommendations')
}

export default async function AdminJobsPage() {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .order('region')
    .order('title')

  return (
    <main className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">일자리 관리</h1>
        <p className="text-lg text-gray-500 mb-10">
          일자리를 등록·삭제합니다.{' '}
          <span className="text-red-500 font-medium">삭제 시 관련 매칭도 함께 삭제됩니다.</span>
        </p>

        {/* 새 일자리 등록 */}
        <section className="bg-white rounded-2xl shadow p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">새 일자리 등록</h2>
          <form action={addJob} className="grid grid-cols-2 gap-5">
            {FIELDS.map(({ id, label, placeholder, type }) => (
              <div key={id} className="flex flex-col gap-1">
                <label className="text-lg font-medium text-gray-700" htmlFor={id}>
                  {label} <span className="text-red-500">*</span>
                </label>
                <input
                  id={id}
                  name={id}
                  type={type}
                  required
                  min={type === 'number' ? 0 : undefined}
                  placeholder={placeholder}
                  className="border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            ))}
            <div className="col-span-2 mt-2">
              <button
                type="submit"
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold rounded-2xl transition-colors"
              >
                + 등록하기
              </button>
            </div>
          </form>
        </section>

        {/* 일자리 목록 */}
        <section className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-5">
            전체 일자리{' '}
            <span className="text-lg font-normal text-gray-400">({jobs?.length ?? 0}건)</span>
          </h2>

          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-base font-semibold text-gray-600">
                <th className="py-3 px-4 text-left rounded-l-xl">직종명</th>
                <th className="py-3 px-4 text-left">지역</th>
                <th className="py-3 px-4 text-left">직종 유형</th>
                <th className="py-3 px-4 text-center">요구 경력</th>
                <th className="py-3 px-4 text-right rounded-r-xl">작업</th>
              </tr>
            </thead>
            <tbody>
              {!jobs?.length ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-lg">
                    등록된 일자리가 없습니다.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4 text-lg font-medium text-gray-900">{job.title}</td>
                    <td className="py-4 px-4 text-base text-gray-600">{job.region}</td>
                    <td className="py-4 px-4 text-base text-gray-600">{job.job_type}</td>
                    <td className="py-4 px-4 text-base text-center text-gray-700">
                      {job.required_career}년
                    </td>
                    <td className="py-4 px-4 text-right">
                      <form action={deleteJob}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-base font-semibold rounded-xl border border-red-200 transition-colors"
                        >
                          삭제
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  )
}
