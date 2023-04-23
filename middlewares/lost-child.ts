import { Context, Middleware } from "https://deno.land/x/oak@v12.1.0/mod.ts";

export const lostChild: Middleware = (context: Context) => {
    context.response.body = { message: "Look like you are lost, because the destination is not found" }
}