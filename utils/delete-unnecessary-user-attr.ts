import { UserSchema } from "../models/user.model.ts";

export const deleteUnnecessaryUserAttribute = (user: Partial<UserSchema>) => {
  delete user.password;
  delete user.email;
  delete user.age;
  return user;
}