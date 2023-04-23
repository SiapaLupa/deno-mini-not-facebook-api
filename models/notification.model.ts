import { ObjectId } from "https://deno.land/x/mongo@v0.31.2/mod.ts";
import { db } from "../config/database.ts";

export interface NotificationSchema {
  _id?: ObjectId;
  user_id: ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}

export const NotificationCollection = db.collection<NotificationSchema>(
  "Notification",
);
