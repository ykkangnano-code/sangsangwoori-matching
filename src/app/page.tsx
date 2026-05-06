import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">상상우리</h1>
        <p className="text-xl text-gray-600 mb-12">시니어 ↔ 일자리 자동 매칭 시스템</p>

        <div className="flex flex-col gap-5">
          <Link
            href="/register"
            className="block w-full py-5 px-8 bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold rounded-2xl transition-colors shadow-md"
          >
            시니어 프로필 등록
          </Link>
          <Link
            href="/recommendations"
            className="block w-full py-5 px-8 bg-green-600 hover:bg-green-700 text-white text-2xl font-bold rounded-2xl transition-colors shadow-md"
          >
            매칭 추천 목록
          </Link>
          <Link
            href="/admin"
            className="block w-full py-5 px-8 bg-purple-600 hover:bg-purple-700 text-white text-2xl font-bold rounded-2xl transition-colors shadow-md"
          >
            담당자 대시보드
          </Link>
        </div>
      </div>
    </main>
  );
}
