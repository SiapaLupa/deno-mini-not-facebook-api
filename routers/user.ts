import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import * as UserController from "../controllers/user.controller.ts";
import { authenticate } from "../utils/authenticate.ts";

export const userRouter = new Router();

userRouter.prefix("/user")
  .get("/", UserController.index)
  .get("/me", authenticate(), UserController.me)
  .get("/:userName", UserController.show)
  .post("/", UserController.insert)
  .post("/:acceptorId", UserController.requestFriend)
  .post("/:userId/response", UserController.requestFriend)
  .patch("/:userId", UserController.update)
  .delete("/:userId", UserController.destroy)