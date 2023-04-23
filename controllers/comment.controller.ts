import { Context, Middleware } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { PostCollection, PostSchema } from "../models/post.model.ts";
import {
  BadRequestError,
  NotFoundError,
  UnprocessableEntityError,
} from "../errors/mod.ts";
import { CommentCollection, CommentSchema } from "../models/comment.model.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.31.2/mod.ts";
import { UserSchema } from "../models/user.model.ts";

export { destroy, insert, update };

type MyContext = Context & {
  params?: {
    postId?: string;
    commentId?: string;
  };
};
type WithUser = {
  user?: UserSchema;
};
type Parameter = {
  postId: string;
};

const insert: Middleware = async (context: MyContext) => {
  const { request, response, params, state } = context;
  const { user } = <WithUser> state;
  const { postId } = <Parameter> params;
  const post: PostSchema | undefined = await PostCollection.findOne({
    _id: new ObjectId(postId),
  });
  if (!post) throw new NotFoundError("Post Not Found");
  const body = request.body();
  if (body.type !== "form") {
    throw new BadRequestError(
      "Request Content-Type must be x-www-form-urlencoded",
    );
  }
  const commentBody = Object.fromEntries(await body.value).body;
  if (!commentBody) throw new BadRequestError("Please input: body");
  const NOW = new Date();
  const comment: CommentSchema = {
    body: commentBody,
    user_id: user!._id,
    post_id: new ObjectId(postId),
    createdAt: NOW,
    updatedAt: NOW,
    deletedAt: null,
    comment: [],
  };
  const comment_id: unknown = await CommentCollection.insertOne(comment);
  if (!comment_id) throw new Error("Failed Creating Comment");
  const postUpdated = await PostCollection.updateOne({
    _id: new ObjectId(postId),
  }, {
    $push: { comments: comment_id },
  }, {
    ignoreUndefined: true,
  });
  if (!postUpdated.modifiedCount) {
    throw new UnprocessableEntityError("Failed adding comment in post");
  }
  response.headers.set("Content-Type", "application/json");
  response.body = { message: "Comment Sent" };
};

const update: Middleware = async (context: MyContext) => {
  const { request, response, state, params } = context;
  const { user } = <WithUser> state;
  const body = request.body();
  if (body.type !== "form-data") {
    throw new BadRequestError(
      "Request Content-Type must be multipart/form-data",
    );
  }
  const form = body.value;
  const rawData: unknown = (await form.read()).fields;
  const data = rawData as CommentSchema;
  const comment = await CommentCollection.updateOne({
    _id: new ObjectId(params?.commentId!),
    post_id: new ObjectId(params?.postId!),
    user_id: user?._id!,
  }, {
    $set: data,
  }, { ignoreUndefined: true });

  if (!comment.modifiedCount) throw new Error("Could not update the comment");
  response.body = { message: "Comment Updated" };
};

const destroy: Middleware = async (context: MyContext) => {
  const { response, params, state } = context;
  const { user } = <WithUser> state;
  const deleted = await CommentCollection.deleteOne({
    _id: new ObjectId(params?.commentId),
    post_id: new ObjectId(params!.postId!),
    user_id: user!._id,
  });
  if (!deleted) throw new Error("Cannot delete comment");
  response.body = { message: "Comment deleted!" };
};
