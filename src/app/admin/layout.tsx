import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="sticky top-0 z-10 bg-purple-700 text-white px-6 py-3 flex items-center gap-6 shadow-md">
        <span className="text-xl font-bold mr-2">관리자</span>
        <Link href="/admin" className="text-lg hover:text-purple-200 transition-colors">
          매칭 현황
        </Link>
        <Link href="/admin/jobs" className="text-lg hover:text-purple-200 transition-colors">
          일자리 관리
        </Link>
        <Link href="/" className="ml-auto text-base text-purple-300 hover:text-white transition-colors">
          ← 홈
        </Link>
      </nav>
      {children}
    </>
  )
}
