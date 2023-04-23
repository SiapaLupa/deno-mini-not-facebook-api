import { Context, Middleware } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { UserCollection } from "../models/user.model.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/mod.ts";
import { SessionCollection } from "../models/session.model.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.31.2/mod.ts";

export { signin, signout, signup };

const signout: Middleware = async (context: Context) => {
  const { response, cookies } = context;
  const sessionId = await cookies.get("sessionId", { signed: true });
  await cookies.delete("sessionId", { signed: true });
  if (!sessionId) throw new Error("You have been logout");
  await SessionCollection.deleteOne({ _id: new ObjectId(sessionId) });
  response.body = { message: "Success Logout" };
};

const signin: Middleware = async (context: Context) => {
  const { request, response, cookies } = context;
  const body: URLSearchParams = await request.body({ type: "form" }).value;
  const { email, password } = Object.fromEntries(body);
  if (!email) throw new BadRequestError("Email Field Required");
  const user = await UserCollection.findOne({ email });
  if (!user) throw new NotFoundError("User Not Found");
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) throw new UnauthorizedError("Wrong Password");
  const sessionId = await SessionCollection.insertOne({
    value: "user=" + user._id!.toString(),
  });
  cookies.set("sessionId", (<ObjectId> sessionId).toString(), {
    signed: true,
  });
  response.body = { message: "Success SignIn" };
};

const signup: Middleware = async (context: Context) => {
  const { request, response, cookies } = context;
  const body: URLSearchParams = await request.body({ type: "form" }).value;
  const { name, age, email, password } = Object.fromEntries(body);
  if (!name.trim()) throw new BadRequestError("Input field: name");
  if (!age) throw new BadRequestError("Input field: age");
  if (!email) throw new BadRequestError("Input field: email");
  if (!password) throw new BadRequestError("Input field: password");
  const _id: unknown = await UserCollection.insertOne({
    name: name.trim(),
    age,
    email,
    likes: [],
    friends: [],
    password: await bcrypt.hash(password),
  });
  response.headers.set("Access-Control-Allow-Credentials", "true");
  const sessionId = await SessionCollection.insertOne({
    value: "user=" + _id!.toString(),
  });
  cookies.set("sessionId", (<ObjectId> sessionId).toString(), {
    signed: true,
  });
  response.body = { message: "Success SignUp" };
};
