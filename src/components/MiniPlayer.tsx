"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useMiniPlayer } from './MiniPlayerContext'
import VideoPlayer from './VideoPlayer'
import { usePathname, useRouter } from 'next/navigation'

export default function MiniPlayer() {
  const { media, visible, position, size, setMedia, attachTo, setPosition, setSize } = useMiniPlayer()
  const router = useRouter()
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement | null>(null)
  const draggingRef = useRef(false)
  const offsetRef = useRef({ x: 0, y: 0 })
  const [localPos, setLocalPos] = useState(position)
  const [localSize, setLocalSize] = useState(size)
  const localSizeRef = useRef(localSize)
  const resizingRef = useRef(false)
  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0 })

  useEffect(() => setLocalPos(position), [position])
  useEffect(() => setLocalSize(size), [size])
  useEffect(() => {
    localSizeRef.current = localSize
  }, [localSize])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (resizingRef.current) {
        // resizing
        const dx = e.clientX - resizeStartRef.current.x
        const dy = e.clientY - resizeStartRef.current.y
        const newW = Math.max(240, resizeStartRef.current.w + dx)
        const newH = Math.max(135, resizeStartRef.current.h + dy)
        setLocalSize({ w: newW, h: newH })
        console.debug('MiniPlayer:resizing', { newW, newH })
        return
      }
      if (!draggingRef.current) return
      const nx = e.clientX - offsetRef.current.x
      const ny = e.clientY - offsetRef.current.y
      setLocalPos({ x: nx, y: ny })
    }
    const onUp = () => {
      if (resizingRef.current) {
        resizingRef.current = false
        // use ref to ensure latest size is used
        const cur = localSizeRef.current || localSize
        setSize(cur.w, cur.h)
        console.debug('MiniPlayer:resizeEnd', cur)
        return
      }
      if (draggingRef.current) {
        draggingRef.current = false
        setPosition(localPos.x, localPos.y)
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [localPos, setPosition])

  if (!media || !visible) return null
  console.debug('MiniPlayer:render', { media, position })

  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true
    const rect = ref.current?.getBoundingClientRect()
    const offsetX = e.clientX - (rect?.left || 0)
    const offsetY = e.clientY - (rect?.top || 0)
    offsetRef.current = { x: offsetX, y: offsetY }
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    resizingRef.current = true
    resizeStartRef.current = { x: e.clientX, y: e.clientY, w: localSize.w, h: localSize.h }
    console.debug('MiniPlayer:resizeStart', resizeStartRef.current)
  }

  const onDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // route to watch page for this media id and attach back
    router.push(`/watch/${media.id}`)
    attachTo(media.id)
    // dispatch resume event so main player attempts to play
    try {
      window.dispatchEvent(new CustomEvent('mini-player-resume', { detail: { id: media.id } }))
    } catch (err) {
      console.debug('mini-player-resume dispatch failed', err)
    }
  }

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      style={{
        position: 'fixed',
        left: localPos.x,
        top: localPos.y,
        zIndex: 9999,
        width: localSize.w,
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
      }}
      className="rounded overflow-hidden bg-neutral-900 border border-neutral-800"
    >
      <div className="flex items-center justify-between px-2 py-1 bg-neutral-800/60">
        <div className="text-sm text-white truncate" style={{ maxWidth: 220 }}>{media.title || 'Now Playing'}</div>
        <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                try {
                  const currentPath = pathname || ''
                  const watchPath = `/watch/${media.id}`
                  if (currentPath === watchPath || currentPath.startsWith(watchPath + '/')) {
                    // If we're already on the watch page, behave like double-click (navigate/reattach)
                    onDoubleClick(e)
                  } else {
                    // Otherwise just close the mini player
                    setMedia(null)
                  }
                } catch (err) {
                  console.debug('close button conditional failed', err)
                  setMedia(null)
                }
              }}
              className="text-xs px-2 py-1 rounded bg-neutral-700/30 hover:bg-neutral-700 text-white"
              aria-label="Close mini player"
            >
              ✕
            </button>
        </div>
      </div>
      <div style={{ width: `${localSize.w}px`, height: `${localSize.h}px` }} className="bg-black relative">
        <VideoPlayer
          mode={media.mode}
          src={media.mode === 'embed' ? media.src : undefined}
          hlsSrc={media.mode === 'hls' ? media.hlsSrc : undefined}
          hlsTracks={media.hlsTracks}
          title={media.title || ''}
          poster={media.poster}
          onError={() => {
            // hide mini on fatal error
            setMedia(null)
          }}
          isMini={true}
        />
      </div>

      {/* Resize handle pinned to outer container bottom-right */}
      <div
        onMouseDown={handleResizeMouseDown}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 28,
          height: 28,
          cursor: 'nwse-resize',
          pointerEvents: 'auto',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent'
        }}
        aria-hidden
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 3v6h-6" />
          <path d="M21 11v6h-6" />
          <path d="M11 21H5v-6" />
        </svg>
      </div>
    </div>
  )
}
