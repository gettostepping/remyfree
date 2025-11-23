// Minimal shim for API key authentication used by server routes.
// This intentionally returns permissive/no-op values so the app works without API key enforcement.

import { NextRequest } from 'next/server'

export async function verifyApiKey(req: NextRequest | Request): Promise<null | { key: string; permissions?: string[] }> {
  try {
    // Look for an api key in headers or query (compat with earlier implementations)
    // Header name often 'x-api-key' or 'authorization'
    // We'll not enforce any key by default — return null to indicate no API key provided.
    return null
  } catch (err) {
    return null
  }
}

export function hasApiKeyPermission(apiKey: { key: string; permissions?: string[] } | null, permission: string): boolean {
  if (!apiKey) return false
  const perms = apiKey.permissions || []
  return perms.includes(permission) || perms.includes('public.*') || perms.includes('admin')
}

export default { verifyApiKey, hasApiKeyPermission }
