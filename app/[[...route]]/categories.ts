import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import { createId } from '@paralleldrive/cuid2';
import { and, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { categories, insertCategorySchema } from '@/db/schema';

const app = new Hono()
  .get('/', clerkMiddleware(), async (ctx) => {
    const auth = getAuth(ctx);

    if (!auth?.userId) {
      // Respons error
      return ctx.json({ success: false, error: 'Akses ditolak.' }, 401);
    }

    const data = await db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(categories)
      .where(eq(categories.userId, auth.userId));

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
          id: categories.id,
          name: categories.name,
        })
        .from(categories)
        .where(and(eq(categories.userId, auth.userId), eq(categories.id, id)));

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
      insertCategorySchema.pick({
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
        .insert(categories)
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
          .min(1, { message: 'Pilih setidaknya satu kategori untuk dihapus.' }),
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
        .delete(categories)
        .where(
          and(
            eq(categories.userId, auth.userId),
            inArray(categories.id, values.ids)
          )
        )
        .returning({
          id: categories.id,
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
      insertCategorySchema.pick({
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
        .update(categories)
        .set(values)
        .where(and(eq(categories.userId, auth.userId), eq(categories.id, id)))
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
        .delete(categories)
        .where(and(eq(categories.userId, auth.userId), eq(categories.id, id)))
        .returning({
          id: categories.id,
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
