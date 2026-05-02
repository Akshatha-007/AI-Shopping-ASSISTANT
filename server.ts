import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "SmartPrice API is running" });
  });

  // Mock Product Search
  app.get("/api/search", (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query required" });

    // Beginner friendly mock data
    const mockProducts = [
      {
        id: "1",
        name: `${q} Pro Max`,
        amazonPrice: 999,
        flipkartPrice: 949,
        rating: 4.8,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
      },
      {
        id: "2",
        name: `${q} Lite`,
        amazonPrice: 499,
        flipkartPrice: 520,
        rating: 4.2,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
      }
    ];
    res.json(mockProducts);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartPrice Server running on http://localhost:${PORT}`);
  });
}

startServer();
