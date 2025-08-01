import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').notNull(),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
}));

// Menambahkan pesan error
export const insertAccountSchema = createInsertSchema(accounts, {
  name: z.string().min(1, { message: 'Nama tidak boleh kosong.' }),
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

// Menambahkan pesan error
export const insertCategorySchema = createInsertSchema(categories, {
  name: z.string().min(1, { message: 'Nama tidak boleh kosong.' }),
});

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  amount: integer('amount').notNull(),
  payee: text('payee').notNull(),
  notes: text('notes'),
  date: timestamp('date', { mode: 'date' }).notNull(),
  accountId: text('account_id')
    .references(() => accounts.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  categoryId: text('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  categories: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

// Menambahkan pesan error
export const insertTransactionSchema = createInsertSchema(transactions, {
  date: z.coerce.date(),
  payee: z.string().min(1, { message: 'Penerima tidak boleh kosong.' }),
  amount: z
    .number()
    .refine((val) => val !== 0, { message: 'Jumlah tidak boleh nol.' }),
});
