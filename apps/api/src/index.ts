import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { createAuth } from './lib/auth';
import { requireAuth } from './middleware/auth';

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.use(
  "/api/auth/*",
  cors({
    origin: "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
);

export default app
