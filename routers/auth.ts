import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  signin,
  signup,
  signout
} from "../controllers/auth.controller.ts";

export const authRouter = new Router();

authRouter.prefix("/auth")
  .post("/signin", signin)
  .post("/signup", signup)
  .post("/signout", signout)
