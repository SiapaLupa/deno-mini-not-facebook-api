import { Context, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";

export const landingRoute = new Router();

landingRoute.get("/", (context: Context) => {
  const { response } = context;
  response.headers.set("Content-Type", "application/json");
  response.body = { message: "HALO" };
});
