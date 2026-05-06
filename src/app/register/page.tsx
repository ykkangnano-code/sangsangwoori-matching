'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const FIELDS = [
  { id: 'name',         label: '이름',       placeholder: '홍길동',         type: 'text'   },
  { id: 'region',       label: '지역',       placeholder: '예: 서울 강남구', type: 'text'   },
  { id: 'desired_job',  label: '희망 직종',  placeholder: '예: 경비, 청소',  type: 'text'   },
  { id: 'career_years', label: '경력 (년)', placeholder: '예: 10',          type: 'number' },
] as const

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/seniors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(fd)),
    })

    if (res.ok) {
      router.push('/recommendations')
    } else {
      const d = await res.json()
      setError(d.error ?? '등록 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-lg p-10">
        <Link href="/" className="text-blue-600 text-lg mb-6 inline-block">
          ← 홈으로
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">시니어 프로필 등록</h1>
        <p className="text-lg text-gray-500 mb-10">
          정보를 입력하시면 적합한 일자리를 안내해 드립니다.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-700 text-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {FIELDS.map(({ id, label, placeholder, type }) => (
            <div key={id} className="flex flex-col gap-2">
              <label className="text-2xl font-semibold text-gray-800" htmlFor={id}>
                {label} <span className="text-red-500">*</span>
              </label>
              <input
                id={id}
                name={id}
                type={type}
                required
                min={type === 'number' ? 0 : undefined}
                placeholder={placeholder}
                className="w-full border-2 border-gray-300 rounded-xl px-5 py-4 text-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-2xl font-bold rounded-2xl transition-colors mt-2"
          >
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </form>
      </div>
    </main>
  )
}
