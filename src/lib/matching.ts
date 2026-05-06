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

/**
 * 규칙 기반 매칭 점수 계산 (최대 100점)
 * - 지역 일치:  +40
 * - 직종 일치:  +40  (부분 문자열 포함)
 * - 경력 충족:  +20
 */
export function computeScore(senior: SeniorInput, job: JobInput): number {
  let score = 0

  if (senior.region && job.region && senior.region.trim() === job.region.trim()) {
    score += 40
  }

  if (senior.desired_job && job.job_type) {
    const s = senior.desired_job.trim()
    const j = job.job_type.trim()
    if (s.includes(j) || j.includes(s)) score += 40
  }

  if (senior.career_years != null && job.required_career != null && senior.career_years >= job.required_career) {
    score += 20
  }

  return score
}
