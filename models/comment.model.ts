import { ObjectId } from "https://deno.land/x/mongo@v0.31.2/mod.ts";
import { db } from "../config/database.ts";

export interface CommentSchema {
  _id? : ObjectId;
  body: string;
  user_id?: ObjectId;
  post_id: ObjectId;
  comment?: Array<ObjectId>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  save?: () => void;
}

export const CommentCollection = db.collection<CommentSchema>("Comment");
