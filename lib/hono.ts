import { getAuth } from '@hono/clerk-auth';
import { clerkMiddleware } from '@hono/clerk-auth';
import { hc } from 'hono/client';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

import { AppType } from '@/app/[[...route]]/route';

export const client = hc<AppType>(process.env.NEXT_PUBLIC_APP_URL!);

type AuthEnv = {
  Variables: {
    auth: ReturnType<typeof getAuth>;
  };
};

export const authedMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    throw new HTTPException(401, {
      res: c.json({ error: 'Unauthorized.' }, 401),
    });
  }
  await next();
});

export const clerkMiddlewareWithAuth = [clerkMiddleware(), authedMiddleware];
