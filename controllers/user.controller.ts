import {
  Context,
  Middleware,
  Status,
} from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { UserCollection, UserSchema } from "../models/user.model.ts";
import { BadRequestError, NotFoundError } from "../errors/mod.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.31.2/mod.ts";
import { FriendCollection } from "../models/friend.model.ts";
import { NotificationCollection } from "../models/mod.ts";
import { deleteUnnecessaryUserAttribute } from "../utils/delete-unnecessary-user-attr.ts";

export {
  destroy,
  index,
  insert,
  me,
  requestFriend,
  responseFriend,
  show,
  unfriend,
  update,
};

type Parameter = Context & {
  params?: Partial<{
    userId: string;
    acceptorId?: string;
    userName?: string;
  }>;
  state: {
    user?: UserSchema;
  };
};

const unfriend: Middleware = async (context: Context) => {
  const { state, params, response } = <Parameter> context;
  const { acceptorId } = params!;
  const { user } = state;
  await UserCollection.updateMany({
    $or: [{ "_id": user!._id }, { "_id": new ObjectId(acceptorId) }],
  }, {
    $pull: {
      friends: { _id: { $in: [new ObjectId(acceptorId), user!._id!] } },
    },
  });
  response.body = { message: "Success" };
};

const requestFriend: Middleware = async (context: Context) => {
  const { params, state, response } = <Parameter> context;
  const { user } = state;
  const { acceptorId } = params!;
  const NOW = new Date();
  const requester = await UserCollection.findOne({ _id: user!._id });
  const isFriend = requester!.friends.find((ObjectId) =>
    ObjectId.toString() === acceptorId
  );
  if (isFriend) throw new BadRequestError("You both are friends");
  await FriendCollection.insertOne({
    requester: user!._id!,
    acceptor: new ObjectId(acceptorId),
    createdAt: NOW,
    updatedAt: NOW,
    status: false,
  });
  await NotificationCollection.insertOne({
    user_id: new ObjectId(acceptorId),
    createdAt: NOW,
    message: "You have a new friend request from " + user!.name,
    read: false,
  });
  response.body = { message: "Friend Request Sent!" };
};

const responseFriend: Middleware = async (context: Context) => {
  const { request, state, params, response } = <Parameter> context;
  const { user } = state;
  const { userId } = params!;
  const body = request.body();
  if (body.type !== "form") {
    throw new BadRequestError(
      "Request Content-Type must be x-www-form-urlencoded",
    );
  }
  const form = await body.value;
  const { status, requestId } = <{
    status?: boolean;
    requestId?: string;
  }> Object.fromEntries(form);
  if (typeof status === "undefined") {
    throw new BadRequestError("There must be a Status of friend");
  }
  const requester = await UserCollection.findOne({
    _id: new ObjectId(userId),
  }, { projection: { name: 1, _id: 0 } });
  if (!requester) throw new NotFoundError("User not found");
  let friend = false;
  if (status) friend = true;
  await FriendCollection.updateOne({
    _id: new ObjectId(requestId),
    acceptor: user!._id,
  }, { status: friend });
  response.body = { message: "You're now friend with " + requester.name };
};

const index: Middleware = async (context: Context) => {
  const { response } = context;
  const users: UserSchema[] = await UserCollection.find().toArray();
  if (!users) throw new NotFoundError("No User Found");
  response.headers.set("Content-Type", "application/json");
  response.status = Status.OK;
  response.body = { users };
};

const insert: Middleware = async (context: Context) => {
  const { response, request } = context;
  const body: URLSearchParams = await request.body({ type: "form" }).value;
  const { name, age, email, password } = Object.fromEntries(body);
  const data: UserSchema = {
    name,
    age,
    email,
    password,
    likes: [],
    friends: [],
  };
  const _id: ObjectId = await UserCollection.insertOne(data);
  response.headers.set("Content-Type", "application/json");
  response.status = Status.OK;
  response.body = Object.assign(Object.fromEntries(body), { _id });
};

const show: Middleware = async (context: Context) => {
  const { response, params } = <Parameter> context;
  const _id: ObjectId = new ObjectId(params!.userName);
  const user: UserSchema | undefined = await UserCollection.findOne({ _id });
  if (!user) throw new NotFoundError("User Not Found");
  response.headers.set("Content-Type", "application/json");
  response.status = Status.OK;
  response.body = { user };
};

const update: Middleware = async (context: Context) => {
  const { request, response, params } = <Parameter> context;
  const _id: ObjectId = new ObjectId(params!.userId);
  const body: URLSearchParams = await request.body({ type: "form" }).value;
  const data = Object.fromEntries(body);
  await UserCollection.updateOne({ _id }, data);
  response.headers.set("Content-Type", "application/json");
  response.body = { message: "User updated!" };
};

const destroy: Middleware = async (context: Context) => {
  const { response, params } = <Parameter> context;
  const _id: string = params!.userId!;
  await UserCollection.deleteOne({ _id: new ObjectId(_id) });
  response.headers.set("Content-Type", "application/json");
  response.status = Status.OK;
  response.body = { message: "User deleted!" };
};

const me: Middleware = (context: Context) => {
  const { state, response } = context;
  const { user } = state;
  deleteUnnecessaryUserAttribute(user);
  response.status = Status.OK;  
  response.body = { user };
};
