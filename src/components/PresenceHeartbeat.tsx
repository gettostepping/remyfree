'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function PresenceHeartbeat() {
  const { data: session, status } = useSession()
  const pathname = usePathname() 

  return null // This component doesn't render anything
}
