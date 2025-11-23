// Lightweight shim for next-auth endpoints so client requests do not 404.
// This intentionally avoids real authentication and returns permissive responses.

export async function GET(req: Request) {
	try {
		const url = new URL(req.url)
		const pathname = url.pathname || ''
		// next-auth client requests /api/auth/session
		if (pathname.endsWith('/session')) {
			return new Response(JSON.stringify({ user: null, expires: null }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		}

		// Accept next-auth client logging endpoint
		if (pathname.endsWith('/_log')) {
			return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
		}

		// Default permissive response for other next-auth routes
		return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
	} catch (err) {
		return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
	}
}

export async function POST(req: Request) {
	try {
		const url = new URL(req.url)
		const pathname = url.pathname || ''
		if (pathname.endsWith('/_log')) {
			// just consume logs
			return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
		}

		if (pathname.endsWith('/session')) {
			return new Response(JSON.stringify({ user: null, expires: null }), { status: 200, headers: { 'Content-Type': 'application/json' } })
		}

		return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
	} catch (err) {
		return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
	}
}


