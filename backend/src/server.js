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
const corsOptions = {
  origin: ENV.NODE_ENV === "production" 
    ? "https://codeverse-wkhy.onrender.com" 
    : ENV.CLIENT_URL,
  credentials: true
};

app.use(cors(corsOptions));
app.use(clerkMiddleware()); 

// API Routes
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);

// Production static file serving
if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    // Standard Express catch-all route for SPA routing
    app.get("*", (req, res) => {
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