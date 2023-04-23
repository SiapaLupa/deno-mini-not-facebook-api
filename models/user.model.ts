import { ObjectId } from "https://deno.land/x/mongo@v0.31.2/mod.ts";
import { db } from "../config/database.ts";

export interface UserSchema {
  _id?: ObjectId;
  name: string;
  age: string;
  password: string;
  email: string;
  friends: Array<ObjectId>;
  likes: Array<ObjectId>;
}

export const UserCollection = db.collection<UserSchema>("User");
