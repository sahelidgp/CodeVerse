import express from "express";
import path from "path"
import { Webhook } from 'svix';
import User from "./models/User.js";
import dns from "dns";
import bodyParser from 'body-parser';

import { ENV } from './lib/env.js'
import { connectDB } from "./lib/db.js";
//import cors from "cors";
// import { serve } from "inngest/express"
// import { inngest, functions } from "./lib/inngest.js";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
//credentials:true means server allows a browser to include cookies on request
//app.use(cors({origin:ENV.CLIENT_URL,credentials:true}))

//app.use("/api/inngest",serve({client: inngest, functions}));

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
app.post('/api/webhooks', bodyParser.raw({ type: 'application/json' }), async function (req, res) {
  try {
    const payloadString = req.body.toString();
    const svixHeaders = req.headers;

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET_KEY);
    const evt = wh.verify(payloadString, svixHeaders);

    const eventType = evt.type;

    if (eventType === 'user.created') {
      // The payload structure you provided shows user data is inside 'data'
      const userData = evt.data; 

      const clerkUserId = userData.id;
      const firstName = userData.first_name || "N/A";
      const lastName = userData.last_name || "N/A";
      // Accessing the nested email array correctly
      const email = userData.email_addresses?.[0]?.email_address || "No Email";

      console.log(`Processing user: ${firstName} ${lastName} (${email})`);

      // Use findOneAndUpdate to prevent duplicates
      const user = await User.findOneAndUpdate(
        { clerkUserId: clerkUserId },
        { 
          $set: { 
            firstName: firstName, 
            lastName: lastName,
            email: email
          } 
        },
        { upsert: true, new: true }
      );

      console.log('✅ User successfully synced to MongoDB:', user.clerkUserId);
    }

    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});