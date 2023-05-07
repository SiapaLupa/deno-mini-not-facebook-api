import "https://deno.land/std@0.182.0/dotenv/load.ts";
import { Application } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  authRouter,
  dahsboardRouter,
  postRouter,
  userRouter,
} from "./routers/mod.ts";
import { landingRoute } from "./routers/landing.ts";
import { cors } from "./utils/cors.ts";
import { error } from "./middlewares/error.ts";
import { lostChild } from "./middlewares/lost-child.ts";
import { notificationRouter } from "./routers/notification.ts";
import { logger } from "./middlewares/logger.ts";

const app: Application = new Application({
  keys: [Deno.env.get("COOKIE_KEY") || crypto.randomUUID().replaceAll("-", "")],
});

app
  .use(
    cors([
      "http://localhost:5173"
    ]),
  )
  .use(error)
  .use(logger)
  .use(landingRoute.routes())
  .use(postRouter.routes())
  .use(authRouter.routes())
  .use(notificationRouter.routes())
  .use(dahsboardRouter.routes())
  .use(userRouter.routes())
  .use(postRouter.allowedMethods())
  .use(userRouter.allowedMethods())
  .use(lostChild);

app.listen({ port: 5000 });
