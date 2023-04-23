import { ObjectId } from "https://deno.land/x/mongo@v0.31.2/mod.ts";
import { db } from "../config/database.ts";

interface FriendShema {
  _id?: ObjectId;
  requester: ObjectId;
  acceptor: ObjectId;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const FriendCollection = db.collection<FriendShema>("Friend");
