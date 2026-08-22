import type { IncomingMessage, ServerResponse } from 'node:http'
import { app } from '../src/app.js'

export const config = { runtime: 'nodejs' }

// Manual Node<->Web bridge. Avoids adapter body-streaming quirks on Vercel:
// read the raw request body, build a standard Web Request, run app.fetch, write back.
export default async function handler(
  req: IncomingMessage & { url?: string; method?: string },
  res: ServerResponse,
): Promise<void> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const rawBody = Buffer.concat(chunks)

  const method = req.method ?? 'GET'
  const host = req.headers.host ?? 'localhost'
  const proto = (req.headers['x-forwarded-proto'] as string) ?? 'https'
  const url = `${proto}://${host}${req.url ?? '/'}`

  const headers = new Headers()
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((val) => headers.append(k, val))
    else if (v != null) headers.set(k, v)
  }

  const hasBody = method !== 'GET' && method !== 'HEAD' && rawBody.length > 0
  const request = new Request(url, {
    method,
    headers,
    body: hasBody ? rawBody : undefined,
  })

  const response = await app.fetch(request)

  res.statusCode = response.status
  response.headers.forEach((value, key) => res.setHeader(key, value))
  const buf = Buffer.from(await response.arrayBuffer())
  res.end(buf)
}
