import type { Express } from "express";
import { createServer } from "http";
import { db } from "@db";
import { drinks, intakes, users } from "@db/schema";
import { eq, and, gte, desc, or } from "drizzle-orm";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Get or create default user
  app.get("/api/user", async (req, res) => {
    let user = await db.query.users.findFirst();
    if (!user) {
      const [newUser] = await db.insert(users).values({}).returning();
      user = newUser;
    }
    res.json(user);
  });

  // Update user preferences
  app.patch("/api/user", async (req, res) => {
    const { sleepStart, sleepEnd } = req.body;
    const user = await db.query.users.findFirst();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const [updated] = await db.update(users)
      .set({ sleepStart, sleepEnd })
      .where(eq(users.id, user.id))
      .returning();
    res.json(updated);
  });

  // Get all drinks
  app.get("/api/drinks", async (req, res) => {
    const user = await db.query.users.findFirst();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const allDrinks = await db.query.drinks.findMany({
      where: or(
        eq(drinks.userId, user.id),
        eq(drinks.isCustom, false)
      ),
    });
    res.json(allDrinks);
  });

  // Create custom drink
  app.post("/api/drinks", async (req, res) => {
    const { name, caffeineAmount } = req.body;
    const user = await db.query.users.findFirst();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const [drink] = await db.insert(drinks)
      .values({
        name,
        caffeineAmount,
        isCustom: true,
        userId: user.id,
      })
      .returning();
    res.json(drink);
  });

  // Log intake
  app.post("/api/intakes", async (req, res) => {
    const { drinkId, amount } = req.body;
    const user = await db.query.users.findFirst();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const [intake] = await db.insert(intakes)
      .values({
        userId: user.id,
        drinkId,
        amount,
      })
      .returning();
    res.json(intake);
  });

  // Get recent intakes
  app.get("/api/intakes", async (req, res) => {
    const user = await db.query.users.findFirst();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentIntakes = await db.query.intakes.findMany({
      where: and(
        eq(intakes.userId, user.id),
        gte(intakes.timestamp, dayAgo)
      ),
      orderBy: desc(intakes.timestamp),
      with: {
        drink: true,
      },
    });
    res.json(recentIntakes);
  });

  // Initialize default drinks if none exist
  app.post("/api/drinks/init", async (req, res) => {
    const existingDrinks = await db.query.drinks.findMany({
      where: eq(drinks.isCustom, false),
    });

    if (existingDrinks.length === 0) {
      const defaultDrinks = [
        { name: "Coffee (8 oz)", caffeineAmount: 95 },
        { name: "Espresso Shot", caffeineAmount: 64 },
        { name: "Black Tea", caffeineAmount: 47 },
        { name: "Green Tea", caffeineAmount: 28 },
        { name: "Cola (12 oz)", caffeineAmount: 34 },
        { name: "Energy Drink (8 oz)", caffeineAmount: 80 },
      ];

      await db.insert(drinks)
        .values(defaultDrinks.map(d => ({ ...d, isCustom: false })))
        .returning();
    }

    res.json({ message: "Default drinks initialized" });
  });

  return httpServer;
}
