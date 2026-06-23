import express from "express";
import path from "path";
import dns from "dns";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";
import { ENV } from './lib/env.js';
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const __dirname = path.resolve();

// middleware
app.use(express.json());

// Set CORS based on environment
// Add this as the VERY FIRST app.use() after express.json()
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://codeverse-wkhy.onrender.com",
    "http://localhost:5173"
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(clerkMiddleware()); 

// API Routes
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);


if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    // Using a RegExp object /.*/ ensures Express doesn't try to parse it as a parameter
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}
const startServer = async () => {
    try {
        await connectDB();
        app.listen(ENV.PORT, () => console.log(`Server is running on port ${ENV.PORT}`));
    } catch (error) {
        console.error("💥 Error starting the server", error);
    }
};

startServer();