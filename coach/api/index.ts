import { handle } from 'hono/vercel'
import { app } from '../src/app.js'

export const config = { runtime: 'nodejs' }

const handler = handle(app)
export default handler
