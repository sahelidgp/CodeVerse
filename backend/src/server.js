import express from "express";
import path from "path"
import dns from "dns";
import { ENV } from './lib/env.js'
import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);

const __dirname = path.resolve()
app.get('/books',(req,res)=>{
    res.status(200).json({msg:"this is the book endpoint"})
})

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