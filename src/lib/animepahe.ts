const DEFAULT_ANIMEPAHE_BASE = 'https://animepaheapitest1.vercel.app'

export function getAnimepaheBaseUrl() {
  const envUrl =
    process.env.ANIMEPAHE_API_BASE_URL ||
    process.env.NEXT_PUBLIC_ANIMEPAHE_API_BASE ||
    DEFAULT_ANIMEPAHE_BASE

  return envUrl.replace(/\/$/, '')
}

interface FetchOptions {
  searchParams?: Record<string, string | number | undefined>
  init?: RequestInit
  revalidate?: number
}

async function requestAnimepahe<T>(
  path: string,
  { searchParams, init, revalidate = 60 }: FetchOptions = {}
): Promise<T> {
  const baseUrl = getAnimepaheBaseUrl()
  const url = new URL(`${baseUrl}${path}`)

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const fullUrl = url.toString()
  console.log('🌐 Animepahe API request:', fullUrl)

  const response = await fetch(fullUrl, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {})
    },
    next: { revalidate }
  })

  const responseText = await response.text()
  console.log('📡 Animepahe API response status:', response.status, response.statusText)
  console.log('📦 Animepahe API response preview:', responseText.substring(0, 500))

  if (!response.ok) {
    throw new Error(
      `Animepahe API error (${response.status} ${response.statusText}): ${responseText}`
    )
  }

  try {
    const json = JSON.parse(responseText)
    return json as T
  } catch (e) {
    console.error('❌ Failed to parse Animepahe API response as JSON:', e)
    throw new Error(`Invalid JSON response from Animepahe API: ${responseText.substring(0, 200)}`)
  }
}

export function searchAnimepahe(query: string, page: number = 1) {
  return requestAnimepahe('/api/search', {
    searchParams: { q: query, page },
    revalidate: 300
  })
}

export function getAnimepaheDetails(session: string) {
  return requestAnimepahe(`/api/${session}`, {
    revalidate: 600
  })
}

export function getAnimepaheReleases(
  session: string,
  sort: string = 'episode_desc',
  page: number = 1
) {
  return requestAnimepahe(`/api/${session}/releases`, {
    searchParams: { sort, page },
    revalidate: 120
  })
}

export function getAnimepahePlay(
  session: string,
  episodeId: string
) {
  // HeroX Animepahe API format: /api/play/:session?episodeId=...
  return requestAnimepahe(`/api/play/${session}`, {
    searchParams: { 
      episodeId
    },
    revalidate: 60
  })
}

export function getAnimepaheAiring(page: number = 1) {
  return requestAnimepahe('/api/airing', {
    searchParams: { page },
    revalidate: 300
  })
}

export function getAnimepaheAnimeList(tab?: string) {
  return requestAnimepahe('/api/anime', {
    searchParams: tab ? { tab } : undefined,
    revalidate: 3600
  })
}

