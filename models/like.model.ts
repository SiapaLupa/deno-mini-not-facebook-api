import { ObjectId } from "https://deno.land/x/mongo@v0.31.2/mod.ts";
import { db } from "../config/database.ts";

export interface LikeSchema {
  _id?: ObjectId;
  post_id: ObjectId;
  user_id: ObjectId;
}

export const LikeCollection = db.collection<LikeSchema>("Like");
