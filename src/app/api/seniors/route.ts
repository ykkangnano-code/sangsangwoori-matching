import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { computeScore } from '@/lib/matching'

export async function POST(req: Request) {
  const { name, region, desired_job, career_years } = await req.json()

  const { data: senior, error } = await supabase
    .from('seniors')
    .insert({ name, region, desired_job, career_years: Number(career_years) })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: jobs } = await supabase.from('jobs').select('*')

  if (jobs?.length) {
    const rows = jobs
      .map((job) => ({
        senior_id: senior.id,
        job_id: job.id,
        score: computeScore(senior, job),
        status: 'pending',
      }))
      .filter((r) => r.score >= 40)

    if (rows.length) await supabase.from('matches').insert(rows)
  }

  return NextResponse.json({ senior })
}
