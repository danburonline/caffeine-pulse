import type { Express } from "express";
import { createServer } from "http";
import { db } from "@db";
import { drinks, intakes, users } from "@db/schema";
import { eq, and, gte, desc, or } from "drizzle-orm";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Get or create default user
  app.get("/api/user", async (req, res) => {
    try {
      let user = await db.query.users.findFirst();

      if (!user) {
        console.log("No user found, creating default user...");
        const [newUser] = await db.insert(users).values({}).returning();
        user = newUser;
        console.log("Created user:", user);
      }

      res.json(user);
    } catch (error) {
      console.error("Error in /api/user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user preferences
  app.patch("/api/user", async (req, res) => {
    try {
      const { sleepStart, sleepEnd } = req.body;
      const user = await db.query.users.findFirst();
      if (!user) {
        res.status(404).json({ message: "User not found, try refreshing the page" });
        return;
      }

      const [updated] = await db.update(users)
        .set({ sleepStart, sleepEnd })
        .where(eq(users.id, user.id))
        .returning();
      res.json(updated);
    } catch (error) {
      console.error("Error in PATCH /api/user:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  // Get all drinks
  app.get("/api/drinks", async (req, res) => {
    try {
      const user = await db.query.users.findFirst();
      if (!user) {
        await db.insert(users).values({}).returning();
        const allDrinks = await db.query.drinks.findMany({
          where: eq(drinks.isCustom, false),
        });
        res.json(allDrinks);
        return;
      }

      const allDrinks = await db.query.drinks.findMany({
        where: or(
          eq(drinks.userId, user.id),
          eq(drinks.isCustom, false)
        ),
      });
      res.json(allDrinks);
    } catch (error) {
      console.error("Error in GET /api/drinks:", error);
      res.status(500).json({ message: "Failed to fetch drinks" });
    }
  });

  // Create custom drink with color
  app.post("/api/drinks", async (req, res) => {
    try {
      const { name, caffeineAmount, color } = req.body;
      let user = await db.query.users.findFirst();

      if (!user) {
        const [newUser] = await db.insert(users).values({}).returning();
        user = newUser;
      }

      const [drink] = await db.insert(drinks)
        .values({
          name,
          caffeineAmount,
          color,
          isCustom: true,
          userId: user.id,
        })
        .returning();
      res.json(drink);
    } catch (error) {
      console.error("Error in POST /api/drinks:", error);
      res.status(500).json({ message: "Failed to create custom drink" });
    }
  });

  // Log intake with custom timestamp
  app.post("/api/intakes", async (req, res) => {
    try {
      const { drinkId, amount, timestamp } = req.body;
      let user = await db.query.users.findFirst();

      if (!user) {
        const [newUser] = await db.insert(users).values({}).returning();
        user = newUser;
      }

      const [intake] = await db.insert(intakes)
        .values({
          userId: user.id,
          drinkId,
          amount,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
        })
        .returning();
      res.json(intake);
    } catch (error) {
      console.error("Error in POST /api/intakes:", error);
      res.status(500).json({ message: "Failed to log intake" });
    }
  });

  // Get recent intakes
  app.get("/api/intakes", async (req, res) => {
    try {
      let user = await db.query.users.findFirst();

      if (!user) {
        const [newUser] = await db.insert(users).values({}).returning();
        user = newUser;
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
    } catch (error) {
      console.error("Error in GET /api/intakes:", error);
      res.status(500).json({ message: "Failed to fetch intakes" });
    }
  });

  // Initialize default drinks with colors
  app.post("/api/drinks/init", async (req, res) => {
    try {
      const existingDrinks = await db.query.drinks.findMany({
        where: eq(drinks.isCustom, false),
      });

      if (existingDrinks.length === 0) {
        const defaultDrinks = [
          { name: "Coffee (8 oz)", caffeineAmount: 95, color: "hsl(25, 70%, 50%)" },
          { name: "Espresso Shot", caffeineAmount: 64, color: "hsl(0, 70%, 50%)" },
          { name: "Black Tea", caffeineAmount: 47, color: "hsl(200, 70%, 50%)" },
          { name: "Green Tea", caffeineAmount: 28, color: "hsl(150, 70%, 50%)" },
          { name: "Cola (12 oz)", caffeineAmount: 34, color: "hsl(350, 70%, 50%)" },
          { name: "Energy Drink (8 oz)", caffeineAmount: 80, color: "hsl(275, 70%, 50%)" },
        ];

        await db.insert(drinks)
          .values(defaultDrinks.map(d => ({ ...d, isCustom: false })))
          .returning();
      }

      res.json({ message: "Default drinks initialized" });
    } catch (error) {
      console.error("Error in POST /api/drinks/init:", error);
      res.status(500).json({ message: "Failed to initialize default drinks" });
    }
  });

  return httpServer;
}