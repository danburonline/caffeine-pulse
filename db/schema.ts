import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  sleepStart: text("sleep_start").default("22:00").notNull(),
  sleepEnd: text("sleep_end").default("06:00").notNull(),
});

export const drinks = pgTable("drinks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  caffeineAmount: integer("caffeine_amount").notNull(), // in mg
  isCustom: boolean("is_custom").default(false).notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const intakes = pgTable("intakes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  drinkId: integer("drink_id").references(() => drinks.id),
  amount: integer("amount").notNull(), // in mg
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  drinks: many(drinks),
  intakes: many(intakes),
}));

export const drinkRelations = relations(drinks, ({ one }) => ({
  user: one(users, {
    fields: [drinks.userId],
    references: [users.id],
  }),
}));

export const intakeRelations = relations(intakes, ({ one }) => ({
  user: one(users, {
    fields: [intakes.userId],
    references: [users.id],
  }),
  drink: one(drinks, {
    fields: [intakes.drinkId],
    references: [drinks.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users);
export const insertDrinkSchema = createInsertSchema(drinks);
export const insertIntakeSchema = createInsertSchema(intakes);

export const selectUserSchema = createSelectSchema(users);
export const selectDrinkSchema = createSelectSchema(drinks);
export const selectIntakeSchema = createSelectSchema(intakes);

export type User = typeof users.$inferSelect;
export type Drink = typeof drinks.$inferSelect;
export type Intake = typeof intakes.$inferSelect;