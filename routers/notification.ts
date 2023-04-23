import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { authenticate } from "../utils/authenticate.ts";
import { NotificationController } from "../controllers/mod.ts";

export const notificationRouter = new Router();

notificationRouter.use(authenticate())

notificationRouter.prefix("/notification")
  .get("/", NotificationController.index)
  .get("/:notificationId", NotificationController.read)
