import { Context, Middleware } from "https://deno.land/x/oak@v12.1.0/mod.ts";

export const logger: Middleware = async (
  context: Context,
  next: () => Promise<unknown>,
): Promise<void> => {
  const { request } = context;

  const color: Record<string, string> = {
    GET: "#6430ff",
    POST: "green",
    PUT: "orange",
    DELETE: "red",
  };

  console.log(
    "%c%s %c%s",
    `color: ${color[request.method]}`,
    request.method,
    "color: white",
    request.url.href,
  );
  await next();
};
