import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/health).*)'],
}

export function middleware(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER
  const pass = process.env.BASIC_AUTH_PASSWORD

  if (!user || !pass) return NextResponse.next()

  const header = req.headers.get('authorization')
  if (header) {
    const b64 = header.split(' ')[1] ?? ''
    const [u, p] = Buffer.from(b64, 'base64').toString().split(':')
    if (u === user && p === pass) return NextResponse.next()
  }

  return new NextResponse('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="exp-os preview"' },
  })
}
