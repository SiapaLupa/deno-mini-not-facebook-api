import { Context, Middleware } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  NotificationCollection,
  NotificationSchema,
} from "../models/notification.model.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.3.0/mod.js";

export { index, read };

type Parameter = Context & {
  params?: {
    notificationId: string;
  };
};

const index: Middleware = async (context: Context) => {
  let message = "There is no notification";
  const { request, response, state } = context;
  const { read }: { read?: string } = Object.fromEntries(
    request.url.searchParams,
  );
  const { user } = state;
  const filter: Partial<NotificationSchema> = { user_id: user._id };
  if (typeof read !== "undefined") filter.read = !!+read;
  const notifications = await NotificationCollection.find(filter).toArray();
  const count = notifications.length;
  if (notifications) message = "There are" + count + "notification";
  response.body = { message, count, notifications };
};

const read: Middleware = async (context: Context) => {
  const { params, response } = <Parameter> context;
  const { notificationId } = params!;
  await NotificationCollection.updateOne(
    { _id: new ObjectId(notificationId) },
    { read: true },
  );
  response.body = { message: "Notification read!" };
};
