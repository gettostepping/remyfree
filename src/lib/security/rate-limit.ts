// Minimal shim for rate limiting utilities.

import { NextRequest, NextResponse } from 'next/server'

export const rateLimiters = {
  // apiKey limiter: return null when allowed, or a NextResponse when throttled
  apiKey: async (req: NextRequest | Request) => {
    return null
  },

  // generic limiter placeholder
  generic: async (req: NextRequest | Request) => null,
}

export default rateLimiters
