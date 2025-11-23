import SearchBar from '@/components/SearchBar'
import SectionGrid from '@/components/SectionGrid'
import { getServerSession } from 'next-auth'
// NotSignedIn component removed (authentication disabled)
import AnimatedHomeContent from '@/components/animations/AnimatedHomeContent'

async function fetchJson(path: string) {
  const base = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const res = await fetch(`${base}${path}`, { next: { revalidate: 60 } })
  if (!res.ok) return {results: []}
  return res.json()
}

export default async function Home() {
  const [trendingMovies, trendingTv, trendingAll] = await Promise.all([
    fetchJson('/api/tmdb/trending?type=movie'),
    fetchJson('/api/tmdb/trending?type=tv'),
    fetchJson('/api/tmdb/trending'),
  ])

  // Combine trending movies and TV for "Trending Now"
  const trendingNow = [
    ...(trendingMovies.results || []).slice(0, 10),
    ...(trendingTv.results || []).slice(0, 10)
  ]

  return (
    <AnimatedHomeContent 
      trending={trendingNow}
      trendingMovies={trendingMovies.results || []}
      trendingTv={trendingTv.results || []}
    />
  )
}

