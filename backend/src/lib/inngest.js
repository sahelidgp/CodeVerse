import { Inngest} from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";

export const inngest = new inngest({ id: "code-verse"})

const syncUser = inngest.createFunction(
    {id:"sync-user"},
    {event:"clerk/user.created"},
    async ({event})=>{
        await connectDB()
        const {id,email,first_name,last_name,image_url} = event.data

        const newUser = {
            clerkId:id,
            email:email_addresses,
            name: `${first_name || ""} ${last_name || ""}`,
            profileImage:image_url
        }
        await User.create(newUser);

        //do something later
    }
)
const deleteUserFrom = inngest.createFunction(
    {id:"delete-user-from-db"},
    {event:"clerk/user.created"},
    async ({event})=>{
        await connectDB();

        const { id } = event.data;
        await User.deleteOne({ clerkId: id });

        //todo: do something else
    }
)
export const functions = [syncUser]