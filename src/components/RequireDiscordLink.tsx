"use client"
import React from 'react'

// No-op replacement for RequireDiscordLink
// This intentionally does nothing so pages aren't blocked by authentication requirements.
export default function RequireDiscordLink({ children }: { children?: React.ReactNode }) {
  return null
}

