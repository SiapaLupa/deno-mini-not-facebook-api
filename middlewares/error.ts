import { Context, Middleware } from "https://deno.land/x/oak@v12.1.0/mod.ts";

export const error: Middleware = async (
  context: Context,
  next: () => Promise<unknown>,
) => {
  const { response } = context;
  try {
    await next();
  } catch (error) {
    if (error.code < 100 || error.code > 599) error.code = 500;
    const { code, message } = error;
    response.status = code;
    response.body = { error: message };
  }
};
