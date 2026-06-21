import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

export const inngest = new Inngest({ id: "code-verse" });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event, step }) => { // 👈 Added 'step' here

    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    // Stream hates empty names. This ensures they always get a valid string.
    const sanitizedName = `${first_name || ""} ${last_name || ""}`.trim() || "New User";

    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: sanitizedName,
      profileImage: image_url || "",
    };

    // STEP 1: MongoDB Sync
    await step.run("Save to MongoDB", async () => {
      await connectDB();
      await User.findOneAndUpdate(
        { clerkId: id }, 
        newUser,         
        { upsert: true, new: true } 
      );
    });

    // STEP 2: Stream Sync
    await step.run("Save to Stream", async () => {
      await upsertStreamUser({
        id: newUser.clerkId.toString(),
        name: newUser.name,
        image: newUser.profileImage,
      });
    });
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => { // 👈 Added 'step' here
    const { id } = event.data;

    await step.run("Delete from MongoDB", async () => {
      await connectDB();
      await User.deleteOne({ clerkId: id });
    });

    await step.run("Delete from Stream", async () => {
      await deleteStreamUser(id.toString());
    });
  }
);

export const functions = [syncUser, deleteUserFromDB];