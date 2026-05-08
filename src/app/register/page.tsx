'use client'

import { useState } from 'react'
import Link from 'next/link'

const REGIONS   = ['서울', '경기', '인천', '기타'] as const
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타'] as const

type FieldErrors = {
  name?: string
  region?: string
  desired_job?: string
  form?: string
}

const FIELDS = [
  {
    id: 'name',
    label: '이름',
    hint: '어떻게 불러 드릴까요?',
    required: true,
    type: 'input' as const,
  },
  {
    id: 'region',
    label: '지역',
    hint: '어디에서 일하고 싶으세요?',
    required: true,
    type: 'region' as const,
  },
  {
    id: 'desired_job',
    label: '희망 직종',
    hint: '어떤 일을 하시겠어요?',
    required: true,
    type: 'job' as const,
  },
  {
    id: 'career_years',
    label: '경력 (년)',
    hint: '일하신 경험이 얼마나 되세요? (없으시면 0)',
    required: false,
    type: 'number' as const,
  },
]

export default function RegisterPage() {
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [errors,  setErrors]    = useState<FieldErrors>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    const newErrors: FieldErrors = {}
    if (!(fd.get('name') as string)?.trim())  newErrors.name        = '이름을 입력해 주세요.'
    if (!fd.get('region'))                     newErrors.region      = '지역을 선택해 주세요.'
    if (!fd.get('desired_job'))                newErrors.desired_job = '희망 직종을 선택해 주세요.'

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    setErrors({})

    const res = await fetch('/api/seniors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(fd)),
    })

    if (res.ok) {
      setSuccess(true)
    } else {
      const d = await res.json()
      setErrors({ form: d.error ?? '등록 중 오류가 발생했습니다.' })
    }
    setLoading(false)
  }

  const inputBase =
    'w-full border-2 rounded-xl px-5 py-4 text-xl focus:outline-none transition-colors bg-white'

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg p-10">

        <Link href="/" className="text-blue-600 text-lg mb-8 inline-block">
          ← 홈으로
        </Link>

        <h1 className="text-5xl font-bold text-gray-900 mb-2 leading-tight">
          시니어 일자리<br />신청하기
        </h1>
        <p className="text-xl text-gray-500 mb-10">
          아래 정보를 입력하시면 맞는 일자리를 찾아 드립니다.
        </p>

        {success ? (
          <>
            <div className="p-8 bg-green-50 border-2 border-green-400 rounded-2xl text-center">
              <p className="text-3xl font-bold text-green-800 mb-2">✅ 등록이 완료되었습니다.</p>
              <p className="text-xl text-green-700">담당자가 곧 연락드립니다.</p>
            </div>
            <div className="flex gap-4 mt-8">
              <Link
                href="/recommendations"
                className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-2xl text-center transition-colors"
              >
                추천 일자리 보기
              </Link>
              <button
                onClick={() => { setSuccess(false); setErrors({}) }}
                className="flex-1 py-5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xl font-bold rounded-2xl transition-colors"
              >
                다시 신청하기
              </button>
            </div>
          </>
        ) : (
          <>
            {errors.form && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-700 text-lg">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {/* 이름 */}
              <div className="flex flex-col gap-2">
                <label className="text-2xl font-bold text-gray-800" htmlFor="name">
                  이름 <span className="text-red-500">*</span>
                </label>
                <p className="text-lg text-gray-500">어떻게 불러 드릴까요?</p>
                {errors.name && (
                  <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-600 text-lg">
                    {errors.name}
                  </div>
                )}
                <input
                  id="name" name="name" type="text" placeholder="홍길동"
                  className={`${inputBase} ${errors.name ? 'border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                />
              </div>

              {/* 지역 */}
              <div className="flex flex-col gap-2">
                <label className="text-2xl font-bold text-gray-800" htmlFor="region">
                  지역 <span className="text-red-500">*</span>
                </label>
                <p className="text-lg text-gray-500">어디에서 일하고 싶으세요?</p>
                {errors.region && (
                  <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-600 text-lg">
                    {errors.region}
                  </div>
                )}
                <select
                  id="region" name="region" defaultValue=""
                  className={`${inputBase} ${errors.region ? 'border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                >
                  <option value="" disabled>지역을 선택하세요</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* 희망 직종 */}
              <div className="flex flex-col gap-2">
                <label className="text-2xl font-bold text-gray-800" htmlFor="desired_job">
                  희망 직종 <span className="text-red-500">*</span>
                </label>
                <p className="text-lg text-gray-500">어떤 일을 하시겠어요?</p>
                {errors.desired_job && (
                  <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-600 text-lg">
                    {errors.desired_job}
                  </div>
                )}
                <select
                  id="desired_job" name="desired_job" defaultValue=""
                  className={`${inputBase} ${errors.desired_job ? 'border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                >
                  <option value="" disabled>직종을 선택하세요</option>
                  {JOB_TYPES.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>

              {/* 경력 */}
              <div className="flex flex-col gap-2">
                <label className="text-2xl font-bold text-gray-800" htmlFor="career_years">
                  경력 (년)
                </label>
                <p className="text-lg text-gray-500">일하신 경험이 얼마나 되세요? (없으시면 0)</p>
                <input
                  id="career_years" name="career_years" type="number" min={0} placeholder="예: 10"
                  className={`${inputBase} border-gray-300 focus:border-blue-500`}
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-2xl font-bold rounded-2xl transition-colors mt-2"
                style={{ minHeight: 64 }}
              >
                {loading ? '신청 중...' : '신청하기'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
