import { ANIME } from '@consumet/extensions'

// Use Consumet library fork (actively maintained at https://github.com/zuhaz/consumet.ts)
// Using KickAssAnime provider - available in the zuhaz fork
// Lazy initialization to avoid webpack bundling issues
// Using type assertion to work around webpack's static analysis
let kickassInstance: any = null

function getKickAssAnime() {
  if (!kickassInstance) {
    const KickAssAnimeClass = (ANIME as any).KickAssAnime
    if (typeof KickAssAnimeClass === 'function') {
      kickassInstance = new KickAssAnimeClass()
    } else {
      throw new Error('KickAssAnime is not available in @consumet/extensions')
    }
  }
  return kickassInstance
}

export interface ConsumetSearchResult {
  id: string
  title: string
  image?: string
  releaseDate?: string
  subOrDub?: 'sub' | 'dub'
  [key: string]: any
}

export interface ConsumetAnimeInfo {
  id: string
  title: string
  image?: string
  description?: string
  releaseDate?: string
  status?: string
  totalEpisodes?: number
  episodes?: ConsumetEpisode[]
  [key: string]: any
}

export interface ConsumetEpisode {
  id: string
  number: number
  title?: string
  image?: string
  url?: string
  [key: string]: any
}

export interface ConsumetSource {
  url: string
  quality?: string
  isM3U8?: boolean
  [key: string]: any
}

export interface ConsumetEpisodeSourcesResponse {
  headers?: {
    Referer?: string
    watchsb?: string | null
    'User-Agent'?: string | null
  }
  sources: ConsumetSource[]
  subtitles?: Array<{
    kind?: string
    url: string
    label?: string
    [key: string]: any
  }>
  download?: string | Array<{ url?: string; quality?: string }>
  [key: string]: any
}

/**
 * Search for anime using Consumet library (KickAssAnime provider)
 */
export async function searchConsumet(query: string, page: number = 1): Promise<ConsumetSearchResult[]> {
  try {
    console.log('🔍 Consumet search (KickAssAnime library):', query, 'page:', page)
    
    // Get KickAssAnime instance (lazy initialization)
    const kickass = getKickAssAnime()
    console.log('📚 Library instance check:', {
      isDefined: typeof kickass !== 'undefined',
      hasSearch: typeof kickass?.search === 'function',
      name: kickass?.name
    })
    
    // Add timeout wrapper (30 seconds)
    const searchPromise = kickass.search(query, page)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Search timeout after 30 seconds')), 30000)
    )
    
    const results = await Promise.race([searchPromise, timeoutPromise]) as any
    console.log('📦 Consumet search response received:', {
      hasResults: !!results,
      resultsType: typeof results,
      resultsCount: results?.results?.length || 0,
      hasNextPage: results?.hasNextPage,
      currentPage: results?.currentPage,
      keys: results ? Object.keys(results) : []
    })
    
    // Consumet library returns: { results: [...], currentPage, hasNextPage }
    // Convert library results to our format (handle title as string | ITitle)
    const searchResults = (results?.results || []).map((item: any) => ({
      ...item,
      title: typeof item.title === 'string' ? item.title : item.title?.romaji || item.title?.english || item.title?.native || 'Unknown'
    }))
    console.log('✅ Consumet search results converted:', searchResults.length, 'results')
    
    return searchResults
  } catch (error: any) {
    console.error('❌ Consumet search error:', error)
    console.error('❌ Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      constructor: error?.constructor?.name,
      cause: error?.cause
    })
    throw error
  }
}

/**
 * Get anime details using Consumet library (KickAssAnime provider)
 */
export async function getConsumetAnimeInfo(animeId: string): Promise<ConsumetAnimeInfo> {
  try {
    console.log('📺 Consumet get anime info (KickAssAnime library):', animeId)
    const kickass = getKickAssAnime()
    const info = await kickass.fetchAnimeInfo(animeId)
    
    // Convert library info to our format (handle title as string | ITitle)
    const convertedInfo = {
      ...info,
      title: typeof info.title === 'string' ? info.title : info.title?.romaji || info.title?.english || info.title?.native || 'Unknown'
    }
    
    console.log('✅ Consumet anime info:', {
      title: convertedInfo.title,
      totalEpisodes: convertedInfo.totalEpisodes,
      episodesCount: convertedInfo.episodes?.length || 0
    })
    return convertedInfo
  } catch (error) {
    console.error('❌ Consumet get anime info error:', error)
    throw error
  }
}

/**
 * Get episode sources using Consumet library (KickAssAnime provider)
 * Returns the full response including headers (for Referer) and subtitles
 * 
 * Note: KickAssAnime episode IDs are in format: "anime-slug/episode/ep-1-12cd96"
 * We use the episode ID directly as provided by fetchAnimeInfo
 */
export async function getConsumetEpisodeSources(
  episodeId: string,
  animeId?: string
): Promise<ConsumetEpisodeSourcesResponse> {
  try {
    console.log('🎬 Consumet get episode sources (KickAssAnime library):', {
      episodeId,
      animeId,
      episodeIdFormat: episodeId.includes('/episode/') ? 'KickAssAnime format' : 'Other format'
    })
    
    // KickAssAnime episode IDs can be:
    // - Full URL: "https://kickass-anime.ru/api/show/naruto-f3cf/episode/ep-1-12cd96"
    // - Path: "naruto-f3cf/episode/ep-1-12cd96"
    // fetchEpisodeSources expects just the path, so extract it if it's a full URL
    let episodePath = episodeId
    if (episodeId.startsWith('http://') || episodeId.startsWith('https://')) {
      try {
        const url = new URL(episodeId)
        // Extract path after /api/show/ or just use the pathname
        const pathMatch = url.pathname.match(/\/api\/show\/(.+)$/)
        if (pathMatch) {
          episodePath = pathMatch[1]
          console.log('📝 Extracted episode path from full URL:', {
            original: episodeId,
            extracted: episodePath
          })
        } else {
          // Fallback: use pathname without leading slash
          episodePath = url.pathname.replace(/^\//, '')
        }
      } catch (e) {
        console.warn('⚠️ Failed to parse episode ID as URL, using as-is:', episodeId)
      }
    }
    
    // Use the library's fetchEpisodeSources method
    const kickass = getKickAssAnime()
    const data = await kickass.fetchEpisodeSources(episodePath)
    console.log('✅ Consumet episode sources:', data.sources?.length || 0, 'sources')
    console.log('📋 Consumet response headers:', data.headers)
    console.log('🔑 Consumet Referer header (CRITICAL for bypassing 403):', data.headers?.Referer || 'NOT PROVIDED')
    console.log('📝 Consumet subtitles:', data.subtitles?.length || 0, 'subtitles')
    if (!data.headers?.Referer) {
      console.warn('⚠️ WARNING: Consumet did not provide Referer header! This may cause 403 errors.')
    }
    return data
  } catch (error: any) {
    console.error('❌ Consumet get episode sources error:', error)
    console.error('❌ Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      episodeId
    })
    throw error
  }
}

