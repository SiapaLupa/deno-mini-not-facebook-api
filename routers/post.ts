import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { CommentController, PostController } from "../controllers/mod.ts";
import { authenticate } from "../utils/authenticate.ts";

export const postRouter = new Router();

postRouter.use(authenticate());

postRouter.prefix("/post")
  .get("/", PostController.index)
  .get("/:postSlug", PostController.show)
  .post("/", PostController.insert)
  .post("/:postId/comment", CommentController.insert)
  .post("/:postId/like", PostController.like)
  .patch("/:postId/comment/:commentId", CommentController.update)
  .patch("/:postId", PostController.update)
  .delete("/:postId/comment/:commentId", CommentController.destroy)
  .delete("/:postId", PostController.destroy);
