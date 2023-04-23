import { Context, Middleware } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.31.2/mod.ts";

import { SessionCollection, UserCollection } from "../models/mod.ts";
import { NotFoundError, UnauthorizedError } from "../errors/mod.ts";

export const authenticate =
  (): Middleware => async (context: Context, next: () => Promise<unknown>) => {
    const { state, cookies, response } = context;
    response.headers.set("Access-Control-Allow-Credentials", "true");
    // await cookies.delete("sessionId", { signed: true });
    const sessionId: string | undefined = await cookies.get("sessionId", {
      signed: true,
    });
    if (!sessionId) throw new UnauthorizedError("Please Login First");
    const session = await SessionCollection.findOne({
      _id: new ObjectId(sessionId),
    });
    if (!session) throw new Error("Session not found");
    const userId = Object.fromEntries(new URLSearchParams(session.value)).user;
    const user = await UserCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw new NotFoundError("User Not Found!");
    state.user = user;
    await next();
  };
