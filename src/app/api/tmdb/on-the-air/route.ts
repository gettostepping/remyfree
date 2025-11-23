import { NextRequest, NextResponse } from 'next/server'
import { tmdbGet } from '@/lib/tmdb'

async function getHandler(req: NextRequest) {
  try {
    const data = await tmdbGet<any>('/tv/on_the_air')
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: 'tmdb_error' }, { status: 502 })
  }
}

export const GET = getHandler

