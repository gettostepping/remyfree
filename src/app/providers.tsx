"use client"
import { SessionProvider } from 'next-auth/react'
import { MiniPlayerProvider } from '@/components/MiniPlayerContext'
import MiniPlayer from '@/components/MiniPlayer'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MiniPlayerProvider>
        {children}
        <MiniPlayer />
      </MiniPlayerProvider>
    </SessionProvider>
  )
}


