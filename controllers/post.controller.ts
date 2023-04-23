import { Context, Middleware } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { PostCollection, PostSchema } from "../models/post.model.ts";
import { UserCollection, UserSchema } from "../models/user.model.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.31.2/mod.ts";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/mod.ts";
import { slugify } from "../utils/slugify.ts";
import { LikeCollection } from "../models/like.model.ts";
import { excerpt } from "../utils/excerpt.ts";

export { destroy, index, insert, like, show, update };

type myContext = Context & {
  params?: Partial<{
    postId: string;
    postSlug: string;
  }>;
};
type WithUser = {
  user?: UserSchema;
};
const index: Middleware = async (context: Context) => {
  const { response } = context;
  const posts = await PostCollection.aggregate([
    {
      $lookup: {
        from: "User",
        localField: "user_id",
        foreignField: "_id",
        as: "author",
      },
    },
    { $unwind: "$author" },
    {
      $lookup: {
        from: "Comment",
        localField: "comments",
        foreignField: "_id",
        as: "comment",
      },
    },
    {
      $lookup: {
        from: "Like",
        localField: "_id",
        foreignField: "post_id",
        as: "like",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$like" },
      },
    },
    {
      $project: {
        title: 1,
        slug: 1,
        content: 1,
        excerpt: 1,
        createdAt: 1,
        updatedAt: 1,
        "author.name": 1,
        "author._id": 1,
        likesCount: 1,
      },
    },
  ]).toArray();
  response.headers.set("Content-Type", "application/json");
  response.body = { posts };
};

const show: Middleware = (context: myContext) => {
  const { response, params } = context;
  const slug: string = params!.postSlug!;
  const post = PostCollection.aggregate([
    { $match: { slug } },
    {
      $lookup: {
        from: "User",
        localField: "user_id",
        foreignField: "_id",
        as: "author",
      },
    },
    { $unwind: "$author" },
    {
      $lookup: {
        from: "Comment",
        localField: "comments",
        foreignField: "_id",
        as: "comments",
      },
    },
  ]);
  response.headers.set("Content-Type", "application/json");
  response.body = post;
};

const insert: Middleware = async (context: Context) => {
  const { request, response, state } = context;
  const { user }: { user?: UserSchema } = state;
  if (!user) throw new UnauthorizedError("Login first to create a posts");
  const body = request.body();
  if (body.type !== "form-data") {
    throw new BadRequestError("Request Content-Type must be form-data");
  }
  const form = body.value;
  const { title, content } = (await form.read()).fields;
  if (!title) throw new BadRequestError("Please Input title");
  if (!content) throw new BadRequestError("Please Input content");
  const NOW = new Date();
  const post: PostSchema = {
    title,
    slug: slugify(title),
    content,
    user_id: user._id!,
    excerpt: excerpt(content),
    comments: [],
    createdAt: NOW,
    updatedAt: NOW,
    deletedAt: null,
  };
  await PostCollection.insertOne(post);
  response.headers.set("Content-Type", "application/json");
  response.body = { message: "Post Created!" };
};

const update: Middleware = async (context: myContext) => {
  const { request, response, params, state } = context;
  const { user } = <WithUser> state;
  const _id = new ObjectId(params!.postId!);

  const body = request.body();
  if (body.type !== "form-data") {
    throw new BadRequestError("Request Content-Type must be form-data");
  }
  const form = body.value;
  const data = (await form.read()).fields;
  const { title, content } = data;
  if (!title && !content) {
    throw new BadRequestError("There is nothing to change");
  }
  const post = await PostCollection.findOne({ _id });
  if (!post) throw new NotFoundError("Post not found");
  if (post.user_id !== user!._id) {
    throw new UnauthorizedError("This post doesn't belongs to you");
  }
  await PostCollection.updateOne({ _id }, {
    $set: {
      updatedAt: new Date(),
      title,
      content,
    },
  }, { ignoreUndefined: true });
  response.headers.set("Content-Type", "application/json");
  response.body = { message: "Post Updated!" };
};

const destroy: Middleware = async (context: myContext) => {
  const { response, params, state } = context;
  const { user } = <WithUser> state;
  const _id = new ObjectId(params!.postId);
  const post = await PostCollection.findOne({ _id });
  if (!post) throw new NotFoundError("Post not found");
  if (post.user_id !== user!._id) {
    throw new UnauthorizedError("This post doesn't belongs to you");
  }
  await PostCollection.deleteOne({ _id });
  response.body = { message: "Post Deleted!" };
};

const like: Middleware = async (context: myContext) => {
  let message: string;
  const { response, state, params } = context;
  const { postId } = params!;
  const { user } = <WithUser> state;
  if (!user) throw new UnauthorizedError("Login to like post");
  const deleted = await LikeCollection.deleteOne({ user_id: user._id });
  if (deleted) {
    message = "Cancel Like";
    await UserCollection.updateOne({ _id: user._id }, {
      $pull: { likes: { $eq: new ObjectId(postId) } },
    });
  } else {
    message = "Liked";
    await LikeCollection.insertOne({
      user_id: user._id!,
      post_id: new ObjectId(postId!),
    });
    await UserCollection.updateOne({ _id: user._id }, {
      $push: { likes: new ObjectId(postId) },
    });
  }
  response.body = { message };
};
