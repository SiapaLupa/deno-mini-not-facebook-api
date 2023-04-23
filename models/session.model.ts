import { ObjectId } from "https://deno.land/x/mongo@v0.31.2/mod.ts";
import { db } from "../config/database.ts";

interface SessionSchema {
  _id: ObjectId;
  value: string;
}

export const SessionCollection = db.collection<SessionSchema>("Session");
