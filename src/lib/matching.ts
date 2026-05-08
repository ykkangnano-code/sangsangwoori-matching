export type SeniorInput = {
  region: string | null
  desired_job: string | null
  career_years: number | null
}

export type JobInput = {
  region: string | null
  job_type: string | null
  required_career: number | null
}

const REGION_MAP: Record<string, string> = {
  '서울특별시': '서울',
  '경기도':     '경기',
  '인천광역시': '인천',
}

const JOB_MAP: Record<string, string> = {
  '경비직': '경비',
  '청소직': '청소',
  '조리직': '조리',
  '돌봄직': '돌봄',
}

function normalizeRegion(v: string | null): string | null {
  if (!v) return null
  const t = v.trim()
  return REGION_MAP[t] ?? t
}

function normalizeJob(v: string | null): string | null {
  if (!v) return null
  const t = v.trim()
  return JOB_MAP[t] ?? t
}

/**
 * 규칙 기반 매칭 점수 계산 (최대 100점)
 * - 지역 일치:  +40  (정규화 후 비교)
 * - 직종 일치:  +40  (정규화 + 부분 문자열 포함)
 * - 경력 충족:  +20
 */
export function computeScore(senior: SeniorInput, job: JobInput): number {
  let score = 0

  const sr = normalizeRegion(senior.region)
  const jr = normalizeRegion(job.region)
  if (sr && jr && sr === jr) score += 40

  const sj = normalizeJob(senior.desired_job)
  const jj = normalizeJob(job.job_type)
  if (sj && jj && (sj.includes(jj) || jj.includes(sj))) score += 40

  if (
    senior.career_years != null &&
    job.required_career != null &&
    senior.career_years >= job.required_career
  ) score += 20

  return score
}
