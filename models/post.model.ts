import { ObjectId } from "https://deno.land/x/mongo@v0.31.2/mod.ts";
import { db } from "../config/database.ts";

export interface PostSchema {
  _id?: ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  user_id: ObjectId;
  comments?: Array<ObjectId>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  save?: () => Promise<void>;
}

export const PostCollection = db.collection<PostSchema>("Post");
