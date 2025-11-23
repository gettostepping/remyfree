// Minimal shim for auth-related helpers used by server routes.

export function blockPublicApiWrites() {
  // Previously this may have enforced that write operations require authentication.
  // For the public/no-auth mode we return a function that always allows writes.
  return {}
}

export default { blockPublicApiWrites }
