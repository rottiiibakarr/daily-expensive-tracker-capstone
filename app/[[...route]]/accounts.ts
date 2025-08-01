import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import { createId } from '@paralleldrive/cuid2';
import { and, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { accounts, insertAccountSchema } from '@/db/schema';

const app = new Hono()
  .get('/', clerkMiddleware(), async (ctx) => {
    const auth = getAuth(ctx);

    if (!auth?.userId) {
      // Respons error
      return ctx.json({ success: false, error: 'Akses ditolak.' }, 401);
    }

    const data = await db
      .select({
        id: accounts.id,
        name: accounts.name,
      })
      .from(accounts)
      .where(eq(accounts.userId, auth.userId));

    return ctx.json({ data });
  })
  .get(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid('param');

      if (!id) {
        return ctx.json({ success: false, error: 'ID tidak ditemukan.' }, 400);
      }

      if (!auth?.userId) {
        // Respons error
        return ctx.json({ success: false, error: 'Akses ditolak.' }, 401);
      }

      const [data] = await db
        .select({
          id: accounts.id,
          name: accounts.name,
        })
        .from(accounts)
        .where(and(eq(accounts.userId, auth.userId), eq(accounts.id, id)));

      if (!data) {
        return ctx.json(
          { success: false, error: 'Data tidak ditemukan.' },
          404
        );
      }
      return ctx.json({ data });
    }
  )
  .post(
    '/',
    clerkMiddleware(),
    zValidator(
      'json',
      insertAccountSchema.pick({
        name: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const values = ctx.req.valid('json');

      if (!auth?.userId) {
        // Respons error
        return ctx.json({ success: false, error: 'Akses ditolak.' }, 401);
      }

      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(),
          userId: auth.userId,
          ...values,
        })
        .returning();

      return ctx.json({ data });
    }
  )
  .post(
    '/bulk-delete',
    clerkMiddleware(),
    zValidator(
      'json',
      z.object({
        // Perbaikan pada array untuk memastikan tidak kosong
        ids: z
          .array(z.string())
          .min(1, { message: 'Pilih setidaknya satu akun untuk dihapus.' }),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const values = ctx.req.valid('json');

      if (!auth?.userId) {
        // Respons error
        return ctx.json({ success: false, error: 'Akses ditolak.' }, 401);
      }

      const data = await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.userId, auth.userId),
            inArray(accounts.id, values.ids)
          )
        )
        .returning({
          id: accounts.id,
        });

      return ctx.json({ data });
    }
  )
  .patch(
    '/:id',
    clerkMiddleware(),
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
      })
    ),
    zValidator(
      'json',
      insertAccountSchema.pick({
        name: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid('param');
      const values = ctx.req.valid('json');

      if (!id) {
        return ctx.json({ success: false, error: 'ID tidak ditemukan.' }, 400);
      }

      if (!auth?.userId) {
        // Respons error
        return ctx.json({ success: false, error: 'Akses ditolak.' }, 401);
      }

      const [data] = await db
        .update(accounts)
        .set(values)
        .where(and(eq(accounts.userId, auth.userId), eq(accounts.id, id)))
        .returning();

      if (!data) {
        return ctx.json(
          { success: false, error: 'Data tidak ditemukan.' },
          404
        );
      }

      return ctx.json({ data });
    }
  )
  .delete(
    '/:id',
    clerkMiddleware(),
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid('param');

      if (!id) {
        return ctx.json({ success: false, error: 'ID tidak ditemukan.' }, 400);
      }

      if (!auth?.userId) {
        // Respons error
        return ctx.json({ success: false, error: 'Akses ditolak.' }, 401);
      }

      const [data] = await db
        .delete(accounts)
        .where(and(eq(accounts.userId, auth.userId), eq(accounts.id, id)))
        .returning({
          id: accounts.id,
        });

      if (!data) {
        return ctx.json(
          { success: false, error: 'Data tidak ditemukan.' },
          404
        );
      }

      return ctx.json({ data });
    }
  );

export default app;
