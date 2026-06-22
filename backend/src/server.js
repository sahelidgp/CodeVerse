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
//import sessionRoutes from "./routes/sessionRoute.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const __dirname = path.resolve()
// middleware
app.use(express.json());
//credentials:true means server allows a browser to include cookies on request
app.use(cors({origin:ENV.CLIENT_URL,credentials:true}))
app.use(clerkMiddleware()); // this adds auth field to request object: req.auth()

app.use("/api/inngest",serve({client: inngest, functions}));
app.use("/api/chat", chatRoutes);
//app.use("/api/sessions", sessionRoutes);



//make our app for deployment
if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")))

    app.get("/{*any}",(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"))
    })
}


const startServer = async() => {
    try{
        await connectDB();
        app.listen(ENV.PORT,()=>console.log(`Server is running on port ${ENV.PORT}`));
     
    
    }catch(error){
        console.error("💥Error starting the server",error);
    }   

};
startServer();

