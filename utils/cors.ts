import { Context } from "https://deno.land/x/oak@v12.1.0/mod.ts";

export const cors =
  (origin: Array<string> = ["*"]) =>
  async (context: Context, next: () => Promise<unknown>) => {
    context.response.headers.set(
      "Access-Control-Allow-Origin",
      origin.join(", "),
    );
    await next();
  };
