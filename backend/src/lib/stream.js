import {StreamChat} from "stream-chat"
import { ENV } from "./env.js"

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;
console.log("Stream API Key exists:", !!apiKey);
console.log("Stream Secret exists:", !!apiSecret);
if(!apiKey || !apiSecret){
    console.log("STREAM_API_KEY or STREAM_API_SECRET is missing")
}

export const chatClient = StreamChat.getInstance(apiKey,apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    console.log("Attempting Stream upsert:", userData);

    const response = await chatClient.upsertUser(userData);

    console.log("Stream upsert success:", response);
  } catch (error) {
    console.error("STREAM UPSERT FAILED");
    console.error(error);
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUser(userId);
    console.log("Stream user deleted successfully:", userId);
  } catch (error) {
    console.error("Error deleting the Stream user:", error);
  }
};