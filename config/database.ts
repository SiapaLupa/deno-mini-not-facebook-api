import { Database, MongoClient } from "https://deno.land/x/mongo@v0.31.2/mod.ts";

const DB_URL = "mongodb://127.0.0.1:27017/test";
const client: MongoClient = new MongoClient();

await client.connect(DB_URL);

export const db: Database = client.database("test");
