import {
  Context,
  Router,
  Status,
} from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { authenticate } from "../utils/authenticate.ts";

export const dahsboardRouter = new Router();

dahsboardRouter.use(authenticate());

dahsboardRouter.prefix("/dashboard")
  .get("/", (context: Context) => {
    const { response, state } = context;
    const { user } = state;
    response.headers.set("Content-Type", "application/json");
    response.status = Status.OK;
    response.body = { message: "HELLO, " + user.name };
  });
