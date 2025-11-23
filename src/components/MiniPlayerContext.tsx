"use client"
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

type SubtitleTrack = {
  src: string
  label?: string
  kind?: 'subtitles' | 'captions' | 'metadata'
  lang?: string
}

type MiniMedia = {
  id: string
  mode: 'embed' | 'hls'
  src?: string
  hlsSrc?: string
  hlsTracks?: SubtitleTrack[]
  title?: string
  poster?: string
}

type MiniPlayerContextType = {
  media: MiniMedia | null
  visible: boolean
  attachedTo: string | null
  position: { x: number; y: number }
  size: { w: number; h: number }
  setMedia: (m: MiniMedia | null, attach?: boolean) => void
  detachFrom: (id: string) => void
  attachTo: (id: string) => void
  setPosition: (x: number, y: number) => void
  setSize: (w: number, h: number) => void
}

const MiniPlayerContext = createContext<MiniPlayerContextType | undefined>(undefined)

export function MiniPlayerProvider({ children }: { children: React.ReactNode }) {
  const [media, setMediaState] = useState<MiniMedia | null>(null)
  const [visible, setVisible] = useState(false)
  const [attachedTo, setAttachedTo] = useState<string | null>(null)
  const [position, setPositionState] = useState<{ x: number; y: number }>({ x: 20, y: 80 })
  const [size, setSizeState] = useState<{ w: number; h: number }>({ w: 420, h: 236 })

  const setMedia = useCallback((m: MiniMedia | null, attach = false) => {
    console.debug('MiniPlayer:setMedia', { media: m, attach })
    setMediaState(m)
    if (m && !attach) {
      setVisible(true)
      setAttachedTo(null)
    } else if (m && attach) {
      // media provided and should be attached to main player
      setAttachedTo(m.id)
      setVisible(false)
    } else if (!m) {
      setVisible(false)
      setAttachedTo(null)
    }
  }, [])

  const detachFrom = useCallback((id: string) => {
    console.debug('MiniPlayer:detachFrom', { id, attachedTo })
    // If the main player for `id` is unmounting, keep media and show mini
    // Always show the mini when asked to detach; clear attachment if it matched
    setVisible(true)
    if (attachedTo === id) {
      setAttachedTo(null)
    }
  }, [attachedTo])

  const attachTo = useCallback((id: string) => {
    console.debug('MiniPlayer:attachTo', { id, media })
    // Attach the media to a main page with this id
    if (media && media.id === id) {
      setAttachedTo(id)
      setVisible(false)
    } else {
      // If there's media but ids don't match, attach anyway and update id
      if (media) {
        setMediaState({ ...media, id })
      }
      setAttachedTo(id)
      setVisible(false)
    }
  }, [media])

  const setPosition = useCallback((x: number, y: number) => {
    setPositionState({ x, y })
  }, [])

  const setSize = useCallback((w: number, h: number) => {
    // clamp reasonable sizes
    const minW = 240
    const minH = 135
    const maxW = Math.max(240, Math.min(w, window.innerWidth - 40))
    const maxH = Math.max(135, Math.min(h, window.innerHeight - 80))
    setSizeState({ w: Math.max(minW, maxW), h: Math.max(minH, maxH) })
  }, [])

  useEffect(() => {
    // Close mini if media removed
    if (!media) {
      setVisible(false)
    }
  }, [media])

  return (
    <MiniPlayerContext.Provider
      value={{ media, visible, attachedTo, position, size, setMedia, detachFrom, attachTo, setPosition, setSize }}
    >
      {children}
    </MiniPlayerContext.Provider>
  )
}

export function useMiniPlayer() {
  const ctx = useContext(MiniPlayerContext)
  if (!ctx) throw new Error('useMiniPlayer must be used within MiniPlayerProvider')
  return ctx
}

export default MiniPlayerContext
