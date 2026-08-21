import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { health } from './routes/health.js'
import { scoreHypothesisSource } from './routes/score-hypothesis-source.js'
import { validateIdea } from './routes/validate-idea.js'
import { validateStepInput } from './routes/validate-step-input.js'

export const app = new Hono()

app.use(
  '*',
  cors({
    origin: (origin) => origin ?? '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Tenant'],
    maxAge: 600,
  }),
)

app.route('/v1/health', health)
app.route('/v1/coach/score/hypothesis-source', scoreHypothesisSource)
app.route('/v1/coach/validate/idea', validateIdea)
app.route('/v1/coach/validate/step-input', validateStepInput)
