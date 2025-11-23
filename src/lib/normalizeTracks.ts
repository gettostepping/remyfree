export type NormalizedTrack = {
  src: string
  label?: string
  kind?: 'subtitles' | 'metadata'
  lang?: string
}

/**
 * Normalize various external subtitle track shapes into a consistent, typed form.
 * - Accepts objects from different servers (may use `proxyUrl`, `url`, `src`, `lang`, `label`, `kind`).
 * - Ensures `kind` is only 'subtitles' or 'metadata'.
 */
export default function normalizeTracks(rawTracks: any[] | undefined): NormalizedTrack[] {
  if (!rawTracks || !Array.isArray(rawTracks)) return []

  return rawTracks
    .map((t: any, index: number) => {
      const src = t?.proxyUrl || t?.url || t?.src
      if (!src) return null

      // Determine label
      const label = t?.label || (t?.lang === 'thumbnails' ? 'Preview' : t?.lang || `Subtitle ${index + 1}`)

      // Normalize kind: prefer explicit 'metadata', otherwise 'subtitles'
      const kind = t?.kind === 'metadata' || t?.lang === 'thumbnails' ? 'metadata' : 'subtitles'

      // Normalize language (if present), keep short iso when possible
      let lang: string | undefined = undefined
      if (t?.lang && typeof t.lang === 'string' && t.lang !== 'thumbnails') {
        lang = t.lang.length <= 2 ? t.lang.toLowerCase() : t.lang.slice(0, 2).toLowerCase()
      } else if (t?.srcLang && typeof t.srcLang === 'string') {
        lang = t.srcLang.length <= 2 ? t.srcLang.toLowerCase() : t.srcLang.slice(0, 2).toLowerCase()
      }

      return { src, label, kind, lang }
    })
    .filter(Boolean) as NormalizedTrack[]
}
